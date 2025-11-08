# @big-bus/api-client

API client library for Big Bus microservices.

## Installation

```bash
npm install @big-bus/api-client
```

## Usage

### Using singleton instances

```typescript
import { api } from '@big-bus/api-client';

// Login
const response = await api.auth.login({
  email: 'user@example.com',
  password: 'password123',
});

// Search routes
const routes = await api.booking.searchRoutes({
  origin: 'Hanoi',
  destination: 'Haiphong',
  date: '2024-01-15',
});

// Create booking
const booking = await api.booking.createBooking({
  scheduleId: 'schedule-id',
  seats: ['A1', 'A2'],
  passengerInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '0123456789',
  },
  pickupStationId: 'station-1',
  dropoffStationId: 'station-2',
});
```

### Using service classes

```typescript
import { AuthService, BookingService } from '@big-bus/api-client';

const authService = new AuthService();
const bookingService = new BookingService();

// Login
await authService.login({ email, password });

// Get bookings
const bookings = await bookingService.getMyBookings();
```

### WebSocket for real-time tracking

```typescript
import { TrackingWebSocketClient } from '@big-bus/api-client';

const trackingWs = new TrackingWebSocketClient();

trackingWs.connect();

trackingWs.onLocationUpdate((data) => {
  console.log('Vehicle location updated:', data);
});

trackingWs.trackVehicle('vehicle-id');
```

### Configuration

```typescript
import { AuthService } from '@big-bus/api-client';

const authService = new AuthService({
  baseURL: 'https://api.bigbus.com/auth',
  timeout: 10000,
});
```

## Environment Variables

The client can be configured using environment variables:

- `NEXT_PUBLIC_API_URL` - Base API URL (default: http://localhost/api)
- `NEXT_PUBLIC_AUTH_SERVICE_URL` - Auth service URL
- `NEXT_PUBLIC_BOOKING_SERVICE_URL` - Booking service URL
- `NEXT_PUBLIC_VEHICLE_SERVICE_URL` - Vehicle service URL
- `NEXT_PUBLIC_PAYMENT_SERVICE_URL` - Payment service URL
- `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL` - Notification service URL
- `NEXT_PUBLIC_ANALYTICS_SERVICE_URL` - Analytics service URL

## Features

- ✅ Type-safe API calls with TypeScript
- ✅ Automatic authentication token management
- ✅ Request/response interceptors
- ✅ Error handling with custom exceptions
- ✅ Retry logic for failed requests
- ✅ WebSocket support for real-time features
- ✅ Singleton pattern for easy use
- ✅ Environment-based configuration
