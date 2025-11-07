import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmailOrPhone(
      createUserDto.email,
      createUserDto.phone,
    );

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  /**
   * Find all users with pagination
   */
  async findAll(page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['roles'],
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
      relations: ['roles'],
    });
  }

  /**
   * Find user by email or phone
   */
  async findByEmailOrPhone(email: string, phone: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email OR user.phone = :phone', { email, phone })
      .getOne();
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  /**
   * Delete user (soft delete by setting status to inactive)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    user.status = 'inactive' as any;
    await this.userRepository.save(user);
  }

  /**
   * Verify user's email
   */
  async verifyEmail(id: string): Promise<User> {
    const user = await this.findById(id);
    user.emailVerified = true;
    user.emailVerificationToken = null;
    return this.userRepository.save(user);
  }

  /**
   * Verify user's phone
   */
  async verifyPhone(id: string): Promise<User> {
    const user = await this.findById(id);
    user.phoneVerified = true;
    user.phoneVerificationToken = null;
    return this.userRepository.save(user);
  }

  /**
   * Update user's refresh token
   */
  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(id, { refreshToken });
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }
}
