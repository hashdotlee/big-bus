/**
 * Vehicle type enum is defined in booking/index.ts
 * Import it here to use in vehicle types
 */
import { VehicleType } from '../booking';

/**
 * Vehicle status enum
 */
export enum VehicleStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  RETIRED = 'retired',
}

/**
 * Vehicle entity interface
 */
export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  model: string;
  manufacturer?: string;
  capacity: number;
  manufactureYear?: number;
  status: VehicleStatus;
  isActive: boolean;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  mileage: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create vehicle DTO
 */
export interface CreateVehicleDto {
  plateNumber: string;
  type: VehicleType;
  model: string;
  manufacturer?: string;
  capacity: number;
  manufactureYear?: number;
  status?: VehicleStatus;
  isActive?: boolean;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  mileage?: number;
  notes?: string;
}

/**
 * Update vehicle DTO
 */
export interface UpdateVehicleDto {
  plateNumber?: string;
  type?: VehicleType;
  model?: string;
  manufacturer?: string;
  capacity?: number;
  manufactureYear?: number;
  status?: VehicleStatus;
  isActive?: boolean;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  mileage?: number;
  notes?: string;
}

/**
 * Vehicle maintenance record
 */
export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  maintenanceDate: Date;
  maintenanceType: MaintenanceType;
  description: string;
  cost: number;
  performedBy?: string;
  nextMaintenanceDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Maintenance type enum
 */
export enum MaintenanceType {
  ROUTINE = 'routine',
  REPAIR = 'repair',
  INSPECTION = 'inspection',
  EMERGENCY = 'emergency',
}

/**
 * Record maintenance DTO
 */
export interface RecordMaintenanceDto {
  vehicleId: string;
  maintenanceDate: Date;
  maintenanceType: MaintenanceType;
  description: string;
  cost: number;
  performedBy?: string;
  nextMaintenanceDate?: Date;
}
