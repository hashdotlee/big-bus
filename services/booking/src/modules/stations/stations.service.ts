import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from '../../database/entities';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
  ) {}

  async create(createStationDto: CreateStationDto): Promise<Station> {
    const station = this.stationsRepository.create(createStationDto);
    return await this.stationsRepository.save(station);
  }

  async findAll(): Promise<Station[]> {
    return await this.stationsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Station> {
    const station = await this.stationsRepository.findOne({
      where: { id },
    });

    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    return station;
  }

  async findByCity(city: string): Promise<Station[]> {
    return await this.stationsRepository.find({
      where: { city, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findByProvince(province: string): Promise<Station[]> {
    return await this.stationsRepository.find({
      where: { province, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateStationDto: UpdateStationDto): Promise<Station> {
    const station = await this.findOne(id);
    Object.assign(station, updateStationDto);
    return await this.stationsRepository.save(station);
  }

  async remove(id: string): Promise<void> {
    const station = await this.findOne(id);
    station.isActive = false;
    await this.stationsRepository.save(station);
  }
}
