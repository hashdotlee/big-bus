# Quick Reference Guide - What's Next to Implement

## Overview
The Big Bus system is currently at **~30% completion**. This guide shows you what to build next based on priority.

## Current Architecture
```
✅ 6 Microservices (Auth, Booking, Vehicle, Payment, Notification, Analytics)
✅ 2 Frontend Apps (Web, Admin) - Basic structure only
❌ Mobile/Driver Apps
❌ Real-time Features (WebSocket)
```

## The 3 Most Critical Missing Pieces

### 1. Real-Time Vehicle Tracking (CRITICAL)
**Current State:** WebSocket client skeleton exists, but no server implementation
**What's Missing:**
- WebSocket gateway in Vehicle Service (`/services/vehicle/src/gateways/tracking.gateway.ts`)
- Live location update endpoints
- Map UI in web app
- Driver location sharing mechanism

**Implementation Complexity:** High (40-50 hours)
**Business Impact:** Critical - Core feature for bus tracking platform

**Start Here:**
```bash
# 1. Add WebSocket library to Vehicle Service
cd services/vehicle
npm install @nestjs/websockets @nestjs/platform-ws

# 2. Create tracking gateway
# File: services/vehicle/src/gateways/tracking.gateway.ts
```

---

### 2. Functional Frontend Pages (HIGH PRIORITY)
**Current State:** All pages are empty shells
**What's Missing:**
- Login/Register page implementations
- Search & booking form implementations
- Booking history display
- Payment UI integration
- User profile management
- Admin features UI

**Implementation Complexity:** Medium (60-80 hours)
**Business Impact:** High - Platform is unusable without this

**Start Here:**
```bash
# Complete page implementations in:
apps/web/src/app/login/page.tsx
apps/web/src/app/register/page.tsx
apps/web/src/app/search/page.tsx
apps/web/src/app/bookings/page.tsx
apps/admin/src/app/[any-page]/page.tsx
```

---

### 3. Support System (HIGH PRIORITY)
**Current State:** Database schema exists, no service implementation
**What's Missing:**
- Support ticket service
- Basic chat interface
- Support agent dashboard
- FAQ system

**Implementation Complexity:** Medium (30-40 hours)
**Business Impact:** High - Essential for customer support

**Start Here:**
```typescript
// Create support ticket service in:
// services/booking/src/modules/support/
// - support.service.ts (create, list, update tickets)
// - support.controller.ts
// - ticket.entity.ts (or use existing)
```

---

## Priority Implementation Roadmap

### Week 1-2: Foundation
- [ ] Add WebSocket to Vehicle Service
- [ ] Create TrackingGateway
- [ ] Complete login/register pages
- [ ] Implement basic API client integration

### Week 3-4: Core Features
- [ ] Real-time location updates (backend)
- [ ] Map UI for tracking
- [ ] Support ticket system
- [ ] Chat interface (basic)

### Week 5-6: User Experience
- [ ] PWA setup (next-pwa)
- [ ] OAuth2 integration (Google, Facebook, Zalo)
- [ ] Loyalty points system
- [ ] Promotion/coupon system

### Week 7-8: Mobile
- [ ] Start driver mobile app (React Native)
- [ ] Analytics dashboard UI
- [ ] Subscription bookings

### Week 9+: Polish & Deploy
- [ ] Affiliate system
- [ ] 2FA implementation
- [ ] Kubernetes manifests
- [ ] Production monitoring

---

## Quick Feature Checklist

### Backend Services (Current Status)

#### Auth Service (35% complete)
- [x] User registration
- [x] User login
- [x] JWT tokens
- [x] Roles module
- [ ] OAuth2 (Google, Facebook, Zalo)
- [ ] 2FA/TOTP
- [ ] SSO with PKCE

#### Booking Service (60% complete)
- [x] Routes management
- [x] Schedules management
- [x] Booking CRUD
- [x] Seat selection
- [x] Price calculation
- [ ] Subscriptions
- [ ] Loyalty points
- [ ] Promotions/Coupons
- [ ] Support tickets

#### Vehicle Service (40% complete)
- [x] Fleet management
- [x] Maintenance tracking
- [ ] Real-time tracking (WebSocket)
- [ ] Live location updates
- [ ] GPS integration

#### Payment Service (70% complete)
- [x] VNPay integration
- [x] Momo integration
- [x] ZaloPay integration
- [x] Wallet system
- [x] Refunds
- [ ] Stripe integration
- [ ] Payment method management
- [ ] Affiliate payouts

#### Notification Service (60% complete)
- [x] Email notifications
- [x] SMS notifications
- [x] Push notifications
- [x] Zalo OA
- [ ] In-app notifications
- [ ] Notification templates
- [ ] Notification preferences

#### Analytics Service (50% complete)
- [x] Activity logs
- [x] Reports generation
- [x] Predictions
- [x] Scheduled tasks
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] Dashboard UI

### Frontend (25% for web, 20% for admin)
- [x] Project structure
- [x] Layout & navigation
- [x] UI component library
- [x] State management (Zustand)
- [ ] All page implementations
- [ ] API integration
- [ ] Real-time tracking
- [ ] PWA features
- [ ] Offline support

### Mobile/Apps (0%)
- [ ] Driver mobile app
- [ ] Customer mobile app
- [ ] Geolocation sharing
- [ ] Real-time notifications

---

## Files You'll Need to Create/Modify

### High Priority

**Vehicle Service WebSocket:**
```
services/vehicle/src/gateways/tracking.gateway.ts (NEW)
services/vehicle/src/modules/tracking/ (NEW FOLDER)
  - tracking.service.ts
  - tracking.controller.ts
```

**Web App Pages (All these need completion):**
```
apps/web/src/app/login/page.tsx (30% done)
apps/web/src/app/register/page.tsx (30% done)
apps/web/src/app/search/page.tsx (20% done)
apps/web/src/app/bookings/page.tsx (15% done)
apps/web/src/app/schedules/page.tsx (15% done)
apps/web/src/app/profile/ (NOT CREATED)
apps/web/src/app/payment/ (NOT CREATED)
apps/web/src/app/support/ (NOT CREATED)
```

**Support System:**
```
services/booking/src/modules/support/ (NEW)
  - support.service.ts
  - support.controller.ts
  - dto/create-ticket.dto.ts
```

### Medium Priority

**PWA Setup:**
```
apps/web/public/manifest.json (NEW)
apps/web/public/sw.js (NEW)
apps/web/next.config.js (MODIFY)
```

**Loyalty System:**
```
services/booking/src/modules/loyalty/ (NEW)
  - loyalty.service.ts
  - loyalty.controller.ts
```

**Promotion System:**
```
services/booking/src/modules/promotions/ (NEW)
  - promotions.service.ts
  - promotions.controller.ts
```

---

## Database Tables to Create

Currently **17/30** designed tables are implemented.

**Missing implementations:**
- Support tickets & messages
- Loyalty transactions & rewards
- Promotions & usage tracking
- Affiliate & commissions
- Notification templates

You'll need to create entities for these and run migrations.

---

## Environment Variables Needed

Check each service's `.env.example` for:
- Database credentials
- API keys for payment gateways
- Email/SMS provider credentials
- OAuth2 client IDs
- JWT secrets
- Redis connection
- RabbitMQ connection

---

## Testing Strategy

### Before Implementation
1. Write unit tests for new services
2. Write integration tests for API endpoints
3. Write E2E tests for critical user flows

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:coverage
```

---

## Deployment Path

1. **MVP (Minimal Viable Product)**: 2-3 weeks
   - Core booking functionality
   - Basic real-time tracking
   - Support tickets
   - Completed frontend pages

2. **Beta**: 6-8 weeks
   - All core features
   - PWA support
   - OAuth2
   - Loyalty system
   - Mobile web version

3. **Production**: 16-20 weeks
   - All features
   - Mobile apps
   - Advanced analytics
   - Kubernetes deployment
   - Full monitoring stack

---

## Common Gotchas

1. **WebSocket Requires Special Setup**
   - Can't use same port as HTTP in development
   - Need separate gateway instance
   - Client needs reconnection logic (already in api-client)

2. **Frontend Pages Need Real Data**
   - Don't hardcode data
   - Properly integrate with API
   - Handle loading/error states

3. **PaymentGateway Callbacks**
   - Sandbox testing needed
   - Webhook setup required
   - Async payment status updates

4. **Real-time Updates**
   - Need proper WebSocket namespace/rooms
   - Memory management for connections
   - Graceful disconnection handling

---

## Success Metrics

### Week 2 Goal
- WebSocket infrastructure in place
- Login/register pages functional
- Basic API integration working

### Week 4 Goal
- Real-time tracking working
- All core pages completed
- Support system operational

### Week 8 Goal
- PWA working
- OAuth2 working
- Loyalty system working
- 50% of designed features done

### Week 16 Goal
- Mobile app released
- All features implemented
- Production ready
- 90%+ feature completion

---

## Questions to Answer While Building

1. How should real-time location updates be throttled?
2. What's the maximum WebSocket connections per server?
3. How should offline bookings be synced?
4. How should failed payments be retried?
5. What's the notification delivery SLA?
6. How should user preferences be stored and applied?

---

## Key Dependencies to Add

```bash
# Vehicle Service (for WebSocket)
npm install @nestjs/websockets @nestjs/platform-ws socket.io

# Web App (for PWA)
npm install next-pwa

# Web App (for Maps - choose one)
npm install leaflet mapbox-gl google-maps-react

# Web App (for Forms)
npm install react-hook-form zod

# Web App (for Real-time)
npm install socket.io-client

# Web App (for Chat)
npm install @sendbird/uikit
```

---

## Next Steps

1. Pick the **top priority feature** you want to implement
2. Review the related design documents
3. Create a feature branch
4. Implement with tests
5. Create PR with documentation
6. Deploy to staging environment

Start with **Real-Time Tracking** - it's the most critical for a bus booking platform!

