import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { EmailModule } from './modules/email/email.module';
import { SmsModule } from './modules/sms/sms.module';
import { PushModule } from './modules/push/push.module';
import { ZaloModule } from './modules/zalo/zalo.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
