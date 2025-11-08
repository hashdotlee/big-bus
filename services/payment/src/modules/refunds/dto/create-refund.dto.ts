import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsEnum, IsOptional } from 'class-validator';
import { RefundReason } from '../../../database/entities/refund.entity';

export class CreateRefundDto {
  @ApiProperty({ description: 'Transaction ID', example: 'uuid' })
  @IsString()
  transactionId: string;

  @ApiProperty({ description: 'Booking ID', example: 'uuid' })
  @IsString()
  bookingId: string;

  @ApiProperty({ description: 'Refund amount', example: 100000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Refund reason',
    enum: RefundReason,
  })
  @IsEnum(RefundReason)
  reason: RefundReason;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
