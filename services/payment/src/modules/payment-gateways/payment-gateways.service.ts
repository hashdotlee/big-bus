import { Injectable, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction, TransactionType, TransactionStatus } from '../../database/entities/transaction.entity';
import { PaymentGatewayLog, GatewayProvider, RequestType } from '../../database/entities/payment-gateway-log.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VNPayService } from './vnpay.service';
import { MomoService } from './momo.service';
import { ZaloPayService } from './zalopay.service';
import { ExtensionRegistry, ExtensionCategory, IPaymentGatewayExtension } from '@big-bus/extensions';

@Injectable()
export class PaymentGatewaysService {
  private readonly logger = new Logger(PaymentGatewaysService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(PaymentGatewayLog)
    private readonly gatewayLogRepository: Repository<PaymentGatewayLog>,
    private readonly vnpayService: VNPayService,
    private readonly momoService: MomoService,
    private readonly zalopayService: ZaloPayService,
    private readonly configService: ConfigService,
    @Inject('PAYMENT_EXTENSION_REGISTRY')
    private readonly extensionRegistry: ExtensionRegistry,
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

    try {
      // Try to use extension first
      const extension = this.extensionRegistry.get<IPaymentGatewayExtension>(createPaymentDto.gateway);

      if (extension && extension.enabled) {
        this.logger.log(`Using payment extension: ${extension.name} for gateway: ${createPaymentDto.gateway}`);

        const result = await extension.createPayment({
          amount: createPaymentDto.amount,
          currency: 'VND' as any,
          orderId: savedTransaction.id,
          orderDescription: createPaymentDto.description || 'Payment for booking',
          customerId: userId,
          returnUrl: createPaymentDto.returnUrl,
          cancelUrl: createPaymentDto.cancelUrl,
        });

        if (result.success) {
          // Update transaction with gateway transaction ID
          savedTransaction.gatewayTransactionId = result.gatewayTransactionId;
          await this.transactionRepository.save(savedTransaction);

          // Log gateway request
          await this.logGatewayRequest(
            savedTransaction.id,
            createPaymentDto.gateway.toUpperCase() as GatewayProvider,
            RequestType.PAYMENT_REQUEST,
            { orderId: savedTransaction.id, amount: createPaymentDto.amount },
            result,
            true,
          );

          return {
            transactionId: savedTransaction.id,
            paymentUrl: result.paymentUrl,
            amount: createPaymentDto.amount,
            currency: 'VND',
            gatewayTransactionId: result.gatewayTransactionId,
          };
        } else {
          throw new BadRequestException(result.message || 'Payment creation failed');
        }
      }

      // Fallback to existing implementation
      let paymentUrl: string;

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
    } catch (error) {
      // Log failed request
      await this.logGatewayRequest(
        savedTransaction.id,
        createPaymentDto.gateway.toUpperCase() as GatewayProvider,
        RequestType.PAYMENT_REQUEST,
        { orderId: savedTransaction.id, amount: createPaymentDto.amount },
        {},
        false,
        error.message,
      );
      throw error;
    }
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

  async handleExtensionCallback(gateway: string, body: any, query: any): Promise<any> {
    const extension = this.extensionRegistry.get<IPaymentGatewayExtension>(gateway);

    if (!extension || !extension.enabled) {
      throw new BadRequestException(`Payment gateway ${gateway} not available`);
    }

    try {
      // Handle callback using extension
      const data = Object.keys(body).length > 0 ? body : query;
      const callbackData = await extension.handleCallback(data);

      // Find transaction
      const transaction = await this.transactionRepository.findOne({
        where: { id: callbackData.orderId },
      });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      // Update transaction status
      transaction.status = this.mapPaymentStatus(callbackData.status);
      transaction.gatewayTransactionId = callbackData.gatewayTransactionId;
      transaction.completedAt = callbackData.status === 'completed' ? new Date() : null;
      transaction.errorMessage = callbackData.errorMessage;
      transaction.errorCode = callbackData.errorCode;

      await this.transactionRepository.save(transaction);

      // Log callback
      await this.logGatewayRequest(
        transaction.id,
        gateway.toUpperCase() as GatewayProvider,
        RequestType.CALLBACK,
        data,
        callbackData,
        callbackData.status === 'completed',
      );

      return {
        success: callbackData.status === 'completed',
        transactionId: transaction.id,
        status: transaction.status,
      };
    } catch (error) {
      this.logger.error(`Extension callback error for ${gateway}:`, error);
      throw error;
    }
  }

  async getAvailableGateways(): Promise<any> {
    const extensions = this.extensionRegistry
      .getEnabledByCategory(ExtensionCategory.PAYMENT)
      .map(ext => {
        const metadata = ext.getMetadata();
        const gateway = ext as IPaymentGatewayExtension;
        return {
          id: metadata.id,
          name: metadata.name,
          version: metadata.version,
          supportedMethods: gateway.getSupportedPaymentMethods(),
          supportedCurrencies: gateway.getSupportedCurrencies(),
        };
      });

    return {
      existing: [
        {
          id: 'vnpay',
          name: 'VNPay',
          supportedMethods: ['card', 'bank_transfer'],
          supportedCurrencies: ['VND'],
        },
        {
          id: 'momo',
          name: 'Momo',
          supportedMethods: ['e_wallet'],
          supportedCurrencies: ['VND'],
        },
        {
          id: 'zalopay',
          name: 'ZaloPay',
          supportedMethods: ['e_wallet'],
          supportedCurrencies: ['VND'],
        },
      ],
      extensions,
    };
  }

  private mapPaymentStatus(status: string): TransactionStatus {
    switch (status.toLowerCase()) {
      case 'completed':
        return TransactionStatus.COMPLETED;
      case 'failed':
        return TransactionStatus.FAILED;
      case 'cancelled':
        return TransactionStatus.CANCELLED;
      case 'processing':
        return TransactionStatus.PROCESSING;
      default:
        return TransactionStatus.PENDING;
    }
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
