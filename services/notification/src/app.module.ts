import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { EmailModule } from './modules/email/email.module';
import { SmsModule } from './modules/sms/sms.module';
import { PushModule } from './modules/push/push.module';
import { ZaloModule } from './modules/zalo/zalo.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local'],
    }),
    ScheduleModule.forRoot(),
    EmailModule,
    SmsModule,
    PushModule,
    ZaloModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
