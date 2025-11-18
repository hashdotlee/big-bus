import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../../database/entities/product.entity';
import { InventoryLog, InventoryOperation } from '../../database/entities/inventory.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InventoryLog)
    private readonly inventoryLogRepository: Repository<InventoryLog>,
  ) {}

  async create(createProductDto: CreateProductDto, sellerId?: string): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      sellerId: createProductDto.sellerId || sellerId,
      status: ProductStatus.DRAFT,
      rating: 0,
      reviewCount: 0,
      soldCount: 0,
    });

    return await this.productRepository.save(product);
  }

  async findAll(filters?: {
    sellerId?: string;
    category?: string;
    subcategory?: string;
    type?: string;
    status?: ProductStatus;
    isAvailableOnBus?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (filters?.sellerId) {
      queryBuilder.andWhere('product.sellerId = :sellerId', { sellerId: filters.sellerId });
    }

    if (filters?.category) {
      queryBuilder.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters?.subcategory) {
      queryBuilder.andWhere('product.subcategory = :subcategory', { subcategory: filters.subcategory });
    }

    if (filters?.type) {
      queryBuilder.andWhere('product.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      queryBuilder.andWhere('product.status = :status', { status: filters.status });
    }

    if (filters?.isAvailableOnBus !== undefined) {
      queryBuilder.andWhere('product.isAvailableOnBus = :isAvailableOnBus', {
        isAvailableOnBus: filters.isAvailableOnBus
      });
    }

    if (filters?.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('product.tags && :tags', { tags: filters.tags });
    }

    queryBuilder.orderBy('product.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    const product = await this.findOne(id);
    product.status = status;
    return await this.productRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async softDelete(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.status = ProductStatus.ARCHIVED;
    return await this.productRepository.save(product);
  }

  async updateInventory(updateInventoryDto: UpdateInventoryDto): Promise<Product> {
    const { productId, variantId, quantity, operation, reason, notes } = updateInventoryDto;

    const product = await this.findOne(productId);

    let currentInventory: number;
    let newInventory: number;

    // Get current inventory
    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found`);
      }
      currentInventory = variant.inventory || 0;
    } else {
      currentInventory = product.inventory?.quantity || 0;
    }

    // Calculate new inventory
    switch (operation) {
      case 'set':
        newInventory = quantity;
        break;
      case 'increment':
        newInventory = currentInventory + quantity;
        break;
      case 'decrement':
        newInventory = currentInventory - quantity;
        if (newInventory < 0) {
          throw new BadRequestException('Insufficient inventory');
        }
        break;
      default:
        throw new BadRequestException('Invalid operation');
    }

    // Update inventory
    if (variantId && product.variants) {
      product.variants = product.variants.map(v => {
        if (v.id === variantId) {
          return { ...v, inventory: newInventory };
        }
        return v;
      });
    } else {
      if (!product.inventory) {
        product.inventory = {
          quantity: newInventory,
          trackInventory: true,
        };
      } else {
        product.inventory.quantity = newInventory;
      }
    }

    // Log inventory change
    const inventoryLog = this.inventoryLogRepository.create({
      productId,
      variantId,
      operation: reason || InventoryOperation.MANUAL_ADJUSTMENT,
      quantityChange: newInventory - currentInventory,
      quantityBefore: currentInventory,
      quantityAfter: newInventory,
      notes,
    });

    await this.inventoryLogRepository.save(inventoryLog);

    return await this.productRepository.save(product);
  }

  async checkInventory(productId: string, variantId?: string, requiredQuantity: number = 1): Promise<boolean> {
    const product = await this.findOne(productId);

    let availableInventory: number;

    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found`);
      }
      availableInventory = variant.inventory || 0;
    } else {
      if (!product.inventory?.trackInventory) {
        return true; // Inventory tracking disabled
      }
      availableInventory = product.inventory?.quantity || 0;
    }

    return availableInventory >= requiredQuantity;
  }

  async getLowStockProducts(sellerId?: string): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (sellerId) {
      queryBuilder.where('product.sellerId = :sellerId', { sellerId });
    }

    const products = await queryBuilder.getMany();

    return products.filter(product => {
      if (!product.inventory?.trackInventory) {
        return false;
      }

      const threshold = product.inventory.lowStockThreshold || 10;
      const currentStock = product.inventory.quantity || 0;

      return currentStock <= threshold;
    });
  }

  async getInventoryLogs(productId: string, variantId?: string): Promise<InventoryLog[]> {
    const where: any = { productId };

    if (variantId) {
      where.variantId = variantId;
    }

    return await this.inventoryLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async incrementSoldCount(productId: string, quantity: number): Promise<void> {
    await this.productRepository.increment({ id: productId }, 'soldCount', quantity);
  }

  async updateRating(productId: string, newRating: number): Promise<Product> {
    const product = await this.findOne(productId);

    const totalRating = product.rating * product.reviewCount + newRating;
    product.reviewCount += 1;
    product.rating = totalRating / product.reviewCount;

    return await this.productRepository.save(product);
  }

  async searchByRoute(routeId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.isAvailableOnBus = :isAvailable', { isAvailable: true })
      .andWhere(':routeId = ANY(product.availableRoutes)', { routeId })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .getMany();
  }
}
