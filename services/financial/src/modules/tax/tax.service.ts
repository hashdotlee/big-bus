import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxRecord, TaxType, TaxPeriod } from '../../database/entities/tax-record.entity';
import { Transaction, TransactionType } from '../../database/entities/transaction.entity';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(TaxRecord)
    private readonly taxRecordRepository: Repository<TaxRecord>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async calculateTax(
    fiscalYear: number,
    period: TaxPeriod,
    taxType: TaxType,
    taxRate: number
  ): Promise<TaxRecord> {
    const { periodStart, periodEnd } = this.getPeriodDates(fiscalYear, period);

    // Get taxable income
    const revenues = await this.transactionRepository.find({
      where: {
        type: TransactionType.REVENUE,
        isTaxable: true,
        status: 'posted',
      },
    });

    const expenses = await this.transactionRepository.find({
      where: {
        type: TransactionType.EXPENSE,
        isTaxable: true,
        status: 'posted',
      },
    });

    const taxableRevenue = revenues.reduce((sum, t) => sum + Number(t.amount), 0);
    const deductibleExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const taxableIncome = taxableRevenue - deductibleExpenses;
    const taxAmount = taxableIncome * (taxRate / 100);

    const taxRecord = this.taxRecordRepository.create({
      taxType,
      period,
      fiscalYear,
      periodStart,
      periodEnd,
      taxableRevenue,
      taxableIncome,
      deductibleExpenses,
      taxRate,
      taxAmount,
      taxOwed: taxAmount,
      status: 'calculated',
    });

    return await this.taxRecordRepository.save(taxRecord);
  }

  private getPeriodDates(year: number, period: TaxPeriod): { periodStart: Date; periodEnd: Date } {
    if (period === TaxPeriod.YEARLY) {
      return {
        periodStart: new Date(year, 0, 1),
        periodEnd: new Date(year, 11, 31),
      };
    }
    // Simplified for now
    return {
      periodStart: new Date(year, 0, 1),
      periodEnd: new Date(year, 11, 31),
    };
  }
}
