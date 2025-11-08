import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Transaction, TransactionStatus } from '../../database/entities/transaction.entity';

@Injectable()
export class ZaloPayService {
  private readonly appId: string;
  private readonly key1: string;
  private readonly key2: string;
  private readonly endpoint: string;
  private readonly callbackUrl: string;

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.appId = this.configService.get<string>('ZALOPAY_APP_ID');
    this.key1 = this.configService.get<string>('ZALOPAY_KEY1');
    this.key2 = this.configService.get<string>('ZALOPAY_KEY2');
    this.endpoint = this.configService.get<string>('ZALOPAY_ENDPOINT');
    this.callbackUrl = this.configService.get<string>('ZALOPAY_CALLBACK_URL');
  }

  async createPaymentUrl(
    transactionId: string,
    amount: number,
    description: string,
  ): Promise<string> {
    const appTransId = `${Date.now()}_${transactionId}`;
    const embedData = JSON.stringify({
      redirecturl: this.callbackUrl,
    });

    const items = JSON.stringify([
      {
        itemid: transactionId,
        itemname: description || 'Payment for booking',
        itemprice: amount,
        itemquantity: 1,
      },
    ]);

    const order: any = {
      app_id: this.appId,
      app_trans_id: appTransId,
      app_user: 'user123',
      app_time: Date.now(),
      item: items,
      embed_data: embedData,
      amount: amount,
      description: description || 'Payment for booking',
      bank_code: '',
      callback_url: this.callbackUrl,
    };

    // Create MAC
    const data = `${this.appId}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex');

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.endpoint, null, {
          params: order,
        }),
      );

      if (response.data.return_code === 1) {
        return response.data.order_url;
      } else {
        throw new BadRequestException('Failed to create ZaloPay payment URL');
      }
    } catch (error) {
      throw new BadRequestException('Failed to create ZaloPay payment URL');
    }
  }

  async handleCallback(body: any): Promise<any> {
    const { data: dataStr, mac } = body;

    // Verify MAC
    const expectedMac = crypto
      .createHmac('sha256', this.key2)
      .update(dataStr)
      .digest('hex');

    if (mac !== expectedMac) {
      throw new BadRequestException('Invalid MAC');
    }

    const data = JSON.parse(dataStr);
    const transactionId = data.app_trans_id.split('_')[1];

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    transaction.status = TransactionStatus.COMPLETED;
    transaction.gatewayTransactionId = data.zp_trans_id;
    transaction.completedAt = new Date();

    await this.transactionRepository.save(transaction);

    return {
      return_code: 1,
      return_message: 'success',
    };
  }
}
