'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function VehiclesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your fleet of vehicles, maintenance schedules, and real-time tracking.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Vehicle management interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
