import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation, RecommendationType, RecommendationStatus } from '../../database/entities/recommendation.entity';
import { UserPreference } from '../../database/entities/user-preference.entity';
import { UserBehavior, BehaviorEventType } from '../../database/entities/user-behavior.entity';
import { UserSegment } from '../../database/entities/user-segment.entity';
import { GetRecommendationsDto, TrackRecommendationDto } from './dto/recommendation.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    @InjectRepository(UserPreference)
    private readonly preferenceRepository: Repository<UserPreference>,
    @InjectRepository(UserBehavior)
    private readonly behaviorRepository: Repository<UserBehavior>,
    @InjectRepository(UserSegment)
    private readonly segmentRepository: Repository<UserSegment>,
  ) {}

  async getRecommendations(dto: GetRecommendationsDto): Promise<Recommendation[]> {
    const { userId, type, limit = 10, placement } = dto;

    // Check if user allows personalized recommendations
    const preferences = await this.preferenceRepository.findOne({ where: { userId } });
    if (preferences && !preferences.allowPersonalizedRecommendations) {
      return [];
    }

    // Get or generate recommendations
    let recommendations = await this.findExistingRecommendations(userId, type, placement, limit);

    if (recommendations.length < limit) {
      // Generate new recommendations
      const newRecs = await this.generateRecommendations(userId, type, limit - recommendations.length);
      recommendations = [...recommendations, ...newRecs];
    }

    return recommendations.slice(0, limit);
  }

  async trackRecommendation(dto: TrackRecommendationDto): Promise<Recommendation> {
    const { recommendationId, action } = dto;

    const recommendation = await this.recommendationRepository.findOne({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    switch (action) {
      case 'viewed':
        recommendation.impressions += 1;
        recommendation.viewedAt = new Date();
        break;
      case 'clicked':
        recommendation.clicks += 1;
        recommendation.clickedAt = new Date();
        recommendation.status = RecommendationStatus.CLICKED;
        break;
      case 'converted':
        recommendation.conversions += 1;
        recommendation.convertedAt = new Date();
        recommendation.status = RecommendationStatus.CONVERTED;
        break;
      case 'dismissed':
        recommendation.dismissedAt = new Date();
        recommendation.status = RecommendationStatus.DISMISSED;
        break;
    }

    return await this.recommendationRepository.save(recommendation);
  }

  private async findExistingRecommendations(
    userId: string,
    type?: RecommendationType,
    placement?: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    const queryBuilder = this.recommendationRepository.createQueryBuilder('rec');

    queryBuilder.where('rec.userId = :userId', { userId });
    queryBuilder.andWhere('rec.status = :status', { status: RecommendationStatus.ACTIVE });
    queryBuilder.andWhere('(rec.expiresAt IS NULL OR rec.expiresAt > :now)', { now: new Date() });

    if (type) {
      queryBuilder.andWhere('rec.type = :type', { type });
    }

    if (placement) {
      queryBuilder.andWhere('rec.placement = :placement', { placement });
    }

    queryBuilder.orderBy('rec.score', 'DESC');
    queryBuilder.addOrderBy('rec.priority', 'DESC');
    queryBuilder.take(limit);

    return await queryBuilder.getMany();
  }

  private async generateRecommendations(
    userId: string,
    type?: RecommendationType,
    limit: number = 10
  ): Promise<Recommendation[]> {
    const [preferences, segment, recentBehaviors] = await Promise.all([
      this.preferenceRepository.findOne({ where: { userId } }),
      this.segmentRepository.findOne({ where: { userId } }),
      this.behaviorRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 50,
      }),
    ]);

    const recommendations: Recommendation[] = [];

    // Generate route recommendations based on preferences
    if ((!type || type === RecommendationType.ROUTE) && preferences?.favoriteRoutes?.length > 0) {
      recommendations.push(
        ...this.generateRouteRecommendations(userId, preferences, segment, recentBehaviors)
      );
    }

    // Generate product recommendations
    if ((!type || type === RecommendationType.PRODUCT) && preferences?.favoriteProducts?.length > 0) {
      recommendations.push(
        ...this.generateProductRecommendations(userId, preferences, segment, recentBehaviors)
      );
    }

    // Generate deal recommendations based on segment
    if ((!type || type === RecommendationType.DEAL) && segment) {
      recommendations.push(...this.generateDealRecommendations(userId, segment));
    }

    // Save and return
    const savedRecommendations = await this.recommendationRepository.save(recommendations);
    return savedRecommendations.slice(0, limit);
  }

  private generateRouteRecommendations(
    userId: string,
    preferences: UserPreference,
    segment: UserSegment | null,
    behaviors: UserBehavior[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Recommend favorite routes
    preferences.favoriteRoutes?.slice(0, 3).forEach((routeId, index) => {
      recommendations.push(
        this.recommendationRepository.create({
          userId,
          type: RecommendationType.ROUTE,
          status: RecommendationStatus.ACTIVE,
          title: 'Your Favorite Route',
          description: 'Book your favorite route again',
          entityType: 'route',
          entityId: routeId,
          algorithm: 'user_preferences',
          score: 0.9 - index * 0.1,
          reasons: ['Based on your favorites'],
          personalizationFactors: {
            basedOnPreferences: true,
          },
          priority: 100,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
      );
    });

    return recommendations;
  }

  private generateProductRecommendations(
    userId: string,
    preferences: UserPreference,
    segment: UserSegment | null,
    behaviors: UserBehavior[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Find frequently viewed products
    const productViews = behaviors.filter(
      b => b.eventType === BehaviorEventType.PRODUCT_VIEW && b.entityId
    );

    const productCounts: Record<string, number> = {};
    productViews.forEach(b => {
      if (b.entityId) {
        productCounts[b.entityId] = (productCounts[b.entityId] || 0) + 1;
      }
    });

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    topProducts.forEach(([productId, views], index) => {
      recommendations.push(
        this.recommendationRepository.create({
          userId,
          type: RecommendationType.PRODUCT,
          status: RecommendationStatus.ACTIVE,
          title: 'You Might Like This',
          description: `You viewed this ${views} times`,
          entityType: 'product',
          entityId: productId,
          algorithm: 'collaborative_filtering',
          score: 0.85 - index * 0.1,
          reasons: [`Viewed ${views} times`],
          personalizationFactors: {
            basedOnHistory: true,
          },
          priority: 90,
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        })
      );
    });

    return recommendations;
  }

  private generateDealRecommendations(userId: string, segment: UserSegment): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Generate deal based on user tier
    if (segment.userTier === 'platinum' || segment.userTier === 'gold') {
      recommendations.push(
        this.recommendationRepository.create({
          userId,
          type: RecommendationType.DEAL,
          status: RecommendationStatus.ACTIVE,
          title: `Exclusive ${segment.userTier} Member Offer`,
          description: 'Get 20% off your next booking',
          algorithm: 'segment_based',
          score: 0.95,
          reasons: [`You're a ${segment.userTier} member`],
          personalizationFactors: {
            basedOnPreferences: true,
          },
          hasSpecialOffer: true,
          offerText: '20% OFF',
          discountPercentage: 20,
          priority: 150,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        })
      );
    }

    return recommendations;
  }
}
