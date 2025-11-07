# Project Structure

This document outlines the complete structure of the Big Bus booking system.

## 📁 Root Structure

```
big-bus/
├── .github/                    # GitHub workflows and templates
├── apps/                       # Frontend applications
│   ├── web/                   # Next.js web application
│   ├── mobile/                # React Native mobile app
│   └── admin/                 # Admin dashboard
├── design-documents/          # System design documentation
│   ├── api-architecture.md   # Backend architecture
│   ├── ui-ux-part-1.md       # UI/UX design part 1
│   └── ui-ux-part-2.md       # UI/UX design part 2
├── nginx/                     # Nginx API Gateway configuration
│   ├── nginx.conf            # Main Nginx config
│   └── conf.d/               # Additional configs
│       └── api-gateway.conf  # API routing
├── packages/                  # Shared packages
│   ├── common/               # Common utilities
│   │   ├── src/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   └── utils/
│   │   └── package.json
│   ├── types/                # TypeScript types
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── vehicle/
│   │   │   ├── payment/
│   │   │   ├── notification/
│   │   │   ├── analytics/
│   │   │   └── common/
│   │   └── package.json
│   ├── config/               # Configuration management
│   └── database/             # Database utilities
├── scripts/                   # Utility scripts
│   └── init-databases.sh     # Database initialization
├── services/                  # Microservices
│   ├── auth/                 # Authentication Service (Port 3001)
│   │   ├── src/
│   │   │   ├── common/       # Service-specific common code
│   │   │   ├── config/       # Configuration
│   │   │   ├── database/     # Database layer
│   │   │   │   ├── entities/ # TypeORM entities
│   │   │   │   └── migrations/ # Database migrations
│   │   │   ├── modules/      # Feature modules
│   │   │   │   ├── auth/     # Auth module
│   │   │   │   ├── users/    # Users module
│   │   │   │   └── roles/    # Roles module
│   │   │   ├── app.module.ts # Root module
│   │   │   └── main.ts       # Bootstrap file
│   │   ├── test/             # Tests
│   │   ├── Dockerfile        # Docker configuration
│   │   ├── nest-cli.json     # NestJS CLI config
│   │   ├── package.json      # Dependencies
│   │   ├── tsconfig.json     # TypeScript config
│   │   └── .env.example      # Environment variables
│   ├── booking/              # Booking Service (Port 3002)
│   ├── vehicle/              # Vehicle Service (Port 3003)
│   ├── payment/              # Payment Service (Port 3004)
│   ├── notification/         # Notification Service (Port 3005)
│   └── analytics/            # Analytics Service (Port 3006)
├── .editorconfig             # Editor configuration
├── .eslintrc.js              # ESLint configuration
├── .gitignore                # Git ignore rules
├── .prettierrc               # Prettier configuration
├── .prettierignore           # Prettier ignore rules
├── docker-compose.yml        # Docker Compose configuration
├── package.json              # Root package.json (workspace)
├── README.md                 # Project README
├── turbo.json                # Turborepo configuration
└── tsconfig.json             # Root TypeScript config
```

## 🏗️ Service Architecture

### Auth Service (Port 3001)
- User registration & authentication
- JWT token management
- OAuth2 integration (Google, Facebook, Zalo)
- Role-based access control (RBAC)
- 2FA support

**Database**: auth_db (PostgreSQL)

**Key Modules**:
- `auth` - Authentication logic
- `users` - User management
- `roles` - Role & permission management

### Booking Service (Port 3002)
- Route & schedule management
- Booking creation & management
- Seat selection
- Subscription bookings
- QR code generation

**Database**: booking_db (PostgreSQL)

### Vehicle Service (Port 3003)
- Fleet management
- Real-time GPS tracking
- Maintenance scheduling
- Vehicle availability

**Database**: vehicle_db (PostgreSQL)

### Payment Service (Port 3004)
- Payment gateway integration (VNPay, Momo, ZaloPay)
- Wallet system
- Transaction management
- Refund processing

**Database**: payment_db (PostgreSQL)

### Notification Service (Port 3005)
- Email notifications
- SMS notifications
- Push notifications
- Zalo OA integration

**No Database** (uses RabbitMQ for queuing)

### Analytics Service (Port 3006)
- Revenue analytics
- Booking statistics
- Custom reports
- Predictive analytics

**Database**: analytics_db (PostgreSQL)

## 🔧 Infrastructure Services

### PostgreSQL (Port 5432)
- Primary database for all services
- Each service has its own database
- Connection pooling enabled
- Automated backups

### Redis (Port 6379)
- Session management
- Caching layer
- Rate limiting
- Real-time data

### RabbitMQ (Ports 5672, 15672)
- Message broker for inter-service communication
- Event-driven architecture
- Task queues for background jobs
- Management UI on port 15672

### Nginx (Ports 80, 443)
- API Gateway
- Load balancing
- Rate limiting
- SSL termination

## 📦 Shared Packages

### @big-bus/common
Common utilities and helpers used across all services:
- Custom decorators
- Exception filters
- Guards
- Interceptors
- Pipes
- Utility functions

### @big-bus/types
Shared TypeScript types and interfaces:
- API response types
- Entity interfaces
- DTOs
- Enums
- Error codes

### @big-bus/config
Configuration management:
- Environment variable validation
- Service discovery
- Feature flags

### @big-bus/database
Database utilities:
- Base repositories
- Query builders
- Migration helpers
- Seeders

## 🚀 Development Workflow

### Starting the Project

```bash
# Install dependencies
npm install

# Start infrastructure (PostgreSQL, Redis, RabbitMQ)
npm run docker:up

# Start all services in development mode
npm run dev

# Start specific service
cd services/auth
npm run start:dev
```

### Building for Production

```bash
# Build all services
npm run build

# Build specific service
cd services/auth
npm run build
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🌍 Environment Configuration

Each service has its own `.env` file based on `.env.example`:

```bash
# Copy example files
cp .env.example .env
cp services/auth/.env.example services/auth/.env
# ... repeat for other services
```

## 📚 API Documentation

When services are running in development mode, Swagger documentation is available at:

- Auth Service: http://localhost:3001/api/docs
- Booking Service: http://localhost:3002/api/docs
- Vehicle Service: http://localhost:3003/api/docs
- Payment Service: http://localhost:3004/api/docs
- Notification Service: http://localhost:3005/api/docs
- Analytics Service: http://localhost:3006/api/docs

## 🔐 Security

- JWT-based authentication
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## 📊 Monitoring & Logging

- Centralized logging with ELK Stack
- Health check endpoints
- Performance monitoring
- Error tracking with Sentry
- Metrics with Prometheus & Grafana

---

For more details, see the individual service READMEs in each service directory.
