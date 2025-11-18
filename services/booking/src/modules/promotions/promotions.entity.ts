import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_TICKET = 'FREE_TICKET',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  DISABLED = 'DISABLED',
}

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PromotionType })
  type: PromotionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountValue: number; // Percentage or amount

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxDiscount: number; // Max discount for percentage type

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minPurchase: number; // Minimum purchase amount

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  usageLimit: number; // Total times can be used

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'int', nullable: true })
  perUserLimit: number; // Times per user

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  applicableRoutes: string[]; // Specific routes or null for all

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('coupon_usage')
@Index(['userId', 'promotionId'])
export class CouponUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  promotionId: string;

  @Column()
  bookingId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  originalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  finalAmount: number;

  @CreateDateColumn()
  usedAt: Date;
}
