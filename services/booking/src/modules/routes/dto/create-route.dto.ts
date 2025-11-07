import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({ example: 'Hanoi - Ho Chi Minh City' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  originStationId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  destinationStationId: string;

  @ApiProperty({ example: 1700.5 })
  @IsNumber()
  distance: number;

  @ApiProperty({ example: 1020 })
  @IsNumber()
  estimatedDuration: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
