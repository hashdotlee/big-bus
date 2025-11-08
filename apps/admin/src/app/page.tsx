'use client';

import { api } from '@big-bus/api-client';
import { useQuery } from 'react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery('dashboardStats', () =>
    api.analytics.getDashboardStats()
  );

  const statsCards = [
    {
      title: "Today's Bookings",
      value: stats?.todayBookings || 0,
      change: '+12.5%',
      trend: 'up',
      color: 'text-gray-900',
    },
    {
      title: "Today's Revenue",
      value: `$${stats?.todayRevenue?.toLocaleString() || 0}`,
      change: '+8.2%',
      trend: 'up',
      color: 'text-green-600',
    },
    {
      title: 'Active Vehicles',
      value: stats?.activeVehicles || 0,
      change: '-2',
      trend: 'down',
      color: 'text-blue-600',
    },
    {
      title: 'Occupancy Rate',
      value: `${stats?.occupancyRate || 0}%`,
      change: '+5.1%',
      trend: 'up',
      color: 'text-purple-600',
    },
  ];

  const quickActions = [
    { name: 'Manage Bookings', href: '/bookings', color: 'bg-blue-50 hover:bg-blue-100' },
    { name: 'Manage Routes', href: '/routes', color: 'bg-green-50 hover:bg-green-100' },
    { name: 'Manage Vehicles', href: '/vehicles', color: 'bg-purple-50 hover:bg-purple-100' },
    { name: 'View Reports', href: '/reports', color: 'bg-orange-50 hover:bg-orange-100' },
  ];

  const services = [
    { name: 'Auth Service', status: 'online' },
    { name: 'Booking Service', status: 'online' },
    { name: 'Payment Service', status: 'online' },
    { name: 'Notification Service', status: 'online' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your bus fleet today.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className={`mt-2 text-3xl font-semibold ${stat.color}`}>
                      {isLoading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {stat.trend === 'up' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions & System status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardContent className="py-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className={`block w-full rounded-lg px-4 py-3 text-left font-medium transition ${action.color}`}
                  >
                    {action.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardContent className="py-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">System Status</h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{service.name}</span>
                    <Badge variant={service.status === 'online' ? 'success' : 'danger'}>
                      {service.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
