import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Booking, Passenger } from '../../database/entities';
import { BookingStatus } from '@big-bus/types';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { SchedulesService } from '../schedules/schedules.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Passenger)
    private passengersRepository: Repository<Passenger>,
    private schedulesService: SchedulesService,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    const { scheduleId, passengers, seatNumbers, pickupStationId, dropoffStationId, promotionCode, specialRequests, bookingType } = createBookingDto;

    // Validate schedule exists and has enough seats
    const schedule = await this.schedulesService.findOne(scheduleId);

    if (schedule.availableSeats < passengers.length) {
      throw new BadRequestException('Not enough available seats for this booking');
    }

    // Calculate price
    const priceCalculation = await this.calculatePrice({
      scheduleId,
      passengerCount: passengers.length,
      pickupStationId,
      dropoffStationId,
      promotionCode,
    });

    // Generate unique booking code
    const bookingCode = await this.generateBookingCode();

    // Create booking
    const booking = this.bookingsRepository.create({
      bookingCode,
      userId,
      scheduleId,
      pickupStationId,
      dropoffStationId,
      seatNumbers: seatNumbers || [],
      bookingType,
      totalPrice: priceCalculation.basePrice,
      discount: priceCalculation.discount,
      finalPrice: priceCalculation.finalPrice,
      status: BookingStatus.PENDING,
      promotionCode,
      specialRequests,
    });

    const savedBooking = await this.bookingsRepository.save(booking);

    // Create passengers
    const passengerEntities = passengers.map((passenger, index) => {
      return this.passengersRepository.create({
        ...passenger,
        bookingId: savedBooking.id,
        seatNumber: seatNumbers?.[index] || passenger.seatNumber,
      });
    });

    await this.passengersRepository.save(passengerEntities);

    // Update available seats
    await this.schedulesService.updateAvailableSeats(scheduleId, passengers.length);

    // Generate QR code
    const qrCode = await this.generateQRCode(savedBooking.bookingCode);
    savedBooking.qrCode = qrCode;
    await this.bookingsRepository.save(savedBooking);

    // Return booking with passengers
    return await this.findOne(savedBooking.id);
  }

  async findAll(userId?: string): Promise<Booking[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    return await this.bookingsRepository.find({
      where,
      relations: ['schedule', 'schedule.route', 'schedule.route.originStation', 'schedule.route.destinationStation', 'passengers', 'pickupStation', 'dropoffStation'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['schedule', 'schedule.route', 'schedule.route.originStation', 'schedule.route.destinationStation', 'passengers', 'pickupStation', 'dropoffStation'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findByBookingCode(bookingCode: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingCode },
      relations: ['schedule', 'schedule.route', 'schedule.route.originStation', 'schedule.route.destinationStation', 'passengers', 'pickupStation', 'dropoffStation'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with code ${bookingCode} not found`);
    }

    return booking;
  }

  async findByUser(userId: string): Promise<Booking[]> {
    return await this.findAll(userId);
  }

  async confirmBooking(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    booking.status = BookingStatus.CONFIRMED;
    return await this.bookingsRepository.save(booking);
  }

  async cancel(id: string, userId: string, cancelDto?: CancelBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.userId !== userId) {
      throw new BadRequestException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    // Release seats back to schedule
    await this.schedulesService.releaseSeats(booking.scheduleId, booking.passengers.length);

    booking.status = BookingStatus.CANCELLED;
    if (cancelDto?.reason) {
      booking.specialRequests = `${booking.specialRequests || ''}\nCancellation reason: ${cancelDto.reason}`;
    }

    return await this.bookingsRepository.save(booking);
  }

  async rate(id: string, userId: string, rateDto: RateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.userId !== userId) {
      throw new BadRequestException('You can only rate your own bookings');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Only completed bookings can be rated');
    }

    booking.rating = rateDto.rating;
    booking.review = rateDto.review;

    return await this.bookingsRepository.save(booking);
  }

  async calculatePrice(calculateDto: CalculatePriceDto): Promise<any> {
    const { scheduleId, passengerCount, promotionCode } = calculateDto;

    const schedule = await this.schedulesService.findOne(scheduleId);

    const ticketPrice = schedule.basePrice * passengerCount;
    const serviceFee = ticketPrice * 0.05; // 5% service fee
    const tax = (ticketPrice + serviceFee) * 0.1; // 10% tax

    let promotionDiscount = 0;
    // Simple promotion logic - can be enhanced with a promotions service
    if (promotionCode === 'PROMO2024') {
      promotionDiscount = ticketPrice * 0.1; // 10% discount
    }

    const basePrice = ticketPrice + serviceFee + tax;
    const finalPrice = basePrice - promotionDiscount;

    return {
      basePrice,
      discount: promotionDiscount,
      finalPrice,
      breakdown: {
        ticketPrice,
        serviceFee,
        tax,
        promotionDiscount,
      },
    };
  }

  private async generateBookingCode(): Promise<string> {
    const prefix = 'BB';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private async generateQRCode(bookingCode: string): Promise<string> {
    try {
      const qrCodeData = await QRCode.toDataURL(bookingCode);
      return qrCodeData;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  }
}
