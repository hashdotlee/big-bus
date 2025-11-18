import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from '../../database/entities';
import { VehicleType, VehicleStatus } from '@big-bus/types';
import { CreateVehicleDto, UpdateVehicleDto, RecordMaintenanceDto } from './dto';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: Repository<Vehicle>;

  const mockVehicle: Partial<Vehicle> = {
    id: 'vehicle-1',
    plateNumber: '29A-12345',
    type: VehicleType.ECONOMY,
    status: VehicleStatus.ACTIVE,
    isActive: true,
    totalSeats: 45,
    mileage: 50000,
    brand: 'Hyundai',
    model: 'Universe',
    year: 2023,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repository = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new vehicle', async () => {
      const createDto: CreateVehicleDto = {
        plateNumber: '29B-67890',
        type: VehicleType.VIP,
        totalSeats: 30,
        brand: 'Mercedes',
        model: 'Travego',
        year: 2024,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockVehicle);
      mockRepository.save.mockResolvedValue(mockVehicle);

      const result = await service.create(createDto);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockVehicle);
    });

    it('should throw ConflictException if plate number exists', async () => {
      const createDto: CreateVehicleDto = {
        plateNumber: '29A-12345',
        type: VehicleType.VIP,
        totalSeats: 30,
        brand: 'Mercedes',
        model: 'Travego',
        year: 2024,
      };

      mockRepository.findOne.mockResolvedValue(mockVehicle);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all vehicles', async () => {
      mockRepository.find.mockResolvedValue([mockVehicle]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockVehicle]);
    });

    it('should filter by active status', async () => {
      mockRepository.find.mockResolvedValue([mockVehicle]);

      await service.findAll(true);

      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });

    it('should filter by type and status', async () => {
      mockRepository.find.mockResolvedValue([mockVehicle]);

      await service.findAll(undefined, VehicleType.ECONOMY, VehicleStatus.ACTIVE);

      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: VehicleType.ECONOMY,
            status: VehicleStatus.ACTIVE,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findOne('vehicle-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'vehicle-1' },
      });
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByPlateNumber', () => {
    it('should return a vehicle by plate number', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findByPlateNumber('29A-12345');

      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByPlateNumber('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMileage', () => {
    it('should update vehicle mileage', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.save.mockResolvedValue({
        ...mockVehicle,
        mileage: 60000,
      });

      const result = await service.updateMileage('vehicle-1', 60000);

      expect(result.mileage).toBe(60000);
    });

    it('should throw BadRequestException if mileage is negative', async () => {
      await expect(service.updateMileage('vehicle-1', -1000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if mileage is less than current', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      await expect(service.updateMileage('vehicle-1', 40000)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('changeStatus', () => {
    it('should change vehicle status', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.save.mockResolvedValue({
        ...mockVehicle,
        status: VehicleStatus.MAINTENANCE,
      });

      const result = await service.changeStatus(
        'vehicle-1',
        VehicleStatus.MAINTENANCE,
      );

      expect(result.status).toBe(VehicleStatus.MAINTENANCE);
    });

    it('should set isActive to false for OUT_OF_SERVICE status', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.save.mockResolvedValue(mockVehicle);

      await service.changeStatus('vehicle-1', VehicleStatus.OUT_OF_SERVICE);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          status: VehicleStatus.OUT_OF_SERVICE,
        }),
      );
    });
  });

  describe('recordMaintenance', () => {
    it('should record maintenance', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockVehicle,
        status: VehicleStatus.MAINTENANCE,
      });
      mockRepository.save.mockResolvedValue(mockVehicle);

      const recordDto: RecordMaintenanceDto = {
        maintenanceDate: new Date(),
        nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      };

      const result = await service.recordMaintenance('vehicle-1', recordDto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          lastMaintenanceDate: recordDto.maintenanceDate,
          status: VehicleStatus.ACTIVE,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a vehicle', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.save.mockResolvedValue(mockVehicle);

      await service.remove('vehicle-1');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          status: VehicleStatus.RETIRED,
        }),
      );
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted vehicle', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockVehicle,
        isActive: false,
        status: VehicleStatus.RETIRED,
      });
      mockRepository.save.mockResolvedValue(mockVehicle);

      const result = await service.restore('vehicle-1');

      expect(result.isActive).toBe(true);
      expect(result.status).toBe(VehicleStatus.ACTIVE);
    });

    it('should throw BadRequestException if vehicle is already active', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      await expect(service.restore('vehicle-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getStatistics', () => {
    it('should return vehicle statistics', async () => {
      const vehicles = [
        { ...mockVehicle, status: VehicleStatus.ACTIVE, type: VehicleType.ECONOMY },
        {
          ...mockVehicle,
          id: 'vehicle-2',
          status: VehicleStatus.MAINTENANCE,
          type: VehicleType.VIP,
        },
        {
          ...mockVehicle,
          id: 'vehicle-3',
          status: VehicleStatus.ACTIVE,
          type: VehicleType.SLEEPER,
        },
      ];
      mockRepository.find.mockResolvedValue(vehicles);

      const result = await service.getStatistics();

      expect(result.total).toBe(3);
      expect(result.active).toBe(2);
      expect(result.maintenance).toBe(1);
      expect(result.byType[VehicleType.ECONOMY]).toBe(1);
      expect(result.byType[VehicleType.VIP]).toBe(1);
      expect(result.byType[VehicleType.SLEEPER]).toBe(1);
    });
  });

  describe('findVehiclesNeedingMaintenance', () => {
    it('should find vehicles needing maintenance', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockVehicle]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findVehiclesNeedingMaintenance(7);

      expect(result).toEqual([mockVehicle]);
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });
});
