import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

export enum AccountSubtype {
  // Assets
  CURRENT_ASSET = 'current_asset',
  FIXED_ASSET = 'fixed_asset',
  CASH = 'cash',
  ACCOUNTS_RECEIVABLE = 'accounts_receivable',
  INVENTORY = 'inventory',

  // Liabilities
  CURRENT_LIABILITY = 'current_liability',
  LONG_TERM_LIABILITY = 'long_term_liability',
  ACCOUNTS_PAYABLE = 'accounts_payable',
  LOANS_PAYABLE = 'loans_payable',

  // Equity
  OWNERS_EQUITY = 'owners_equity',
  RETAINED_EARNINGS = 'retained_earnings',

  // Revenue
  OPERATING_REVENUE = 'operating_revenue',
  NON_OPERATING_REVENUE = 'non_operating_revenue',

  // Expenses
  OPERATING_EXPENSE = 'operating_expense',
  COST_OF_GOODS_SOLD = 'cost_of_goods_sold',
  ADMINISTRATIVE_EXPENSE = 'administrative_expense',
  DEPRECIATION = 'depreciation',
}

@Entity('accounts')
@Index(['code'], { unique: true })
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // e.g., 1000, 2000, 4000

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: AccountType })
  type: AccountType;

  @Column({ type: 'enum', enum: AccountSubtype })
  subtype: AccountSubtype;

  @Column({ nullable: true })
  parentAccountId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debitBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditBalance: number;

  @Column({ type: 'text', default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isSystem: boolean; // System accounts cannot be deleted

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
