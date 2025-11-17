import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../database/entities';

interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: Date;
  scheduleId?: string;
}

interface RouteTracking {
  vehicleId: string;
  scheduleId: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  route: {
    origin: string;
    destination: string;
    estimatedArrival: Date;
  };
  progress: number; // percentage
  nextStop?: string;
}

@Injectable()
export class TrackingService {
  // In-memory store for real-time locations
  // In production, this should use Redis or a similar cache
  private vehicleLocations: Map<string, VehicleLocation> = new Map();

  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  /**
   * Update vehicle location (typically called by GPS devices)
   */
  async updateLocation(
    vehicleId: string,
    latitude: number,
    longitude: number,
    speed: number,
    heading: number,
    scheduleId?: string,
  ): Promise<VehicleLocation> {
    // Verify vehicle exists
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    const location: VehicleLocation = {
      vehicleId,
      latitude,
      longitude,
      speed,
      heading,
      timestamp: new Date(),
      scheduleId,
    };

    this.vehicleLocations.set(vehicleId, location);

    return location;
  }

  /**
   * Get current location of a vehicle
   */
  async getVehicleLocation(vehicleId: string): Promise<VehicleLocation> {
    const location = this.vehicleLocations.get(vehicleId);

    if (!location) {
      throw new NotFoundException(
        `No location data found for vehicle ${vehicleId}`,
      );
    }

    return location;
  }

  /**
   * Get route tracking information for a vehicle on a specific schedule
   */
  async getRouteTracking(
    vehicleId: string,
    scheduleId: string,
  ): Promise<RouteTracking> {
    const location = this.vehicleLocations.get(vehicleId);

    if (!location) {
      throw new NotFoundException(
        `No location data found for vehicle ${vehicleId}`,
      );
    }

    // TODO: In production, fetch actual schedule and route data
    // For now, return mock data
    const tracking: RouteTracking = {
      vehicleId,
      scheduleId,
      currentLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      route: {
        origin: 'Origin Station',
        destination: 'Destination Station',
        estimatedArrival: new Date(Date.now() + 3600000), // 1 hour from now
      },
      progress: 45, // Mock progress
      nextStop: 'Next Stop Station',
    };

    return tracking;
  }

  /**
   * Get all active vehicle locations
   */
  async getAllActiveLocations(): Promise<VehicleLocation[]> {
    // Filter locations updated in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeLocations: VehicleLocation[] = [];

    this.vehicleLocations.forEach((location) => {
      if (location.timestamp >= fiveMinutesAgo) {
        activeLocations.push(location);
      }
    });

    return activeLocations;
  }

  /**
   * Clear old location data
   */
  cleanupOldLocations(): void {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    this.vehicleLocations.forEach((location, vehicleId) => {
      if (location.timestamp < thirtyMinutesAgo) {
        this.vehicleLocations.delete(vehicleId);
      }
    });
  }
}
