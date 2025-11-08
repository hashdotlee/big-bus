'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@big-bus/api-client';
import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import VehicleForm, { VehicleFormData } from '@/components/vehicles/VehicleForm';
import { useToast } from '@/components/ui/ToastContainer';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function VehiclesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: vehicles, isLoading } = useQuery(['vehicles', statusFilter, typeFilter], () => {
    const params: any = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter !== 'all') params.type = typeFilter;
    return api.vehicles.getVehicles(params);
  });

  // Note: Backend doesn't have createVehicle API yet, but we prepare the mutation
  const createVehicleMutation = useMutation(
    (data: VehicleFormData) => {
      // API not implemented yet - placeholder
      return Promise.resolve({ id: 'new-id', ...data });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vehicles');
        setIsFormOpen(false);
        showToast({
          type: 'success',
          message: 'Vehicle created successfully!',
        });
      },
      onError: (error: any) => {
        showToast({
          type: 'error',
          message: error.message || 'Failed to create vehicle',
        });
      },
    }
  );

  const filteredVehicles = vehicles?.filter((vehicle: any) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      vehicle.licensePlate?.toLowerCase().includes(search) ||
      vehicle.brand?.toLowerCase().includes(search) ||
      vehicle.model?.toLowerCase().includes(search)
    );
  });

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: VehicleFormData) => {
    if (editingVehicle) {
      // Update mutation (not implemented in backend yet)
      showToast({
        type: 'info',
        message: 'Update API not yet implemented',
      });
    } else {
      createVehicleMutation.mutate(data);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchQuery('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default'> = {
      active: 'success',
      maintenance: 'warning',
      inactive: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'info' | 'success' | 'warning'> = {
      standard: 'default',
      deluxe: 'info',
      vip: 'warning',
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your fleet of vehicles, maintenance schedules, and real-time tracking.
            </p>
          </div>
          <Button onClick={handleAddVehicle}>
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Vehicle
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {vehicles?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="mt-2 text-3xl font-semibold text-green-600">
                    {vehicles?.filter((v: any) => v.status === 'active').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">In Maintenance</p>
                  <p className="mt-2 text-3xl font-semibold text-yellow-600">
                    {vehicles?.filter((v: any) => v.status === 'maintenance').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Inactive</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-600">
                    {vehicles?.filter((v: any) => v.status === 'inactive').length || 0}
                  </p>
                </div>
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
                  placeholder="Search vehicles..."
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
                  { value: 'active', label: 'Active' },
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'standard', label: 'Standard' },
                  { value: 'deluxe', label: 'Deluxe' },
                  { value: 'vip', label: 'VIP' },
                ]}
              />
              <Button variant="secondary" fullWidth onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles table */}
        <Card>
          <CardHeader>
            <CardTitle>All Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">Loading vehicles...</p>
              </div>
            ) : filteredVehicles && filteredVehicles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Brand & Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle: any) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                      <TableCell>
                        {vehicle.brand} {vehicle.model}
                      </TableCell>
                      <TableCell>{getTypeBadge(vehicle.type)}</TableCell>
                      <TableCell>{vehicle.capacity} seats</TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditVehicle(vehicle)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit vehicle"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-800"
                            title="View location"
                          >
                            <MapPinIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="text-orange-600 hover:text-orange-800"
                            title="Maintenance"
                          >
                            <WrenchScrewdriverIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center">
                <p className="text-gray-500">No vehicles found</p>
                <p className="mt-1 text-sm text-gray-400">
                  Try adjusting your filters or add a new vehicle
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Form Modal */}
      <VehicleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingVehicle}
        isLoading={createVehicleMutation.isLoading}
      />
    </AdminLayout>
  );
}
