'use client';

/**
 * Revenue Chart Component
 * Feature: Reports & Analytics
 */

import { Card, CardHeader, CardTitle, CardContent } from '@big-bus/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
            <Bar yAxisId="right" dataKey="bookings" fill="#22c55e" name="Bookings" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
