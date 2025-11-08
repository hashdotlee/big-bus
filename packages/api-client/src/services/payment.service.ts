import { BaseApiClient } from '../base-client';
import { SERVICE_URLS } from '../config';
import {
  IWallet,
  CreateWalletDto,
  WalletBalanceDto,
  ITransaction,
  CreateTransactionDto,
  IPaymentGateway,
  PaymentIntentDto,
  PaymentIntentResponse,
  IRefund,
  CreateRefundDto,
  TransactionFilterDto,
} from '@big-bus/types';

export class PaymentService extends BaseApiClient {
  constructor() {
    super({ baseURL: SERVICE_URLS.payment });
  }

  // Wallet operations
  async createWallet(data: CreateWalletDto): Promise<IWallet> {
    return this.post('/wallets', data);
  }

  async getMyWallet(): Promise<IWallet> {
    return this.get('/wallets/me');
  }

  async getWalletBalance(walletId: string): Promise<WalletBalanceDto> {
    return this.get(`/wallets/${walletId}/balance`);
  }

  async topUpWallet(walletId: string, amount: number, paymentMethod: string): Promise<ITransaction> {
    return this.post(`/wallets/${walletId}/topup`, { amount, paymentMethod });
  }

  async withdrawFromWallet(walletId: string, amount: number, bankAccount: any): Promise<ITransaction> {
    return this.post(`/wallets/${walletId}/withdraw`, { amount, bankAccount });
  }

  // Transaction operations
  async getTransactions(filter?: TransactionFilterDto): Promise<ITransaction[]> {
    return this.get('/transactions', { params: filter });
  }

  async getTransaction(id: string): Promise<ITransaction> {
    return this.get(`/transactions/${id}`);
  }

  async getMyTransactions(filter?: TransactionFilterDto): Promise<ITransaction[]> {
    return this.get('/transactions/my-transactions', { params: filter });
  }

  // Payment gateway operations
  async getPaymentGateways(): Promise<IPaymentGateway[]> {
    return this.get('/payment-gateways');
  }

  async getActivePaymentGateways(): Promise<IPaymentGateway[]> {
    return this.get('/payment-gateways/active');
  }

  async createPaymentIntent(data: PaymentIntentDto): Promise<PaymentIntentResponse> {
    return this.post('/payment-gateways/create-intent', data);
  }

  async processPaymentCallback(provider: string, callbackData: any): Promise<ITransaction> {
    return this.post(`/payment-gateways/${provider}/callback`, callbackData);
  }

  // Refund operations
  async requestRefund(data: CreateRefundDto): Promise<IRefund> {
    return this.post('/refunds', data);
  }

  async getMyRefunds(): Promise<IRefund[]> {
    return this.get('/refunds/my-refunds');
  }

  async getRefund(id: string): Promise<IRefund> {
    return this.get(`/refunds/${id}`);
  }

  async cancelRefund(id: string): Promise<IRefund> {
    return this.post(`/refunds/${id}/cancel`);
  }
}
