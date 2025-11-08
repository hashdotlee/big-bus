'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@big-bus/api-client';
import { format } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import PaymentDetailModal from '@/components/finance/PaymentDetailModal';
import { useToast } from '@/components/ui/ToastContainer';
import { exportToCSV } from '@/utils/exportData';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export default function FinancePage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: payments, isLoading } = useQuery('payments', () =>
    api.payment.getMyPayments()
  );

  // Process payment mutation
  const processMutation = useMutation(
    ({ paymentId, data }: { paymentId: string; data: any }) =>
      api.payment.processPayment(paymentId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments');
        setIsDetailModalOpen(false);
        showToast({
          type: 'success',
          message: 'Payment processed successfully!',
        });
      },
      onError: (error: any) => {
        showToast({
          type: 'error',
          message: error.message || 'Failed to process payment',
        });
      },
    }
  );

  // Refund payment mutation
  const refundMutation = useMutation(
    ({ paymentId, data }: { paymentId: string; data: any }) =>
      api.payment.refundPayment(paymentId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments');
        setIsDetailModalOpen(false);
        showToast({
          type: 'success',
          message: 'Payment refunded successfully!',
        });
      },
      onError: (error: any) => {
        showToast({
          type: 'error',
          message: error.message || 'Failed to refund payment',
        });
      },
    }
  );

  const filteredPayments = payments?.filter((payment: any) => {
    // Status filter
    if (statusFilter !== 'all' && payment.status !== statusFilter) {
      return false;
    }
    // Method filter
    if (methodFilter !== 'all' && payment.method !== methodFilter) {
      return false;
    }
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        payment.id?.toLowerCase().includes(search) ||
        payment.transactionId?.toLowerCase().includes(search) ||
        payment.bookingId?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  const handleProcessPayment = (paymentId: string) => {
    if (window.confirm('Are you sure you want to process this payment?')) {
      processMutation.mutate({
        paymentId,
        data: {
          transactionId: `TXN-${Date.now()}`,
          metadata: { processedBy: 'admin' },
        },
      });
    }
  };

  const handleRefundPayment = (paymentId: string) => {
    if (window.confirm('Are you sure you want to refund this payment?')) {
      refundMutation.mutate({
        paymentId,
        data: {
          reason: 'Admin initiated refund',
          amount: selectedPayment?.amount,
        },
      });
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setMethodFilter('all');
    setSearchQuery('');
  };

  const handleExportPayments = () => {
    if (!filteredPayments || filteredPayments.length === 0) {
      showToast({
        type: 'warning',
        message: 'No payments to export',
      });
      return;
    }

    const exportData = filteredPayments.map((payment: any) => ({
      'Payment ID': payment.id,
      'Transaction ID': payment.transactionId || 'N/A',
      'Booking ID': payment.bookingId,
      Amount: payment.amount,
      Currency: payment.currency,
      Method: payment.method,
      Status: payment.status,
      'Created At': payment.createdAt ? format(new Date(payment.createdAt), 'PPp') : 'N/A',
    }));

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    exportToCSV(exportData, `payments_${timestamp}`);
    showToast({
      type: 'success',
      message: 'Payments exported successfully!',
    });
  };

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

  const getMethodBadge = (method: string) => {
    return <Badge variant="default">{method.replace('_', ' ')}</Badge>;
  };

  const stats = {
    total: filteredPayments?.length || 0,
    totalAmount: filteredPayments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0,
    pending: filteredPayments?.filter((p: any) => p.status === 'pending').length || 0,
    completed: filteredPayments?.filter((p: any) => p.status === 'completed').length || 0,
    failed: filteredPayments?.filter((p: any) => p.status === 'failed').length || 0,
    refunded: filteredPayments?.filter((p: any) => p.status === 'refunded').length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance & Payments</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage payments, process transactions, and handle refunds.
            </p>
          </div>
          <Button onClick={handleExportPayments}>
            <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
            Export Payments
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
                <p className="mt-1 text-xs text-gray-500">
                  ${stats.totalAmount.toLocaleString()} total amount
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="mt-2 text-3xl font-semibold text-green-600">{stats.completed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Refunded</p>
                <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.refunded}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and search */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'refunded', label: 'Refunded' },
                ]}
              />
              <Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Methods' },
                  { value: 'credit_card', label: 'Credit Card' },
                  { value: 'debit_card', label: 'Debit Card' },
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'e_wallet', label: 'E-Wallet' },
                ]}
              />
              <Button variant="secondary" fullWidth onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments table */}
        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">Loading payments...</p>
              </div>
            ) : filteredPayments && filteredPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {payment.transactionId ? (
                          <span className="text-xs">{payment.transactionId}</span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {payment.bookingId?.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${payment.amount?.toLocaleString() || 0}
                        <span className="ml-1 text-xs text-gray-500">
                          {payment.currency || 'USD'}
                        </span>
                      </TableCell>
                      <TableCell>{getMethodBadge(payment.method)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.createdAt
                          ? format(new Date(payment.createdAt), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {payment.status === 'pending' && (
                            <button
                              onClick={() => handleProcessPayment(payment.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Process payment"
                              disabled={processMutation.isLoading}
                            >
                              <BanknotesIcon className="h-5 w-5" />
                            </button>
                          )}
                          {payment.status === 'completed' && (
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                handleRefundPayment(payment.id);
                              }}
                              className="text-orange-600 hover:text-orange-800"
                              title="Refund payment"
                              disabled={refundMutation.isLoading}
                            >
                              <ArrowPathIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center">
                <p className="text-gray-500">No payments found</p>
                <p className="mt-1 text-sm text-gray-400">
                  Try adjusting your filters or wait for new payments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        payment={selectedPayment}
        onProcess={(paymentId, data) => processMutation.mutate({ paymentId, data })}
        onRefund={(paymentId, data) => refundMutation.mutate({ paymentId, data })}
        isLoading={processMutation.isLoading || refundMutation.isLoading}
      />
    </AdminLayout>
  );
}
