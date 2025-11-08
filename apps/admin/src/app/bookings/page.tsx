'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function BookingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all bookings, passenger information, and booking status.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Booking management interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
