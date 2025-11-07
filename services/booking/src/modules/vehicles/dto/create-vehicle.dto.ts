import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VehicleType } from '@big-bus/types';

export class CreateVehicleDto {
  @ApiProperty({ example: '51A-12345' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'economy', enum: VehicleType })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiProperty({ example: 'Thaco Universe K47' })
  @IsString()
  model: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  capacity: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastMaintenanceDate?: Date;
}
