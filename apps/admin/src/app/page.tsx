'use client';

import { api } from '@big-bus/api-client';
import { useQuery } from 'react-query';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useState } from 'react';

function DashboardContent() {
  const { data: stats } = useQuery('dashboardStats', () =>
    api.analytics.getDashboardStats()
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Big Bus Admin Dashboard
          </h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm mb-2">Today's Bookings</p>
            <p className="text-3xl font-bold text-gray-800">
              {stats?.todayBookings || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm mb-2">Today's Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ${stats?.todayRevenue || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm mb-2">Active Vehicles</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.activeVehicles || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm mb-2">Occupancy Rate</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.occupancyRate || 0}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                Manage Bookings
              </button>
              <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                Manage Routes
              </button>
              <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                Manage Vehicles
              </button>
              <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                View Reports
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Auth Service</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Booking Service</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Service</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Notification Service</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}
