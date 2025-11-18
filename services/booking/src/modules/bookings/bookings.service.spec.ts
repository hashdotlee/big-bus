import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { BookingsService } from './bookings.service';
import { Booking, Passenger } from '../../database/entities';
import { BookingStatus } from '@big-bus/types';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { SchedulesService } from '../schedules/schedules.service';

jest.mock('qrcode');

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingsRepository: Repository<Booking>;
  let passengersRepository: Repository<Passenger>;
  let schedulesService: SchedulesService;

  const mockSchedule = {
    id: 'schedule-1',
    availableSeats: 10,
    basePrice: 100000,
    route: {
      id: 'route-1',
      originStation: { id: 'station-1', name: 'Station A' },
      destinationStation: { id: 'station-2', name: 'Station B' },
    },
  };

  const mockBooking: Partial<Booking> = {
    id: 'booking-1',
    bookingCode: 'BB123456',
    userId: 'user-1',
    scheduleId: 'schedule-1',
    pickupStationId: 'station-1',
    dropoffStationId: 'station-2',
    seatNumbers: ['A1', 'A2'],
    totalPrice: 230000,
    discount: 0,
    finalPrice: 230000,
    status: BookingStatus.PENDING,
    passengers: [],
    qrCode: 'data:image/png;base64,mockQRCode',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBookingsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPassengersRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSchedulesService = {
    findOne: jest.fn(),
    updateAvailableSeats: jest.fn(),
    releaseSeats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingsRepository,
        },
        {
          provide: getRepositoryToken(Passenger),
          useValue: mockPassengersRepository,
        },
        {
          provide: SchedulesService,
          useValue: mockSchedulesService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingsRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    passengersRepository = module.get<Repository<Passenger>>(getRepositoryToken(Passenger));
    schedulesService = module.get<SchedulesService>(SchedulesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createBookingDto: CreateBookingDto = {
      scheduleId: 'schedule-1',
      passengers: [
        {
          fullName: 'John Doe',
          phone: '+84987654321',
          email: 'john@example.com',
          passengerType: 'adult' as any,
        },
        {
          fullName: 'Jane Doe',
          phone: '+84987654322',
          email: 'jane@example.com',
          passengerType: 'adult' as any,
        },
      ],
      seatNumbers: ['A1', 'A2'],
      pickupStationId: 'station-1',
      dropoffStationId: 'station-2',
      bookingType: 'ONLINE' as any,
    };

    it('should create a booking successfully', async () => {
      mockSchedulesService.findOne.mockResolvedValue(mockSchedule);
      mockBookingsRepository.create.mockReturnValue(mockBooking);
      mockBookingsRepository.save.mockResolvedValueOnce(mockBooking).mockResolvedValueOnce({
        ...mockBooking,
        qrCode: 'data:image/png;base64,mockQRCode',
      });
      mockPassengersRepository.create.mockImplementation((dto) => dto);
      mockPassengersRepository.save.mockResolvedValue([]);
      mockSchedulesService.updateAvailableSeats.mockResolvedValue(undefined);
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        passengers: createBookingDto.passengers,
      });

      (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mockQRCode');

      const result = await service.create('user-1', createBookingDto);

      expect(mockSchedulesService.findOne).toHaveBeenCalledWith('schedule-1');
      expect(mockBookingsRepository.create).toHaveBeenCalled();
      expect(mockPassengersRepository.save).toHaveBeenCalled();
      expect(mockSchedulesService.updateAvailableSeats).toHaveBeenCalledWith('schedule-1', 2);
      expect(QRCode.toDataURL).toHaveBeenCalled();
    });

    it('should throw BadRequestException if not enough seats available', async () => {
      mockSchedulesService.findOne.mockResolvedValue({
        ...mockSchedule,
        availableSeats: 1,
      });

      await expect(service.create('user-1', createBookingDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create('user-1', createBookingDto)).rejects.toThrow(
        'Not enough available seats for this booking',
      );
    });
  });

  describe('findAll', () => {
    it('should return all bookings', async () => {
      mockBookingsRepository.find.mockResolvedValue([mockBooking]);

      const result = await service.findAll();

      expect(mockBookingsRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: expect.any(Array),
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockBooking]);
    });

    it('should filter bookings by userId', async () => {
      mockBookingsRepository.find.mockResolvedValue([mockBooking]);

      await service.findAll('user-1');

      expect(mockBookingsRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: expect.any(Array),
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      mockBookingsRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOne('booking-1');

      expect(mockBookingsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        relations: expect.any(Array),
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockBookingsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByBookingCode', () => {
    it('should return a booking by booking code', async () => {
      mockBookingsRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findByBookingCode('BB123456');

      expect(mockBookingsRepository.findOne).toHaveBeenCalledWith({
        where: { bookingCode: 'BB123456' },
        relations: expect.any(Array),
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if booking code not found', async () => {
      mockBookingsRepository.findOne.mockResolvedValue(null);

      await expect(service.findByBookingCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('confirmBooking', () => {
    it('should confirm a pending booking', async () => {
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.PENDING,
      });
      mockBookingsRepository.save.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });

      const result = await service.confirmBooking('booking-1');

      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should throw BadRequestException if booking is not pending', async () => {
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });

      await expect(service.confirmBooking('booking-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a booking successfully', async () => {
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.PENDING,
        passengers: [{}, {}] as any,
      });
      mockSchedulesService.releaseSeats.mockResolvedValue(undefined);
      mockBookingsRepository.save.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      const cancelDto: CancelBookingDto = {
        reason: 'Changed plans',
      };

      const result = await service.cancel('booking-1', 'user-1', cancelDto);

      expect(mockSchedulesService.releaseSeats).toHaveBeenCalledWith('schedule-1', 2);
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('should throw BadRequestException if user is not the booking owner', async () => {
      mockBookingsRepository.findOne.mockResolvedValue(mockBooking);

      await expect(
        service.cancel('booking-1', 'different-user'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if booking is already cancelled', async () => {
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(service.cancel('booking-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if booking is completed', async () => {
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      });

      await expect(service.cancel('booking-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('rate', () => {
    it('should rate a completed booking', async () => {
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      });
      mockBookingsRepository.save.mockResolvedValue({
        ...mockBooking,
        rating: 5,
        review: 'Great service!',
      });

      const rateDto: RateBookingDto = {
        rating: 5,
        review: 'Great service!',
      };

      const result = await service.rate('booking-1', 'user-1', rateDto);

      expect(result.rating).toBe(5);
      expect(result.review).toBe('Great service!');
    });

    it('should throw BadRequestException if user is not the booking owner', async () => {
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      });

      await expect(
        service.rate('booking-1', 'different-user', { rating: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if booking is not completed', async () => {
      mockBookingsRepository.findOne.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.PENDING,
      });

      await expect(
        service.rate('booking-1', 'user-1', { rating: 5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculatePrice', () => {
    it('should calculate price correctly without promotion', async () => {
      mockSchedulesService.findOne.mockResolvedValue(mockSchedule);

      const calculateDto: CalculatePriceDto = {
        scheduleId: 'schedule-1',
        passengerCount: 2,
        pickupStationId: 'station-1',
        dropoffStationId: 'station-2',
      };

      const result = await service.calculatePrice(calculateDto);

      expect(result.breakdown.ticketPrice).toBe(200000);
      expect(result.breakdown.serviceFee).toBe(10000);
      expect(result.breakdown.tax).toBe(21000);
      expect(result.finalPrice).toBe(231000);
    });

    it('should apply promotion discount correctly', async () => {
      mockSchedulesService.findOne.mockResolvedValue(mockSchedule);

      const calculateDto: CalculatePriceDto = {
        scheduleId: 'schedule-1',
        passengerCount: 2,
        pickupStationId: 'station-1',
        dropoffStationId: 'station-2',
        promotionCode: 'PROMO2024',
      };

      const result = await service.calculatePrice(calculateDto);

      expect(result.breakdown.ticketPrice).toBe(200000);
      expect(result.breakdown.promotionDiscount).toBe(20000);
      expect(result.discount).toBe(20000);
      expect(result.finalPrice).toBe(211000);
    });
  });

  describe('findByUser', () => {
    it('should return all bookings for a user', async () => {
      mockBookingsRepository.find.mockResolvedValue([mockBooking]);

      const result = await service.findByUser('user-1');

      expect(result).toEqual([mockBooking]);
      expect(mockBookingsRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: expect.any(Array),
        order: { createdAt: 'DESC' },
      });
    });
  });
});
