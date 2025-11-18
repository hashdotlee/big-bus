import { BaseExtension, ExtensionCategory } from '../core/base-extension';

/**
 * Transaction types
 */
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
}

/**
 * Account types
 */
export enum AccountType {
  REVENUE = 'revenue',
  COST_OF_GOODS_SOLD = 'cogs',
  OPERATING_EXPENSE = 'operating_expense',
  ASSETS = 'assets',
  LIABILITIES = 'liabilities',
  EQUITY = 'equity',
}

/**
 * Tax types
 */
export enum TaxType {
  VAT = 'vat',
  INCOME_TAX = 'income_tax',
  CORPORATE_TAX = 'corporate_tax',
  SALES_TAX = 'sales_tax',
  WITHHOLDING_TAX = 'withholding_tax',
}

/**
 * Reporting period
 */
export enum ReportingPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

/**
 * Accounting configuration
 */
export interface AccountingConfig {
  baseCurrency: string;
  fiscalYearStart?: string; // MM-DD format
  taxRegion?: string;
  defaultTaxRate?: number;
  enableMultiCurrency?: boolean;
  [key: string]: any;
}

/**
 * Account
 */
export interface Account {
  accountId: string;
  code: string;
  name: string;
  type: AccountType;
  parentAccountId?: string;
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

/**
 * Transaction
 */
export interface Transaction {
  transactionId: string;
  date: Date;
  type: TransactionType;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  category?: string;
  taxAmount?: number;
  taxType?: TaxType;
  attachments?: string[];
  metadata?: Record<string, any>;
}

/**
 * Journal entry
 */
export interface JournalEntry {
  entryId: string;
  date: Date;
  description: string;
  reference?: string;
  lines: JournalEntryLine[];
  isPosted: boolean;
  createdAt: Date;
  postedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Journal entry line (double-entry bookkeeping)
 */
export interface JournalEntryLine {
  lineId: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

/**
 * Income statement
 */
export interface IncomeStatement {
  period: {
    start: Date;
    end: Date;
  };
  revenue: {
    total: number;
    breakdown: Array<{
      category: string;
      amount: number;
    }>;
  };
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: {
    total: number;
    breakdown: Array<{
      category: string;
      amount: number;
    }>;
  };
  operatingIncome: number;
  otherIncome: number;
  otherExpenses: number;
  netIncomeBeforeTax: number;
  incomeTax: number;
  netIncome: number;
  currency: string;
}

/**
 * Balance sheet
 */
export interface BalanceSheet {
  date: Date;
  assets: {
    current: {
      total: number;
      breakdown: Array<{
        category: string;
        amount: number;
      }>;
    };
    nonCurrent: {
      total: number;
      breakdown: Array<{
        category: string;
        amount: number;
      }>;
    };
    total: number;
  };
  liabilities: {
    current: {
      total: number;
      breakdown: Array<{
        category: string;
        amount: number;
      }>;
    };
    nonCurrent: {
      total: number;
      breakdown: Array<{
        category: string;
        amount: number;
      }>;
    };
    total: number;
  };
  equity: {
    total: number;
    breakdown: Array<{
      category: string;
      amount: number;
    }>;
  };
  currency: string;
}

/**
 * Cash flow statement
 */
export interface CashFlowStatement {
  period: {
    start: Date;
    end: Date;
  };
  operatingActivities: {
    netIncome: number;
    adjustments: Array<{
      item: string;
      amount: number;
    }>;
    total: number;
  };
  investingActivities: {
    items: Array<{
      item: string;
      amount: number;
    }>;
    total: number;
  };
  financingActivities: {
    items: Array<{
      item: string;
      amount: number;
    }>;
    total: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  currency: string;
}

/**
 * Tax calculation request
 */
export interface TaxCalculationRequest {
  period: {
    start: Date;
    end: Date;
  };
  income: number;
  deductions?: Array<{
    type: string;
    amount: number;
  }>;
  credits?: Array<{
    type: string;
    amount: number;
  }>;
}

/**
 * Tax calculation response
 */
export interface TaxCalculationResponse {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBreakdown: Array<{
    type: TaxType;
    rate: number;
    amount: number;
  }>;
  totalTax: number;
  effectiveTaxRate: number;
  credits: number;
  netTax: number;
}

/**
 * Budget
 */
export interface Budget {
  budgetId: string;
  name: string;
  period: {
    start: Date;
    end: Date;
  };
  categories: Array<{
    category: string;
    budgeted: number;
    actual?: number;
    variance?: number;
  }>;
  totalBudgeted: number;
  totalActual?: number;
  currency: string;
}

/**
 * Financial metrics
 */
export interface FinancialMetrics {
  period: {
    start: Date;
    end: Date;
  };
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
  };
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover?: number;
    receivablesTurnover?: number;
  };
  leverage: {
    debtToEquity: number;
    debtToAssets: number;
    equityMultiplier: number;
  };
}

/**
 * Base interface for accounting extensions
 */
export interface IAccountingExtension extends BaseExtension {
  readonly category: ExtensionCategory.ACCOUNTING;

  /**
   * Get chart of accounts
   */
  getChartOfAccounts(): Promise<Account[]>;

  /**
   * Create account
   */
  createAccount(account: Omit<Account, 'accountId' | 'balance'>): Promise<Account>;

  /**
   * Record transaction
   */
  recordTransaction(transaction: Omit<Transaction, 'transactionId'>): Promise<Transaction>;

  /**
   * Create journal entry
   */
  createJournalEntry(entry: Omit<JournalEntry, 'entryId' | 'createdAt' | 'isPosted'>): Promise<JournalEntry>;

  /**
   * Generate income statement
   */
  generateIncomeStatement(startDate: Date, endDate: Date): Promise<IncomeStatement>;

  /**
   * Generate balance sheet
   */
  generateBalanceSheet(date: Date): Promise<BalanceSheet>;

  /**
   * Generate cash flow statement
   */
  generateCashFlowStatement(startDate: Date, endDate: Date): Promise<CashFlowStatement>;

  /**
   * Calculate taxes
   */
  calculateTax(request: TaxCalculationRequest): Promise<TaxCalculationResponse>;

  /**
   * Get budget
   */
  getBudget(budgetId: string): Promise<Budget>;

  /**
   * Create budget
   */
  createBudget(budget: Omit<Budget, 'budgetId'>): Promise<Budget>;

  /**
   * Compare budget vs actual
   */
  compareBudgetVsActual(budgetId: string): Promise<Budget>;

  /**
   * Calculate financial metrics
   */
  calculateMetrics(startDate: Date, endDate: Date): Promise<FinancialMetrics>;

  /**
   * Get account balance
   */
  getAccountBalance(accountId: string, date?: Date): Promise<number>;

  /**
   * Reconcile account
   */
  reconcileAccount?(accountId: string, statement: Array<Transaction>): Promise<{
    matched: Transaction[];
    unmatched: Transaction[];
    missingFromStatement: Transaction[];
  }>;

  /**
   * Export to accounting software
   */
  exportToAccounting?(format: 'csv' | 'json' | 'quickbooks' | 'xero', startDate: Date, endDate: Date): Promise<string>;

  /**
   * Generate tax report
   */
  generateTaxReport?(taxType: TaxType, startDate: Date, endDate: Date): Promise<any>;
}

/**
 * Abstract base class for accounting extensions
 */
export abstract class BaseAccountingExtension
  extends BaseExtension
  implements IAccountingExtension
{
  readonly category = ExtensionCategory.ACCOUNTING;
  protected accountingConfig: AccountingConfig;

  abstract getChartOfAccounts(): Promise<Account[]>;
  abstract createAccount(account: Omit<Account, 'accountId' | 'balance'>): Promise<Account>;
  abstract recordTransaction(
    transaction: Omit<Transaction, 'transactionId'>,
  ): Promise<Transaction>;
  abstract createJournalEntry(
    entry: Omit<JournalEntry, 'entryId' | 'createdAt' | 'isPosted'>,
  ): Promise<JournalEntry>;
  abstract generateIncomeStatement(startDate: Date, endDate: Date): Promise<IncomeStatement>;
  abstract generateBalanceSheet(date: Date): Promise<BalanceSheet>;
  abstract generateCashFlowStatement(startDate: Date, endDate: Date): Promise<CashFlowStatement>;
  abstract calculateTax(request: TaxCalculationRequest): Promise<TaxCalculationResponse>;
  abstract getBudget(budgetId: string): Promise<Budget>;
  abstract createBudget(budget: Omit<Budget, 'budgetId'>): Promise<Budget>;
  abstract compareBudgetVsActual(budgetId: string): Promise<Budget>;
  abstract calculateMetrics(startDate: Date, endDate: Date): Promise<FinancialMetrics>;
  abstract getAccountBalance(accountId: string, date?: Date): Promise<number>;

  async initialize(config: AccountingConfig): Promise<void> {
    await super.initialize(config);
    this.accountingConfig = config;
  }

  protected validateJournalEntry(entry: JournalEntry): boolean {
    // Ensure debits equal credits (double-entry bookkeeping)
    const totalDebits = entry.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredits = entry.lines.reduce((sum, line) => sum + line.credit, 0);
    return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for rounding errors
  }

  protected generateAccountCode(type: AccountType, sequence: number): string {
    const prefixes: Record<AccountType, string> = {
      [AccountType.ASSETS]: '1',
      [AccountType.LIABILITIES]: '2',
      [AccountType.EQUITY]: '3',
      [AccountType.REVENUE]: '4',
      [AccountType.COST_OF_GOODS_SOLD]: '5',
      [AccountType.OPERATING_EXPENSE]: '6',
    };
    return `${prefixes[type]}${sequence.toString().padStart(4, '0')}`;
  }
}
