import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction, TransactionType } from '../../database/entities/transaction.entity';
import { Account, AccountType } from '../../database/entities/account.entity';
import { GenerateReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async generateProfitLossReport(startDate: Date, endDate: Date): Promise<any> {
    const revenues = await this.transactionRepository.find({
      where: {
        type: TransactionType.REVENUE,
        transactionDate: Between(startDate, endDate),
        status: 'posted',
      },
    });

    const expenses = await this.transactionRepository.find({
      where: {
        type: TransactionType.EXPENSE,
        transactionDate: Between(startDate, endDate),
        status: 'posted',
      },
    });

    const totalRevenue = revenues.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      reportType: 'Profit & Loss Statement',
      period: { start: startDate, end: endDate },
      revenue: {
        total: totalRevenue,
        breakdown: this.groupByCategory(revenues),
      },
      expenses: {
        total: totalExpenses,
        breakdown: this.groupByCategory(expenses),
      },
      netIncome,
      profitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
    };
  }

  async generateBalanceSheet(asOfDate: Date): Promise<any> {
    const accounts = await this.accountRepository.find({ where: { isActive: true } });

    const assets = accounts.filter(a => a.type === AccountType.ASSET);
    const liabilities = accounts.filter(a => a.type === AccountType.LIABILITY);
    const equity = accounts.filter(a => a.type === AccountType.EQUITY);

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalEquity = equity.reduce((sum, a) => sum + Number(a.balance), 0);

    return {
      reportType: 'Balance Sheet',
      asOf: asOfDate,
      assets: {
        total: totalAssets,
        accounts: assets.map(a => ({ name: a.name, balance: Number(a.balance) })),
      },
      liabilities: {
        total: totalLiabilities,
        accounts: liabilities.map(a => ({ name: a.name, balance: Number(a.balance) })),
      },
      equity: {
        total: totalEquity,
        accounts: equity.map(a => ({ name: a.name, balance: Number(a.balance) })),
      },
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  }

  async generateCashFlowReport(startDate: Date, endDate: Date): Promise<any> {
    const transactions = await this.transactionRepository.find({
      where: {
        transactionDate: Between(startDate, endDate),
        status: 'posted',
      },
    });

    const operating = transactions.filter(t =>
      t.type === TransactionType.REVENUE || t.type === TransactionType.EXPENSE
    );

    const cashInflows = operating
      .filter(t => t.type === TransactionType.REVENUE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const cashOutflows = operating
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      reportType: 'Cash Flow Statement',
      period: { start: startDate, end: endDate },
      operatingActivities: {
        inflows: cashInflows,
        outflows: cashOutflows,
        net: cashInflows - cashOutflows,
      },
      netCashFlow: cashInflows - cashOutflows,
    };
  }

  private groupByCategory(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);
  }
}
