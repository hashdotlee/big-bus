import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction, TransactionType, TransactionStatus } from '../../database/entities/transaction.entity';
import { PaymentGatewayLog, GatewayProvider, RequestType } from '../../database/entities/payment-gateway-log.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VNPayService } from './vnpay.service';
import { MomoService } from './momo.service';
import { ZaloPayService } from './zalopay.service';

@Injectable()
export class PaymentGatewaysService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(PaymentGatewayLog)
    private readonly gatewayLogRepository: Repository<PaymentGatewayLog>,
    private readonly vnpayService: VNPayService,
    private readonly momoService: MomoService,
    private readonly zalopayService: ZaloPayService,
    private readonly configService: ConfigService,
  ) {}

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto): Promise<any> {
    // Create transaction record
    const transaction = this.transactionRepository.create({
      userId,
      bookingId: createPaymentDto.bookingId,
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PENDING,
      paymentMethod: createPaymentDto.gateway,
      amount: createPaymentDto.amount,
      currency: 'VND',
      description: createPaymentDto.description || 'Payment for booking',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    let paymentUrl: string;

    // Create payment URL based on gateway
    switch (createPaymentDto.gateway) {
      case 'vnpay':
        paymentUrl = await this.vnpayService.createPaymentUrl(
          savedTransaction.id,
          createPaymentDto.amount,
          createPaymentDto.description,
          createPaymentDto.returnUrl,
        );
        break;
      case 'momo':
        paymentUrl = await this.momoService.createPaymentUrl(
          savedTransaction.id,
          createPaymentDto.amount,
          createPaymentDto.description,
          createPaymentDto.returnUrl,
        );
        break;
      case 'zalopay':
        paymentUrl = await this.zalopayService.createPaymentUrl(
          savedTransaction.id,
          createPaymentDto.amount,
          createPaymentDto.description,
        );
        break;
      default:
        throw new BadRequestException('Invalid payment gateway');
    }

    return {
      transactionId: savedTransaction.id,
      paymentUrl,
      amount: createPaymentDto.amount,
      currency: 'VND',
    };
  }

  async handleVNPayCallback(queryParams: any): Promise<any> {
    return this.vnpayService.handleCallback(queryParams);
  }

  async handleMomoCallback(body: any): Promise<any> {
    return this.momoService.handleCallback(body);
  }

  async handleZaloPayCallback(body: any): Promise<any> {
    return this.zalopayService.handleCallback(body);
  }

  async logGatewayRequest(
    transactionId: string,
    provider: GatewayProvider,
    requestType: RequestType,
    requestData: any,
    responseData: any,
    isSuccess: boolean,
    error?: string,
  ): Promise<void> {
    const log = this.gatewayLogRepository.create({
      transactionId,
      provider,
      requestType,
      requestBody: requestData,
      responseBody: responseData,
      isSuccess,
      errorMessage: error,
    });

    await this.gatewayLogRepository.save(log);
  }
}
