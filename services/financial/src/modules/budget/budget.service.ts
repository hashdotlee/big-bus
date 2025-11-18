import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../../database/entities/budget.entity';
import { Transaction, TransactionType } from '../../database/entities/transaction.entity';
import { CreateBudgetDto } from './dto/budget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(dto: CreateBudgetDto): Promise<Budget> {
    const budget = this.budgetRepository.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      totalBudgeted: dto.budgetedRevenue - dto.budgetedExpenses,
      projectedProfit: dto.budgetedRevenue - dto.budgetedExpenses,
      status: 'draft',
    });

    return await this.budgetRepository.save(budget);
  }

  async updateActuals(budgetId: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({ where: { id: budgetId } });

    if (!budget) throw new Error('Budget not found');

    // Get actual revenue and expenses
    const revenues = await this.transactionRepository.find({
      where: {
        type: TransactionType.REVENUE,
        status: 'posted',
      },
    });

    const expenses = await this.transactionRepository.find({
      where: {
        type: TransactionType.EXPENSE,
        status: 'posted',
      },
    });

    budget.actualRevenue = revenues.reduce((sum, t) => sum + Number(t.amount), 0);
    budget.actualExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    budget.actualProfit = budget.actualRevenue - budget.actualExpenses;

    budget.totalActual = budget.actualProfit;
    budget.totalVariance = budget.actualProfit - budget.projectedProfit;
    budget.totalVariancePercentage =
      budget.projectedProfit > 0
        ? (budget.totalVariance / budget.projectedProfit) * 100
        : 0;

    return await this.budgetRepository.save(budget);
  }

  async findAll(): Promise<Budget[]> {
    return await this.budgetRepository.find({
      order: { fiscalYear: 'DESC', startDate: 'DESC' },
    });
  }
}
