import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserBehavior, BehaviorEventType } from '../../database/entities/user-behavior.entity';
import { UserSegment, SegmentType } from '../../database/entities/user-segment.entity';
import { TrackEventDto } from './dto/track-event.dto';

@Injectable()
export class BehaviorService {
  constructor(
    @InjectRepository(UserBehavior)
    private readonly behaviorRepository: Repository<UserBehavior>,
    @InjectRepository(UserSegment)
    private readonly segmentRepository: Repository<UserSegment>,
  ) {}

  async trackEvent(trackEventDto: TrackEventDto): Promise<UserBehavior> {
    const behavior = this.behaviorRepository.create(trackEventDto);
    const savedBehavior = await this.behaviorRepository.save(behavior);

    // Asynchronously update user segmentation (non-blocking)
    this.updateUserSegmentation(trackEventDto.userId).catch(err =>
      console.error('Error updating segmentation:', err)
    );

    return savedBehavior;
  }

  async getUserBehaviors(
    userId: string,
    filters?: {
      eventType?: BehaviorEventType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<UserBehavior[]> {
    const queryBuilder = this.behaviorRepository.createQueryBuilder('behavior');

    queryBuilder.where('behavior.userId = :userId', { userId });

    if (filters?.eventType) {
      queryBuilder.andWhere('behavior.eventType = :eventType', { eventType: filters.eventType });
    }

    if (filters?.startDate && filters?.endDate) {
      queryBuilder.andWhere('behavior.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy('behavior.createdAt', 'DESC');

    if (filters?.limit) {
      queryBuilder.take(filters.limit);
    }

    return await queryBuilder.getMany();
  }

  async getUserBehaviorStats(userId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const behaviors = await this.getUserBehaviors(userId, {
      startDate,
      endDate: new Date(),
    });

    const stats = {
      totalEvents: behaviors.length,
      byEventType: {} as Record<BehaviorEventType, number>,
      byDevice: {} as Record<string, number>,
      byPlatform: {} as Record<string, number>,
      totalValue: 0,
      averageSessionDuration: 0,
      mostViewedEntities: [] as Array<{ entityType: string; entityId: string; count: number }>,
    };

    // Initialize counters
    Object.values(BehaviorEventType).forEach(type => {
      stats.byEventType[type] = 0;
    });

    let totalDuration = 0;
    let durationCount = 0;
    const entityViews: Record<string, { entityType: string; entityId: string; count: number }> = {};

    behaviors.forEach(behavior => {
      stats.byEventType[behavior.eventType]++;

      if (behavior.device) {
        stats.byDevice[behavior.device] = (stats.byDevice[behavior.device] || 0) + 1;
      }

      if (behavior.platform) {
        stats.byPlatform[behavior.platform] = (stats.byPlatform[behavior.platform] || 0) + 1;
      }

      if (behavior.value) {
        stats.totalValue += Number(behavior.value);
      }

      if (behavior.durationSeconds) {
        totalDuration += behavior.durationSeconds;
        durationCount++;
      }

      if (behavior.entityType && behavior.entityId) {
        const key = `${behavior.entityType}:${behavior.entityId}`;
        if (!entityViews[key]) {
          entityViews[key] = {
            entityType: behavior.entityType,
            entityId: behavior.entityId,
            count: 0,
          };
        }
        entityViews[key].count++;
      }
    });

    stats.averageSessionDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;
    stats.mostViewedEntities = Object.values(entityViews)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  async getPopularItems(
    entityType: string,
    filters?: {
      days?: number;
      limit?: number;
    }
  ): Promise<Array<{ entityId: string; count: number; value: number }>> {
    const days = filters?.days || 30;
    const limit = filters?.limit || 10;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const behaviors = await this.behaviorRepository.find({
      where: {
        entityType,
        createdAt: Between(startDate, new Date()),
      },
    });

    const itemStats: Record<string, { count: number; value: number }> = {};

    behaviors.forEach(behavior => {
      if (!behavior.entityId) return;

      if (!itemStats[behavior.entityId]) {
        itemStats[behavior.entityId] = { count: 0, value: 0 };
      }

      itemStats[behavior.entityId].count++;
      if (behavior.value) {
        itemStats[behavior.entityId].value += Number(behavior.value);
      }
    });

    return Object.entries(itemStats)
      .map(([entityId, stats]) => ({
        entityId,
        count: stats.count,
        value: stats.value,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private async updateUserSegmentation(userId: string): Promise<void> {
    // Get user behaviors from last 90 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const behaviors = await this.getUserBehaviors(userId, {
      startDate,
      endDate: new Date(),
    });

    // Calculate metrics
    const totalBookings = behaviors.filter(b => b.eventType === BehaviorEventType.BOOKING_COMPLETED).length;
    const totalSpent = behaviors
      .filter(b => b.eventType === BehaviorEventType.BOOKING_COMPLETED)
      .reduce((sum, b) => sum + (b.value ? Number(b.value) : 0), 0);

    const averageOrderValue = totalBookings > 0 ? totalSpent / totalBookings : 0;

    const lastBooking = behaviors.find(b => b.eventType === BehaviorEventType.BOOKING_COMPLETED);
    const daysSinceLastBooking = lastBooking
      ? Math.floor((Date.now() - lastBooking.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const firstBooking = behaviors
      .filter(b => b.eventType === BehaviorEventType.BOOKING_COMPLETED)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    const daysSinceFirstBooking = firstBooking
      ? Math.floor((Date.now() - firstBooking.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Determine user tier
    let userTier = 'bronze';
    if (totalBookings >= 20 || totalSpent >= 500) {
      userTier = 'platinum';
    } else if (totalBookings >= 10 || totalSpent >= 250) {
      userTier = 'gold';
    } else if (totalBookings >= 5 || totalSpent >= 100) {
      userTier = 'silver';
    }

    // Determine lifecycle stage
    let lifeCycleStage = 'new';
    if (daysSinceLastBooking > 60) {
      lifeCycleStage = 'churned';
    } else if (daysSinceLastBooking > 30) {
      lifeCycleStage = 'at_risk';
    } else if (totalBookings > 0) {
      lifeCycleStage = 'active';
    }

    // Determine spending tier
    let spendingTier = 'low';
    if (averageOrderValue >= 100) {
      spendingTier = 'very_high';
    } else if (averageOrderValue >= 50) {
      spendingTier = 'high';
    } else if (averageOrderValue >= 25) {
      spendingTier = 'medium';
    }

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(
      100,
      (totalBookings * 5 + behaviors.length * 0.5) / (daysSinceFirstBooking > 0 ? daysSinceFirstBooking / 30 : 1)
    );

    // Calculate churn risk (0-1)
    const churnRisk = Math.min(1, Math.max(0, daysSinceLastBooking / 90));

    // Update or create segment
    let segment = await this.segmentRepository.findOne({ where: { userId, type: SegmentType.BEHAVIORAL } });

    if (!segment) {
      segment = this.segmentRepository.create({
        userId,
        type: SegmentType.BEHAVIORAL,
        segmentName: 'behavioral_segment',
      });
    }

    segment.userTier = userTier;
    segment.lifeCycleStage = lifeCycleStage;
    segment.spendingTier = spendingTier;
    segment.totalBookings = totalBookings;
    segment.totalSpent = totalSpent;
    segment.averageOrderValue = averageOrderValue;
    segment.daysSinceLastBooking = daysSinceLastBooking;
    segment.daysSinceFirstBooking = daysSinceFirstBooking;
    segment.engagementScore = Number(engagementScore.toFixed(2));
    segment.churnRisk = Number(churnRisk.toFixed(2));
    segment.lifetimeValue = totalSpent;
    segment.predictedLifetimeValue = totalSpent * (1 + (1 - churnRisk));
    segment.lastCalculatedAt = new Date();

    await this.segmentRepository.save(segment);
  }

  async getUserSegment(userId: string): Promise<UserSegment | null> {
    return await this.segmentRepository.findOne({
      where: { userId, type: SegmentType.BEHAVIORAL },
    });
  }
}
