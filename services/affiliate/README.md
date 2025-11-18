# Affiliate Service

Quản lý chương trình affiliate marketing cho Big Bus.

## Tính năng

### 1. Quản lý Affiliate
- Đăng ký affiliate mới với referral code tự động
- Quản lý thông tin profile (social media, bank account)
- Theo dõi status (pending, active, suspended, banned)
- Tính toán commission rate (percentage, fixed, tiered)

### 2. Tracking & Analytics
- Track referral clicks (IP, user agent, source URL)
- Theo dõi conversion từ click -> order
- Performance metrics (clicks, conversions, conversion rate)
- Top affiliates leaderboard

### 3. Commission Management
- Tự động tạo commission khi có conversion
- Approve/reject commissions
- Tính toán commission với 3 loại:
  - **Percentage**: Phần trăm trên order amount
  - **Fixed**: Số tiền cố định
  - **Tiered**: Tự động tăng rate theo order amount
- Track commission status (pending, approved, paid, rejected)

### 4. Payout Processing
- Request payout với minimum amount threshold
- Process payout tự động
- Track payout status
- Integration-ready với Payment Service

## Entities

### Affiliate
```typescript
{
  id: uuid
  userId: string
  referralCode: string (unique)
  status: pending | active | suspended | banned
  email: string
  name: string
  website?: string
  socialMedia?: {facebook, instagram, twitter, youtube, tiktok}
  taxId?: string
  bankAccount?: {bankName, accountNumber, accountHolder}
  commissionType: percentage | fixed | tiered
  commissionRate: number
  totalEarnings: decimal
  pendingEarnings: decimal
  paidEarnings: decimal
  totalReferrals: number
  totalConversions: number
  totalSales: decimal
}
```

### Commission
```typescript
{
  id: uuid
  affiliateId: uuid
  orderId: string
  customerId: string
  orderAmount: decimal
  commissionAmount: decimal
  commissionRate: decimal
  status: pending | approved | paid | rejected | cancelled
  payoutId?: uuid
  approvedAt?: date
  paidAt?: date
  rejectedReason?: string
}
```

### Payout
```typescript
{
  id: uuid
  affiliateId: uuid
  amount: decimal
  currency: string
  status: pending | processing | completed | failed | cancelled
  paymentMethod: string
  paymentDetails: object
  transactionId?: string
  failureReason?: string
  processedAt?: date
}
```

### ReferralClick
```typescript
{
  id: uuid
  affiliateId: uuid
  referralCode: string
  customerId?: string
  sessionId?: string
  sourceUrl?: string
  ipAddress?: string
  userAgent?: string
  converted: boolean
  orderId?: string
  convertedAt?: date
}
```

## API Endpoints

### Affiliates

```bash
# Đăng ký affiliate mới
POST /api/v1/affiliates/register
Body: {
  userId: string
  email: string
  name: string
  website?: string
  socialMedia?: {...}
  taxId?: string
  bankAccount?: {...}
  referralCode?: string  # Auto-generated nếu không cung cấp
}

# Lấy danh sách affiliates
GET /api/v1/affiliates?page=1&limit=10&status=active

# Lấy top affiliates
GET /api/v1/affiliates/top?limit=10

# Validate referral code
GET /api/v1/affiliates/validate/:code

# Lấy affiliate theo referral code
GET /api/v1/affiliates/referral-code/:code

# Lấy affiliate theo userId
GET /api/v1/affiliates/user/:userId

# Lấy affiliate theo ID
GET /api/v1/affiliates/:id

# Lấy performance metrics
GET /api/v1/affiliates/:id/performance?startDate=2024-01-01&endDate=2024-12-31

# Cập nhật affiliate
PUT /api/v1/affiliates/:id
Body: {
  name?: string
  website?: string
  socialMedia?: {...}
  status?: string
  commissionRate?: number
}

# Cập nhật status
PATCH /api/v1/affiliates/:id/status
Body: { status: "active" | "suspended" | "banned" }

# Track referral click
POST /api/v1/affiliates/track-referral
Body: {
  referralCode: string
  customerId?: string
  sessionId?: string
  sourceUrl?: string
  ipAddress?: string
  userAgent?: string
}
```

### Commissions

```bash
# Record conversion (tạo commission)
POST /api/v1/commissions/record-conversion
Body: {
  referralCode: string
  customerId: string
  orderId: string
  orderAmount: number
  products?: [...]
}

# Lấy danh sách commissions
GET /api/v1/commissions?page=1&limit=10&affiliateId=xxx&status=pending

# Lấy earnings của affiliate
GET /api/v1/commissions/affiliate/:affiliateId/earnings

# Lấy commission theo ID
GET /api/v1/commissions/:id

# Approve/reject commission
PATCH /api/v1/commissions/:id/approve
Body: {
  status: "approved" | "rejected"
  rejectedReason?: string
}
```

### Payouts

```bash
# Request payout
POST /api/v1/payouts/request
Body: {
  affiliateId: string
  amount: number
  paymentMethod: string
  paymentDetails?: {...}
}

# Lấy danh sách payouts
GET /api/v1/payouts?page=1&limit=10&affiliateId=xxx&status=pending

# Lấy payout stats
GET /api/v1/payouts/affiliate/:affiliateId/stats

# Lấy payout theo ID
GET /api/v1/payouts/:id

# Process payout
PATCH /api/v1/payouts/:id/process
Body: { transactionId: string }

# Cancel payout
PATCH /api/v1/payouts/:id/cancel
```

## Environment Variables

```bash
PORT=3007
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=affiliate_db

# Affiliate Settings
DEFAULT_COMMISSION_RATE=5        # 5%
MINIMUM_PAYOUT=100000           # 100k VND
PAYOUT_SCHEDULE=monthly

# Service URLs
PAYMENT_SERVICE_URL=http://localhost:3004
BOOKING_SERVICE_URL=http://localhost:3002
```

## Workflow

### 1. Đăng ký Affiliate

```
User -> POST /affiliates/register
     -> System generates referral code (REF123ABC)
     -> Status: PENDING
     -> Admin approves
     -> Status: ACTIVE
```

### 2. Referral Tracking

```
Customer clicks referral link (bigbus.vn?ref=REF123ABC)
     -> POST /affiliates/track-referral
     -> ReferralClick record created
     -> Customer browses, adds to cart
     -> Customer completes order
     -> Booking Service calls /commissions/record-conversion
     -> Commission created with status PENDING
```

### 3. Commission Lifecycle

```
Commission created (PENDING)
     -> Admin reviews
     -> Approve -> Status: APPROVED
     OR
     -> Reject -> Status: REJECTED (earnings deducted)
```

### 4. Payout Process

```
Affiliate requests payout
     -> POST /payouts/request (amount: 500000 VND)
     -> Check minimum threshold
     -> Check available approved commissions
     -> Payout created (PENDING)
     -> Admin processes
     -> PATCH /payouts/:id/process
     -> Call Payment Service
     -> Mark related commissions as PAID
     -> Payout status: COMPLETED
```

## Commission Calculation Examples

### Percentage (5%)
```
Order: 1,000,000 VND
Commission: 50,000 VND
```

### Fixed (50,000 VND)
```
Order: 500,000 VND
Commission: 50,000 VND

Order: 2,000,000 VND
Commission: 50,000 VND (still fixed)
```

### Tiered
```
Order < 500K: 5% commission
Order >= 500K: 7% commission
Order >= 1M: 10% commission

Example:
Order: 1,200,000 VND
Commission: 120,000 VND (10%)
```

## Integration với Booking Service

Khi customer hoàn thành booking qua referral link:

```typescript
// In Booking Service - after order completion
const bookingService = new BookingService();
const affiliateService = axios.create({
  baseURL: 'http://localhost:3007/api/v1',
});

// Track conversion
await affiliateService.post('/commissions/record-conversion', {
  referralCode: booking.referralCode,  // from cookie/session
  customerId: booking.userId,
  orderId: booking.id,
  orderAmount: booking.totalAmount,
  products: booking.tickets.map(t => ({
    productId: t.routeId,
    quantity: t.quantity,
    price: t.price,
  })),
});
```

## Development

```bash
# Install dependencies
pnpm install

# Run development
pnpm run dev

# Build
pnpm run build

# Run production
pnpm run start
```

## Testing

```bash
# Test affiliate registration
curl -X POST http://localhost:3007/api/v1/affiliates/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "email": "affiliate@example.com",
    "name": "John Doe"
  }'

# Test track referral
curl -X POST http://localhost:3007/api/v1/affiliates/track-referral \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "REF123ABC",
    "sourceUrl": "https://bigbus.vn/routes/hn-hcm"
  }'

# Test record conversion
curl -X POST http://localhost:3007/api/v1/commissions/record-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "REF123ABC",
    "customerId": "customer456",
    "orderId": "ORDER789",
    "orderAmount": 1000000
  }'
```

## Database

Tự động tạo schema khi chạy development mode (synchronize: true).

Các bảng:
- `affiliates`
- `commissions`
- `payouts`
- `referral_clicks`

## Future Enhancements

- [ ] Multi-tier affiliate program (referrer gets commission from sub-affiliates)
- [ ] Affiliate dashboard với charts
- [ ] Email notifications cho affiliate events
- [ ] Automated payout scheduling
- [ ] Fraud detection cho suspicious patterns
- [ ] Custom commission rules per affiliate
- [ ] Product-specific commission rates
- [ ] Affiliate performance reports export (CSV, PDF)
