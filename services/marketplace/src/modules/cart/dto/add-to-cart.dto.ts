import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsString()
  cartItemId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class RemoveFromCartDto {
  @IsString()
  cartItemId: string;
}
