import { Injectable, NotFoundException } from '@nestjs/common';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  cost: number;
  performedAt: Date;
  performedBy: string;
  nextMaintenanceDue?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MaintenanceService {
  // In-memory store for maintenance records
  // In production, this should use a database
  private maintenanceRecords: Map<string, MaintenanceRecord> = new Map();

  /**
   * Get all maintenance records
   */
  async findAll(vehicleId?: string): Promise<MaintenanceRecord[]> {
    const records = Array.from(this.maintenanceRecords.values());

    if (vehicleId) {
      return records.filter((r) => r.vehicleId === vehicleId);
    }

    return records;
  }

  /**
   * Get maintenance record by ID
   */
  async findOne(id: string): Promise<MaintenanceRecord> {
    const record = this.maintenanceRecords.get(id);

    if (!record) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }

    return record;
  }

  /**
   * Create maintenance record
   */
  async create(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const record: MaintenanceRecord = {
      id: this.generateId(),
      vehicleId: data.vehicleId,
      type: data.type || 'general',
      description: data.description,
      cost: data.cost || 0,
      performedAt: data.performedAt || new Date(),
      performedBy: data.performedBy || 'Unknown',
      nextMaintenanceDue: data.nextMaintenanceDue,
      status: data.status || 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.maintenanceRecords.set(record.id, record);

    return record;
  }

  /**
   * Update maintenance record
   */
  async update(
    id: string,
    data: Partial<MaintenanceRecord>,
  ): Promise<MaintenanceRecord> {
    const record = await this.findOne(id);

    Object.assign(record, data);
    record.updatedAt = new Date();

    this.maintenanceRecords.set(id, record);

    return record;
  }

  /**
   * Delete maintenance record
   */
  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    this.maintenanceRecords.delete(id);
  }

  /**
   * Get upcoming maintenance
   */
  async getUpcoming(daysAhead: number = 30): Promise<MaintenanceRecord[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const records = Array.from(this.maintenanceRecords.values());

    return records.filter((r) => {
      return (
        r.status === 'scheduled' &&
        r.nextMaintenanceDue &&
        r.nextMaintenanceDue >= now &&
        r.nextMaintenanceDue <= futureDate
      );
    });
  }

  /**
   * Get maintenance history for a vehicle
   */
  async getVehicleHistory(vehicleId: string): Promise<MaintenanceRecord[]> {
    return this.findAll(vehicleId);
  }

  private generateId(): string {
    return `maint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
