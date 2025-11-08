import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet, WalletStatus } from '../../database/entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../../database/entities/transaction.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { UpdateWalletStatusDto } from './dto/update-wallet-status.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createWalletDto: CreateWalletDto): Promise<Wallet> {
    // Check if user already has a wallet
    const existingWallet = await this.walletRepository.findOne({
      where: { userId: createWalletDto.userId, isPrimary: true },
    });

    if (existingWallet) {
      throw new ConflictException('User already has a primary wallet');
    }

    const wallet = this.walletRepository.create(createWalletDto);
    return this.walletRepository.save(wallet);
  }

  async findByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { userId, isPrimary: true },
      relations: ['transactions'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async findOne(id: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getBalance(userId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.findByUserId(userId);
    return {
      balance: Number(wallet.balance),
      currency: wallet.currency,
    };
  }

  async topUp(userId: string, topUpDto: TopUpWalletDto): Promise<Transaction> {
    const wallet = await this.findByUserId(userId);

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Wallet is not active');
    }

    // Create transaction record
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      userId: userId,
      type: TransactionType.TOP_UP,
      status: TransactionStatus.PENDING,
      paymentMethod: topUpDto.paymentMethod,
      amount: topUpDto.amount,
      currency: wallet.currency,
      description: topUpDto.description || 'Wallet top-up',
      balanceBefore: Number(wallet.balance),
    });

    return this.transactionRepository.save(transaction);
  }

  async processTopUp(transactionId: string, gatewayTransactionId?: string): Promise<Wallet> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('Transaction is not pending');
      }

      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: transaction.walletId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Update wallet balance
      const newBalance = Number(wallet.balance) + Number(transaction.amount);
      wallet.balance = newBalance;
      wallet.lastTransactionAt = new Date();

      // Update transaction
      transaction.status = TransactionStatus.COMPLETED;
      transaction.balanceAfter = newBalance;
      transaction.completedAt = new Date();
      if (gatewayTransactionId) {
        transaction.gatewayTransactionId = gatewayTransactionId;
      }

      await queryRunner.manager.save(Wallet, wallet);
      await queryRunner.manager.save(Transaction, transaction);

      await queryRunner.commitTransaction();

      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deductBalance(
    userId: string,
    amount: number,
    bookingId: string,
    description?: string,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId, isPrimary: true },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.status !== WalletStatus.ACTIVE) {
        throw new BadRequestException('Wallet is not active');
      }

      if (Number(wallet.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Update wallet balance
      const newBalance = Number(wallet.balance) - amount;
      wallet.balance = newBalance;
      wallet.lastTransactionAt = new Date();

      // Create transaction
      const transaction = queryRunner.manager.create(Transaction, {
        walletId: wallet.id,
        userId: userId,
        bookingId: bookingId,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
        paymentMethod: PaymentMethod.WALLET,
        amount: amount,
        currency: wallet.currency,
        description: description || 'Payment for booking',
        balanceBefore: Number(wallet.balance) + amount,
        balanceAfter: newBalance,
        completedAt: new Date(),
      });

      await queryRunner.manager.save(Wallet, wallet);
      const savedTransaction = await queryRunner.manager.save(Transaction, transaction);

      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: string, updateStatusDto: UpdateWalletStatusDto): Promise<Wallet> {
    const wallet = await this.findOne(id);
    wallet.status = updateStatusDto.status;
    return this.walletRepository.save(wallet);
  }

  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ transactions: Transaction[]; total: number; page: number; pages: number }> {
    const wallet = await this.findByUserId(userId);

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}
