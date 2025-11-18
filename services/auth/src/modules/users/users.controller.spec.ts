import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, UserStatus } from '@big-bus/types';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    phone: '+84987654321',
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

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        phone: '+84123456789',
        password: 'Password123!',
        fullName: 'New User',
        userType: UserRole.CUSTOMER,
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginatedResult = {
        users: [mockUser],
        total: 1,
      };

      mockUsersService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 10);

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(paginatedResult);
    });

    it('should use default pagination values', async () => {
      const paginatedResult = {
        users: [],
        total: 0,
      };

      mockUsersService.findAll.mockResolvedValue(paginatedResult);

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('test-user-id');

      expect(service.findById).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
      };

      const updatedUser = { ...mockUser, fullName: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('test-user-id', updateUserDto);

      expect(service.update).toHaveBeenCalledWith('test-user-id', updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('test-user-id');

      expect(service.remove).toHaveBeenCalledWith('test-user-id');
      expect(result).toBeUndefined();
    });
  });
});
