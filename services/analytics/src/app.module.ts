import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { databaseConfig } from './config/database.config';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { PredictionsModule } from './modules/predictions/predictions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    ScheduleModule.forRoot(), // For scheduled tasks (e.g., generating periodic reports)
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    AnalyticsModule,
    ReportsModule,
    ActivityLogsModule,
    PredictionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
