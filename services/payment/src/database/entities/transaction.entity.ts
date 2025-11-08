import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  TOP_UP = 'top_up',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  WALLET = 'wallet',
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  CARD = 'card',
  CASH = 'cash',
}

@Entity('transactions')
@Index(['walletId'])
@Index(['userId'])
@Index(['bookingId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id' })
  @Index()
  walletId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'booking_id', nullable: true })
  @Index()
  bookingId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  amount: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'gateway_transaction_id', nullable: true })
  gatewayTransactionId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'balance_before', type: 'decimal', precision: 15, scale: 2, nullable: true })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 15, scale: 2, nullable: true })
  balanceAfter: number;

  @Column({ name: 'error_code', nullable: true })
  errorCode: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
