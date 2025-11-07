import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStationDto {
  @ApiProperty({ example: 'Hanoi Central Station' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Hanoi' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Hanoi' })
  @IsString()
  province: string;

  @ApiProperty({ example: 21.028511 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 105.804817 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
