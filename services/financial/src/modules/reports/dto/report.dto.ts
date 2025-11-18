import { IsDateString, IsOptional, IsEnum } from 'class-validator';

export enum ReportType {
  PROFIT_LOSS = 'profit_loss',
  BALANCE_SHEET = 'balance_sheet',
  CASH_FLOW = 'cash_flow',
  INCOME_STATEMENT = 'income_statement',
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  format?: string; // json, pdf, csv
}
