import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { ReportFormat } from '../../../database/entities/report.entity';

export class ExportReportDto {
  @ApiProperty({
    description: 'Report ID to export',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  reportId: string;

  @ApiProperty({
    description: 'Export format',
    enum: ReportFormat,
    example: ReportFormat.PDF,
  })
  @IsEnum(ReportFormat)
  format: ReportFormat;
}
