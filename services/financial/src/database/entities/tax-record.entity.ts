import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TaxType {
  INCOME_TAX = 'income_tax',
  SALES_TAX = 'sales_tax',
  VAT = 'vat',
  PAYROLL_TAX = 'payroll_tax',
  PROPERTY_TAX = 'property_tax',
  OTHER = 'other',
}

export enum TaxPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum TaxStatus {
  CALCULATED = 'calculated',
  FILED = 'filed',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Entity('tax_records')
export class TaxRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TaxType })
  taxType: TaxType;

  @Column({ type: 'enum', enum: TaxPeriod })
  period: TaxPeriod;

  @Column({ type: 'enum', enum: TaxStatus, default: TaxStatus.CALCULATED })
  status: TaxStatus;

  @Column({ type: 'int' })
  fiscalYear: number;

  @Column({ type: 'int', nullable: true })
  fiscalQuarter: number; // 1, 2, 3, 4

  @Column({ type: 'int', nullable: true })
  fiscalMonth: number; // 1-12

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  // Taxable amounts
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxableIncome: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxableRevenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  deductibleExpenses: number;

  // Tax calculations
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  taxRate: number; // Percentage

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxPaid: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxOwed: number;

  // Withholding and credits
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  withholdingAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxCredits: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penalties: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  interest: number;

  // Filing information
  @Column({ type: 'text', nullable: true })
  filingReference: string;

  @Column({ type: 'timestamp', nullable: true })
  filedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  preparedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'jsonb', default: [] })
  attachments: Array<{
    filename: string;
    url: string;
    type: string;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
