import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class RecordConversionDto {
  @IsString()
  referralCode: string;

  @IsString()
  customerId: string;

  @IsString()
  orderId: string;

  @IsNumber()
  orderAmount: number;

  @IsOptional()
  @IsArray()
  products?: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}
