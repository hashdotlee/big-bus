import { IsString, IsNumber, IsDate, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VehicleType } from '@big-bus/types';

export class CreateScheduleDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  routeId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ example: '2024-12-25T08:00:00Z' })
  @Type(() => Date)
  @IsDate()
  departureTime: Date;

  @ApiProperty({ example: '2024-12-25T20:00:00Z' })
  @Type(() => Date)
  @IsDate()
  arrivalTime: Date;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  basePrice: number;

  @ApiProperty({ example: 45 })
  @IsNumber()
  totalSeats: number;

  @ApiProperty({ example: 'economy', enum: VehicleType })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;
}
