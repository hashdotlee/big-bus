export enum PaymentGatewayProvider {
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export enum PaymentGatewayStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export interface IPaymentGateway {
  id: string;
  provider: PaymentGatewayProvider;
  name: string;
  description?: string;
  status: PaymentGatewayStatus;
  config: Record<string, unknown>;
  isDefault: boolean;
  supportedCurrencies: string[];
  fee: number;
  feeType: 'fixed' | 'percentage';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentGatewayDto {
  provider: PaymentGatewayProvider;
  name: string;
  description?: string;
  status?: PaymentGatewayStatus;
  config: Record<string, unknown>;
  isDefault?: boolean;
  supportedCurrencies?: string[];
  fee?: number;
  feeType?: 'fixed' | 'percentage';
}

export interface UpdatePaymentGatewayDto {
  name?: string;
  description?: string;
  status?: PaymentGatewayStatus;
  config?: Record<string, unknown>;
  isDefault?: boolean;
  supportedCurrencies?: string[];
  fee?: number;
  feeType?: 'fixed' | 'percentage';
}

export interface PaymentIntentDto {
  amount: number;
  currency: string;
  provider: PaymentGatewayProvider;
  bookingId?: string;
  returnUrl: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntentResponse {
  intentId: string;
  paymentUrl: string;
  qrCode?: string;
  expiresAt: Date;
}

export interface PaymentCallbackDto {
  provider: PaymentGatewayProvider;
  transactionId: string;
  status: 'success' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  gatewayTransactionId: string;
  metadata?: Record<string, unknown>;
}
