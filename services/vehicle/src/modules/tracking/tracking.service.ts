import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../database/entities/vehicle.entity';
import { UpdateLocationDto } from './dto';

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  scheduleId?: string;
  timestamp: Date;
  licensePlate?: string;
  vehicleType?: string;
}

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private vehicleLocations: Map<string, VehicleLocation> = new Map();

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  /**
   * Update vehicle location in real-time
   */
  async updateLocation(dto: UpdateLocationDto): Promise<VehicleLocation> {
    this.logger.debug(`Updating location for vehicle ${dto.vehicleId}`);

    // Verify vehicle exists
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: dto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`);
    }

    // Update in-memory location
    const location: VehicleLocation = {
      vehicleId: dto.vehicleId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed,
      heading: dto.heading,
      scheduleId: dto.scheduleId,
      timestamp: new Date(),
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.type,
    };

    this.vehicleLocations.set(dto.vehicleId, location);

    // Update database (asynchronously, don't wait)
    this.updateDatabaseLocation(dto.vehicleId, dto.latitude, dto.longitude).catch(
      (error) => {
        this.logger.error(
          `Failed to update database location for ${dto.vehicleId}`,
          error,
        );
      },
    );

    return location;
  }

  /**
   * Get current location of a vehicle
   */
  async getVehicleLocation(vehicleId: string): Promise<VehicleLocation | null> {
    // Try to get from in-memory cache first
    const cachedLocation = this.vehicleLocations.get(vehicleId);
    if (cachedLocation) {
      return cachedLocation;
    }

    // If not in cache, get from database
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle || !vehicle.currentLatitude || !vehicle.currentLongitude) {
      return null;
    }

    const location: VehicleLocation = {
      vehicleId: vehicle.id,
      latitude: vehicle.currentLatitude,
      longitude: vehicle.currentLongitude,
      timestamp: vehicle.lastLocationUpdate || new Date(),
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.type,
    };

    return location;
  }

  /**
   * Get all active vehicles with their locations
   */
  async getAllActiveVehicleLocations(): Promise<VehicleLocation[]> {
    // Return all cached locations
    return Array.from(this.vehicleLocations.values());
  }

  /**
   * Get locations for specific schedule (trip)
   */
  async getScheduleVehicleLocations(scheduleId: string): Promise<VehicleLocation[]> {
    const locations = Array.from(this.vehicleLocations.values());
    return locations.filter((loc) => loc.scheduleId === scheduleId);
  }

  /**
   * Remove vehicle from tracking
   */
  async stopTracking(vehicleId: string): Promise<void> {
    this.vehicleLocations.delete(vehicleId);
    this.logger.debug(`Stopped tracking vehicle ${vehicleId}`);
  }

  /**
   * Update vehicle location in database (async)
   */
  private async updateDatabaseLocation(
    vehicleId: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    await this.vehicleRepository.update(vehicleId, {
      currentLatitude: latitude,
      currentLongitude: longitude,
      lastLocationUpdate: new Date(),
    });
  }

  /**
   * Clean up old location data (older than 1 hour)
   */
  cleanupOldLocations(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [vehicleId, location] of this.vehicleLocations.entries()) {
      if (location.timestamp < oneHourAgo) {
        this.vehicleLocations.delete(vehicleId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} old vehicle locations`);
    }
  }
}
