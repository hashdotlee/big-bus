import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDate,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VehicleType, VehicleStatus } from '@big-bus/types';

export class CreateVehicleDto {
  @ApiProperty({ example: '51A-12345', description: 'Vehicle plate number' })
  @IsString()
  @Length(1, 50)
  plateNumber: string;

  @ApiProperty({
    example: 'economy',
    enum: VehicleType,
    description: 'Type of vehicle',
  })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiProperty({ example: 'Thaco Universe K47', description: 'Vehicle model' })
  @IsString()
  @Length(1, 100)
  model: string;

  @ApiProperty({
    example: 'Thaco',
    description: 'Vehicle manufacturer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  manufacturer?: string;

  @ApiProperty({ example: 45, description: 'Seating capacity' })
  @IsNumber()
  @Min(1)
  @Max(200)
  capacity: number;

  @ApiProperty({
    example: 2023,
    description: 'Year of manufacture',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  manufactureYear?: number;

  @ApiProperty({
    example: 'active',
    enum: VehicleStatus,
    description: 'Vehicle status',
    required: false,
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiProperty({
    example: true,
    description: 'Whether vehicle is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: '2024-01-15T00:00:00Z',
    description: 'Last maintenance date',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastMaintenanceDate?: Date;

  @ApiProperty({
    example: '2024-07-15T00:00:00Z',
    description: 'Next scheduled maintenance date',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextMaintenanceDate?: Date;

  @ApiProperty({
    example: 50000.5,
    description: 'Current mileage in kilometers',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage?: number;

  @ApiProperty({
    example: 'Recently serviced air conditioning system',
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
