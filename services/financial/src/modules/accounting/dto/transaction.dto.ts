import { IsString, IsEnum, IsNumber, IsDateString, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, TransactionCategory } from '../../../database/entities/transaction.entity';

export class JournalEntryDto {
  @IsString()
  accountId: string;

  @IsEnum(['debit', 'credit'])
  entryType: 'debit' | 'credit';

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @IsDateString()
  transactionDate: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  payeePayor?: string;

  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryDto)
  journalEntries?: JournalEntryDto[];
}

export class RecordRevenueDto {
  @IsString()
  source: string; // booking, marketplace, affiliate

  @IsString()
  sourceId: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;
}

export class RecordExpenseDto {
  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @IsNumber()
  amount: number;

  @IsDateString()
  transactionDate: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  payee?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;
}
