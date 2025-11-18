import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../../database/entities/product.entity';
import { InventoryLog } from '../../database/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, InventoryLog])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
