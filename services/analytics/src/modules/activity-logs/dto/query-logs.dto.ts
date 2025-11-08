import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryLogsDto {
  @ApiProperty({
    description: 'User ID to filter by',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Action to filter by',
    required: false,
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: 'Entity type to filter by',
    required: false,
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({
    description: 'Entity ID to filter by',
    required: false,
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({
    description: 'Start date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Page number',
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    default: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
