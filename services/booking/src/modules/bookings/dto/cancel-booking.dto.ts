import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiProperty({ example: 'Trip cancelled due to emergency', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
