import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../../../database/entities/transaction.entity';

export class TopUpWalletDto {
  @ApiProperty({ description: 'Amount to top up', example: 100000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.VNPAY,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
