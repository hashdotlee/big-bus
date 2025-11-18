import { BaseExtension, ExtensionCategory } from '../core/base-extension';

/**
 * Payment method types
 */
export enum PaymentMethodType {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  QR_CODE = 'qr_code',
  CRYPTO = 'crypto',
  INSTALLMENT = 'installment',
  BUY_NOW_PAY_LATER = 'bnpl',
  CASH = 'cash',
}

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

/**
 * Currency codes
 */
export enum CurrencyCode {
  VND = 'VND',
  USD = 'USD',
  EUR = 'EUR',
  THB = 'THB',
  SGD = 'SGD',
}

/**
 * Payment gateway configuration
 */
export interface PaymentGatewayConfig {
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  environment?: 'sandbox' | 'production';
  webhookSecret?: string;
  returnUrl?: string;
  cancelUrl?: string;
  notifyUrl?: string;
  timeout?: number;
  [key: string]: any;
}

/**
 * Payment request data
 */
export interface PaymentRequest {
  amount: number;
  currency: CurrencyCode;
  orderId: string;
  orderDescription?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
  paymentMethod?: PaymentMethodType;
  locale?: string;
}

/**
 * Payment response
 */
export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  gatewayTransactionId?: string;
  status: PaymentStatus;
  amount?: number;
  currency?: CurrencyCode;
  message?: string;
  errorCode?: string;
  metadata?: Record<string, any>;
  qrCode?: string;
  deepLink?: string;
}

/**
 * Payment callback data
 */
export interface PaymentCallback {
  gatewayTransactionId: string;
  orderId: string;
  amount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  transactionDate: Date;
  signature?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  rawData?: any;
}

/**
 * Refund request
 */
export interface RefundRequest {
  transactionId: string;
  gatewayTransactionId: string;
  amount: number;
  currency: CurrencyCode;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Refund response
 */
export interface RefundResponse {
  success: boolean;
  refundId?: string;
  gatewayRefundId?: string;
  amount?: number;
  status: PaymentStatus;
  message?: string;
  errorCode?: string;
  metadata?: Record<string, any>;
}

/**
 * Payment query request
 */
export interface PaymentQueryRequest {
  transactionId?: string;
  gatewayTransactionId?: string;
  orderId?: string;
}

/**
 * Payment query response
 */
export interface PaymentQueryResponse {
  success: boolean;
  transactionId?: string;
  gatewayTransactionId?: string;
  orderId?: string;
  amount?: number;
  currency?: CurrencyCode;
  status: PaymentStatus;
  paymentDate?: Date;
  metadata?: Record<string, any>;
}

/**
 * Supported payment methods for a gateway
 */
export interface SupportedPaymentMethod {
  type: PaymentMethodType;
  name: string;
  description?: string;
  icon?: string;
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies?: CurrencyCode[];
}

/**
 * Base interface for payment gateway extensions
 */
export interface IPaymentGatewayExtension extends BaseExtension {
  readonly category: ExtensionCategory.PAYMENT;

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): SupportedPaymentMethod[];

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): CurrencyCode[];

  /**
   * Create a payment
   */
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;

  /**
   * Handle payment callback/webhook
   */
  handleCallback(data: any): Promise<PaymentCallback>;

  /**
   * Verify callback signature
   */
  verifySignature(data: any, signature: string): boolean;

  /**
   * Query payment status
   */
  queryPayment(request: PaymentQueryRequest): Promise<PaymentQueryResponse>;

  /**
   * Refund a payment
   */
  refund(request: RefundRequest): Promise<RefundResponse>;

  /**
   * Check if payment method is supported
   */
  supportsPaymentMethod(method: PaymentMethodType): boolean;

  /**
   * Check if currency is supported
   */
  supportsCurrency(currency: CurrencyCode): boolean;

  /**
   * Get transaction fee
   */
  getTransactionFee?(amount: number, currency: CurrencyCode): number;

  /**
   * Validate payment amount
   */
  validateAmount?(amount: number, currency: CurrencyCode): boolean;
}

/**
 * Abstract base class for payment gateway extensions
 */
export abstract class BasePaymentGatewayExtension
  extends BaseExtension
  implements IPaymentGatewayExtension
{
  readonly category = ExtensionCategory.PAYMENT;
  protected gatewayConfig: PaymentGatewayConfig;

  abstract getSupportedPaymentMethods(): SupportedPaymentMethod[];
  abstract getSupportedCurrencies(): CurrencyCode[];
  abstract createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  abstract handleCallback(data: any): Promise<PaymentCallback>;
  abstract verifySignature(data: any, signature: string): boolean;

  async initialize(config: PaymentGatewayConfig): Promise<void> {
    await super.initialize(config);
    this.gatewayConfig = config;
  }

  async queryPayment(request: PaymentQueryRequest): Promise<PaymentQueryResponse> {
    throw new Error('Query payment not implemented for this gateway');
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    throw new Error('Refund not implemented for this gateway');
  }

  supportsPaymentMethod(method: PaymentMethodType): boolean {
    return this.getSupportedPaymentMethods().some(m => m.type === method);
  }

  supportsCurrency(currency: CurrencyCode): boolean {
    return this.getSupportedCurrencies().includes(currency);
  }

  getTransactionFee(amount: number, currency: CurrencyCode): number {
    return 0; // Override in subclasses
  }

  validateAmount(amount: number, currency: CurrencyCode): boolean {
    return amount > 0;
  }

  protected generateOrderId(): string {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected formatAmount(amount: number, currency: CurrencyCode): number {
    // VND doesn't use decimals
    if (currency === CurrencyCode.VND) {
      return Math.round(amount);
    }
    return Math.round(amount * 100) / 100;
  }
}
