export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum RefundReason {
  CANCELLATION = 'cancellation',
  SERVICE_ISSUE = 'service_issue',
  DUPLICATE_PAYMENT = 'duplicate_payment',
  OVERCHARGE = 'overcharge',
  OTHER = 'other',
}

export interface IRefund {
  id: string;
  transactionId: string;
  bookingId: string;
  walletId: string;
  amount: number;
  currency: string;
  reason: RefundReason;
  reasonDetails?: string;
  status: RefundStatus;
  processedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateRefundDto {
  transactionId: string;
  bookingId: string;
  amount: number;
  reason: RefundReason;
  reasonDetails?: string;
}

export interface UpdateRefundDto {
  status?: RefundStatus;
  processedBy?: string;
  rejectionReason?: string;
  completedAt?: Date;
}

export interface ProcessRefundDto {
  refundId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface RefundFilterDto {
  transactionId?: string;
  bookingId?: string;
  walletId?: string;
  status?: RefundStatus;
  reason?: RefundReason;
  fromDate?: Date;
  toDate?: Date;
}
