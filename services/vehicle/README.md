# Big Bus Vehicle Service

Vehicle management microservice for the Big Bus booking system.

## Description

The Vehicle Service is responsible for managing all vehicle-related operations including:

- Vehicle CRUD operations
- Vehicle maintenance tracking
- Vehicle status management
- Vehicle type and capacity management
- Mileage tracking
- Vehicle statistics and reporting

## Features

- ✅ Complete CRUD operations for vehicles
- ✅ Vehicle maintenance tracking and scheduling
- ✅ Vehicle status management (Active, Maintenance, Out of Service, Retired)
- ✅ Mileage tracking and updates
- ✅ Query vehicles by type, status, and plate number
- ✅ Get vehicles needing maintenance
- ✅ Vehicle statistics and analytics
- ✅ Soft delete and restore capabilities
- ✅ Comprehensive API documentation with Swagger

## Technology Stack

- **Framework**: NestJS 10.3.0
- **Language**: TypeScript 5.3.3
- **Database**: PostgreSQL (via TypeORM)
- **ORM**: TypeORM 0.3.19
- **Cache**: Redis
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Application
NODE_ENV=development
PORT=3003
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=vehicle_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# CORS
CORS_ORIGIN=*
```

## Running the Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## API Documentation

Once the service is running, access the Swagger documentation at:
- http://localhost:3003/api/docs

## API Endpoints

### Vehicle Management

- `POST /api/v1/vehicles` - Create a new vehicle
- `GET /api/v1/vehicles` - Get all vehicles (with filters)
- `GET /api/v1/vehicles/:id` - Get vehicle by ID
- `GET /api/v1/vehicles/plate/:plateNumber` - Get vehicle by plate number
- `GET /api/v1/vehicles/type/:type` - Get vehicles by type
- `GET /api/v1/vehicles/status/:status` - Get vehicles by status
- `PATCH /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Soft delete vehicle

### Maintenance

- `PATCH /api/v1/vehicles/:id/maintenance` - Record maintenance
- `GET /api/v1/vehicles/maintenance-needed` - Get vehicles needing maintenance
- `PATCH /api/v1/vehicles/:id/mileage` - Update vehicle mileage

### Status Management

- `PATCH /api/v1/vehicles/:id/status` - Change vehicle status
- `PATCH /api/v1/vehicles/:id/restore` - Restore soft-deleted vehicle

### Analytics

- `GET /api/v1/vehicles/statistics` - Get vehicle statistics

## Vehicle Types

- `economy` - Economy class vehicles
- `vip` - VIP class vehicles
- `sleeper` - Sleeper class vehicles

## Vehicle Status

- `active` - Vehicle is active and available
- `maintenance` - Vehicle is under maintenance
- `out_of_service` - Vehicle is temporarily out of service
- `retired` - Vehicle is permanently retired

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker

```bash
# Build
docker build -t bigbus-vehicle-service .

# Run
docker run -p 3003:3003 bigbus-vehicle-service
```

## License

Private - Big Bus Project
