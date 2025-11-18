import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { User } from '../../database/entities/user.entity';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorController } from './two-factor.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { ZaloStrategy } from './strategies/zalo.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  controllers: [OAuthController, TwoFactorController],
  providers: [
    OAuthService,
    TwoFactorService,
    GoogleStrategy,
    FacebookStrategy,
    ZaloStrategy,
  ],
  exports: [OAuthService, TwoFactorService],
})
export class AuthModule {}
