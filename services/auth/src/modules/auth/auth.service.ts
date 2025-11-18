import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../../database/entities';
import { UserRole } from '@big-bus/types';

interface TokenPayload {
  sub: string;
  email: string;
  userType: UserRole;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Create user with CUSTOMER role by default
    const user = await this.usersService.create({
      ...registerDto,
      userType: UserRole.CUSTOMER,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email or phone
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active' && user.status !== 'pending_verification') {
      throw new UnauthorizedException('Account is not active');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token and update last login
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    await this.usersService.updateLastLogin(user.id);

    return {
      ...tokens,
      user,
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<{ message: string }> {
    // Clear refresh token
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find user
      const user = await this.usersService.findById(payload.sub);

      // Verify refresh token matches
      if (!user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        ...tokens,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);

    // Verify old password
    const isValidPassword = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Invalid old password');
    }

    // Update password
    await this.usersService.update(userId, {
      password: changePasswordDto.newPassword,
    });

    // Clear refresh token to force re-login
    await this.usersService.updateRefreshToken(userId, null);

    return { message: 'Password changed successfully' };
  }

  /**
   * Forgot password - send reset token
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save reset token (expires in 1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.usersService.update(user.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expiresAt,
    } as any);

    // TODO: Send email with reset token
    // For now, we'll just return success
    // In production, you would send an email with:
    // const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * Reset password
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    // Hash the provided token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetPasswordDto.token)
      .digest('hex');

    // Find user with valid reset token
    const user = await this.usersService['userRepository']
      .createQueryBuilder('user')
      .where('user.passwordResetToken = :token', { token: hashedToken })
      .andWhere('user.passwordResetExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password and clear reset token
    await this.usersService.update(user.id, {
      password: resetPasswordDto.newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    } as any);

    // Clear refresh token to force re-login
    await this.usersService.updateRefreshToken(user.id, null);

    return { message: 'Password reset successfully' };
  }

  /**
   * OAuth login (Google, Facebook, Zalo)
   */
  async oauthLogin(
    provider: 'google' | 'facebook' | 'zalo',
    token: string,
    referralCode?: string,
  ): Promise<AuthResponse> {
    // TODO: Implement OAuth verification with each provider
    // For now, this is a placeholder

    // Verify token with provider and get user info
    // const userInfo = await this.verifyOAuthToken(provider, token);

    // For demonstration purposes, we'll throw an error
    throw new BadRequestException(
      `OAuth login with ${provider} is not yet implemented`,
    );

    // In production, you would:
    // 1. Verify the OAuth token with the provider
    // 2. Get user info from provider
    // 3. Find or create user in database
    // 4. Generate JWT tokens
    // 5. Return auth response
  }

  /**
   * Validate user credentials
   */
  private async validateUser(
    username: string,
    password: string,
  ): Promise<User | null> {
    // Try to find by email or phone
    let user: User | null = null;

    if (username.includes('@')) {
      user = await this.usersService.findByEmail(username);
    } else {
      user = await this.usersService.findByPhone(username);
    }

    if (!user) {
      return null;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
