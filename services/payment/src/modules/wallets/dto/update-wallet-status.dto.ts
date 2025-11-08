import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { WalletStatus } from '../../../database/entities/wallet.entity';

export class UpdateWalletStatusDto {
  @ApiProperty({
    description: 'Wallet status',
    enum: WalletStatus,
  })
  @IsEnum(WalletStatus)
  status: WalletStatus;
}
