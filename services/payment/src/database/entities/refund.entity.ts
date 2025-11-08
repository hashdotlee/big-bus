import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

export enum RefundReason {
  CUSTOMER_REQUEST = 'customer_request',
  BOOKING_CANCELLED = 'booking_cancelled',
  SERVICE_ISSUE = 'service_issue',
  DUPLICATE_PAYMENT = 'duplicate_payment',
  OTHER = 'other',
}

@Entity('refunds')
@Index(['transactionId'])
@Index(['bookingId'])
@Index(['userId'])
@Index(['status'])
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id' })
  @Index()
  transactionId: string;

  @Column({ name: 'booking_id' })
  @Index()
  bookingId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  amount: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({
    type: 'enum',
    enum: RefundReason,
  })
  reason: RefundReason;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'gateway_refund_id', nullable: true })
  gatewayRefundId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'processed_by', nullable: true })
  processedBy: string;

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'error_code', nullable: true })
  errorCode: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
