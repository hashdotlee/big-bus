import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription, SubscriptionBooking } from './subscriptions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, SubscriptionBooking])],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
