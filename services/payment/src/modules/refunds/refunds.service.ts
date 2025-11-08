import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { Refund, RefundStatus } from '../../database/entities/refund.entity';
import { Transaction, TransactionStatus, TransactionType } from '../../database/entities/transaction.entity';
import { Wallet } from '../../database/entities/wallet.entity';
import { CreateRefundDto } from './dto/create-refund.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, createRefundDto: CreateRefundDto): Promise<Refund> {
    // Verify transaction exists and belongs to user
    const transaction = await this.transactionRepository.findOne({
      where: { id: createRefundDto.transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed transactions');
    }

    // Check if refund amount is valid
    if (createRefundDto.amount > Number(transaction.amount)) {
      throw new BadRequestException('Refund amount exceeds transaction amount');
    }

    // Check if refund already exists for this transaction
    const existingRefund = await this.refundRepository.findOne({
      where: {
        transactionId: createRefundDto.transactionId,
        status: RefundStatus.PENDING,
      },
    });

    if (existingRefund) {
      throw new BadRequestException('Pending refund already exists for this transaction');
    }

    const refund = this.refundRepository.create({
      ...createRefundDto,
      userId,
      currency: transaction.currency,
    });

    return this.refundRepository.save(refund);
  }

  async findAll(
    userId?: string,
    status?: RefundStatus,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    refunds: Refund[];
    total: number;
    page: number;
    pages: number;
  }> {
    const where: FindOptionsWhere<Refund> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [refunds, total] = await this.refundRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      refunds,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Refund> {
    const refund = await this.refundRepository.findOne({
      where: { id },
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    return refund;
  }

  async process(
    id: string,
    processRefundDto: ProcessRefundDto,
    processedBy: string,
  ): Promise<Refund> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const refund = await queryRunner.manager.findOne(Refund, {
        where: { id },
      });

      if (!refund) {
        throw new NotFoundException('Refund not found');
      }

      if (refund.status !== RefundStatus.PENDING) {
        throw new BadRequestException('Refund is not pending');
      }

      // If refund is approved, process the refund
      if (processRefundDto.status === RefundStatus.COMPLETED) {
        // Get the original transaction
        const transaction = await queryRunner.manager.findOne(Transaction, {
          where: { id: refund.transactionId },
        });

        if (!transaction) {
          throw new NotFoundException('Transaction not found');
        }

        // Get user wallet
        const wallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId: refund.userId, isPrimary: true },
        });

        if (wallet) {
          // Refund to wallet
          const newBalance = Number(wallet.balance) + Number(refund.amount);
          wallet.balance = newBalance;
          wallet.lastTransactionAt = new Date();

          // Create refund transaction
          const refundTransaction = queryRunner.manager.create(Transaction, {
            walletId: wallet.id,
            userId: refund.userId,
            bookingId: refund.bookingId,
            type: TransactionType.REFUND,
            status: TransactionStatus.COMPLETED,
            paymentMethod: transaction.paymentMethod,
            amount: refund.amount,
            currency: refund.currency,
            description: `Refund for transaction ${refund.transactionId}`,
            balanceBefore: Number(wallet.balance),
            balanceAfter: newBalance,
            completedAt: new Date(),
          });

          await queryRunner.manager.save(Wallet, wallet);
          await queryRunner.manager.save(Transaction, refundTransaction);
        }

        refund.completedAt = new Date();
      }

      // Update refund
      refund.status = processRefundDto.status;
      refund.processedBy = processedBy;
      refund.processedAt = new Date();

      if (processRefundDto.gatewayRefundId) {
        refund.gatewayRefundId = processRefundDto.gatewayRefundId;
      }
      if (processRefundDto.errorCode) {
        refund.errorCode = processRefundDto.errorCode;
      }
      if (processRefundDto.errorMessage) {
        refund.errorMessage = processRefundDto.errorMessage;
      }

      const savedRefund = await queryRunner.manager.save(Refund, refund);

      await queryRunner.commitTransaction();

      return savedRefund;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByBookingId(bookingId: string): Promise<Refund[]> {
    return this.refundRepository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }
}
