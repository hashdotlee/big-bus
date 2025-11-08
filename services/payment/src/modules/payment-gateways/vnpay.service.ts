import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as querystring from 'querystring';
import { Transaction, TransactionStatus } from '../../database/entities/transaction.entity';

@Injectable()
export class VNPayService {
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly url: string;
  private readonly returnUrl: string;

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly configService: ConfigService,
  ) {
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE');
    this.hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET');
    this.url = this.configService.get<string>('VNPAY_URL');
    this.returnUrl = this.configService.get<string>('VNPAY_RETURN_URL');
  }

  async createPaymentUrl(
    transactionId: string,
    amount: number,
    description: string,
    returnUrl?: string,
  ): Promise<string> {
    const date = new Date();
    const createDate = this.formatDate(date);
    const orderId = transactionId;
    const ipAddr = '127.0.0.1'; // Should be replaced with actual IP

    let vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: description || 'Payment for booking',
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // VNPay expects amount in smallest currency unit
      vnp_ReturnUrl: returnUrl || this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sort params
    vnpParams = this.sortObject(vnpParams);

    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;

    const paymentUrl = this.url + '?' + querystring.stringify(vnpParams, { encode: false });

    return paymentUrl;
  }

  async handleCallback(queryParams: any): Promise<any> {
    let vnpParams = { ...queryParams };
    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    vnpParams = this.sortObject(vnpParams);

    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      throw new BadRequestException('Invalid signature');
    }

    const transactionId = vnpParams['vnp_TxnRef'];
    const responseCode = vnpParams['vnp_ResponseCode'];
    const transactionNo = vnpParams['vnp_TransactionNo'];

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (responseCode === '00') {
      transaction.status = TransactionStatus.COMPLETED;
      transaction.gatewayTransactionId = transactionNo;
      transaction.completedAt = new Date();
    } else {
      transaction.status = TransactionStatus.FAILED;
      transaction.errorCode = responseCode;
    }

    await this.transactionRepository.save(transaction);

    return {
      success: responseCode === '00',
      transactionId,
      gatewayTransactionId: transactionNo,
      responseCode,
    };
  }

  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}
