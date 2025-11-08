import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { RefundStatus } from '../../../database/entities/refund.entity';

export class ProcessRefundDto {
  @ApiProperty({
    description: 'Refund status',
    enum: RefundStatus,
  })
  @IsEnum(RefundStatus)
  status: RefundStatus;

  @ApiProperty({ description: 'Gateway refund ID', required: false })
  @IsString()
  @IsOptional()
  gatewayRefundId?: string;

  @ApiProperty({ description: 'Error code', required: false })
  @IsString()
  @IsOptional()
  errorCode?: string;

  @ApiProperty({ description: 'Error message', required: false })
  @IsString()
  @IsOptional()
  errorMessage?: string;
}
