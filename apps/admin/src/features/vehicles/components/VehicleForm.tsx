'use client';

/**
 * Vehicle Form Component
 * Feature: Vehicle Management
 */

import { useState } from 'react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@big-bus/ui';

interface VehicleFormData {
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'retired';
  driverId: string;
}

interface VehicleFormProps {
  initialData?: Partial<VehicleFormData>;
  onSubmit?: (data: VehicleFormData) => void;
  onCancel?: () => void;
  drivers?: Array<{ value: string; label: string }>;
}

export const VehicleForm = ({ initialData, onSubmit, onCancel, drivers = [] }: VehicleFormProps) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    plateNumber: initialData?.plateNumber || '',
    model: initialData?.model || '',
    capacity: initialData?.capacity || 40,
    status: initialData?.status || 'active',
    driverId: initialData?.driverId || '',
  });

  const handleChange = (field: keyof VehicleFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'capacity' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Vehicle' : 'Add New Vehicle'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plate Number"
              placeholder="e.g., ABC-123"
              value={formData.plateNumber}
              onChange={handleChange('plateNumber')}
              required
              fullWidth
            />
            <Input
              label="Model"
              placeholder="e.g., Mercedes Sprinter"
              value={formData.model}
              onChange={handleChange('model')}
              required
              fullWidth
            />
            <Input
              label="Capacity"
              type="number"
              min="1"
              max="100"
              value={formData.capacity.toString()}
              onChange={handleChange('capacity')}
              required
              fullWidth
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={handleChange('status')}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'retired', label: 'Retired' },
              ]}
              required
              fullWidth
            />
            <Select
              label="Assigned Driver"
              value={formData.driverId}
              onChange={handleChange('driverId')}
              options={drivers}
              placeholder="Select a driver"
              required
              fullWidth
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {initialData ? 'Update' : 'Create'} Vehicle
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
