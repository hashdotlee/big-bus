# Big Bus - File Structure & Locations Guide

## Critical Files Overview

### Analysis Documents (In Root)
- **IMPLEMENTATION_STATUS.md** - Comprehensive detailed analysis (614 lines)
- **IMPLEMENTATION_SUMMARY.txt** - Visual summary with estimates
- **QUICK_START_GUIDE.md** - Step-by-step what to build next
- **FILE_STRUCTURE_GUIDE.md** - This file (locations & structure)

### Design Documents (design-documents/)
- **api-architecture.md** - Complete API/backend design
- **ui-ux-part-1.md** - UI/UX design system & components
- **ui-ux-part-2.md** - PWA, admin dashboard, analytics
- **database-schema.sql** - Full database schema (800+ lines)

---

## Services Directory Structure

```
services/
├── auth/                         # Auth Service (Port 3001) - 35% complete
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/             # Authentication module
│   │   │   ├── users/            # User management (160 lines)
│   │   │   └── roles/            # Role management
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   │   ├── user.entity.ts
│   │   │   │   └── role.entity.ts
│   │   │   └── migrations/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── booking/                      # Booking Service (Port 3002) - 60% complete
│   ├── src/
│   │   ├── modules/
│   │   │   ├── bookings/         # Booking CRUD (231 lines service)
│   │   │   │   ├── bookings.service.ts
│   │   │   │   ├── bookings.controller.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-booking.dto.ts
│   │   │   │       ├── cancel-booking.dto.ts
│   │   │   │       ├── calculate-price.dto.ts
│   │   │   │       └── rate-booking.dto.ts
│   │   │   ├── routes/           # Route management (create, update)
│   │   │   ├── schedules/        # Schedule management (150 lines)
│   │   │   ├── stations/         # Station management
│   │   │   └── vehicles/         # Vehicle reference
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   │   ├── booking.entity.ts
│   │   │   │   ├── route.entity.ts
│   │   │   │   ├── schedule.entity.ts
│   │   │   │   ├── station.entity.ts
│   │   │   │   ├── vehicle.entity.ts
│   │   │   │   └── passenger.entity.ts
│   │   │   └── migrations/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── vehicle/                      # Vehicle Service (Port 3003) - 40% complete
│   ├── src/
│   │   ├── modules/
│   │   │   └── vehicles/         # Fleet management (291 lines)
│   │   │       ├── vehicles.service.ts
│   │   │       ├── vehicles.controller.ts
│   │   │       ├── dto/
│   │   │       │   ├── create-vehicle.dto.ts
│   │   │       │   ├── update-vehicle.dto.ts
│   │   │       │   └── record-maintenance.dto.ts
│   │   │       └── vehicle.entity.ts
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   │   └── vehicle.entity.ts
│   │   │   └── migrations/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── payment/                      # Payment Service (Port 3004) - 70% complete
│   ├── src/
│   │   ├── modules/
│   │   │   ├── payment-gateways/  # VNPay, Momo, ZaloPay integration
│   │   │   │   ├── vnpay.service.ts (132 lines)
│   │   │   │   ├── momo.service.ts (140 lines)
│   │   │   │   └── zalopay.service.ts (119 lines)
│   │   │   ├── transactions/       # Transaction management (123 lines)
│   │   │   ├── wallets/            # Wallet system (238 lines)
│   │   │   └── refunds/            # Refund processing (209 lines)
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   │   ├── transaction.entity.ts
│   │   │   │   ├── wallet.entity.ts
│   │   │   │   ├── refund.entity.ts
│   │   │   │   └── payment-gateway-log.entity.ts
│   │   │   └── migrations/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── notification/                 # Notification Service (Port 3005) - 60% complete
│   ├── src/
│   │   ├── modules/
│   │   │   ├── email/            # SendGrid integration (134 lines)
│   │   │   ├── sms/              # Twilio integration (132 lines)
│   │   │   ├── push/             # Firebase push (229 lines)
│   │   │   └── zalo/             # Zalo OA integration (241 lines)
│   │   ├── common/
│   │   │   └── constants/
│   │   │       └── notification.constants.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
└── analytics/                    # Analytics Service (Port 3006) - 50% complete
    ├── src/
    │   ├── modules/
    │   │   ├── activity-logs/     # Activity tracking (199 lines)
    │   │   ├── analytics/         # Analytics metrics (324 lines)
    │   │   ├── reports/           # Report generation (347 lines)
    │   │   └── predictions/       # Predictive analytics (358 lines)
    │   ├── database/
    │   │   ├── entities/
    │   │   │   ├── activity-log.entity.ts
    │   │   │   ├── metric-snapshot.entity.ts
    │   │   │   ├── report.entity.ts
    │   │   │   └── prediction.entity.ts
    │   │   └── migrations/
    │   ├── app.module.ts
    │   └── main.ts
    ├── package.json
    ├── Dockerfile
    └── .env.example
```

---

## Apps Directory Structure

```
apps/
├── web/                          # Web App (Next.js 14) - 25% complete
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Home page (15% done)
│   │   │   ├── login/page.tsx             # Login (30% done)
│   │   │   ├── register/page.tsx          # Register (30% done)
│   │   │   ├── search/page.tsx            # Search (20% done)
│   │   │   ├── schedules/page.tsx         # Schedules (15% done)
│   │   │   ├── bookings/page.tsx          # Bookings (15% done)
│   │   │   ├── layout.tsx                 # Root layout
│   │   │   └── providers.tsx              # React providers
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       └── Footer.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useBooking.ts
│   │   ├── store/
│   │   │   ├── auth.store.ts (Zustand)
│   │   │   └── booking.store.ts (Zustand)
│   │   └── styles/
│   │       └── globals.css
│   ├── public/                   # MISSING: PWA assets
│   │   ├── manifest.json (NOT CREATED)
│   │   ├── sw.js (NOT CREATED)
│   │   └── icons/ (NOT CREATED)
│   ├── next.config.js            # Basic config (PWA not added)
│   ├── package.json
│   └── .env.example
│
├── admin/                        # Admin Dashboard (Next.js 14) - 20% complete
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Dashboard (20% done)
│   │   │   ├── bookings/page.tsx          # Bookings (25% done)
│   │   │   ├── finance/page.tsx           # Finance (20% done)
│   │   │   ├── reports/page.tsx           # Reports (15% done)
│   │   │   ├── routes/page.tsx            # Routes (15% done)
│   │   │   ├── settings/page.tsx          # Settings (10% done)
│   │   │   ├── vehicles/page.tsx          # Vehicles (20% done)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── ToastContainer.tsx
│   │   │   ├── bookings/
│   │   │   │   └── BookingDetailModal.tsx
│   │   │   ├── finance/
│   │   │   │   └── PaymentDetailModal.tsx
│   │   │   └── vehicles/
│   │   │       └── VehicleForm.tsx
│   │   └── utils/
│   │       └── exportData.ts
│   ├── next.config.js
│   ├── package.json
│   └── .env.example
```

---

## Packages Directory Structure

```
packages/
├── api-client/                   # API Client Library
│   ├── src/
│   │   ├── utils/
│   │   │   └── websocket-client.ts    # WebSocket client skeleton
│   │   │       ├── WebSocketClient class
│   │   │       ├── TrackingWebSocketClient class
│   │   │       └── Auto-reconnect logic
│   │   └── interceptors/
│   │       └── auth.interceptor.ts    # JWT token handling
│   └── package.json
│
├── types/                        # Shared TypeScript Types
│   ├── src/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── vehicle/
│   │   ├── payment/
│   │   ├── notification/
│   │   ├── analytics/
│   │   └── common/
│   └── package.json
│
├── common/                       # Shared Utilities
│   ├── src/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── utils/
│   └── package.json
│
├── config/                       # Configuration Management
│   └── package.json
│
└── database/                     # Database Utilities
    └── package.json
```

---

## Infrastructure Files

```
/
├── docker-compose.yml            # Docker Compose for all services
├── Dockerfile                    # (individual service Dockerfiles in each service)
├── k8s/                          # Kubernetes manifests (MISSING)
│   ├── deployments/ (NOT CREATED)
│   ├── services/ (NOT CREATED)
│   └── configmaps/ (NOT CREATED)
├── nginx/                        # API Gateway configuration
│   ├── nginx.conf
│   └── conf.d/
│       └── api-gateway.conf      # Service routing
├── scripts/
│   └── init-databases.sh         # Database initialization
└── .github/                      # GitHub Actions
    └── workflows/                # CI/CD pipelines
```

---

## Key Files to Understand

### Start Here (Most Important)
1. **design-documents/api-architecture.md** - Complete API design
2. **design-documents/database-schema.sql** - Database structure
3. **services/*/app.module.ts** - Service configuration
4. **apps/web/src/app/layout.tsx** - Web app layout
5. **packages/api-client/src/utils/websocket-client.ts** - WebSocket skeleton

### Backend Implementation
1. **services/booking/src/modules/bookings/bookings.service.ts** - Best example of service implementation
2. **services/payment/src/modules/payment-gateways/vnpay.service.ts** - Payment integration example
3. **services/notification/src/modules/email/email.service.ts** - Notification example
4. **services/analytics/src/modules/analytics/analytics.service.ts** - Complex service example

### Frontend Implementation
1. **apps/web/src/store/auth.store.ts** - Zustand store example
2. **apps/web/src/hooks/useAuth.ts** - Custom hook example
3. **apps/admin/src/components/ui/Button.tsx** - UI component example
4. **apps/admin/src/components/layout/AdminLayout.tsx** - Layout example

---

## What's Missing (Files That Don't Exist Yet)

### Critical Missing
1. **services/vehicle/src/gateways/tracking.gateway.ts** - WebSocket gateway
2. **apps/web/public/manifest.json** - PWA manifest
3. **apps/web/public/sw.js** - Service Worker
4. **services/*/database/migrations/** - Database migrations
5. **services/*/src/modules/support/** - Support system

### High Priority Missing
1. **services/booking/src/modules/loyalty/** - Loyalty system
2. **services/booking/src/modules/promotions/** - Promotion system
3. **services/auth/src/strategies/oauth.strategy.ts** - OAuth2 implementation
4. **apps/web/src/app/profile/page.tsx** - User profile page
5. **apps/web/src/app/payment/page.tsx** - Payment page
6. **apps/web/src/components/tracking/TrackingMap.tsx** - Tracking map

### Mobile Apps (Completely Missing)
1. **apps/mobile/** - Customer mobile app (React Native)
2. **apps/driver/** - Driver mobile app (React Native)

---

## Development Workflow

### Running Services
```bash
# All services
npm run dev

# Specific service
cd services/auth
npm run start:dev

# All in Docker
npm run docker:up
```

### Building
```bash
# All services
npm run build

# Specific service
cd services/auth
npm run build
```

### Testing
```bash
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:coverage  # Coverage report
```

---

## Database Locations

### Entity Files
```
services/auth/src/database/entities/user.entity.ts
services/auth/src/database/entities/role.entity.ts
services/booking/src/database/entities/booking.entity.ts
services/booking/src/database/entities/schedule.entity.ts
services/booking/src/database/entities/route.entity.ts
services/booking/src/database/entities/station.entity.ts
services/payment/src/database/entities/transaction.entity.ts
services/payment/src/database/entities/wallet.entity.ts
services/analytics/src/database/entities/activity-log.entity.ts
```

### Migration Directories (EMPTY)
```
services/*/src/database/migrations/ - NO MIGRATIONS EXIST YET
```

---

## Configuration Files

### Environment Files
- Root: `.env.example`
- Each service: `services/*/`env.example`
- Each app: `apps/*/`env.example`

### Build Config
- **tsconfig.json** - Root TypeScript config
- **turbo.json** - Turborepo configuration
- **next.config.js** - Each app's Next.js config
- **nest-cli.json** - Each service's NestJS config

### Code Quality
- **.eslintrc.js** - ESLint configuration
- **.prettierrc** - Code formatting
- **.lintstagedrc.json** - Pre-commit hooks
- **.commitlintrc.json** - Commit message validation

---

## Quick Navigation Commands

```bash
# List all services
ls -la services/

# List all apps
ls -la apps/

# List all package.json files
find . -name "package.json" -not -path "./node_modules/*"

# Count lines of code in services
find services -name "*.ts" -not -path "*/node_modules/*" | xargs wc -l

# Check what services are running
ps aux | grep "npm\|node"

# View service logs
npm run docker:logs
```

---

## Documentation Location

- **README.md** - Main project overview
- **PROJECT_STRUCTURE.md** - Detailed project structure explanation
- **INTEGRATION.md** - Service integration guide
- **design-documents/** - Complete design specifications
- **IMPLEMENTATION_STATUS.md** - This project's status (NEW)
- **QUICK_START_GUIDE.md** - Step-by-step implementation guide (NEW)

---

## Next Steps

1. Review **IMPLEMENTATION_STATUS.md** for detailed gap analysis
2. Review **QUICK_START_GUIDE.md** for what to build next
3. Pick one critical feature from the roadmap
4. Check the relevant design document
5. Create the necessary files in the structure above
6. Follow the pattern from existing implementations

**Recommended Start:** Real-Time Tracking (WebSocket)
- Design: api-architecture.md (search "tracking")
- Create: services/vehicle/src/gateways/tracking.gateway.ts
- Implement: TrackingService and TrackingController

