import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum RecommendationType {
  ROUTE = 'route',
  PRODUCT = 'product',
  DEAL = 'deal',
  DESTINATION = 'destination',
  UPGRADE = 'upgrade',
  CROSS_SELL = 'cross_sell',
  UP_SELL = 'up_sell',
}

export enum RecommendationStatus {
  ACTIVE = 'active',
  CLICKED = 'clicked',
  CONVERTED = 'converted',
  DISMISSED = 'dismissed',
  EXPIRED = 'expired',
}

@Entity('recommendations')
@Index(['userId', 'status'])
@Index(['userId', 'type'])
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: RecommendationType })
  type: RecommendationType;

  @Column({ type: 'enum', enum: RecommendationStatus, default: RecommendationStatus.ACTIVE })
  status: RecommendationStatus;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  entityType: string; // route, product, booking

  @Column({ type: 'text', nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  entityData: Record<string, any>;

  // Recommendation metadata
  @Column({ type: 'text' })
  algorithm: string; // collaborative, content-based, hybrid, ml-model

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  score: number; // 0-1 confidence score

  @Column({ type: 'jsonb', default: [] })
  reasons: string[]; // Why this was recommended

  // Personalization factors
  @Column({ type: 'jsonb', default: {} })
  personalizationFactors: {
    basedOnHistory?: boolean;
    basedOnPreferences?: boolean;
    basedOnSimilarUsers?: boolean;
    basedOnTrending?: boolean;
    basedOnLocation?: boolean;
    basedOnSeasonality?: boolean;
  };

  // Pricing and offers
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  recommendedPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage: number;

  @Column({ type: 'boolean', default: false })
  hasSpecialOffer: boolean;

  @Column({ type: 'text', nullable: true })
  offerText: string;

  // Engagement tracking
  @Column({ type: 'int', default: 0 })
  impressions: number;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ type: 'int', default: 0 })
  conversions: number;

  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  clickedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  convertedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dismissedAt: Date;

  // Priority and placement
  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'text', nullable: true })
  placement: string; // home, search, checkout, etc.

  // Expiration
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
