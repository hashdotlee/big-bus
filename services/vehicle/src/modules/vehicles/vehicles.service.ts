import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../database/entities';
import { VehicleType, VehicleStatus } from '@big-bus/types';
import { CreateVehicleDto, UpdateVehicleDto, RecordMaintenanceDto } from './dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  /**
   * Create a new vehicle
   */
  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Check if plate number already exists
    const existing = await this.vehiclesRepository.findOne({
      where: { plateNumber: createVehicleDto.plateNumber },
    });

    if (existing) {
      throw new ConflictException(
        `Vehicle with plate number ${createVehicleDto.plateNumber} already exists`,
      );
    }

    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      status: createVehicleDto.status || VehicleStatus.ACTIVE,
      isActive: createVehicleDto.isActive !== undefined ? createVehicleDto.isActive : true,
      mileage: createVehicleDto.mileage || 0,
    });

    return await this.vehiclesRepository.save(vehicle);
  }

  /**
   * Get all vehicles (optionally filter by active status and type)
   */
  async findAll(
    isActive?: boolean,
    type?: VehicleType,
    status?: VehicleStatus,
  ): Promise<Vehicle[]> {
    const whereConditions: any = {};

    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }

    if (type) {
      whereConditions.type = type;
    }

    if (status) {
      whereConditions.status = status;
    }

    return await this.vehiclesRepository.find({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      order: { plateNumber: 'ASC' },
    });
  }

  /**
   * Get a single vehicle by ID
   */
  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  /**
   * Get a vehicle by plate number
   */
  async findByPlateNumber(plateNumber: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { plateNumber },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with plate number ${plateNumber} not found`);
    }

    return vehicle;
  }

  /**
   * Get vehicles by type
   */
  async findByType(type: VehicleType, isActive = true): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      where: { type, isActive },
      order: { plateNumber: 'ASC' },
    });
  }

  /**
   * Get vehicles by status
   */
  async findByStatus(status: VehicleStatus): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      where: { status },
      order: { plateNumber: 'ASC' },
    });
  }

  /**
   * Get vehicles that need maintenance (next maintenance date is in the past or within X days)
   */
  async findVehiclesNeedingMaintenance(daysAhead = 7): Promise<Vehicle[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const vehicles = await this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.nextMaintenanceDate IS NOT NULL')
      .andWhere('vehicle.nextMaintenanceDate <= :futureDate', { futureDate })
      .andWhere('vehicle.isActive = :isActive', { isActive: true })
      .orderBy('vehicle.nextMaintenanceDate', 'ASC')
      .getMany();

    return vehicles;
  }

  /**
   * Update a vehicle
   */
  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    // Check plate number uniqueness if it's being updated
    if (updateVehicleDto.plateNumber && updateVehicleDto.plateNumber !== vehicle.plateNumber) {
      const existing = await this.vehiclesRepository.findOne({
        where: { plateNumber: updateVehicleDto.plateNumber },
      });

      if (existing) {
        throw new ConflictException(
          `Vehicle with plate number ${updateVehicleDto.plateNumber} already exists`,
        );
      }
    }

    Object.assign(vehicle, updateVehicleDto);
    return await this.vehiclesRepository.save(vehicle);
  }

  /**
   * Update vehicle mileage
   */
  async updateMileage(id: string, mileage: number): Promise<Vehicle> {
    if (mileage < 0) {
      throw new BadRequestException('Mileage cannot be negative');
    }

    const vehicle = await this.findOne(id);

    if (mileage < vehicle.mileage) {
      throw new BadRequestException(
        'New mileage cannot be less than current mileage',
      );
    }

    vehicle.mileage = mileage;
    return await this.vehiclesRepository.save(vehicle);
  }

  /**
   * Change vehicle status
   */
  async changeStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.status = status;

    // If status is OUT_OF_SERVICE or RETIRED, set isActive to false
    if (status === VehicleStatus.OUT_OF_SERVICE || status === VehicleStatus.RETIRED) {
      vehicle.isActive = false;
    }

    return await this.vehiclesRepository.save(vehicle);
  }

  /**
   * Record maintenance for a vehicle
   */
  async recordMaintenance(
    id: string,
    recordMaintenanceDto: RecordMaintenanceDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    vehicle.lastMaintenanceDate = recordMaintenanceDto.maintenanceDate;

    if (recordMaintenanceDto.nextMaintenanceDate) {
      vehicle.nextMaintenanceDate = recordMaintenanceDto.nextMaintenanceDate;
    }

    // If vehicle was in maintenance status, set it back to active
    if (vehicle.status === VehicleStatus.MAINTENANCE) {
      vehicle.status = VehicleStatus.ACTIVE;
      vehicle.isActive = true;
    }

    // TODO: Create a separate maintenance record entity to track maintenance history
    // For now, we just update the vehicle entity

    return await this.vehiclesRepository.save(vehicle);
  }

  /**
   * Soft delete a vehicle (set isActive to false)
   */
  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    vehicle.isActive = false;
    vehicle.status = VehicleStatus.RETIRED;
    await this.vehiclesRepository.save(vehicle);
  }

  /**
   * Permanently delete a vehicle
   */
  async delete(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    await this.vehiclesRepository.remove(vehicle);
  }

  /**
   * Restore a soft-deleted vehicle
   */
  async restore(id: string): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    if (vehicle.isActive) {
      throw new BadRequestException('Vehicle is already active');
    }

    vehicle.isActive = true;
    vehicle.status = VehicleStatus.ACTIVE;

    return await this.vehiclesRepository.save(vehicle);
  }

  /**
   * Get vehicle statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    maintenance: number;
    outOfService: number;
    retired: number;
    byType: Record<VehicleType, number>;
  }> {
    const allVehicles = await this.vehiclesRepository.find();

    const stats = {
      total: allVehicles.length,
      active: allVehicles.filter((v) => v.status === VehicleStatus.ACTIVE).length,
      maintenance: allVehicles.filter((v) => v.status === VehicleStatus.MAINTENANCE).length,
      outOfService: allVehicles.filter((v) => v.status === VehicleStatus.OUT_OF_SERVICE)
        .length,
      retired: allVehicles.filter((v) => v.status === VehicleStatus.RETIRED).length,
      byType: {
        [VehicleType.ECONOMY]: allVehicles.filter((v) => v.type === VehicleType.ECONOMY)
          .length,
        [VehicleType.VIP]: allVehicles.filter((v) => v.type === VehicleType.VIP).length,
        [VehicleType.SLEEPER]: allVehicles.filter((v) => v.type === VehicleType.SLEEPER)
          .length,
      },
    };

    return stats;
  }
}
