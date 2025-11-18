import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus, DeliveryMethod } from '../../database/entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req?: any) {
    const customerId = req?.user?.id || createOrderDto.customerId;
    return await this.ordersService.create(createOrderDto, customerId);
  }

  @Get()
  async findAll(
    @Query('customerId') customerId?: string,
    @Query('sellerId') sellerId?: string,
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('deliveryMethod') deliveryMethod?: DeliveryMethod,
    @Query('bookingId') bookingId?: string,
    @Query('routeId') routeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (customerId) filters.customerId = customerId;
    if (sellerId) filters.sellerId = sellerId;
    if (status) filters.status = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (deliveryMethod) filters.deliveryMethod = deliveryMethod;
    if (bookingId) filters.bookingId = bookingId;
    if (routeId) filters.routeId = routeId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);

    return await this.ordersService.findAll(filters);
  }

  @Get('stats')
  async getStats(
    @Query('customerId') customerId?: string,
    @Query('sellerId') sellerId?: string,
  ) {
    return await this.ordersService.getOrderStats(customerId, sellerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @Get('number/:orderNumber')
  async findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return await this.ordersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus
  ) {
    return await this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
    @Body('paymentIntentId') paymentIntentId?: string,
  ) {
    return await this.ordersService.updatePaymentStatus(id, paymentStatus, paymentIntentId);
  }

  @Patch(':id/tracking')
  async updateTracking(
    @Param('id') id: string,
    @Body('trackingNumber') trackingNumber: string,
    @Body('trackingUrl') trackingUrl?: string,
  ) {
    return await this.ordersService.updateTracking(id, trackingNumber, trackingUrl);
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return await this.ordersService.cancel(id, reason);
  }
}
