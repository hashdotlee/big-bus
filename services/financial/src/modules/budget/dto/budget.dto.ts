import { IsString, IsEnum, IsNumber, IsDateString, IsOptional, IsObject } from 'class-validator';
import { BudgetPeriod } from '../../../database/entities/budget.entity';

export class CreateBudgetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  fiscalYear: number;

  @IsNumber()
  budgetedRevenue: number;

  @IsNumber()
  budgetedExpenses: number;

  @IsOptional()
  @IsObject()
  allocations?: Record<string, number>;
}
