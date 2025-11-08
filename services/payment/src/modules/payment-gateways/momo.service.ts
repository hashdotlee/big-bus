import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Transaction, TransactionStatus } from '../../database/entities/transaction.entity';

@Injectable()
export class MomoService {
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly endpoint: string;
  private readonly returnUrl: string;
  private readonly notifyUrl: string;

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
    this.accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
    this.secretKey = this.configService.get<string>('MOMO_SECRET_KEY');
    this.endpoint = this.configService.get<string>('MOMO_ENDPOINT');
    this.returnUrl = this.configService.get<string>('MOMO_RETURN_URL');
    this.notifyUrl = this.configService.get<string>('MOMO_NOTIFY_URL');
  }

  async createPaymentUrl(
    transactionId: string,
    amount: number,
    description: string,
    returnUrl?: string,
  ): Promise<string> {
    const orderId = transactionId;
    const requestId = orderId;
    const orderInfo = description || 'Payment for booking';
    const redirectUrl = returnUrl || this.returnUrl;
    const ipnUrl = this.notifyUrl;
    const requestType = 'captureWallet';
    const extraData = '';

    // Create signature
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.endpoint, requestBody),
      );

      if (response.data.resultCode === 0) {
        return response.data.payUrl;
      } else {
        throw new BadRequestException('Failed to create Momo payment URL');
      }
    } catch (error) {
      throw new BadRequestException('Failed to create Momo payment URL');
    }
  }

  async handleCallback(body: any): Promise<any> {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;

    // Verify signature
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid signature');
    }

    const transaction = await this.transactionRepository.findOne({
      where: { id: orderId },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (resultCode === 0) {
      transaction.status = TransactionStatus.COMPLETED;
      transaction.gatewayTransactionId = transId;
      transaction.completedAt = new Date();
    } else {
      transaction.status = TransactionStatus.FAILED;
      transaction.errorCode = String(resultCode);
      transaction.errorMessage = message;
    }

    await this.transactionRepository.save(transaction);

    return {
      success: resultCode === 0,
      transactionId: orderId,
      gatewayTransactionId: transId,
      resultCode,
      message,
    };
  }
}
