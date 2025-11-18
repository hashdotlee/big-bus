import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Booking,
  Schedule,
  Route,
  Station,
  Passenger,
} from '../src/database/entities';
import { Repository } from 'typeorm';

describe('Booking Flow Integration Tests (UI -> API -> Service -> DB)', () => {
  let app: INestApplication;
  let bookingRepository: Repository<Booking>;
  let passengerRepository: Repository<Passenger>;
  let scheduleRepository: Repository<Schedule>;
  let routeRepository: Repository<Route>;
  let stationRepository: Repository<Station>;

  let testScheduleId: string;
  let testStationId1: string;
  let testStationId2: string;
  let createdBookingId: string;

  const testUserId = 'test-user-flow-id';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    bookingRepository = moduleFixture.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );
    passengerRepository = moduleFixture.get<Repository<Passenger>>(
      getRepositoryToken(Passenger),
    );
    scheduleRepository = moduleFixture.get<Repository<Schedule>>(
      getRepositoryToken(Schedule),
    );
    routeRepository = moduleFixture.get<Repository<Route>>(
      getRepositoryToken(Route),
    );
    stationRepository = moduleFixture.get<Repository<Station>>(
      getRepositoryToken(Station),
    );

    await app.init();

    // Setup test data
    const station1 = await stationRepository.save(
      stationRepository.create({
        name: 'Flow Test Station A',
        address: '123 Flow Test St',
        city: 'Hanoi',
        latitude: 21.0285,
        longitude: 105.8542,
      }),
    );
    testStationId1 = station1.id;

    const station2 = await stationRepository.save(
      stationRepository.create({
        name: 'Flow Test Station B',
        address: '456 Flow Test Ave',
        city: 'HCMC',
        latitude: 10.8231,
        longitude: 106.6297,
      }),
    );
    testStationId2 = station2.id;

    const route = await routeRepository.save(
      routeRepository.create({
        name: 'Flow Test Route',
        originStationId: testStationId1,
        destinationStationId: testStationId2,
        distance: 1700,
        estimatedDuration: 1800,
      }),
    );

    const schedule = await scheduleRepository.save(
      scheduleRepository.create({
        routeId: route.id,
        vehicleId: 'flow-test-vehicle-id',
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 54 * 60 * 60 * 1000),
        basePrice: 350000,
        totalSeats: 45,
        availableSeats: 45,
      }),
    );
    testScheduleId = schedule.id;
  });

  afterAll(async () => {
    // Cleanup in reverse order of dependencies
    if (createdBookingId) {
      await passengerRepository.delete({ bookingId: createdBookingId });
      await bookingRepository.delete({ id: createdBookingId });
    }
    await scheduleRepository.delete({ id: testScheduleId });
    await routeRepository.delete({});
    await stationRepository.delete({});
    await app.close();
  });

  beforeEach(async () => {
    // Reset schedule seats before each test
    await scheduleRepository.update(testScheduleId, { availableSeats: 45 });
  });

  describe('Complete Booking Flow (User Journey)', () => {
    it('STEP 1: User searches for routes - Should calculate price', async () => {
      const priceResponse = await request(app.getHttpServer())
        .post('/bookings/calculate-price')
        .send({
          scheduleId: testScheduleId,
          passengerCount: 2,
          pickupStationId: testStationId1,
          dropoffStationId: testStationId2,
        })
        .expect(201);

      expect(priceResponse.body).toHaveProperty('finalPrice');
      expect(priceResponse.body).toHaveProperty('breakdown');
      expect(priceResponse.body.breakdown.ticketPrice).toBe(700000); // 350k * 2
      expect(priceResponse.body.finalPrice).toBeGreaterThan(0);
    });

    it('STEP 2: User creates booking - Should persist to database', async () => {
      const bookingData = {
        userId: testUserId,
        scheduleId: testScheduleId,
        passengers: [
          {
            fullName: 'John Doe',
            phone: '+84987654321',
            email: 'john@example.com',
            passengerType: 'adult',
          },
          {
            fullName: 'Jane Doe',
            phone: '+84987654322',
            email: 'jane@example.com',
            passengerType: 'adult',
          },
        ],
        seatNumbers: ['A1', 'A2'],
        pickupStationId: testStationId1,
        dropoffStationId: testStationId2,
        bookingType: 'ONLINE',
      };

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .send(bookingData)
        .expect(201);

      createdBookingId = response.body.id;

      // Verify response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('bookingCode');
      expect(response.body).toHaveProperty('qrCode');
      expect(response.body.status).toBe('PENDING');

      // Verify booking in database
      const bookingInDb = await bookingRepository.findOne({
        where: { id: createdBookingId },
        relations: ['passengers'],
      });

      expect(bookingInDb).toBeTruthy();
      expect(bookingInDb!.userId).toBe(testUserId);
      expect(bookingInDb!.seatNumbers).toEqual(['A1', 'A2']);
      expect(bookingInDb!.passengers.length).toBe(2);

      // Verify passengers in database
      const passengersInDb = await passengerRepository.find({
        where: { bookingId: createdBookingId },
      });

      expect(passengersInDb.length).toBe(2);
      expect(passengersInDb[0].fullName).toBe('John Doe');
      expect(passengersInDb[1].fullName).toBe('Jane Doe');

      // Verify seat availability updated
      const scheduleInDb = await scheduleRepository.findOne({
        where: { id: testScheduleId },
      });

      expect(scheduleInDb!.availableSeats).toBe(43); // 45 - 2
    });

    it('STEP 3: User retrieves booking - Should return complete data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bookings/${createdBookingId}`)
        .expect(200);

      expect(response.body.id).toBe(createdBookingId);
      expect(response.body.passengers).toBeTruthy();
      expect(response.body.schedule).toBeTruthy();
      expect(response.body.pickupStation).toBeTruthy();
      expect(response.body.dropoffStation).toBeTruthy();
    });

    it('STEP 4: User cancels booking - Should release seats and update status', async () => {
      const response = await request(app.getHttpServer())
        .post(`/bookings/${createdBookingId}/cancel`)
        .send({
          userId: testUserId,
          reason: 'Changed travel plans',
        })
        .expect(200);

      expect(response.body.status).toBe('CANCELLED');

      // Verify booking status in database
      const bookingInDb = await bookingRepository.findOne({
        where: { id: createdBookingId },
      });

      expect(bookingInDb!.status).toBe('CANCELLED');

      // Verify seats released
      const scheduleInDb = await scheduleRepository.findOne({
        where: { id: testScheduleId },
      });

      expect(scheduleInDb!.availableSeats).toBe(45); // Seats returned
    });
  });

  describe('Database Transaction Tests', () => {
    it('should rollback on booking creation failure', async () => {
      const initialSeats = (
        await scheduleRepository.findOne({ where: { id: testScheduleId } })
      )!.availableSeats;

      // Try to create booking with invalid data (should fail)
      await request(app.getHttpServer())
        .post('/bookings')
        .send({
          userId: testUserId,
          scheduleId: testScheduleId,
          passengers: [], // Empty passengers should fail
          seatNumbers: [],
          pickupStationId: testStationId1,
          dropoffStationId: testStationId2,
          bookingType: 'ONLINE',
        })
        .expect(400);

      // Verify seats not deducted
      const seatsAfter = (
        await scheduleRepository.findOne({ where: { id: testScheduleId } })
      )!.availableSeats;

      expect(seatsAfter).toBe(initialSeats);
    });

    it('should maintain data consistency across related entities', async () => {
      const booking = await bookingRepository.findOne({
        where: { id: createdBookingId },
        relations: ['passengers'],
      });

      expect(booking!.passengers.length).toBeGreaterThan(0);
      expect(booking!.seatNumbers.length).toBe(booking!.passengers.length);
    });
  });

  describe('Business Logic Validation', () => {
    it('should prevent booking when no seats available', async () => {
      // Set available seats to 0
      await scheduleRepository.update(testScheduleId, { availableSeats: 0 });

      await request(app.getHttpServer())
        .post('/bookings')
        .send({
          userId: testUserId,
          scheduleId: testScheduleId,
          passengers: [
            {
              fullName: 'Test User',
              phone: '+84987654321',
              email: 'test@example.com',
              passengerType: 'adult',
            },
          ],
          seatNumbers: ['B1'],
          pickupStationId: testStationId1,
          dropoffStationId: testStationId2,
          bookingType: 'ONLINE',
        })
        .expect(400);
    });

    it('should prevent cancelling already cancelled booking', async () => {
      // Cancel once
      await request(app.getHttpServer())
        .post(`/bookings/${createdBookingId}/cancel`)
        .send({
          userId: testUserId,
          reason: 'First cancellation',
        })
        .expect(200);

      // Try to cancel again
      await request(app.getHttpServer())
        .post(`/bookings/${createdBookingId}/cancel`)
        .send({
          userId: testUserId,
          reason: 'Second cancellation',
        })
        .expect(400);
    });

    it('should prevent unauthorized booking cancellation', async () => {
      await request(app.getHttpServer())
        .post(`/bookings/${createdBookingId}/cancel`)
        .send({
          userId: 'different-user-id', // Different user
          reason: 'Unauthorized attempt',
        })
        .expect(400);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent bookings', async () => {
      const promises = Array.from({ length: 3 }, (_, i) =>
        request(app.getHttpServer())
          .post('/bookings')
          .send({
            userId: `concurrent-user-${i}`,
            scheduleId: testScheduleId,
            passengers: [
              {
                fullName: `Passenger ${i}`,
                phone: `+8498765432${i}`,
                email: `passenger${i}@example.com`,
                passengerType: 'adult',
              },
            ],
            seatNumbers: [`C${i + 1}`],
            pickupStationId: testStationId1,
            dropoffStationId: testStationId2,
            bookingType: 'ONLINE',
          }),
      );

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.status).toBe(201);
        expect(result.body).toHaveProperty('bookingCode');
      });

      // Verify correct seat deduction
      const schedule = await scheduleRepository.findOne({
        where: { id: testScheduleId },
      });

      expect(schedule!.availableSeats).toBe(42); // 45 - 3

      // Cleanup
      for (const result of results) {
        await passengerRepository.delete({ bookingId: result.body.id });
        await bookingRepository.delete({ id: result.body.id });
      }
    });
  });
});
