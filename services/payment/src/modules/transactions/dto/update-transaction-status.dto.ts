import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '../../../database/entities/transaction.entity';

export class UpdateTransactionStatusDto {
  @ApiProperty({
    description: 'Transaction status',
    enum: TransactionStatus,
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty({ description: 'Gateway transaction ID', required: false })
  @IsString()
  @IsOptional()
  gatewayTransactionId?: string;

  @ApiProperty({ description: 'Error code', required: false })
  @IsString()
  @IsOptional()
  errorCode?: string;

  @ApiProperty({ description: 'Error message', required: false })
  @IsString()
  @IsOptional()
  errorMessage?: string;
}
