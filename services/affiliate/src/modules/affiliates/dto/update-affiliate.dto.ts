import { IsString, IsOptional, IsEnum, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AffiliateStatus, CommissionType } from '../../../database/entities/affiliate.entity';

class SocialMediaDto {
  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  youtube?: string;

  @IsOptional()
  @IsString()
  tiktok?: string;
}

class BankAccountDto {
  @IsString()
  bankName: string;

  @IsString()
  accountNumber: string;

  @IsString()
  accountHolder: string;
}

export class UpdateAffiliateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BankAccountDto)
  bankAccount?: BankAccountDto;

  @IsOptional()
  @IsEnum(AffiliateStatus)
  status?: AffiliateStatus;

  @IsOptional()
  @IsEnum(CommissionType)
  commissionType?: CommissionType;

  @IsOptional()
  @IsNumber()
  commissionRate?: number;
}
