import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../database/entities';
import { VehicleType } from '@big-bus/types';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Check if plate number already exists
    const existing = await this.vehiclesRepository.findOne({
      where: { plateNumber: createVehicleDto.plateNumber },
    });

    if (existing) {
      throw new ConflictException('Vehicle with this plate number already exists');
    }

    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    return await this.vehiclesRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      where: { isActive: true },
      order: { plateNumber: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async findByType(type: VehicleType): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      where: { type, isActive: true },
      order: { plateNumber: 'ASC' },
    });
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    // Check plate number uniqueness if it's being updated
    if (updateVehicleDto.plateNumber && updateVehicleDto.plateNumber !== vehicle.plateNumber) {
      const existing = await this.vehiclesRepository.findOne({
        where: { plateNumber: updateVehicleDto.plateNumber },
      });

      if (existing) {
        throw new ConflictException('Vehicle with this plate number already exists');
      }
    }

    Object.assign(vehicle, updateVehicleDto);
    return await this.vehiclesRepository.save(vehicle);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    vehicle.isActive = false;
    await this.vehiclesRepository.save(vehicle);
  }

  async recordMaintenance(id: string, maintenanceDate: Date): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.lastMaintenanceDate = maintenanceDate;
    return await this.vehiclesRepository.save(vehicle);
  }
}
