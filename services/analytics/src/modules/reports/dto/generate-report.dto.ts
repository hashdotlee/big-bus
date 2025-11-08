import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsOptional, IsString } from 'class-validator';
import { ReportType, ReportFormat } from '../../../database/entities/report.entity';

export class GenerateReportDto {
  @ApiProperty({
    description: 'Type of report to generate',
    enum: ReportType,
    example: ReportType.DAILY,
  })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({
    description: 'Start date for the report',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for the report',
    example: '2024-01-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Output format',
    enum: ReportFormat,
    default: ReportFormat.JSON,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiProperty({
    description: 'Report title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Report description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
