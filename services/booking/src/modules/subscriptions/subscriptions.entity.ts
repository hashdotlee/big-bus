import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum SubscriptionFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

@Entity('subscriptions')
@Index(['userId', 'status'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  routeId: string;

  @Column()
  scheduleId: string;

  @Column({ type: 'jsonb' })
  seatNumbers: string[]; // Preferred seats

  @Column({ type: 'enum', enum: SubscriptionFrequency })
  frequency: SubscriptionFrequency;

  @Column({ type: 'jsonb', nullable: true })
  daysOfWeek: number[]; // 0-6 for Sunday-Saturday (for weekly)

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp', nullable: true })
  nextBookingDate: Date;

  @Column({ type: 'int', default: 0 })
  totalBookings: number;

  @Column({ type: 'jsonb', nullable: true })
  passengerInfo: any;

  @Column({ type: 'boolean', default: true })
  autoPayment: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('subscription_bookings')
@Index(['subscriptionId', 'bookingDate'])
export class SubscriptionBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  subscriptionId: string;

  @Column()
  bookingId: string;

  @Column({ type: 'timestamp' })
  bookingDate: Date;

  @Column({ default: true })
  successful: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
