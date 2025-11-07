import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Schedule, ScheduleStatus } from '../../database/entities';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SearchScheduleDto } from './dto/search-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    if (createScheduleDto.departureTime >= createScheduleDto.arrivalTime) {
      throw new BadRequestException('Departure time must be before arrival time');
    }

    const schedule = this.schedulesRepository.create({
      ...createScheduleDto,
      availableSeats: createScheduleDto.totalSeats,
      status: ScheduleStatus.ACTIVE,
    });

    return await this.schedulesRepository.save(schedule);
  }

  async findAll(): Promise<Schedule[]> {
    return await this.schedulesRepository.find({
      relations: ['route', 'route.originStation', 'route.destinationStation', 'vehicle'],
      order: { departureTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id },
      relations: ['route', 'route.originStation', 'route.destinationStation', 'vehicle'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async search(searchDto: SearchScheduleDto): Promise<Schedule[]> {
    const { originStationId, destinationStationId, departureDate, passengerCount, vehicleType } = searchDto;

    // Parse the departure date
    const startDate = new Date(departureDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(departureDate);
    endDate.setHours(23, 59, 59, 999);

    const queryBuilder = this.schedulesRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('route.originStation', 'originStation')
      .leftJoinAndSelect('route.destinationStation', 'destinationStation')
      .leftJoinAndSelect('schedule.vehicle', 'vehicle')
      .where('route.originStationId = :originStationId', { originStationId })
      .andWhere('route.destinationStationId = :destinationStationId', { destinationStationId })
      .andWhere('schedule.departureTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('schedule.status = :status', { status: ScheduleStatus.ACTIVE });

    if (passengerCount) {
      queryBuilder.andWhere('schedule.availableSeats >= :passengerCount', { passengerCount });
    }

    if (vehicleType) {
      queryBuilder.andWhere('schedule.vehicleType = :vehicleType', { vehicleType });
    }

    queryBuilder.orderBy('schedule.departureTime', 'ASC');

    return await queryBuilder.getMany();
  }

  async findByRoute(routeId: string, fromDate?: Date): Promise<Schedule[]> {
    const query: any = {
      routeId,
      status: ScheduleStatus.ACTIVE,
    };

    if (fromDate) {
      return await this.schedulesRepository.find({
        where: {
          routeId,
          status: ScheduleStatus.ACTIVE,
          departureTime: MoreThanOrEqual(fromDate),
        },
        relations: ['route', 'vehicle'],
        order: { departureTime: 'ASC' },
      });
    }

    return await this.schedulesRepository.find({
      where: query,
      relations: ['route', 'vehicle'],
      order: { departureTime: 'ASC' },
    });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findOne(id);

    if (updateScheduleDto.departureTime && updateScheduleDto.arrivalTime) {
      if (updateScheduleDto.departureTime >= updateScheduleDto.arrivalTime) {
        throw new BadRequestException('Departure time must be before arrival time');
      }
    }

    Object.assign(schedule, updateScheduleDto);
    return await this.schedulesRepository.save(schedule);
  }

  async updateAvailableSeats(id: string, seatsToBook: number): Promise<Schedule> {
    const schedule = await this.findOne(id);

    if (schedule.availableSeats < seatsToBook) {
      throw new BadRequestException('Not enough available seats');
    }

    schedule.availableSeats -= seatsToBook;
    return await this.schedulesRepository.save(schedule);
  }

  async releaseSeats(id: string, seatsToRelease: number): Promise<Schedule> {
    const schedule = await this.findOne(id);
    schedule.availableSeats = Math.min(schedule.availableSeats + seatsToRelease, schedule.totalSeats);
    return await this.schedulesRepository.save(schedule);
  }

  async cancel(id: string): Promise<Schedule> {
    const schedule = await this.findOne(id);
    schedule.status = ScheduleStatus.CANCELLED;
    return await this.schedulesRepository.save(schedule);
  }

  async complete(id: string): Promise<Schedule> {
    const schedule = await this.findOne(id);
    schedule.status = ScheduleStatus.COMPLETED;
    return await this.schedulesRepository.save(schedule);
  }
}
