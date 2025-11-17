'use client';

/**
 * Vehicle Table Component
 * Feature: Vehicle Management
 */

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
} from '@big-bus/ui';
import { Edit, Trash2, Eye } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'retired';
  driver: string;
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusColors = {
  active: 'success' as const,
  maintenance: 'warning' as const,
  retired: 'error' as const,
};

export const VehicleTable = ({ vehicles, onView, onEdit, onDelete }: VehicleTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plate Number</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.id}>
            <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
            <TableCell>{vehicle.model}</TableCell>
            <TableCell>{vehicle.capacity} seats</TableCell>
            <TableCell>{vehicle.driver}</TableCell>
            <TableCell>
              <Badge variant={statusColors[vehicle.status]} rounded>
                {vehicle.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView?.(vehicle.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(vehicle.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(vehicle.id)}
                >
                  <Trash2 className="w-4 h-4 text-error-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
