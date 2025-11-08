import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Transaction, TransactionStatus } from '../../database/entities/transaction.entity';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(
    userId?: string,
    status?: TransactionStatus,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
  }> {
    const where: FindOptionsWhere<Transaction> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where,
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

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findByBookingId(bookingId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    transaction.status = updateStatusDto.status;
    if (updateStatusDto.gatewayTransactionId) {
      transaction.gatewayTransactionId = updateStatusDto.gatewayTransactionId;
    }
    if (updateStatusDto.errorCode) {
      transaction.errorCode = updateStatusDto.errorCode;
    }
    if (updateStatusDto.errorMessage) {
      transaction.errorMessage = updateStatusDto.errorMessage;
    }

    if (updateStatusDto.status === TransactionStatus.COMPLETED) {
      transaction.completedAt = new Date();
    }

    return this.transactionRepository.save(transaction);
  }

  async getStatistics(userId?: string): Promise<{
    totalTransactions: number;
    totalAmount: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
  }> {
    const where: FindOptionsWhere<Transaction> = {};
    if (userId) where.userId = userId;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where,
    });

    const totalAmount = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );
    const successfulTransactions = transactions.filter(
      (t) => t.status === TransactionStatus.COMPLETED,
    ).length;
    const failedTransactions = transactions.filter(
      (t) => t.status === TransactionStatus.FAILED,
    ).length;
    const pendingTransactions = transactions.filter(
      (t) => t.status === TransactionStatus.PENDING,
    ).length;

    return {
      totalTransactions: total,
      totalAmount,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
    };
  }
}
