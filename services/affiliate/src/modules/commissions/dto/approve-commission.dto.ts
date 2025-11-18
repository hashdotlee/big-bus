import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommissionStatus } from '../../../database/entities/commission.entity';

export class ApproveCommissionDto {
  @IsEnum(CommissionStatus)
  status: CommissionStatus;

  @IsOptional()
  @IsString()
  rejectedReason?: string;
}
