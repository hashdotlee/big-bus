import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum BehaviorEventType {
  PAGE_VIEW = 'page_view',
  ROUTE_SEARCH = 'route_search',
  ROUTE_VIEW = 'route_view',
  BOOKING_STARTED = 'booking_started',
  BOOKING_COMPLETED = 'booking_completed',
  BOOKING_CANCELLED = 'booking_cancelled',
  PRODUCT_VIEW = 'product_view',
  PRODUCT_ADDED_TO_CART = 'product_added_to_cart',
  PRODUCT_PURCHASED = 'product_purchased',
  REVIEW_SUBMITTED = 'review_submitted',
  SUPPORT_CONTACTED = 'support_contacted',
  OFFER_VIEWED = 'offer_viewed',
  OFFER_CLICKED = 'offer_clicked',
  PAYMENT_METHOD_SELECTED = 'payment_method_selected',
  APP_OPENED = 'app_opened',
  NOTIFICATION_CLICKED = 'notification_clicked',
}

@Entity('user_behaviors')
@Index(['userId', 'eventType'])
@Index(['userId', 'createdAt'])
export class UserBehavior {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ type: 'enum', enum: BehaviorEventType })
  @Index()
  eventType: BehaviorEventType;

  @Column({ type: 'text', nullable: true })
  entityType: string; // route, product, booking, etc.

  @Column({ type: 'text', nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', default: {} })
  eventData: Record<string, any>;

  // Context information
  @Column({ type: 'text', nullable: true })
  device: string; // mobile, desktop, tablet

  @Column({ type: 'text', nullable: true })
  platform: string; // ios, android, web

  @Column({ type: 'text', nullable: true })
  browser: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  source: string; // organic, campaign, referral

  @Column({ type: 'text', nullable: true })
  campaignId: string;

  // Engagement metrics
  @Column({ type: 'int', nullable: true })
  durationSeconds: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value: number; // Monetary value if applicable

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
