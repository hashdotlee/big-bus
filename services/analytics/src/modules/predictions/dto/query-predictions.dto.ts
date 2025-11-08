import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PredictionType, PredictionStatus } from '../../../database/entities/prediction.entity';

export class QueryPredictionsDto {
  @ApiProperty({
    description: 'Filter by prediction type',
    enum: PredictionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(PredictionType)
  predictionType?: PredictionType;

  @ApiProperty({
    description: 'Filter by status',
    enum: PredictionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PredictionStatus)
  status?: PredictionStatus;

  @ApiProperty({
    description: 'Start date for target date range',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for target date range',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
