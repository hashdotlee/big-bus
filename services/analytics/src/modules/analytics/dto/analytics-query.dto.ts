import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';

export enum TimeRange {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class AnalyticsQueryDto {
  @ApiProperty({
    description: 'Start date for analytics period',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for analytics period',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Predefined time range',
    enum: TimeRange,
    required: false,
  })
  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange;

  @ApiProperty({
    description: 'Route ID for filtering',
    required: false,
  })
  @IsOptional()
  @IsString()
  routeId?: string;

  @ApiProperty({
    description: 'Station ID for filtering',
    required: false,
  })
  @IsOptional()
  @IsString()
  stationId?: string;
}
