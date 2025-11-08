import { IsDate, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MaintenanceType } from '@big-bus/types';

export class RecordMaintenanceDto {
  @ApiProperty({
    example: '2024-11-08T00:00:00Z',
    description: 'Date when maintenance was performed',
  })
  @Type(() => Date)
  @IsDate()
  maintenanceDate: Date;

  @ApiProperty({
    example: 'routine',
    enum: MaintenanceType,
    description: 'Type of maintenance performed',
  })
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @ApiProperty({
    example: 'Oil change and tire rotation',
    description: 'Description of maintenance work',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 500000,
    description: 'Cost of maintenance in VND',
  })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Person who performed the maintenance',
    required: false,
  })
  @IsOptional()
  @IsString()
  performedBy?: string;

  @ApiProperty({
    example: '2025-05-08T00:00:00Z',
    description: 'Next scheduled maintenance date',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextMaintenanceDate?: Date;
}
