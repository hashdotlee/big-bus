import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../../database/entities';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    if (createRouteDto.originStationId === createRouteDto.destinationStationId) {
      throw new BadRequestException('Origin and destination stations cannot be the same');
    }

    const route = this.routesRepository.create(createRouteDto);
    return await this.routesRepository.save(route);
  }

  async findAll(): Promise<Route[]> {
    return await this.routesRepository.find({
      where: { isActive: true },
      relations: ['originStation', 'destinationStation'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Route> {
    const route = await this.routesRepository.findOne({
      where: { id },
      relations: ['originStation', 'destinationStation'],
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return route;
  }

  async findByStations(originStationId: string, destinationStationId: string): Promise<Route[]> {
    return await this.routesRepository.find({
      where: {
        originStationId,
        destinationStationId,
        isActive: true,
      },
      relations: ['originStation', 'destinationStation'],
    });
  }

  async findByOrigin(originStationId: string): Promise<Route[]> {
    return await this.routesRepository.find({
      where: {
        originStationId,
        isActive: true,
      },
      relations: ['originStation', 'destinationStation'],
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);

    if (updateRouteDto.originStationId && updateRouteDto.destinationStationId) {
      if (updateRouteDto.originStationId === updateRouteDto.destinationStationId) {
        throw new BadRequestException('Origin and destination stations cannot be the same');
      }
    }

    Object.assign(route, updateRouteDto);
    return await this.routesRepository.save(route);
  }

  async remove(id: string): Promise<void> {
    const route = await this.findOne(id);
    route.isActive = false;
    await this.routesRepository.save(route);
  }
}
