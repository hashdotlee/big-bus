import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionStatus } from '../../database/entities/transaction.entity';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: Repository<Transaction>;

  const mockTransaction: Partial<Transaction> = {
    id: 'transaction-1',
    userId: 'user-1',
    bookingId: 'booking-1',
    amount: 100000,
    status: TransactionStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      const transactions = [mockTransaction];
      mockRepository.findAndCount.mockResolvedValue([transactions, 1]);

      const result = await service.findAll();

      expect(result.transactions).toEqual(transactions);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pages).toBe(1);
    });

    it('should filter by userId', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-1');

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1' }),
        }),
      );
    });

    it('should filter by status', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(undefined, TransactionStatus.COMPLETED);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: TransactionStatus.COMPLETED }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(undefined, undefined, 2, 5);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
      expect(result.page).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne('transaction-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'transaction-1' },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByBookingId', () => {
    it('should return transactions for a booking', async () => {
      const transactions = [mockTransaction];
      mockRepository.find.mockResolvedValue(transactions);

      const result = await service.findByBookingId('booking-1');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { bookingId: 'booking-1' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(transactions);
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockRepository.save.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.COMPLETED,
      });

      const updateDto: UpdateTransactionStatusDto = {
        status: TransactionStatus.COMPLETED,
        gatewayTransactionId: 'gateway-123',
      };

      const result = await service.updateStatus('transaction-1', updateDto);

      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should set completedAt when status is COMPLETED', async () => {
      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockRepository.save.mockResolvedValue(mockTransaction);

      const updateDto: UpdateTransactionStatusDto = {
        status: TransactionStatus.COMPLETED,
      };

      await service.updateStatus('transaction-1', updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          completedAt: expect.any(Date),
        }),
      );
    });

    it('should update error fields if provided', async () => {
      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockRepository.save.mockResolvedValue(mockTransaction);

      const updateDto: UpdateTransactionStatusDto = {
        status: TransactionStatus.FAILED,
        errorCode: 'ERR001',
        errorMessage: 'Payment failed',
      };

      await service.updateStatus('transaction-1', updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'ERR001',
          errorMessage: 'Payment failed',
        }),
      );
    });
  });

  describe('getStatistics', () => {
    it('should calculate transaction statistics', async () => {
      const transactions = [
        { ...mockTransaction, amount: 100000, status: TransactionStatus.COMPLETED },
        { ...mockTransaction, id: 'transaction-2', amount: 200000, status: TransactionStatus.FAILED },
        { ...mockTransaction, id: 'transaction-3', amount: 150000, status: TransactionStatus.PENDING },
      ];
      mockRepository.findAndCount.mockResolvedValue([transactions, 3]);

      const result = await service.getStatistics();

      expect(result.totalTransactions).toBe(3);
      expect(result.totalAmount).toBe(450000);
      expect(result.successfulTransactions).toBe(1);
      expect(result.failedTransactions).toBe(1);
      expect(result.pendingTransactions).toBe(1);
    });

    it('should filter statistics by userId', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getStatistics('user-1');

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });
});
