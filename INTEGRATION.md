# Big Bus - Backend Integration Documentation

This document describes the integration between frontend applications and backend microservices.

## Overview

The Big Bus platform is now fully integrated with:
- ✅ 6 Backend Microservices (auth, booking, vehicle, payment, notification, analytics)
- ✅ Shared Packages (types, config, database, common, api-client)
- ✅ Frontend Applications (web, admin)
- ✅ API Gateway (nginx)
- ✅ Infrastructure (PostgreSQL, Redis, RabbitMQ)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
│  ┌────────────────┐              ┌────────────────┐         │
│  │  Web (Next.js) │              │ Admin (Next.js)│         │
│  │  Port: 3000    │              │  Port: 3100    │         │
│  └────────┬───────┘              └────────┬───────┘         │
│           │                               │                  │
│           └───────────────┬───────────────┘                  │
│                           │                                  │
│                    @big-bus/api-client                       │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    API Gateway (Nginx)                       │
│                      Port: 80/443                            │
└───────────────────────────┼──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│  Auth Service  │  │   Booking   │  │  Vehicle Service│
│   Port: 3001   │  │   Service   │  │   Port: 3003    │
│                │  │  Port: 3002 │  │                 │
└────────────────┘  └─────────────┘  └─────────────────┘

┌────────────────┐  ┌──────────────┐  ┌─────────────────┐
│ Payment Service│  │ Notification │  │ Analytics Svc   │
│  Port: 3004    │  │   Service    │  │  Port: 3006     │
│                │  │  Port: 3005  │  │                 │
└────────────────┘  └──────────────┘  └─────────────────┘
```

## Packages Structure

### 1. @big-bus/types
Complete type definitions for all services:
- ✅ Auth types (User, Role, JWT)
- ✅ Booking types (Route, Schedule, Booking, Station)
- ✅ Vehicle types (Vehicle, Maintenance, Tracking)
- ✅ Payment types (Wallet, Transaction, Gateway, Refund)
- ✅ Notification types (Notification, Template, Channels)
- ✅ Analytics types (Reports, Predictions, Metrics)

### 2. @big-bus/api-client
Unified API client for all backend services:

**Features:**
- TypeScript-first with full type safety
- Automatic authentication token management
- Request/response interceptors
- Error handling with custom exceptions
- Retry logic for failed requests
- WebSocket support for real-time features
- Singleton pattern for easy use

**Services:**
```typescript
import { api } from '@big-bus/api-client';

// Authentication
await api.auth.login({ email, password });
await api.auth.register(userData);

// Booking
const routes = await api.booking.searchRoutes({ origin, destination, date });
const booking = await api.booking.createBooking(bookingData);

// Payment
const wallet = await api.payment.getMyWallet();
await api.payment.createPaymentIntent({ amount, provider });

// Vehicle
const vehicles = await api.vehicle.getVehicles();
const location = await api.vehicle.getVehicleLocation(id);

// Notification
await api.notification.sendNotification(data);
const unreadCount = await api.notification.getUnreadCount();

// Analytics
const stats = await api.analytics.getDashboardStats();
const report = await api.analytics.generateReport(options);
```

### 3. Frontend Applications

#### Web Application (apps/web)
Customer-facing Next.js application on port 3000.

**Features:**
- ✅ User authentication (login, register, OAuth)
- ✅ Route search and schedule selection
- ✅ Seat selection and booking
- ✅ Payment integration
- ✅ Booking management
- ✅ Real-time tracking (WebSocket)

**Tech Stack:**
- Next.js 14 (App Router)
- React Query for data fetching
- Zustand for state management
- Tailwind CSS for styling
- TypeScript

**Key Pages:**
- `/` - Home page with search
- `/search` - Route search results
- `/schedules` - Schedule selection
- `/seats` - Seat selection
- `/bookings` - User bookings
- `/login` - Authentication
- `/register` - User registration

#### Admin Dashboard (apps/admin)
Admin application on port 3100.

**Features:**
- ✅ Dashboard with real-time statistics
- ✅ Booking management
- ✅ Route and vehicle management
- ✅ Reports and analytics
- ✅ System status monitoring

## Integration Points

### 1. Authentication Flow

```typescript
// Login
const { user, accessToken } = await api.auth.login({ email, password });
setToken(accessToken); // Automatically saved to localStorage

// All subsequent requests include the token
const bookings = await api.booking.getMyBookings(); // ✅ Authenticated
```

### 2. Booking Flow

```
Search Routes → Select Schedule → Choose Seats →
Enter Passenger Info → Create Booking → Make Payment →
Get QR Code Ticket
```

**Implementation:**
```typescript
// 1. Search routes
const routes = await api.booking.searchRoutes({
  origin: 'Hanoi',
  destination: 'Haiphong',
  date: '2024-01-15',
});

// 2. Get schedules for selected route
const schedules = await api.booking.getSchedules({
  routeId: route.id,
  date: '2024-01-15',
});

// 3. Check available seats
const { available, occupied } = await api.booking.getAvailableSeats(schedule.id);

// 4. Create booking
const booking = await api.booking.createBooking({
  scheduleId: schedule.id,
  seats: ['A1', 'A2'],
  passengerInfo: { firstName, lastName, email, phone },
  pickupStationId: 'station-1',
  dropoffStationId: 'station-2',
});

// 5. Make payment
const payment = await api.payment.createPaymentIntent({
  amount: booking.totalPrice,
  provider: 'vnpay',
  bookingId: booking.id,
});
```

### 3. Real-time Tracking

```typescript
import { TrackingWebSocketClient } from '@big-bus/api-client';

const trackingWs = new TrackingWebSocketClient();

trackingWs.connect();

trackingWs.onLocationUpdate((data) => {
  console.log('Vehicle location:', data.location);
  // Update map marker
});

trackingWs.trackVehicle('vehicle-id');
```

### 4. Payment Integration

```typescript
// Get available payment gateways
const gateways = await api.payment.getActivePaymentGateways();

// Create payment intent
const { paymentUrl, qrCode } = await api.payment.createPaymentIntent({
  amount: 100000,
  currency: 'VND',
  provider: 'vnpay',
  bookingId: 'booking-id',
  returnUrl: 'https://bigbus.com/payment/success',
});

// Redirect to payment gateway
window.location.href = paymentUrl;
```

## Environment Configuration

### Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost/api/auth
NEXT_PUBLIC_BOOKING_SERVICE_URL=http://localhost/api
NEXT_PUBLIC_VEHICLE_SERVICE_URL=http://localhost/api
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost/api/v1
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=http://localhost/api
NEXT_PUBLIC_ANALYTICS_SERVICE_URL=http://localhost/api

# OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
NEXT_PUBLIC_ZALO_APP_ID=your-zalo-app-id
```

## API Endpoints

All requests go through the API Gateway (nginx) on port 80/443.

### Authentication Endpoints
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/change-password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/oauth/google
POST   /api/auth/oauth/facebook
POST   /api/auth/oauth/zalo
```

### Booking Endpoints
```
GET    /api/routes
GET    /api/routes/search
GET    /api/routes/:id
GET    /api/stations
GET    /api/stations/:id
GET    /api/schedules
GET    /api/schedules/:id
GET    /api/schedules/:id/available-seats
POST   /api/bookings
GET    /api/bookings/my-bookings
GET    /api/bookings/:id
POST   /api/bookings/:id/cancel
POST   /api/bookings/:id/confirm
GET    /api/bookings/:id/qr-code
```

### Payment Endpoints
```
POST   /api/v1/wallets
GET    /api/v1/wallets/me
GET    /api/v1/wallets/:id/balance
POST   /api/v1/wallets/:id/topup
POST   /api/v1/wallets/:id/withdraw
GET    /api/v1/transactions
GET    /api/v1/transactions/my-transactions
GET    /api/v1/payment-gateways
POST   /api/v1/payment-gateways/create-intent
POST   /api/v1/refunds
GET    /api/v1/refunds/my-refunds
```

### Vehicle Endpoints
```
GET    /api/vehicles
GET    /api/vehicles/:id
GET    /api/vehicles/available
GET    /api/vehicles/:id/location
GET    /api/vehicles/:id/route/:scheduleId
GET    /api/vehicles/maintenance
POST   /api/vehicles/maintenance
```

### Notification Endpoints
```
POST   /api/notifications/send
GET    /api/notifications/my-notifications
PATCH  /api/notifications/:id/read
POST   /api/notifications/mark-all-read
GET    /api/notifications/unread-count
GET    /api/notifications/preferences
PUT    /api/notifications/preferences
```

### Analytics Endpoints
```
GET    /api/analytics/dashboard
GET    /api/analytics/revenue
GET    /api/analytics/routes
GET    /api/analytics/customers
GET    /api/analytics/occupancy
GET    /api/analytics/predictions/demand
POST   /api/reports/generate
GET    /api/reports/:id
GET    /api/reports/:id/download
```

## Development Workflow

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Start Backend Services
```bash
# Start all services
cd services/auth && npm run dev &
cd services/booking && npm run dev &
cd services/vehicle && npm run dev &
cd services/payment && npm run dev &
cd services/notification && npm run dev &
cd services/analytics && npm run dev &
```

### 3. Start Frontend Applications
```bash
# Web application
cd apps/web && npm run dev

# Admin dashboard
cd apps/admin && npm run dev
```

### 4. Access Applications
- Web App: http://localhost:3000
- Admin Dashboard: http://localhost:3100
- API Gateway: http://localhost
- API Docs (per service): http://localhost:3001/api/docs (auth), etc.

## Testing Integration

### 1. Test Authentication
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 2. Test Booking Flow
```bash
# Search routes
curl http://localhost/api/routes/search?origin=Hanoi&destination=Haiphong&date=2024-01-15

# Get schedules
curl http://localhost/api/schedules?routeId=route-id&date=2024-01-15

# Create booking (requires auth token)
curl -X POST http://localhost/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scheduleId":"...","seats":["A1"],...}'
```

## State Management

### Auth State (Zustand)
```typescript
const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
```

### Booking State (Zustand)
```typescript
const {
  searchParams,
  selectedSchedule,
  selectedSeats,
  setSearchParams,
  setSelectedSchedule,
  setSelectedSeats,
} = useBookingStore();
```

## Error Handling

```typescript
try {
  const booking = await api.booking.createBooking(data);
} catch (error) {
  if (error instanceof ApiException) {
    if (error.statusCode === 401) {
      // Redirect to login
    } else if (error.statusCode === 422) {
      // Show validation errors
      console.log(error.details);
    }
  }
}
```

## Best Practices

1. **Always use the API client** - Don't make direct axios/fetch calls
2. **Type everything** - Leverage TypeScript for better DX
3. **Handle errors properly** - Use try/catch and show user-friendly messages
4. **Optimize queries** - Use React Query's caching and refetching
5. **Manage state wisely** - Use Zustand for global state, React Query for server state
6. **Secure tokens** - Never expose tokens in logs or URLs
7. **Test integrations** - Write integration tests for critical flows

## Troubleshooting

### Issue: "Network Error"
- Check if backend services are running
- Verify API Gateway (nginx) is running
- Check CORS configuration

### Issue: "Authentication Required"
- Verify token is saved in localStorage
- Check if token is expired
- Re-login if necessary

### Issue: "Type errors"
- Rebuild @big-bus/types package
- Clear node_modules and reinstall
- Check import paths

## Next Steps

1. ✅ Complete payment gateway integration (VNPay, Momo, ZaloPay)
2. ✅ Implement WebSocket for real-time tracking
3. ✅ Add push notifications
4. ✅ Build mobile app (React Native)
5. ✅ Add E2E tests
6. ✅ Deploy to production

## Support

For issues or questions:
- Check API documentation at `/api/docs` on each service
- Review this integration guide
- Check service logs: `docker-compose logs -f [service-name]`

---

**Integration completed on:** 2025-11-08
**Version:** 1.0.0
