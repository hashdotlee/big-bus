# Booking Service

Microservice for managing bus bookings, routes, schedules, and stations.

## Features

- **Station Management**: Create and manage bus stations
- **Route Management**: Define routes between stations
- **Schedule Management**: Create and manage bus schedules
- **Booking Management**: Handle customer bookings with QR codes
- **Price Calculation**: Dynamic pricing with promotions
- **Seat Management**: Track available seats per schedule

## Tech Stack

- NestJS
- TypeORM
- PostgreSQL
- Redis (for caching)
- Swagger (API documentation)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

### Running the Service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### API Documentation

Once the service is running, visit:
- Swagger UI: http://localhost:3002/api/docs

## API Endpoints

### Stations
- `POST /api/v1/stations` - Create a station
- `GET /api/v1/stations` - List all stations
- `GET /api/v1/stations/:id` - Get station by ID
- `PATCH /api/v1/stations/:id` - Update station
- `DELETE /api/v1/stations/:id` - Soft delete station

### Routes
- `POST /api/v1/routes` - Create a route
- `GET /api/v1/routes` - List all routes
- `GET /api/v1/routes/:id` - Get route by ID
- `PATCH /api/v1/routes/:id` - Update route
- `DELETE /api/v1/routes/:id` - Soft delete route

### Schedules
- `POST /api/v1/schedules` - Create a schedule
- `GET /api/v1/schedules` - List all schedules
- `POST /api/v1/schedules/search` - Search schedules
- `GET /api/v1/schedules/:id` - Get schedule by ID
- `PATCH /api/v1/schedules/:id` - Update schedule
- `PATCH /api/v1/schedules/:id/cancel` - Cancel schedule
- `PATCH /api/v1/schedules/:id/complete` - Mark schedule as completed

### Bookings
- `POST /api/v1/bookings` - Create a booking
- `POST /api/v1/bookings/calculate-price` - Calculate booking price
- `GET /api/v1/bookings` - List all bookings
- `GET /api/v1/bookings/my-bookings` - Get current user bookings
- `GET /api/v1/bookings/by-code/:code` - Get booking by code
- `GET /api/v1/bookings/:id` - Get booking by ID
- `PATCH /api/v1/bookings/:id/confirm` - Confirm booking
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking
- `PATCH /api/v1/bookings/:id/rate` - Rate a booking

## Database Schema

The service uses PostgreSQL with the following main entities:

- **Station**: Bus stations/terminals
- **Route**: Routes between stations
- **Vehicle**: Bus vehicles
- **Schedule**: Scheduled trips
- **Booking**: Customer bookings
- **Passenger**: Passenger information

## Development

```bash
# Run tests
npm run test

# Run linter
npm run lint

# Format code
npm run format
```

## License

MIT
