import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ProductStatus } from '../../database/entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Request() req?: any) {
    const sellerId = req?.user?.id || createProductDto.sellerId;
    return await this.productsService.create(createProductDto, sellerId);
  }

  @Get()
  async findAll(
    @Query('sellerId') sellerId?: string,
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
    @Query('type') type?: string,
    @Query('status') status?: ProductStatus,
    @Query('isAvailableOnBus') isAvailableOnBus?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (sellerId) filters.sellerId = sellerId;
    if (category) filters.category = category;
    if (subcategory) filters.subcategory = subcategory;
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (isAvailableOnBus !== undefined) filters.isAvailableOnBus = isAvailableOnBus === 'true';
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (search) filters.search = search;
    if (tags) filters.tags = tags.split(',');
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);

    return await this.productsService.findAll(filters);
  }

  @Get('low-stock')
  async getLowStockProducts(@Query('sellerId') sellerId?: string) {
    return await this.productsService.getLowStockProducts(sellerId);
  }

  @Get('route/:routeId')
  async getProductsByRoute(@Param('routeId') routeId: string) {
    return await this.productsService.searchByRoute(routeId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProductStatus
  ) {
    return await this.productsService.updateStatus(id, status);
  }

  @Patch(':id/inventory')
  async updateInventory(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto
  ) {
    return await this.productsService.updateInventory(updateInventoryDto);
  }

  @Get(':id/inventory/check')
  async checkInventory(
    @Param('id') id: string,
    @Query('variantId') variantId?: string,
    @Query('quantity') quantity?: string
  ) {
    const requiredQuantity = quantity ? parseInt(quantity) : 1;
    const available = await this.productsService.checkInventory(id, variantId, requiredQuantity);
    return { available };
  }

  @Get(':id/inventory/logs')
  async getInventoryLogs(
    @Param('id') id: string,
    @Query('variantId') variantId?: string
  ) {
    return await this.productsService.getInventoryLogs(id, variantId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }

  @Delete(':id/soft')
  async softDelete(@Param('id') id: string) {
    return await this.productsService.softDelete(id);
  }
}
