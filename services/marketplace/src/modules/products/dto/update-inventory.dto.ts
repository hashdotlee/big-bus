import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { InventoryOperation } from '../../../database/entities/inventory.entity';

export class UpdateInventoryDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  quantity: number;

  @IsEnum(['set', 'increment', 'decrement'])
  operation: 'set' | 'increment' | 'decrement';

  @IsOptional()
  @IsEnum(InventoryOperation)
  reason?: InventoryOperation;

  @IsOptional()
  @IsString()
  notes?: string;
}
