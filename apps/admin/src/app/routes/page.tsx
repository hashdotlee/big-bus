'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function RoutesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage routes, stations, schedules, and vehicle assignments.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Route management interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
