'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage application settings and configurations.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Settings interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
