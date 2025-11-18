import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsBoolean, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from '../../../database/entities/product.entity';

class ProductVariantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber()
  inventory?: number;

  @IsOptional()
  attributes?: Record<string, string>;

  @IsOptional()
  @IsString()
  image?: string;
}

class InventoryDto {
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsBoolean()
  trackInventory: boolean;

  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;
}

class DimensionsDto {
  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsString()
  unit: string;
}

export class CreateProductDto {
  @IsOptional()
  @IsString()
  sellerId?: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => InventoryDto)
  inventory?: InventoryDto;

  @IsOptional()
  attributes?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isAvailableOnBus?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableRoutes?: string[];

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;
}
