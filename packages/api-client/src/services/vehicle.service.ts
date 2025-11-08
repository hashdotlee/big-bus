import { BaseApiClient } from '../base-client';
import { SERVICE_URLS } from '../config';

export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  type: 'standard' | 'deluxe' | 'vip';
  status: 'active' | 'maintenance' | 'inactive';
  features: string[];
  currentLocation?: {
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    timestamp: string;
  };
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost: number;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface CreateMaintenanceDto {
  vehicleId: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost?: number;
  scheduledDate: string;
}

export class VehicleService extends BaseApiClient {
  constructor() {
    super({ baseURL: SERVICE_URLS.vehicle });
  }

  // Vehicle operations
  async getVehicles(params?: {
    status?: string;
    type?: string;
    available?: boolean;
  }): Promise<Vehicle[]> {
    return this.get('/vehicles', { params });
  }

  async getVehicle(id: string): Promise<Vehicle> {
    return this.get(`/vehicles/${id}`);
  }

  async getAvailableVehicles(date: string): Promise<Vehicle[]> {
    return this.get('/vehicles/available', { params: { date } });
  }

  // Tracking operations
  async getVehicleLocation(id: string): Promise<Vehicle['currentLocation']> {
    return this.get(`/vehicles/${id}/location`);
  }

  async getVehicleRoute(id: string, scheduleId: string): Promise<{
    route: Array<{ lat: number; lng: number; timestamp: string }>;
    currentPosition: { lat: number; lng: number };
    estimatedArrival: string;
  }> {
    return this.get(`/vehicles/${id}/route/${scheduleId}`);
  }

  // Maintenance operations
  async getMaintenanceRecords(vehicleId?: string): Promise<MaintenanceRecord[]> {
    return this.get('/vehicles/maintenance', { params: { vehicleId } });
  }

  async getMaintenanceRecord(id: string): Promise<MaintenanceRecord> {
    return this.get(`/vehicles/maintenance/${id}`);
  }

  async createMaintenanceRecord(data: CreateMaintenanceDto): Promise<MaintenanceRecord> {
    return this.post('/vehicles/maintenance', data);
  }

  async updateMaintenanceStatus(
    id: string,
    status: MaintenanceRecord['status'],
  ): Promise<MaintenanceRecord> {
    return this.patch(`/vehicles/maintenance/${id}/status`, { status });
  }
}
