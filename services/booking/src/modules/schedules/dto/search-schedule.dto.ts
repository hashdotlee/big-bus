import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '@big-bus/types';

export class SearchScheduleDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  originStationId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsString()
  destinationStationId: string;

  @ApiProperty({ example: '2024-12-25' })
  @IsDateString()
  departureDate: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  passengerCount?: number;

  @ApiProperty({ example: 'economy', enum: VehicleType, required: false })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;
}
