import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking, Schedule, Route, Station } from '../src/database/entities';
import { Repository } from 'typeorm';

describe('Bookings E2E Tests', () => {
  let app: INestApplication;
  let bookingRepository: Repository<Booking>;
  let scheduleRepository: Repository<Schedule>;
  let routeRepository: Repository<Route>;
  let stationRepository: Repository<Station>;
  let testScheduleId: string;
  let testStationId1: string;
  let testStationId2: string;
  const testUserId = 'test-user-id';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    bookingRepository = moduleFixture.get<Repository<Booking>>(
      getRepositoryToken(Booking),
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

    // Create test data
    const station1 = stationRepository.create({
      name: 'Test Station A',
      address: '123 Test St',
      city: 'Test City',
      latitude: 10.0,
      longitude: 106.0,
    });
    const savedStation1 = await stationRepository.save(station1);
    testStationId1 = savedStation1.id;

    const station2 = stationRepository.create({
      name: 'Test Station B',
      address: '456 Test Ave',
      city: 'Test City',
      latitude: 11.0,
      longitude: 107.0,
    });
    const savedStation2 = await stationRepository.save(station2);
    testStationId2 = savedStation2.id;

    const route = routeRepository.create({
      name: 'Test Route',
      originStationId: testStationId1,
      destinationStationId: testStationId2,
      distance: 100,
      estimatedDuration: 120,
    });
    const savedRoute = await routeRepository.save(route);

    const schedule = scheduleRepository.create({
      routeId: savedRoute.id,
      vehicleId: 'test-vehicle-id',
      departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      arrivalTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
      basePrice: 100000,
      totalSeats: 45,
      availableSeats: 45,
    });
    const savedSchedule = await scheduleRepository.save(schedule);
    testScheduleId = savedSchedule.id;
  });

  afterAll(async () => {
    // Cleanup
    await bookingRepository.delete({});
    await scheduleRepository.delete({});
    await routeRepository.delete({});
    await stationRepository.delete({});
    await app.close();
  });

  beforeEach(async () => {
    // Clean up bookings before each test
    await bookingRepository.delete({});

    // Reset schedule seats
    await scheduleRepository.update(testScheduleId, { availableSeats: 45 });
  });

  describe('POST /bookings', () => {
    it('should create a new booking', () => {
      return request(app.getHttpServer())
        .post('/bookings')
        .send({
          userId: testUserId,
          scheduleId: testScheduleId,
          passengers: [
            {
              fullName: 'John Doe',
              phone: '+84987654321',
              email: 'john@example.com',
              passengerType: 'adult',
            },
          ],
          seatNumbers: ['A1'],
          pickupStationId: testStationId1,
          dropoffStationId: testStationId2,
          bookingType: 'ONLINE',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('bookingCode');
          expect(res.body).toHaveProperty('qrCode');
          expect(res.body.status).toBe('PENDING');
        });
    });

    it('should return 400 if not enough seats available', async () => {
      // Update schedule to have 0 available seats
      await scheduleRepository.update(testScheduleId, { availableSeats: 0 });

      return request(app.getHttpServer())
        .post('/bookings')
        .send({
          userId: testUserId,
          scheduleId: testScheduleId,
          passengers: [
            {
              fullName: 'John Doe',
              phone: '+84987654321',
              email: 'john@example.com',
              passengerType: 'adult',
            },
          ],
          seatNumbers: ['A1'],
          pickupStationId: testStationId1,
          dropoffStationId: testStationId2,
          bookingType: 'ONLINE',
        })
        .expect(400);
    });
  });

  describe('GET /bookings', () => {
    it('should return all bookings', async () => {
      // Create a test booking
      await request(app.getHttpServer()).post('/bookings').send({
        userId: testUserId,
        scheduleId: testScheduleId,
        passengers: [
          {
            fullName: 'Jane Doe',
            phone: '+84987654322',
            email: 'jane@example.com',
            passengerType: 'adult',
          },
        ],
        seatNumbers: ['A2'],
        pickupStationId: testStationId1,
        dropoffStationId: testStationId2,
        bookingType: 'ONLINE',
      });

      return request(app.getHttpServer())
        .get('/bookings')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /bookings/:id', () => {
    it('should return a booking by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          userId: testUserId,
          scheduleId: testScheduleId,
          passengers: [
            {
              fullName: 'Test User',
              phone: '+84987654323',
              email: 'test@example.com',
              passengerType: 'adult',
            },
          ],
          seatNumbers: ['A3'],
          pickupStationId: testStationId1,
          dropoffStationId: testStationId2,
          bookingType: 'ONLINE',
        });

      const bookingId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/bookings/${bookingId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(bookingId);
        });
    });

    it('should return 404 for non-existent booking', () => {
      return request(app.getHttpServer())
        .get('/bookings/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /bookings/:id/cancel', () => {
    it('should cancel a booking', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          userId: testUserId,
          scheduleId: testScheduleId,
          passengers: [
            {
              fullName: 'Cancel Test',
              phone: '+84987654324',
              email: 'cancel@example.com',
              passengerType: 'adult',
            },
          ],
          seatNumbers: ['A4'],
          pickupStationId: testStationId1,
          dropoffStationId: testStationId2,
          bookingType: 'ONLINE',
        });

      const bookingId = createResponse.body.id;

      return request(app.getHttpServer())
        .post(`/bookings/${bookingId}/cancel`)
        .send({
          userId: testUserId,
          reason: 'Changed plans',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('CANCELLED');
        });
    });
  });

  describe('POST /bookings/calculate-price', () => {
    it('should calculate booking price', () => {
      return request(app.getHttpServer())
        .post('/bookings/calculate-price')
        .send({
          scheduleId: testScheduleId,
          passengerCount: 2,
          pickupStationId: testStationId1,
          dropoffStationId: testStationId2,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('basePrice');
          expect(res.body).toHaveProperty('finalPrice');
          expect(res.body).toHaveProperty('breakdown');
        });
    });

    it('should apply promotion code discount', () => {
      return request(app.getHttpServer())
        .post('/bookings/calculate-price')
        .send({
          scheduleId: testScheduleId,
          passengerCount: 2,
          pickupStationId: testStationId1,
          dropoffStationId: testStationId2,
          promotionCode: 'PROMO2024',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.discount).toBeGreaterThan(0);
          expect(res.body.finalPrice).toBeLessThan(res.body.basePrice);
        });
    });
  });
});
