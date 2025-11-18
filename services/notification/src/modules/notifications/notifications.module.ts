import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { PushModule } from '../push/push.module';
import { ZaloModule } from '../zalo/zalo.module';

@Module({
  imports: [EmailModule, SmsModule, PushModule, ZaloModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
