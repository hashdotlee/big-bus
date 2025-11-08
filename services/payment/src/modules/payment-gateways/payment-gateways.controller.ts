import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentGatewaysService } from './payment-gateways.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payment-gateways')
@Controller('payment-gateways')
export class PaymentGatewaysController {
  constructor(
    private readonly paymentGatewaysService: PaymentGatewaysService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create payment URL' })
  @ApiResponse({ status: 201, description: 'Payment URL created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid gateway or request' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID (temporary, will be from JWT)' })
  async createPayment(
    @Query('userId') userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentGatewaysService.createPayment(userId, createPaymentDto);
  }

  @Get('vnpay/callback')
  @ApiOperation({ summary: 'VNPay payment callback' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  async vnpayCallback(@Query() query: any) {
    return this.paymentGatewaysService.handleVNPayCallback(query);
  }

  @Post('momo/notify')
  @ApiOperation({ summary: 'Momo payment notification' })
  @ApiResponse({ status: 200, description: 'Notification processed successfully' })
  async momoNotify(@Body() body: any) {
    return this.paymentGatewaysService.handleMomoCallback(body);
  }

  @Post('zalopay/callback')
  @ApiOperation({ summary: 'ZaloPay payment callback' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  async zalopayCallback(@Body() body: any) {
    return this.paymentGatewaysService.handleZaloPayCallback(body);
  }
}
