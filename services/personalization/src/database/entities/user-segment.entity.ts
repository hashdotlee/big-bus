import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SegmentType {
  BEHAVIORAL = 'behavioral',
  DEMOGRAPHIC = 'demographic',
  GEOGRAPHIC = 'geographic',
  PSYCHOGRAPHIC = 'psychographic',
  VALUE_BASED = 'value_based',
  LIFECYCLE = 'lifecycle',
}

@Entity('user_segments')
@Index(['userId'])
export class UserSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: SegmentType })
  type: SegmentType;

  @Column({ type: 'text' })
  segmentName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Segment characteristics
  @Column({ type: 'text', nullable: true })
  userTier: string; // bronze, silver, gold, platinum

  @Column({ type: 'text', nullable: true })
  lifeCycleStage: string; // new, active, at_risk, churned, reactivated

  @Column({ type: 'text', nullable: true })
  spendingTier: string; // low, medium, high, very_high

  @Column({ type: 'text', nullable: true })
  frequencyTier: string; // occasional, regular, frequent, power_user

  // Behavioral attributes
  @Column({ type: 'int', default: 0 })
  totalBookings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageOrderValue: number;

  @Column({ type: 'int', default: 0 })
  daysSinceLastBooking: number;

  @Column({ type: 'int', default: 0 })
  daysSinceFirstBooking: number;

  // Preferences and interests
  @Column({ type: 'jsonb', default: [] })
  interests: string[];

  @Column({ type: 'jsonb', default: [] })
  preferredRouteTypes: string[];

  @Column({ type: 'boolean', default: false })
  pricesensi: boolean;

  @Column({ type: 'boolean', default: false })
  brandLoyal: boolean;

  // Engagement metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  engagementScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  churnRisk: number; // 0-1

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  lifetimeValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  predictedLifetimeValue: number;

  // Campaign targeting
  @Column({ type: 'jsonb', default: [] })
  eligibleCampaigns: string[];

  @Column({ type: 'jsonb', default: [] })
  excludedCampaigns: string[];

  // Metadata
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1 })
  confidence: number; // How confident we are in this segmentation

  @Column({ type: 'timestamp', nullable: true })
  lastCalculatedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
