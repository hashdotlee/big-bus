import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsOptional, IsObject } from 'class-validator';
import { PredictionType } from '../../../database/entities/prediction.entity';

export class CreatePredictionDto {
  @ApiProperty({
    description: 'Type of prediction',
    enum: PredictionType,
    example: PredictionType.DEMAND,
  })
  @IsEnum(PredictionType)
  predictionType: PredictionType;

  @ApiProperty({
    description: 'Target date for prediction',
    example: '2024-12-31',
  })
  @IsDateString()
  targetDate: string;

  @ApiProperty({
    description: 'Additional parameters for the prediction model',
    required: false,
  })
  @IsOptional()
  @IsObject()
  parameters?: any;
}
