import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Configure OTP library
    authenticator.options = {
      window: 1, // Allow 30 seconds before/after for time drift
    };
  }

  /**
   * Generate 2FA secret for a user
   */
  async generateTwoFactorSecret(userId: string): Promise<{
    secret: string;
    qrCodeUrl: string;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate secret
    const secret = authenticator.generateSecret();

    // Generate OTP Auth URL
    const otpAuthUrl = authenticator.keyuri(
      user.email,
      'BigBus', // App name
      secret,
    );

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

    // Save secret to user (but don't enable 2FA yet)
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false;
    await this.userRepository.save(user);

    this.logger.log(`Generated 2FA secret for user ${userId}`);

    return {
      secret,
      qrCodeUrl,
    };
  }

  /**
   * Enable 2FA after verifying the first code
   */
  async enableTwoFactor(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not set up for this user');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA already enabled');
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await this.userRepository.save(user);

    this.logger.log(`Enabled 2FA for user ${userId}`);

    return true;
  }

  /**
   * Disable 2FA
   */
  async disableTwoFactor(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA not enabled for this user');
    }

    // Verify the code before disabling
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await this.userRepository.save(user);

    this.logger.log(`Disabled 2FA for user ${userId}`);

    return true;
  }

  /**
   * Verify 2FA code during login
   */
  async verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not enabled for this user');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      this.logger.warn(`Failed 2FA verification for user ${userId}`);
      return false;
    }

    this.logger.debug(`Successful 2FA verification for user ${userId}`);
    return true;
  }

  /**
   * Check if user has 2FA enabled
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'twoFactorEnabled'],
    });

    return user?.twoFactorEnabled || false;
  }

  /**
   * Generate backup codes for 2FA
   */
  async generateBackupCodes(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA not enabled for this user');
    }

    // Generate 10 backup codes (8 characters each)
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      backupCodes.push(code);
    }

    // In production, you'd want to store hashed versions of these codes
    // For now, we'll just return them
    this.logger.log(`Generated backup codes for user ${userId}`);

    return backupCodes;
  }
}
