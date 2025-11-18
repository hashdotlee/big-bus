import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/user.entity';

export interface OAuthUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  provider: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate and authenticate OAuth user
   * Creates new user if doesn't exist, or links to existing account
   */
  async validateOAuthLogin(oauthUser: OAuthUser): Promise<{
    user: User;
    accessToken: string;
    isNewUser: boolean;
  }> {
    this.logger.log(`OAuth login attempt: ${oauthUser.provider} - ${oauthUser.email}`);

    // Check if user exists by provider ID
    let user = await this.userRepository.findOne({
      where: {
        [`${oauthUser.provider}Id`]: oauthUser.providerId,
      },
    });

    let isNewUser = false;

    if (!user) {
      // Check if user exists by email
      user = await this.userRepository.findOne({
        where: { email: oauthUser.email },
      });

      if (user) {
        // Link existing account with OAuth provider
        user[`${oauthUser.provider}Id`] = oauthUser.providerId;
        this.logger.log(`Linked existing account with ${oauthUser.provider}: ${user.id}`);
      } else {
        // Create new user
        user = this.userRepository.create({
          email: oauthUser.email,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          [`${oauthUser.provider}Id`]: oauthUser.providerId,
          emailVerified: true, // OAuth providers verify email
          isActive: true,
        });

        isNewUser = true;
        this.logger.log(`Created new user from ${oauthUser.provider}: ${oauthUser.email}`);
      }

      await this.userRepository.save(user);
    }

    // Generate JWT token
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      accessToken,
      isNewUser,
    };
  }

  /**
   * Unlink OAuth provider from user account
   */
  async unlinkProvider(userId: string, provider: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user) {
      user[`${provider}Id`] = null;
      await this.userRepository.save(user);
      this.logger.log(`Unlinked ${provider} from user ${userId}`);
    }
  }

  /**
   * Get linked OAuth providers for a user
   */
  async getLinkedProviders(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return [];
    }

    const providers: string[] = [];

    if (user.googleId) providers.push('google');
    if (user.facebookId) providers.push('facebook');
    if (user.zaloId) providers.push('zalo');

    return providers;
  }
}
