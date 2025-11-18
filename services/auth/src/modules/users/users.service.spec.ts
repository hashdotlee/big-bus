import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../database/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, UserStatus } from '@big-bus/types';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: Partial<User> = {
    id: 'test-user-id',
    email: 'test@example.com',
    phone: '+84987654321',
    password: 'hashedPassword123',
    fullName: 'Test User',
    userType: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      phone: '+84123456789',
      password: 'Password123!',
      fullName: 'New User',
      userType: UserRole.CUSTOMER,
    };

    it('should create a new user successfully', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashedPassword123');

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword123',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'User with this email or phone already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-2' }];
      mockRepository.findAndCount.mockResolvedValue([users, 2]);

      const result = await service.findAll(1, 10);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: ['roles'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ users, total: 2 });
    });

    it('should handle pagination correctly', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(2, 5);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        relations: ['roles'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('test-user-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        relations: ['roles'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findById('non-existent-id')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['roles'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByPhone', () => {
    it('should return a user by phone', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByPhone('+84987654321');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { phone: '+84987654321' },
        relations: ['roles'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByPhone('+84000000000');

      expect(result).toBeNull();
    });
  });

  describe('findByEmailOrPhone', () => {
    it('should find user by email or phone', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findByEmailOrPhone(
        'test@example.com',
        '+84987654321',
      );

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email OR user.phone = :phone',
        { email: 'test@example.com', phone: '+84987654321' },
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      fullName: 'Updated Name',
    };

    it('should update user successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update('test-user-id', updateUserDto);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.fullName).toBe('Updated Name');
    });

    it('should hash password if password is being updated', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      const updateWithPassword: UpdateUserDto = {
        password: 'NewPassword123!',
      };

      await service.update('test-user-id', updateWithPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 10);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete user by setting status to inactive', async () => {
      const user = { ...mockUser, status: UserStatus.ACTIVE };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(user);

      await service.remove('test-user-id');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'inactive' }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email', async () => {
      const user = {
        ...mockUser,
        emailVerified: false,
        emailVerificationToken: 'token123',
      };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({
        ...user,
        emailVerified: true,
        emailVerificationToken: undefined,
      });

      const result = await service.verifyEmail('test-user-id');

      expect(result.emailVerified).toBe(true);
      expect(result.emailVerificationToken).toBeUndefined();
    });
  });

  describe('verifyPhone', () => {
    it('should verify user phone', async () => {
      const user = {
        ...mockUser,
        phoneVerified: false,
        phoneVerificationToken: 'token456',
      };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({
        ...user,
        phoneVerified: true,
        phoneVerificationToken: undefined,
      });

      const result = await service.verifyPhone('test-user-id');

      expect(result.phoneVerified).toBe(true);
      expect(result.phoneVerificationToken).toBeUndefined();
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateRefreshToken('test-user-id', 'new-refresh-token');

      expect(mockRepository.update).toHaveBeenCalledWith('test-user-id', {
        refreshToken: 'new-refresh-token',
      });
    });

    it('should clear refresh token when null is passed', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateRefreshToken('test-user-id', null);

      expect(mockRepository.update).toHaveBeenCalledWith('test-user-id', {
        refreshToken: undefined,
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateLastLogin('test-user-id');

      expect(mockRepository.update).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          lastLogin: expect.any(Date),
        }),
      );
    });
  });
});
