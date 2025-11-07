import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculatePriceDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  scheduleId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  passengerCount: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  pickupStationId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsUUID()
  dropoffStationId: string;

  @ApiProperty({ example: 'PROMO2024', required: false })
  @IsOptional()
  @IsString()
  promotionCode?: string;
}
