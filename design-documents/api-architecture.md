# Bus Booking System - API Architecture

## 1. Microservices Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         API Gateway                          │
│                    (Kong / Nginx / Traefik)                 │
└─────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐   ┌─────────▼────────┐   ┌─────────▼────────┐
│  Auth Service  │   │ Booking Service  │   │ Vehicle Service  │
│   Port: 3001   │   │   Port: 3002     │   │   Port: 3003     │
└────────────────┘   └──────────────────┘   └──────────────────┘
        │                       │                       │
┌───────▼────────┐   ┌─────────▼────────┐   ┌─────────▼────────┐
│Payment Service │   │Notification Svc  │   │Analytics Service │
│   Port: 3004   │   │   Port: 3005     │   │   Port: 3006     │
└────────────────┘   └──────────────────┘   └──────────────────┘
```

## 2. Service Definitions

### 2.1 Auth Service (Port 3001)

```typescript
// auth.module.ts structure
@Module({
  imports: [
    JwtModule,
    PassportModule,
    UsersModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
})
export class AuthModule {}
```

#### API Endpoints:

```typescript
// Authentication & Authorization
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email
POST   /auth/verify-phone
POST   /auth/2fa/enable
POST   /auth/2fa/verify
GET    /auth/me
PUT    /auth/profile

// OAuth2
GET    /auth/google
GET    /auth/google/callback
GET    /auth/facebook
GET    /auth/facebook/callback
GET    /auth/zalo
GET    /auth/zalo/callback

// SSO with PKCE
POST   /auth/sso/authorize
POST   /auth/sso/token
GET    /auth/sso/userinfo
POST   /auth/sso/revoke

// Role Management
GET    /auth/roles
POST   /auth/roles
PUT    /auth/roles/:id
DELETE /auth/roles/:id
POST   /auth/users/:userId/roles
DELETE /auth/users/:userId/roles/:roleId
```

#### DTOs and Validation:

```typescript
// register.dto.ts
import { IsEmail, IsString, MinLength, IsPhoneNumber, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber('VN')
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(['customer', 'driver', 'staff'])
  userType: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}

// login.dto.ts
export class LoginDto {
  @IsString()
  username: string; // email or phone

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  twoFactorCode?: string;
}
```

### 2.2 Booking Service (Port 3002)

```typescript
// booking.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Schedule, Route, Station]),
    RabbitMQModule,
    RedisModule,
  ],
  controllers: [
    BookingController,
    ScheduleController,
    RouteController,
    StationController,
  ],
  providers: [
    BookingService,
    ScheduleService,
    RouteService,
    StationService,
    SeatSelectionService,
    PricingService,
  ],
})
export class BookingModule {}
```

#### API Endpoints:

```typescript
// Bookings
GET    /bookings                    // List bookings (with filters)
GET    /bookings/:id                // Get booking details
POST   /bookings                    // Create new booking
POST   /bookings/calculate-price    // Calculate price before booking
PUT    /bookings/:id                // Update booking
POST   /bookings/:id/cancel         // Cancel booking
POST   /bookings/:id/confirm        // Confirm booking
GET    /bookings/:id/qr-code        // Get QR code for boarding
POST   /bookings/:id/rate           // Rate booking

// Schedules
GET    /schedules                   // Search schedules
GET    /schedules/:id               // Get schedule details
POST   /schedules                   // Create schedule (admin)
PUT    /schedules/:id               // Update schedule (admin)
DELETE /schedules/:id               // Delete schedule (admin)
GET    /schedules/:id/seats         // Get seat availability
POST   /schedules/:id/update-status // Update schedule status

// Routes
GET    /routes                      // List all routes
GET    /routes/:id                  // Get route details
POST   /routes                      // Create route (admin)
PUT    /routes/:id                  // Update route (admin)
DELETE /routes/:id                  // Delete route (admin)
GET    /routes/search               // Search routes by origin/destination

// Stations
GET    /stations                    // List all stations
GET    /stations/:id                // Get station details
POST   /stations                    // Create station (admin)
PUT    /stations/:id                // Update station (admin)
DELETE /stations/:id                // Delete station (admin)
GET    /stations/nearby             // Find nearby stations (GPS)

// Subscription Bookings
GET    /subscriptions               // List user subscriptions
POST   /subscriptions               // Create subscription
PUT    /subscriptions/:id           // Update subscription
DELETE /subscriptions/:id           // Cancel subscription
POST   /subscriptions/:id/pause     // Pause subscription
POST   /subscriptions/:id/resume    // Resume subscription
```

#### DTOs:

```typescript
// create-booking.dto.ts
export class CreateBookingDto {
  @IsUUID()
  scheduleId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];

  @IsOptional()
  @IsArray()
  seatNumbers?: string[];

  @IsUUID()
  pickupStationId: string;

  @IsUUID()
  dropoffStationId: string;

  @IsOptional()
  @IsString()
  promotionCode?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsEnum(['one_way', 'round_trip'])
  bookingType: string;
}

// passenger.dto.ts
export class PassengerDto {
  @IsString()
  fullName: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsEnum(['male', 'female', 'other'])
  gender: string;

  @IsString()
  idNumber: string;

  @IsOptional()
  @IsString()
  seatNumber?: string;
}

// search-schedule.dto.ts
export class SearchScheduleDto {
  @IsUUID()
  originStationId: string;

  @IsUUID()
  destinationStationId: string;

  @IsDateString()
  departureDate: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  passengerCount?: number = 1;

  @IsOptional()
  @IsEnum(['economy', 'vip', 'sleeper'])
  vehicleType?: string;
}
```

### 2.3 Vehicle Service (Port 3003)

```typescript
// vehicle.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, VehicleType, Maintenance]),
    BullModule.registerQueue({ name: 'maintenance' }),
  ],
  controllers: [
    VehicleController,
    MaintenanceController,
    TrackingController,
  ],
  providers: [
    VehicleService,
    MaintenanceService,
    TrackingService,
    GPSService,
  ],
})
export class VehicleModule {}
```

#### API Endpoints:

```typescript
// Vehicles
GET    /vehicles                    // List vehicles
GET    /vehicles/:id                // Get vehicle details
POST   /vehicles                    // Add vehicle (admin)
PUT    /vehicles/:id                // Update vehicle (admin)
DELETE /vehicles/:id                // Remove vehicle (admin)
GET    /vehicles/:id/location       // Get current location
POST   /vehicles/:id/update-location // Update location (driver)
GET    /vehicles/:id/maintenance    // Get maintenance history
POST   /vehicles/:id/maintenance    // Schedule maintenance

// Vehicle Types
GET    /vehicle-types               // List vehicle types
POST   /vehicle-types               // Create type (admin)
PUT    /vehicle-types/:id           // Update type (admin)
DELETE /vehicle-types/:id           // Delete type (admin)

// GPS Tracking
GET    /tracking/vehicles           // Get all vehicle positions
GET    /tracking/vehicles/:id       // Track specific vehicle
POST   /tracking/update             // Batch update positions
WS     /tracking/live               // WebSocket for live tracking

// Maintenance
GET    /maintenance                 // List maintenance records
POST   /maintenance                 // Create maintenance record
PUT    /maintenance/:id             // Update maintenance
GET    /maintenance/upcoming        // Get upcoming maintenance
POST   /maintenance/:id/complete    // Mark as completed
```

### 2.4 Payment Service (Port 3004)

```typescript
// payment.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Wallet]),
    BullModule.registerQueue({ name: 'payment' }),
  ],
  controllers: [
    PaymentController,
    WalletController,
  ],
  providers: [
    PaymentService,
    WalletService,
    VNPayService,
    MomoService,
    ZaloPayService,
    StripeService,
  ],
})
export class PaymentModule {}
```

#### API Endpoints:

```typescript
// Payments
POST   /payments/create             // Create payment
POST   /payments/confirm            // Confirm payment
GET    /payments/:id                // Get payment details
POST   /payments/refund             // Process refund
GET    /payments/callback           // Payment gateway callback
POST   /payments/webhook            // Payment gateway webhook

// Wallets
GET    /wallets/balance             // Get wallet balance
POST   /wallets/topup               // Top up wallet
POST   /wallets/withdraw            // Withdraw from wallet
GET    /wallets/transactions        // Get wallet transactions
POST   /wallets/transfer            // Transfer between wallets

// Payment Methods
GET    /payment-methods             // List available methods
POST   /payment-methods             // Add payment method
DELETE /payment-methods/:id         // Remove payment method
POST   /payment-methods/:id/default // Set as default
```

### 2.5 Notification Service (Port 3005)

```typescript
// notification.module.ts
@Module({
  imports: [
    BullModule.registerQueue({ name: 'email' }),
    BullModule.registerQueue({ name: 'sms' }),
    BullModule.registerQueue({ name: 'push' }),
    BullModule.registerQueue({ name: 'zalo' }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailService,
    SmsService,
    PushService,
    ZaloOAService,
  ],
})
export class NotificationModule {}
```

#### API Endpoints:

```typescript
// Notifications
POST   /notifications/send          // Send notification
GET    /notifications               // Get user notifications
PUT    /notifications/:id/read      // Mark as read
DELETE /notifications/:id           // Delete notification
POST   /notifications/broadcast     // Broadcast to multiple users

// Templates
GET    /templates                   // List templates
POST   /templates                   // Create template
PUT    /templates/:id               // Update template
DELETE /templates/:id               // Delete template

// Preferences
GET    /preferences                 // Get notification preferences
PUT    /preferences                 // Update preferences

// Zalo OA
POST   /zalo/send-message          // Send Zalo message
POST   /zalo/send-template         // Send template message
POST   /zalo/broadcast             // Broadcast message
GET    /zalo/followers             // Get followers list
```

### 2.6 Analytics Service (Port 3006)

```typescript
// analytics.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([DailyStatistics, ActivityLog]),
    InfluxDBModule,
    ElasticsearchModule,
  ],
  controllers: [
    AnalyticsController,
    ReportController,
  ],
  providers: [
    AnalyticsService,
    ReportService,
    PredictionService,
  ],
})
export class AnalyticsModule {}
```

#### API Endpoints:

```typescript
// Analytics
GET    /analytics/dashboard         // Dashboard data
GET    /analytics/revenue           // Revenue analytics
GET    /analytics/bookings          // Booking analytics
GET    /analytics/occupancy         // Occupancy rates
GET    /analytics/routes            // Route performance
GET    /analytics/customers         // Customer analytics

// Reports
GET    /reports/daily               // Daily report
GET    /reports/weekly              // Weekly report
GET    /reports/monthly             // Monthly report
GET    /reports/custom             // Custom date range
POST   /reports/generate            // Generate report
GET    /reports/export              // Export report (PDF/Excel)

// Predictions
GET    /predictions/demand          // Demand prediction
GET    /predictions/revenue         // Revenue forecast
GET    /predictions/maintenance     // Maintenance prediction
POST   /predictions/train           // Train ML models

// Activity Logs
GET    /logs                        // Get activity logs
POST   /logs                        // Create log entry
GET    /logs/export                 // Export logs
```

## 3. Common Middleware & Guards

```typescript
// auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom logic here
    return super.canActivate(context);
  }
}

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// rate-limit.guard.ts
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    @Inject('RATE_LIMIT_OPTIONS') private options: RateLimitOptions
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = `rate_limit:${request.ip}:${request.path}`;
    
    const current = await this.redisService.incr(key);
    
    if (current === 1) {
      await this.redisService.expire(key, this.options.windowMs / 1000);
    }
    
    return current <= this.options.max;
  }
}
```

## 4. WebSocket Events (Real-time Features)

```typescript
// gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // Events
  @SubscribeMessage('join_tracking')
  handleJoinTracking(client: Socket, vehicleId: string) {
    client.join(`tracking:${vehicleId}`);
  }

  @SubscribeMessage('location_update')
  handleLocationUpdate(client: Socket, data: LocationUpdateDto) {
    this.server.to(`tracking:${data.vehicleId}`).emit('location', data);
  }

  @SubscribeMessage('booking_status')
  handleBookingStatus(client: Socket, bookingId: string) {
    client.join(`booking:${bookingId}`);
  }

  // Emit events
  emitBookingUpdate(bookingId: string, status: string) {
    this.server.to(`booking:${bookingId}`).emit('status_update', { status });
  }

  emitVehicleLocation(vehicleId: string, location: any) {
    this.server.to(`tracking:${vehicleId}`).emit('location_update', location);
  }
}
```

## 5. Message Queue Events (RabbitMQ)

```typescript
// Events between services
export enum ServiceEvents {
  // Booking events
  BOOKING_CREATED = 'booking.created',
  BOOKING_CONFIRMED = 'booking.confirmed',
  BOOKING_CANCELLED = 'booking.cancelled',
  BOOKING_COMPLETED = 'booking.completed',

  // Payment events
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  REFUND_PROCESSED = 'refund.processed',

  // Schedule events
  SCHEDULE_DEPARTURE = 'schedule.departure',
  SCHEDULE_ARRIVAL = 'schedule.arrival',
  SCHEDULE_DELAYED = 'schedule.delayed',

  // User events
  USER_REGISTERED = 'user.registered',
  USER_VERIFIED = 'user.verified',
  LOYALTY_POINTS_EARNED = 'loyalty.points.earned',

  // Vehicle events
  VEHICLE_LOCATION_UPDATE = 'vehicle.location.update',
  VEHICLE_MAINTENANCE_DUE = 'vehicle.maintenance.due',
}

// Event payload examples
interface BookingCreatedEvent {
  bookingId: string;
  userId: string;
  scheduleId: string;
  amount: number;
  seatNumbers: string[];
  timestamp: Date;
}

interface PaymentSuccessEvent {
  transactionId: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  timestamp: Date;
}
```

## 6. API Response Format

```typescript
// Standard response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

// Success response
{
  "success": true,
  "data": {
    "id": "123",
    "bookingCode": "BK2024001",
    "status": "confirmed"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}

// Error response
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found with the provided ID",
    "details": {
      "bookingId": "123"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}

// Paginated response
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 7. Error Codes

```typescript
export enum ErrorCodes {
  // Auth errors (1xxx)
  INVALID_CREDENTIALS = 'AUTH_1001',
  TOKEN_EXPIRED = 'AUTH_1002',
  UNAUTHORIZED = 'AUTH_1003',
  FORBIDDEN = 'AUTH_1004',

  // Booking errors (2xxx)
  BOOKING_NOT_FOUND = 'BOOK_2001',
  SEATS_NOT_AVAILABLE = 'BOOK_2002',
  SCHEDULE_FULL = 'BOOK_2003',
  BOOKING_CANCELLED = 'BOOK_2004',

  // Payment errors (3xxx)
  PAYMENT_FAILED = 'PAY_3001',
  INSUFFICIENT_BALANCE = 'PAY_3002',
  PAYMENT_TIMEOUT = 'PAY_3003',
  REFUND_FAILED = 'PAY_3004',

  // Vehicle errors (4xxx)
  VEHICLE_NOT_FOUND = 'VEH_4001',
  VEHICLE_UNAVAILABLE = 'VEH_4002',

  // General errors (9xxx)
  VALIDATION_ERROR = 'GEN_9001',
  INTERNAL_ERROR = 'GEN_9002',
  NOT_FOUND = 'GEN_9003',
  RATE_LIMIT_EXCEEDED = 'GEN_9004',
}
```

## 8. Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=bus_booking

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_URL=amqp://localhost

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Payment Gateways
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=

MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=

ZALOPAY_APP_ID=
ZALOPAY_KEY1=
ZALOPAY_KEY2=

# Notification Services
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
FIREBASE_PROJECT_ID=

# Zalo OA
ZALO_OA_ID=
ZALO_OA_SECRET=
ZALO_OA_ACCESS_TOKEN=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=

# Monitoring
SENTRY_DSN=
GRAFANA_API_KEY=
```

## 9. Docker Compose Setup

```yaml
version: '3.8'

services:
  # Databases
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: bus_booking
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass password
    ports:
      - "6379:6379"

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    ports:
      - "5672:5672"
      - "15672:15672"

  # Services
  auth-service:
    build:
      context: ./services/auth
    environment:
      - NODE_ENV=production
      - PORT=3001
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  booking-service:
    build:
      context: ./services/booking
    environment:
      - NODE_ENV=production
      - PORT=3002
    ports:
      - "3002:3002"
    depends_on:
      - postgres
      - redis
      - rabbitmq

  vehicle-service:
    build:
      context: ./services/vehicle
    environment:
      - NODE_ENV=production
      - PORT=3003
    ports:
      - "3003:3003"
    depends_on:
      - postgres
      - redis

  payment-service:
    build:
      context: ./services/payment
    environment:
      - NODE_ENV=production
      - PORT=3004
    ports:
      - "3004:3004"
    depends_on:
      - postgres
      - redis
      - rabbitmq

  notification-service:
    build:
      context: ./services/notification
    environment:
      - NODE_ENV=production
      - PORT=3005
    ports:
      - "3005:3005"
    depends_on:
      - redis
      - rabbitmq

  analytics-service:
    build:
      context: ./services/analytics
    environment:
      - NODE_ENV=production
      - PORT=3006
    ports:
      - "3006:3006"
    depends_on:
      - postgres
      - redis

  # API Gateway
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - auth-service
      - booking-service
      - vehicle-service
      - payment-service
      - notification-service
      - analytics-service

volumes:
  postgres_data:
```

## 10. Testing Strategy

```typescript
// Unit Test Example
describe('BookingService', () => {
  let service: BookingService;
  let repository: Repository<Booking>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    repository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const createBookingDto: CreateBookingDto = {
        scheduleId: 'schedule-id',
        passengers: [...],
        pickupStationId: 'station-id',
        dropoffStationId: 'station-id',
      };

      const result = await service.createBooking(createBookingDto);
      expect(result).toBeDefined();
      expect(result.status).toBe('pending');
    });
  });
});

// E2E Test Example
describe('BookingController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/bookings (POST)', () => {
    return request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', 'Bearer token')
      .send({
        scheduleId: 'schedule-id',
        passengers: [...],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.bookingCode).toBeDefined();
      });
  });
});
```
