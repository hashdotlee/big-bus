import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { JournalEntry } from './journal-entry.entity';

export enum TransactionType {
  REVENUE = 'revenue',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  POSTED = 'posted',
  VOID = 'void',
  RECONCILED = 'reconciled',
}

export enum TransactionCategory {
  // Revenue
  BOOKING_REVENUE = 'booking_revenue',
  MARKETPLACE_REVENUE = 'marketplace_revenue',
  AFFILIATE_COMMISSION = 'affiliate_commission',
  OTHER_REVENUE = 'other_revenue',

  // Expense
  FUEL_COST = 'fuel_cost',
  MAINTENANCE = 'maintenance',
  SALARIES = 'salaries',
  MARKETING = 'marketing',
  RENT = 'rent',
  UTILITIES = 'utilities',
  INSURANCE = 'insurance',
  DEPRECIATION_EXPENSE = 'depreciation_expense',
  PAYMENT_PROCESSING = 'payment_processing',
  OTHER_EXPENSE = 'other_expense',
}

@Entity('transactions')
@Index(['transactionDate'])
@Index(['status'])
@Index(['type'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  transactionNumber: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.DRAFT })
  status: TransactionStatus;

  @Column({ type: 'enum', enum: TransactionCategory })
  category: TransactionCategory;

  @Column({ type: 'date' })
  @Index()
  transactionDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  reference: string; // External reference (invoice, receipt, etc.)

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  payeePayor: string; // Who we paid to / received from

  @Column({ nullable: true })
  relatedEntityType: string; // booking, order, affiliate, etc.

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ type: 'boolean', default: false })
  isTaxable: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'text', nullable: true })
  taxRate: string;

  @Column({ type: 'text', nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;

  @Column({ type: 'jsonb', default: [] })
  attachments: Array<{
    filename: string;
    url: string;
    type: string;
  }>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @OneToMany(() => JournalEntry, entry => entry.transaction)
  journalEntries: JournalEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
