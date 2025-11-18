import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { Wallet, WalletStatus } from '../../database/entities/wallet.entity';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from '../../database/entities/transaction.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { UpdateWalletStatusDto } from './dto/update-wallet-status.dto';

describe('WalletsService', () => {
  let service: WalletsService;
  let walletRepository: Repository<Wallet>;
  let transactionRepository: Repository<Transaction>;
  let dataSource: DataSource;

  const mockWallet: Partial<Wallet> = {
    id: 'wallet-1',
    userId: 'user-1',
    balance: 1000000,
    currency: 'VND',
    status: WalletStatus.ACTIVE,
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction: Partial<Transaction> = {
    id: 'transaction-1',
    walletId: 'wallet-1',
    userId: 'user-1',
    amount: 500000,
    type: TransactionType.TOP_UP,
    status: TransactionStatus.PENDING,
    paymentMethod: PaymentMethod.VNPAY,
    currency: 'VND',
    balanceBefore: 1000000,
  };

  const mockWalletRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new wallet', async () => {
      const createDto: CreateWalletDto = {
        userId: 'user-2',
        currency: 'VND',
        isPrimary: true,
      };

      mockWalletRepository.findOne.mockResolvedValue(null);
      mockWalletRepository.create.mockReturnValue(mockWallet);
      mockWalletRepository.save.mockResolvedValue(mockWallet);

      const result = await service.create(createDto);

      expect(mockWalletRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockWalletRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockWallet);
    });

    it('should throw ConflictException if user already has a primary wallet', async () => {
      const createDto: CreateWalletDto = {
        userId: 'user-1',
        currency: 'VND',
        isPrimary: true,
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByUserId', () => {
    it('should return wallet by userId', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.findByUserId('user-1');

      expect(mockWalletRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1', isPrimary: true },
        relations: ['transactions'],
      });
      expect(result).toEqual(mockWallet);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(service.findByUserId('user-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return wallet by id', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.findOne('wallet-1');

      expect(result).toEqual(mockWallet);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.getBalance('user-1');

      expect(result.balance).toBe(1000000);
      expect(result.currency).toBe('VND');
    });
  });

  describe('topUp', () => {
    it('should create a top-up transaction', async () => {
      const topUpDto: TopUpWalletDto = {
        amount: 500000,
        paymentMethod: PaymentMethod.VNPAY,
        description: 'Top up wallet',
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.topUp('user-1', topUpDto);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.TOP_UP,
          status: TransactionStatus.PENDING,
          amount: 500000,
        }),
      );
      expect(result).toEqual(mockTransaction);
    });

    it('should throw BadRequestException if wallet is not active', async () => {
      const topUpDto: TopUpWalletDto = {
        amount: 500000,
        paymentMethod: PaymentMethod.VNPAY,
      };

      mockWalletRepository.findOne.mockResolvedValue({
        ...mockWallet,
        status: WalletStatus.BLOCKED,
      });

      await expect(service.topUp('user-1', topUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('processTopUp', () => {
    it('should process top-up and update wallet balance', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockTransaction)
        .mockResolvedValueOnce(mockWallet);
      mockQueryRunner.manager.save.mockResolvedValue(mockWallet);

      const result = await service.processTopUp('transaction-1', 'gateway-123');

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      mockQueryRunner.manager.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.processTopUp('transaction-1')).rejects.toThrow();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException if transaction not found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.processTopUp('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if transaction is not pending', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.COMPLETED,
      });

      await expect(service.processTopUp('transaction-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deductBalance', () => {
    it('should deduct balance and create payment transaction', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(mockWallet);
      mockQueryRunner.manager.create.mockReturnValue(mockTransaction);
      mockQueryRunner.manager.save.mockResolvedValue(mockTransaction);

      const result = await service.deductBalance(
        'user-1',
        200000,
        'booking-1',
        'Payment for booking',
      );

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        ...mockWallet,
        balance: 100000,
      });

      await expect(
        service.deductBalance('user-1', 200000, 'booking-1'),
      ).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if wallet is not active', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        ...mockWallet,
        status: WalletStatus.BLOCKED,
      });

      await expect(
        service.deductBalance('user-1', 100000, 'booking-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should update wallet status', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockWalletRepository.save.mockResolvedValue({
        ...mockWallet,
        status: WalletStatus.BLOCKED,
      });

      const updateDto: UpdateWalletStatusDto = {
        status: WalletStatus.BLOCKED,
      };

      const result = await service.updateStatus('wallet-1', updateDto);

      expect(result.status).toBe(WalletStatus.BLOCKED);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return paginated transaction history', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.findAndCount.mockResolvedValue([
        [mockTransaction],
        1,
      ]);

      const result = await service.getTransactionHistory('user-1', 1, 10);

      expect(result.transactions).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pages).toBe(1);
    });
  });
});
