import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PricingStrategy {
  DYNAMIC = 'dynamic',
  SEGMENT_BASED = 'segment_based',
  TIME_BASED = 'time_based',
  DEMAND_BASED = 'demand_based',
  LOYALTY_BASED = 'loyalty_based',
  PROMOTIONAL = 'promotional',
}

export enum RuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
}

@Entity('pricing_rules')
export class PricingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PricingStrategy })
  strategy: PricingStrategy;

  @Column({ type: 'enum', enum: RuleStatus, default: RuleStatus.ACTIVE })
  status: RuleStatus;

  @Column({ type: 'int', default: 0 })
  priority: number;

  // Targeting criteria
  @Column({ type: 'jsonb', nullable: true })
  targetUserSegments: string[];

  @Column({ type: 'jsonb', nullable: true })
  targetRoutes: string[];

  @Column({ type: 'jsonb', nullable: true })
  targetCategories: string[];

  @Column({ type: 'text', nullable: true })
  targetDayOfWeek: string; // monday, tuesday, etc., or "weekday", "weekend"

  @Column({ type: 'text', nullable: true })
  targetTimeOfDay: string; // morning, afternoon, evening, night

  // Conditions
  @Column({ type: 'int', nullable: true })
  minDaysInAdvance: number;

  @Column({ type: 'int', nullable: true })
  maxDaysInAdvance: number;

  @Column({ type: 'int', nullable: true })
  minSeatsAvailable: number;

  @Column({ type: 'int', nullable: true })
  maxSeatsAvailable: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  minOccupancyRate: number; // 0-100%

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxOccupancyRate: number; // 0-100%

  // Pricing adjustments
  @Column({ type: 'text' })
  adjustmentType: string; // percentage, fixed_amount, multiplier

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  adjustmentValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice: number;

  // Time constraints
  @Column({ type: 'timestamp', nullable: true })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date;

  // Usage limits
  @Column({ type: 'int', nullable: true })
  maxUsagePerUser: number;

  @Column({ type: 'int', nullable: true })
  maxTotalUsage: number;

  @Column({ type: 'int', default: 0 })
  currentUsageCount: number;

  // Performance tracking
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'int', default: 0 })
  totalApplications: number;

  @Column({ type: 'int', default: 0 })
  totalConversions: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
