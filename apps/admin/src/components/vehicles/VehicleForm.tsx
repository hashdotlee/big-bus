'use client';

import { useState } from 'react';
import Modal, { ModalFooter } from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => void;
  initialData?: Partial<VehicleFormData>;
  isLoading?: boolean;
}

export interface VehicleFormData {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  type: 'standard' | 'deluxe' | 'vip';
  status: 'active' | 'maintenance' | 'inactive';
  features: string[];
}

export default function VehicleForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    licensePlate: initialData?.licensePlate || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    capacity: initialData?.capacity || 40,
    type: initialData?.type || 'standard',
    status: initialData?.status || 'active',
    features: initialData?.features || [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof VehicleFormData, string>> = {};

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Invalid year';
    }
    if (formData.capacity < 1 || formData.capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Vehicle' : 'Add Vehicle'} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Plate"
              value={formData.licensePlate}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
              error={errors.licensePlate}
              required
              placeholder="e.g., ABC-1234"
            />
            <Input
              label="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              error={errors.brand}
              required
              placeholder="e.g., Mercedes"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              error={errors.model}
              required
              placeholder="e.g., Sprinter"
            />
            <Input
              label="Year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              error={errors.year}
              required
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacity (seats)"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              error={errors.capacity}
              required
              min="1"
              max="100"
            />
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'deluxe', label: 'Deluxe' },
                { value: 'vip', label: 'VIP' },
              ]}
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            required
            options={[
              { value: 'active', label: 'Active' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : initialData ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
