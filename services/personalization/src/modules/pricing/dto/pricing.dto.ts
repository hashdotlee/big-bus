import { IsString, IsOptional, IsDateString, IsNumber, IsObject } from 'class-validator';

export class GetPersonalizedPriceDto {
  @IsString()
  userId: string;

  @IsString()
  entityType: string; // route, product

  @IsString()
  entityId: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
