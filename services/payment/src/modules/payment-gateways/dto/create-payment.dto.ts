import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional, IsEnum } from 'class-validator';

export enum PaymentGatewayType {
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Amount to pay', example: 100000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Booking ID', example: 'uuid' })
  @IsString()
  bookingId: string;

  @ApiProperty({ description: 'Payment description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Payment gateway type',
    enum: PaymentGatewayType,
  })
  @IsEnum(PaymentGatewayType)
  gateway: PaymentGatewayType;

  @ApiProperty({ description: 'Return URL after payment', required: false })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}
