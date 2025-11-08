export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment',
  REFUND = 'refund',
  TRANSFER = 'transfer',
}

export interface ITransaction {
  id: string;
  walletId: string;
  bookingId?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  paymentGateway?: string;
  gatewayTransactionId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateTransactionDto {
  walletId: string;
  bookingId?: string;
  amount: number;
  currency?: string;
  type: TransactionType;
  paymentGateway?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTransactionDto {
  status?: TransactionStatus;
  gatewayTransactionId?: string;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface TransactionFilterDto {
  walletId?: string;
  bookingId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  paymentGateway?: string;
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}
