import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserPreference } from './database/entities/user-preference.entity';
import { UserBehavior } from './database/entities/user-behavior.entity';
import { Recommendation } from './database/entities/recommendation.entity';
import { UserSegment } from './database/entities/user-segment.entity';
import { PricingRule } from './database/entities/pricing-rule.entity';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { BehaviorModule } from './modules/behavior/behavior.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'personalization_db'),
        entities: [UserPreference, UserBehavior, Recommendation, UserSegment, PricingRule],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    PreferencesModule,
    BehaviorModule,
    RecommendationsModule,
    PricingModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
