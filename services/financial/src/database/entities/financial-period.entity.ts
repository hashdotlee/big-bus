import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PeriodType {
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum PeriodStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  LOCKED = 'locked',
}

@Entity('financial_periods')
@Index(['fiscalYear', 'periodType'])
export class FinancialPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "Q1 2025", "January 2025", "FY 2025"

  @Column({ type: 'enum', enum: PeriodType })
  periodType: PeriodType;

  @Column({ type: 'enum', enum: PeriodStatus, default: PeriodStatus.OPEN })
  status: PeriodStatus;

  @Column({ type: 'int' })
  fiscalYear: number;

  @Column({ type: 'int', nullable: true })
  quarter: number; // 1, 2, 3, 4

  @Column({ type: 'int', nullable: true })
  month: number; // 1-12

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  // Financial summary for the period
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalExpenses: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netIncome: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossProfit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  operatingIncome: number;

  // Balance sheet data
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAssets: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalLiabilities: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalEquity: number;

  // Closing information
  @Column({ nullable: true })
  closedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'text', nullable: true })
  closingNotes: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
