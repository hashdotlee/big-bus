# Big Bus - Tổng quan các tính năng mở rộng

Tài liệu này mô tả các tính năng mở rộng mới được thêm vào hệ thống Big Bus.

## 📦 Extension System

Hệ thống extension cho phép dễ dàng tích hợp các dịch vụ bên thứ ba mà không cần sửa đổi code core.

**Package:** `@big-bus/extensions`

**Vị trí:** `packages/extensions/`

### Các loại Extensions được hỗ trợ:

1. **Payment Gateway Extensions** 💳
2. **OAuth2 Provider Extensions** 🔐
3. **AI Service Extensions** 🤖
4. **Affiliate Extensions** 👥
5. **Marketplace Extensions** 🛍️
6. **Personalization Extensions** 🎯
7. **Accounting Extensions** 📊

Xem chi tiết tại: [packages/extensions/README.md](packages/extensions/README.md)

---

## 💳 Payment Gateway Extensions

### Tính năng

- Tích hợp Stripe (thanh toán quốc tế)
- Tích hợp PayPal (thanh toán quốc tế)
- Hỗ trợ nhiều loại thanh toán: Card, E-Wallet, Bank Transfer
- Callback handling tự động
- Refund processing

### Cách sử dụng

```bash
# Enable trong environment
STRIPE_ENABLED=true
STRIPE_API_KEY=sk_test_...

PAYPAL_ENABLED=true
PAYPAL_CLIENT_ID=...
```

### API Endpoints

```
POST /api/v1/payment-gateways/create
GET  /api/v1/payment-gateways/available
POST /api/v1/payment-gateways/callback/:gateway
```

**Tích hợp:** Payment Service (`services/payment/`)

**Files quan trọng:**
- `services/payment/src/extensions/payment-extensions.module.ts`
- `services/payment/src/extensions/payment-extension.initializer.ts`
- `services/payment/src/modules/payment-gateways/payment-gateways.service.ts`

---

## 🔐 OAuth2 Provider Extensions

### Tính năng

- Đăng nhập với Microsoft (Azure AD, Office 365)
- Đăng nhập với Apple
- OAuth2 flow hoàn chỉnh (Authorization, Token Exchange, Refresh)
- User profile retrieval

### Cách sử dụng

```bash
# Enable trong environment
MICROSOFT_OAUTH_ENABLED=true
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_REDIRECT_URI=...

APPLE_OAUTH_ENABLED=true
APPLE_CLIENT_ID=...
APPLE_CLIENT_SECRET=...
```

### API Endpoints

```
GET /api/v1/auth/oauth/providers
GET /api/v1/auth/oauth/:provider/login
GET /api/v1/auth/oauth/:provider/callback
GET /api/v1/auth/oauth/:provider/refresh
```

**Tích hợp:** Auth Service (`services/auth/`)

**Files quan trọng:**
- `services/auth/src/extensions/oauth-extensions.module.ts`
- `services/auth/src/extensions/oauth-extension.initializer.ts`
- `services/auth/src/modules/auth/oauth-extension.controller.ts`

---

## 👥 Affiliate Service (MỚI)

Service quản lý chương trình affiliate marketing cho Big Bus.

### Tính năng

- **Quản lý Affiliate:**
  - Đăng ký affiliate mới
  - Quản lý thông tin (profile, bank account, social media)
  - Tạo referral code tự động
  - Theo dõi status (pending, active, suspended, banned)

- **Commission Tracking:**
  - Tính toán commission tự động (percentage, fixed, tiered)
  - Theo dõi conversion từ referral
  - Quản lý status (pending, approved, paid, rejected)
  - Lịch sử chi tiết mỗi commission

- **Performance Analytics:**
  - Tổng số referrals
  - Tỷ lệ conversion
  - Tổng sales
  - Earnings (total, pending, paid)

- **Payout Management:**
  - Xử lý thanh toán tự động
  - Tích hợp với Payment Service
  - Minimum payout threshold

### Database Schema

**Entities:**
- `Affiliate`: Thông tin affiliate
- `Commission`: Chi tiết hoa hồng

### Environment Variables

```bash
PORT=3007
DB_DATABASE=affiliate_db
DEFAULT_COMMISSION_RATE=5
MINIMUM_PAYOUT=100000
PAYOUT_SCHEDULE=monthly
```

**Vị trí:** `services/affiliate/`

**Port:** 3007

---

## 🛍️ Marketplace Service (MỚI)

Service quản lý marketplace để bán sản phẩm/dịch vụ cho khách đi xe.

### Tính năng

- **Product Management:**
  - Quản lý sản phẩm (physical, digital, service, bundle)
  - Multi-variant support
  - Inventory tracking
  - Image gallery
  - SEO optimization

- **Tính năng đặc biệt cho Bus:**
  - `isAvailableOnBus`: Sản phẩm bán trên xe
  - `availableRoutes`: Chỉ định tuyến đường
  - `deliveryMethod`: delivery/pickup/on_bus
  - `busBookingId`: Liên kết với booking

- **Shopping Cart:**
  - Add/update/remove items
  - Session-based và user-based carts
  - Auto-expire

- **Order Processing:**
  - Order creation & tracking
  - Multiple payment methods
  - Status management (pending → delivered)
  - Shipping & billing addresses
  - Notes và metadata

- **Inventory Management:**
  - Real-time stock tracking
  - Low stock alerts
  - Out of stock handling

### Database Schema

**Entities:**
- `Product`: Thông tin sản phẩm
- `Order`: Đơn hàng

### Environment Variables

```bash
PORT=3008
DB_DATABASE=marketplace_db
```

**Vị trí:** `services/marketplace/`

**Port:** 3008

---

## 🤖 AI Service Extensions

### Tính năng được thiết kế (Chưa implement hoàn chỉnh)

- **Customer Support Chatbot:**
  - OpenAI GPT integration
  - Intent analysis
  - Suggested responses
  - Escalation to human agent

- **Analytics AI:**
  - Predictive analytics
  - Anomaly detection
  - Revenue forecasting
  - Demand prediction

- **NLP Services:**
  - Sentiment analysis
  - Text classification
  - Translation
  - Summarization

- **Recommendation Engine:**
  - Route recommendations
  - Product recommendations
  - Personalized offers

**Package:** Đã có interfaces trong `@big-bus/extensions`

**Cần implement:** Tích hợp vào Analytics Service

---

## 🎯 Personalization Extensions

### Tính năng được thiết kế (Chưa implement hoàn chỉnh)

- **User Preferences:**
  - Language, currency, timezone
  - Seat preferences
  - Departure time preferences
  - Budget range
  - Amenity preferences

- **Dynamic Pricing:**
  - User segment-based pricing
  - Demand-based pricing
  - Loyalty discounts

- **Content Personalization:**
  - Homepage customization
  - Featured routes
  - Personalized promotions

- **User Segmentation:**
  - New user, Frequent traveler, Business, Tourist, Student, Senior, VIP

**Package:** Đã có interfaces trong `@big-bus/extensions`

**Cần implement:** Tích hợp vào Booking Service

---

## 📊 Accounting Extensions

### Tính năng được thiết kế (Chưa implement hoàn chỉnh)

- **Chart of Accounts**
- **Financial Statements:**
  - Income Statement
  - Balance Sheet
  - Cash Flow Statement
- **Tax Calculation & Reporting**
- **Budget Management**
- **Financial Metrics & KPIs**

**Package:** Đã có interfaces trong `@big-bus/extensions`

**Cần implement:** Tạo Accounting Service mới hoặc tích hợp vào Analytics

---

## 🚀 Architecture Overview

### Services

```
├── Auth Service (Port 3001)        - Authentication, Users, Roles
│   └── + OAuth2 Extensions
├── Booking Service (Port 3002)     - Routes, Schedules, Bookings
│   └── (Ready for Personalization)
├── Vehicle Service (Port 3003)     - Fleet, GPS, Maintenance
├── Payment Service (Port 3004)     - Transactions, Wallets, Refunds
│   └── + Payment Gateway Extensions (Stripe, PayPal)
├── Notification Service (Port 3005)- Email, SMS, Push
├── Analytics Service (Port 3006)   - Reports, Metrics, Predictions
│   └── (Ready for AI Integration)
├── Affiliate Service (Port 3007)   - 🆕 Affiliate Marketing
└── Marketplace Service (Port 3008) - 🆕 Product Sales
```

### Shared Packages

```
├── @big-bus/extensions   - Extension system với 7 loại extensions
├── @big-bus/types        - Shared TypeScript types
├── @big-bus/common       - Shared utilities (Logger, Sentry, Filters)
├── @big-bus/config       - Configuration management
├── @big-bus/database     - Database utilities
└── @big-bus/api-client   - Unified API client
```

---

## 📝 Cách chạy services mới

### Development

```bash
# Install dependencies
pnpm install

# Build extension package
pnpm --filter @big-bus/extensions build

# Run all services
pnpm run docker:up

# Hoặc chạy từng service
pnpm --filter @big-bus/affiliate-service dev
pnpm --filter @big-bus/marketplace-service dev
```

### Docker

```bash
# Run tất cả services kể cả mới
docker-compose up -d

# Check logs
docker-compose logs -f affiliate-service
docker-compose logs -f marketplace-service
```

### Databases

Postgres sẽ tự động tạo các database:
- `affiliate_db`
- `marketplace_db`

---

## 🔧 Configuration

### Payment Gateway Extensions

File: `services/payment/.env`

```bash
STRIPE_ENABLED=true
STRIPE_API_KEY=sk_test_...
PAYPAL_ENABLED=true
PAYPAL_CLIENT_ID=...
```

### OAuth2 Extensions

File: `services/auth/.env`

```bash
MICROSOFT_OAUTH_ENABLED=true
MICROSOFT_CLIENT_ID=...
APPLE_OAUTH_ENABLED=true
APPLE_CLIENT_ID=...
```

### New Services

Files:
- `services/affiliate/.env`
- `services/marketplace/.env`

---

## 📚 Documentation

- **Extension System:** [packages/extensions/README.md](packages/extensions/README.md)
- **Integration Guide:** [packages/extensions/INTEGRATION.md](packages/extensions/INTEGRATION.md)
- **Main README:** [README.md](README.md)

---

## 🎯 Next Steps

### Cần hoàn thành:

1. **Affiliate Service:**
   - [ ] Implement API controllers & services
   - [ ] Referral tracking logic
   - [ ] Commission calculation engine
   - [ ] Payout integration với Payment Service

2. **Marketplace Service:**
   - [ ] Implement Product CRUD APIs
   - [ ] Shopping cart logic
   - [ ] Order processing
   - [ ] Inventory management

3. **AI Integration:**
   - [ ] Customer support chatbot
   - [ ] Analytics AI cho dự đoán
   - [ ] Recommendation engine

4. **Personalization:**
   - [ ] User preferences tracking
   - [ ] Dynamic pricing engine
   - [ ] Content personalization

5. **Accounting:**
   - [ ] Financial reports
   - [ ] Tax calculation
   - [ ] Budget management

---

## 🤝 Contributing

Để thêm extension mới hoặc phát triển services:

1. Xem [packages/extensions/README.md](packages/extensions/README.md)
2. Tham khảo example implementations trong `packages/extensions/src/*/examples/`
3. Follow integration guide tại [INTEGRATION.md](packages/extensions/INTEGRATION.md)

---

## 📞 Support

Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ team.
