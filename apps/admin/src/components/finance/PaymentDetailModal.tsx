'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Modal, { ModalFooter } from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  onProcess?: (paymentId: string, data: any) => void;
  onRefund?: (paymentId: string, data: any) => void;
  isLoading?: boolean;
}

export default function PaymentDetailModal({
  isOpen,
  onClose,
  payment,
  onProcess,
  onRefund,
  isLoading,
}: PaymentDetailModalProps) {
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  if (!payment) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'danger' | 'default' | 'info'> = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'danger',
      refunded: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleProcessPayment = () => {
    if (onProcess) {
      onProcess(payment.id, {
        transactionId: `TXN-${Date.now()}`,
        metadata: {
          processedBy: 'admin',
          processedAt: new Date().toISOString(),
        },
      });
    }
  };

  const handleRefundPayment = () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }

    if (!refundReason.trim()) {
      alert('Please enter a refund reason');
      return;
    }

    if (onRefund) {
      onRefund(payment.id, {
        amount: parseFloat(refundAmount),
        reason: refundReason,
      });
      setRefundAmount('');
      setRefundReason('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details" size="lg">
      <div className="space-y-6">
        {/* Payment Info */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Payment Information</h4>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-500">Payment ID</p>
              <p className="mt-1 font-medium">{payment.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <div className="mt-1">{getStatusBadge(payment.status)}</div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Transaction ID</p>
              <p className="mt-1 font-medium">{payment.transactionId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Booking ID</p>
              <p className="mt-1 font-medium">{payment.bookingId}</p>
            </div>
          </div>
        </div>

        {/* Amount Info */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Amount Details</h4>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                ${payment.amount?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Currency</p>
              <p className="mt-1 text-lg font-medium">{payment.currency || 'USD'}</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Payment Method</h4>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm">
              <Badge variant="default">{payment.method?.replace('_', ' ')}</Badge>
            </p>
            {payment.metadata?.cardLast4 && (
              <p className="mt-2 text-xs text-gray-500">
                Card ending in {payment.metadata.cardLast4}
              </p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Timeline</h4>
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Created</span>
              <span className="text-sm font-medium">
                {payment.createdAt ? format(new Date(payment.createdAt), 'PPp') : 'N/A'}
              </span>
            </div>
            {payment.updatedAt && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Last Updated</span>
                <span className="text-sm font-medium">
                  {format(new Date(payment.updatedAt), 'PPp')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        {payment.metadata && Object.keys(payment.metadata).length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Additional Information</h4>
            <div className="rounded-lg bg-gray-50 p-4">
              <pre className="text-xs text-gray-600">
                {JSON.stringify(payment.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Refund Section - Only for completed payments */}
        {payment.status === 'completed' && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Refund Payment</h4>
            <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <Input
                label="Refund Amount"
                type="number"
                placeholder="0.00"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={payment.amount}
                step="0.01"
              />
              <Input
                label="Refund Reason"
                placeholder="Enter reason for refund"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Max refund amount: ${payment.amount?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {payment.status === 'pending' && (
          <Button onClick={handleProcessPayment} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Process Payment'}
          </Button>
        )}
        {payment.status === 'completed' && (
          <Button variant="danger" onClick={handleRefundPayment} disabled={isLoading}>
            {isLoading ? 'Refunding...' : 'Issue Refund'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
