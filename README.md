# Big Bus - Bus Booking System

A comprehensive, production-grade bus booking platform built with microservices architecture.

## 🏗️ Architecture

```
big-bus/
├── services/          # Microservices
│   ├── auth/         # Authentication & Authorization Service (Port 3001)
│   ├── booking/      # Booking Management Service (Port 3002)
│   ├── vehicle/      # Vehicle & Fleet Management Service (Port 3003)
│   ├── payment/      # Payment Processing Service (Port 3004)
│   ├── notification/ # Notification Service (Port 3005)
│   └── analytics/    # Analytics & Reporting Service (Port 3006)
├── packages/         # Shared packages
│   ├── common/       # Common utilities & helpers
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Configuration management
│   └── database/     # Database models & migrations
└── apps/             # Frontend applications
    ├── web/          # Web application (Next.js)
    ├── mobile/       # Mobile app (React Native)
    └── admin/        # Admin dashboard
```

## 🚀 Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **API Gateway**: Nginx
- **Authentication**: JWT, OAuth2, 2FA

### Frontend
- **Web**: Next.js 14, React 18, TailwindCSS
- **Mobile**: React Native
- **State Management**: Redux Toolkit / Zustand
- **UI Components**: Custom design system

### DevOps
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Grafana, Prometheus, Sentry
- **Logging**: ELK Stack

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- PostgreSQL 15+ (via Docker)
- Redis 7+ (via Docker)
- RabbitMQ 3+ (via Docker)

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd big-bus
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
# Copy example env files
cp .env.example .env
cp services/auth/.env.example services/auth/.env
cp services/booking/.env.example services/booking/.env
# ... repeat for all services
```

### 4. Start infrastructure services

```bash
# Start PostgreSQL, Redis, RabbitMQ via Docker
npm run docker:up
```

### 5. Run database migrations

```bash
npm run migrate
```

### 6. Start development servers

```bash
# Start all services in development mode
npm run dev
```

## 📜 Available Scripts

- `npm run build` - Build all packages and services
- `npm run dev` - Start all services in development mode
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run typecheck` - Type-check all TypeScript code
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services
- `npm run docker:logs` - View Docker logs

## 🔧 Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Write tests
4. Run `npm run lint` and `npm run test`
5. Commit with conventional commit messages
6. Push and create a pull request

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 🌍 Environment Variables

Each service requires its own `.env` file. See `.env.example` files in each service directory.

Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Service port
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `RABBITMQ_URL` - RabbitMQ connection string
- `JWT_SECRET` - JWT signing secret

## 🏗️ Microservices

### Auth Service (Port 3001)
- User registration & authentication
- JWT token management
- OAuth2 (Google, Facebook, Zalo)
- Role-based access control (RBAC)
- 2FA support

### Booking Service (Port 3002)
- Search routes & schedules
- Seat selection & booking
- Booking management
- Subscription bookings
- QR code generation

### Vehicle Service (Port 3003)
- Fleet management
- Real-time GPS tracking
- Maintenance scheduling
- Vehicle availability

### Payment Service (Port 3004)
- Multiple payment gateways (VNPay, Momo, ZaloPay)
- Wallet system
- Refund processing
- Transaction history

### Notification Service (Port 3005)
- Email notifications (SendGrid)
- SMS notifications (Twilio)
- Push notifications (Firebase)
- Zalo OA integration

### Analytics Service (Port 3006)
- Revenue analytics
- Booking statistics
- Route performance
- Custom reports

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📚 Documentation

- [Architecture Design](/design-documents/api-architecture.md)
- [UI/UX Design](/design-documents/ui-ux-part-1.md)
- [API Documentation](http://localhost:3000/api/docs) (when running)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

- Project Lead: [Name]
- Backend Lead: [Name]
- Frontend Lead: [Name]
- DevOps Lead: [Name]

## 📞 Support

For support, email support@bigbus.com or join our Slack channel.

---

Built with ❤️ by the Big Bus Team
