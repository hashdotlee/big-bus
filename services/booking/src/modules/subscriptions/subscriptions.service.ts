import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Subscription,
  SubscriptionBooking,
  SubscriptionStatus,
  SubscriptionFrequency,
} from './subscriptions.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionBooking)
    private readonly subscriptionBookingRepository: Repository<SubscriptionBooking>,
  ) {}

  /**
   * Create a new subscription
   */
  async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      ...data,
      status: SubscriptionStatus.ACTIVE,
      totalBookings: 0,
      nextBookingDate: this.calculateNextBookingDate(
        data.startDate,
        data.frequency,
        data.daysOfWeek,
      ),
    });

    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Created subscription ${subscription.id} for user ${data.userId}`);

    return subscription;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, userId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Cancelled subscription ${subscriptionId}`);
  }

  /**
   * Pause/resume a subscription
   */
  async toggleSubscription(
    subscriptionId: string,
    userId: string,
    pause: boolean,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = pause
      ? SubscriptionStatus.PAUSED
      : SubscriptionStatus.ACTIVE;

    await this.subscriptionRepository.save(subscription);

    this.logger.log(`${pause ? 'Paused' : 'Resumed'} subscription ${subscriptionId}`);
  }

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Process subscriptions (run daily via cron)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processSubscriptions(): Promise<void> {
    this.logger.log('Processing subscriptions...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextBookingDate: LessThanOrEqual(today),
      },
    });

    this.logger.log(`Found ${dueSubscriptions.length} subscriptions to process`);

    for (const subscription of dueSubscriptions) {
      try {
        await this.createSubscriptionBooking(subscription);

        // Update next booking date
        subscription.nextBookingDate = this.calculateNextBookingDate(
          new Date(),
          subscription.frequency,
          subscription.daysOfWeek,
        );

        subscription.totalBookings += 1;

        // Check if subscription has ended
        if (
          subscription.endDate &&
          subscription.nextBookingDate > subscription.endDate
        ) {
          subscription.status = SubscriptionStatus.EXPIRED;
        }

        await this.subscriptionRepository.save(subscription);
      } catch (error) {
        this.logger.error(
          `Failed to process subscription ${subscription.id}`,
          error,
        );
      }
    }

    this.logger.log('Subscription processing complete');
  }

  /**
   * Create a booking from subscription
   */
  private async createSubscriptionBooking(
    subscription: Subscription,
  ): Promise<void> {
    try {
      // Here you would integrate with your booking service
      // to create an actual booking with the subscription details

      const bookingId = `booking-${Date.now()}`; // Placeholder

      const subscriptionBooking = this.subscriptionBookingRepository.create({
        subscriptionId: subscription.id,
        bookingId,
        bookingDate: new Date(),
        successful: true,
      });

      await this.subscriptionBookingRepository.save(subscriptionBooking);

      this.logger.log(
        `Created booking ${bookingId} from subscription ${subscription.id}`,
      );
    } catch (error) {
      // Log failed booking
      const subscriptionBooking = this.subscriptionBookingRepository.create({
        subscriptionId: subscription.id,
        bookingId: '',
        bookingDate: new Date(),
        successful: false,
        errorMessage: error.message,
      });

      await this.subscriptionBookingRepository.save(subscriptionBooking);

      throw error;
    }
  }

  /**
   * Calculate next booking date based on frequency
   */
  private calculateNextBookingDate(
    startDate: Date,
    frequency: SubscriptionFrequency,
    daysOfWeek?: number[],
  ): Date {
    const next = new Date(startDate);

    switch (frequency) {
      case SubscriptionFrequency.DAILY:
        next.setDate(next.getDate() + 1);
        break;

      case SubscriptionFrequency.WEEKLY:
        next.setDate(next.getDate() + 7);
        break;

      case SubscriptionFrequency.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
    }

    return next;
  }
}
