import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus, DeliveryMethod } from '../../database/entities/order.entity';
import { Product } from '../../database/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { InventoryOperation } from '../../database/entities/inventory.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, customerId?: string): Promise<Order> {
    const { items, shippingAddress, billingAddress, deliveryMethod, bookingId, routeId } = createOrderDto;

    // Validate items and check inventory
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);

      // Check inventory availability
      const hasInventory = await this.productsService.checkInventory(
        item.productId,
        item.variantId,
        item.quantity
      );

      if (!hasInventory) {
        throw new BadRequestException(
          `Product "${product.name}" does not have sufficient inventory`
        );
      }

      // Get price
      let price = product.price;
      let variantName: string | undefined;

      if (item.variantId && product.variants) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) {
          throw new NotFoundException(`Variant ${item.variantId} not found`);
        }
        price = variant.price || product.price;
        variantName = variant.name;
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: product.name,
        variantName,
        quantity: item.quantity,
        price,
        total: itemTotal,
        image: product.images[0],
      });
    }

    // Calculate totals (simplified - you can add tax, shipping, discounts later)
    const shippingFee = deliveryMethod === DeliveryMethod.DELIVERY ? 5.00 : 0;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shippingFee + tax;

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Create order
    const order = this.orderRepository.create({
      customerId: createOrderDto.customerId || customerId,
      orderNumber,
      items: validatedItems,
      subtotal,
      shippingFee,
      tax,
      total,
      currency: 'USD',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      shippingAddress,
      billingAddress,
      deliveryMethod,
      bookingId,
      routeId,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Reserve inventory
    for (const item of items) {
      await this.productsService.updateInventory({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        operation: 'decrement',
        reason: InventoryOperation.ORDER_RESERVED,
        notes: `Order ${orderNumber}`,
      });
    }

    return savedOrder;
  }

  async findAll(filters?: {
    customerId?: string;
    sellerId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    deliveryMethod?: DeliveryMethod;
    bookingId?: string;
    routeId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (filters?.customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters?.sellerId) {
      // Filter orders containing products from a specific seller
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(order.items) AS item
          WHERE (item->>'productId')::text IN (
            SELECT id::text FROM products WHERE "sellerId" = :sellerId
          )
        )`,
        { sellerId: filters.sellerId }
      );
    }

    if (filters?.status) {
      queryBuilder.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters?.paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
    }

    if (filters?.deliveryMethod) {
      queryBuilder.andWhere('order.deliveryMethod = :deliveryMethod', { deliveryMethod: filters.deliveryMethod });
    }

    if (filters?.bookingId) {
      queryBuilder.andWhere('order.bookingId = :bookingId', { bookingId: filters.bookingId });
    }

    if (filters?.routeId) {
      queryBuilder.andWhere('order.routeId = :routeId', { routeId: filters.routeId });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { orderNumber } });

    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);

    // Validate status transitions
    this.validateStatusTransition(order.status, status);

    order.status = status;

    // Handle specific status changes
    if (status === OrderStatus.CONFIRMED) {
      order.confirmedAt = new Date();

      // Update sold count for products
      for (const item of order.items) {
        await this.productsService.incrementSoldCount(item.productId, item.quantity);
      }
    }

    if (status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    }

    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    if (status === OrderStatus.CANCELLED) {
      // Restore inventory
      for (const item of order.items) {
        await this.productsService.updateInventory({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          operation: 'increment',
          reason: InventoryOperation.ORDER_CANCELLED,
          notes: `Order ${order.orderNumber} cancelled`,
        });
      }
    }

    return await this.orderRepository.save(order);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paymentIntentId?: string): Promise<Order> {
    const order = await this.findOne(id);

    order.paymentStatus = paymentStatus;

    if (paymentIntentId) {
      order.paymentIntentId = paymentIntentId;
    }

    if (paymentStatus === PaymentStatus.PAID) {
      order.paidAt = new Date();

      // Auto-confirm order when paid
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.CONFIRMED;
        order.confirmedAt = new Date();
      }
    }

    return await this.orderRepository.save(order);
  }

  async updateTracking(id: string, trackingNumber: string, trackingUrl?: string): Promise<Order> {
    const order = await this.findOne(id);

    order.trackingNumber = trackingNumber;
    if (trackingUrl) {
      order.trackingUrl = trackingUrl;
    }

    // Auto-mark as shipped if not already
    if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.DELIVERED) {
      order.status = OrderStatus.SHIPPED;
      order.shippedAt = new Date();
    }

    return await this.orderRepository.save(order);
  }

  async cancel(id: string, reason: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order already cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelReason = reason;

    // Restore inventory
    for (const item of order.items) {
      await this.productsService.updateInventory({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        operation: 'increment',
        reason: InventoryOperation.ORDER_CANCELLED,
        notes: `Order ${order.orderNumber} cancelled: ${reason}`,
      });
    }

    return await this.orderRepository.save(order);
  }

  async getOrderStats(customerId?: string, sellerId?: string): Promise<any> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (customerId) {
      queryBuilder.where('order.customerId = :customerId', { customerId });
    }

    if (sellerId) {
      queryBuilder.where(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(order.items) AS item
          WHERE (item->>'productId')::text IN (
            SELECT id::text FROM products WHERE "sellerId" = :sellerId
          )
        )`,
        { sellerId }
      );
    }

    const orders = await queryBuilder.getMany();

    const stats = {
      totalOrders: orders.length,
      totalRevenue: 0,
      averageOrderValue: 0,
      byStatus: {} as Record<OrderStatus, number>,
      byPaymentStatus: {} as Record<PaymentStatus, number>,
    };

    // Initialize counters
    Object.values(OrderStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });
    Object.values(PaymentStatus).forEach(status => {
      stats.byPaymentStatus[status] = 0;
    });

    // Calculate stats
    orders.forEach(order => {
      stats.totalRevenue += Number(order.total);
      stats.byStatus[order.status]++;
      stats.byPaymentStatus[order.paymentStatus]++;
    });

    stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

    return stats;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
