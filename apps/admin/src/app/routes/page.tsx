'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '@big-bus/api-client';
import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Input from '@/components/ui/Input';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MapIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function RoutesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: routes, isLoading } = useQuery('routes', () => api.booking.getAllRoutes());

  const { data: schedules } = useQuery('schedules', () =>
    api.booking.getSchedules({ status: 'scheduled' })
  );

  const filteredRoutes = routes?.filter((route: any) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      route.origin?.toLowerCase().includes(search) ||
      route.destination?.toLowerCase().includes(search)
    );
  });

  const stats = {
    totalRoutes: routes?.length || 0,
    activeSchedules: schedules?.filter((s: any) => s.status === 'scheduled').length || 0,
    totalStations: new Set(
      routes?.flatMap((r: any) => r.stations?.map((s: any) => s.id) || [])
    ).size,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Route Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage routes, stations, schedules, and vehicle assignments.
            </p>
          </div>
          <Button>
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Route
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <MapIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Routes</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {stats.totalRoutes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Schedules</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {stats.activeSchedules}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <MapIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Stations</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {stats.totalStations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="py-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Routes table */}
        <Card>
          <CardHeader>
            <CardTitle>All Routes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">Loading routes...</p>
              </div>
            ) : filteredRoutes && filteredRoutes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoutes.map((route: any) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">
                        {route.origin} → {route.destination}
                      </TableCell>
                      <TableCell>{route.origin}</TableCell>
                      <TableCell>{route.destination}</TableCell>
                      <TableCell>{route.distance} km</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          {Math.round(route.estimatedDuration / 60)}h
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${route.price}</TableCell>
                      <TableCell>
                        <Badge variant="default">{route.stations?.length || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <MapIcon className="h-5 w-5" title="View map" />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <CalendarIcon className="h-5 w-5" title="View schedules" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center">
                <p className="text-gray-500">No routes found</p>
                <p className="mt-1 text-sm text-gray-400">
                  Try adjusting your search or add a new route
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Schedules */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules && schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.slice(0, 5).map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {schedule.route?.origin} → {schedule.route?.destination}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Departure:{' '}
                        {schedule.departureTime
                          ? new Date(schedule.departureTime).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={schedule.status === 'scheduled' ? 'success' : 'default'}>
                        {schedule.status}
                      </Badge>
                      <p className="mt-1 text-sm text-gray-500">
                        {schedule.availableSeats} seats available
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No schedules available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
