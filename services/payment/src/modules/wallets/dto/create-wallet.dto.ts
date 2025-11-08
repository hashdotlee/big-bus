import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Currency } from '../../../database/entities/wallet.entity';

export class CreateWalletDto {
  @ApiProperty({ description: 'User ID', example: 'uuid' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Wallet currency',
    enum: Currency,
    default: Currency.VND,
  })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiProperty({ description: 'Is primary wallet', default: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
