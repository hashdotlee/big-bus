'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '@big-bus/api-client';
import { format, subDays } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('7days');
  const [reportType, setReportType] = useState('revenue');

  const today = new Date();
  const startDate = subDays(today, timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90);

  const { data: revenueData } = useQuery(['revenue', timeRange], () =>
    api.analytics.getRevenueAnalytics({
      startDate: startDate.toISOString(),
      endDate: today.toISOString(),
      groupBy: 'day',
    })
  );

  const { data: routeAnalytics } = useQuery(['routeAnalytics', timeRange], () =>
    api.analytics.getRouteAnalytics({
      startDate: startDate.toISOString(),
      endDate: today.toISOString(),
    })
  );

  const { data: customerAnalytics } = useQuery(['customerAnalytics', timeRange], () =>
    api.analytics.getCustomerAnalytics({
      startDate: startDate.toISOString(),
      endDate: today.toISOString(),
    })
  );

  const revenueChartData = revenueData?.breakdown?.map((item: any) => ({
    date: format(new Date(item.date), 'MMM dd'),
    revenue: item.revenue,
    bookings: item.bookings,
  }));

  const routeChartData = routeAnalytics?.slice(0, 5).map((route: any) => ({
    name: `${route.routeName?.substring(0, 20)}...` || 'Unknown',
    revenue: route.revenue,
    bookings: route.bookingCount,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              View detailed analytics, generate reports, and track performance metrics.
            </p>
          </div>
          <Button>
            <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select
                label="Time Range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                options={[
                  { value: '7days', label: 'Last 7 Days' },
                  { value: '30days', label: 'Last 30 Days' },
                  { value: '90days', label: 'Last 90 Days' },
                ]}
              />
              <Select
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={[
                  { value: 'revenue', label: 'Revenue Report' },
                  { value: 'bookings', label: 'Bookings Report' },
                  { value: 'routes', label: 'Routes Report' },
                  { value: 'customers', label: 'Customer Report' },
                ]}
              />
              <div className="flex items-end">
                <Button variant="secondary" fullWidth>
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Custom Date Range
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  ${revenueData?.totalRevenue?.toLocaleString() || 0}
                </p>
                <p className="mt-1 text-xs text-green-600">+12.5% from previous period</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {revenueData?.bookingCount?.toLocaleString() || 0}
                </p>
                <p className="mt-1 text-xs text-green-600">+8.2% from previous period</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Ticket Price</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  ${revenueData?.averageTicketPrice?.toFixed(2) || 0}
                </p>
                <p className="mt-1 text-xs text-red-600">-2.1% from previous period</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {customerAnalytics?.totalCustomers?.toLocaleString() || 0}
                </p>
                <p className="mt-1 text-xs text-green-600">+15.3% from previous period</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Routes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Routes by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={routeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Customers</span>
                  <span className="text-lg font-semibold">
                    {customerAnalytics?.totalCustomers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Customers</span>
                  <span className="text-lg font-semibold text-green-600">
                    {customerAnalytics?.newCustomers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Returning Customers</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {customerAnalytics?.returningCustomers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Bookings per Customer</span>
                  <span className="text-lg font-semibold">
                    {customerAnalytics?.averageBookingsPerCustomer?.toFixed(1) || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerAnalytics?.topCustomers?.slice(0, 5).map((customer: any, index: number) => (
                <div
                  key={customer.userId}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <span className="font-semibold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">
                        {customer.bookingCount} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${customer.totalSpent?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500">Total spent</p>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-500">No customer data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
