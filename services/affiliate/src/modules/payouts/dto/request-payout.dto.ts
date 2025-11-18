import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class RequestPayoutDto {
  @IsString()
  affiliateId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>;
}
