import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BudgetPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum BudgetStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: BudgetPeriod })
  period: BudgetPeriod;

  @Column({ type: 'enum', enum: BudgetStatus, default: BudgetStatus.DRAFT })
  status: BudgetStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  fiscalYear: number;

  // Budget allocations by category
  @Column({ type: 'jsonb', default: {} })
  allocations: Record<string, {
    budgeted: number;
    actual: number;
    variance: number;
    variancePercentage: number;
  }>;

  // Overall budget totals
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalBudgeted: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalActual: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalVariance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalVariancePercentage: number;

  // Revenue budget
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  budgetedRevenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualRevenue: number;

  // Expense budget
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  budgetedExpenses: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualExpenses: number;

  // Profit projection
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  projectedProfit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualProfit: number;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
