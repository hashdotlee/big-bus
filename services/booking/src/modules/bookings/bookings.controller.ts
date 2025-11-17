import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiBearerAuth()
  create(@Request() req: any, @Body() createBookingDto: CreateBookingDto) {
    // In production, userId should come from JWT token in request
    const userId = req.user?.id || 'temp-user-id';
    return this.bookingsService.create(userId, createBookingDto);
  }

  @Post('calculate-price')
  @ApiOperation({ summary: 'Calculate booking price' })
  @ApiResponse({ status: 200, description: 'Return price calculation' })
  calculatePrice(@Body() calculateDto: CalculatePriceDto) {
    return this.bookingsService.calculatePrice(calculateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({ status: 200, description: 'Return all bookings' })
  @ApiBearerAuth()
  findAll(@Request() req: any, @Query('userId') userId?: string) {
    // In production, should filter by authenticated user
    return this.bookingsService.findAll(userId);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'Return user bookings' })
  @ApiBearerAuth()
  findMyBookings(@Request() req: any) {
    const userId = req.user?.id || 'temp-user-id';
    return this.bookingsService.findByUser(userId);
  }

  @Get('by-code/:code')
  @ApiOperation({ summary: 'Get booking by booking code' })
  @ApiResponse({ status: 200, description: 'Return booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findByCode(@Param('code') code: string) {
    return this.bookingsService.findByBookingCode(code);
  }

  @Get(':id/qr-code')
  @ApiOperation({ summary: 'Get QR code for booking' })
  @ApiResponse({ status: 200, description: 'Return QR code data' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getQRCode(@Param('id') id: string) {
    return this.bookingsService.getQRCode(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Return booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm booking (after payment)' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  confirm(@Param('id') id: string) {
    return this.bookingsService.confirmBooking(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  cancel(@Request() req: any, @Param('id') id: string, @Body() cancelDto?: CancelBookingDto) {
    const userId = req.user?.id || 'temp-user-id';
    return this.bookingsService.cancel(id, userId, cancelDto);
  }

  @Patch(':id/rate')
  @ApiOperation({ summary: 'Rate a completed booking' })
  @ApiResponse({ status: 200, description: 'Booking rated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  rate(@Request() req: any, @Param('id') id: string, @Body() rateDto: RateBookingDto) {
    const userId = req.user?.id || 'temp-user-id';
    return this.bookingsService.rate(id, userId, rateDto);
  }
}
