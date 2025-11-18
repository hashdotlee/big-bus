# Financial Service

Enterprise-grade financial management service implementing double-entry bookkeeping, comprehensive reporting, budgeting, and tax management for the Big Bus platform.

## Features

### 📊 Core Accounting
- **Double-Entry Bookkeeping**: Full implementation with debit/credit validation
- **Chart of Accounts**: Comprehensive account structure (Assets, Liabilities, Equity, Revenue, Expenses)
- **Journal Entries**: Detailed transaction tracking with audit trails
- **Trial Balance**: Real-time balance verification
- **Account Reconciliation**: Multi-level account hierarchy support

### 📈 Financial Reporting
- **Profit & Loss Statement**: Revenue and expense analysis by period
- **Balance Sheet**: Financial position snapshot
- **Cash Flow Statement**: Operating, investing, and financing activities
- **Custom Period Reports**: Monthly, quarterly, yearly reporting
- **Financial Period Management**: Period closing and locking

### 💰 Budgeting
- **Budget Creation**: Multi-category budget allocation
- **Actual Tracking**: Real-time actual vs. budgeted comparison
- **Variance Analysis**: Automatic variance calculation and percentage tracking
- **Budget Forecasting**: Projected profit and revenue planning

### 🧾 Tax Management
- **Multi-Tax Support**: Income tax, sales tax, VAT, payroll tax
- **Automated Calculation**: Tax computation by period
- **Filing Tracking**: Due dates and filing status management
- **Tax Record History**: Complete audit trail

## Architecture

### Database Schema

```
┌─────────────────┐       ┌──────────────────┐
│    Account      │       │   Transaction    │
├─────────────────┤       ├──────────────────┤
│ id              │       │ id               │
│ accountNumber   │       │ transactionNumber│
│ name            │◄──────┤ description      │
│ type            │       │ amount           │
│ balance         │       │ type             │
│ parentAccount   │       │ status           │
└─────────────────┘       └──────────────────┘
         │                         │
         │                         │
         └────────┬────────────────┘
                  │
         ┌────────▼────────┐
         │  JournalEntry   │
         ├─────────────────┤
         │ id              │
         │ entryType       │
         │ amount          │
         │ description     │
         └─────────────────┘

┌─────────────────┐       ┌──────────────────┐
│     Budget      │       │   TaxRecord      │
├─────────────────┤       ├──────────────────┤
│ fiscalYear      │       │ taxType          │
│ budgetedRevenue │       │ taxableAmount    │
│ actualRevenue   │       │ taxAmount        │
│ totalVariance   │       │ filingStatus     │
└─────────────────┘       └──────────────────┘
```

## API Endpoints

### Accounting Operations

#### Create Transaction with Journal Entries
```http
POST /api/accounting/transactions
Content-Type: application/json

{
  "description": "Booking revenue from Route HN-HCM",
  "transactionDate": "2025-11-18",
  "amount": 1500000,
  "type": "revenue",
  "category": "booking_revenue",
  "reference": "BOOKING-12345",
  "journalEntries": [
    {
      "accountId": "cash-account-id",
      "entryType": "debit",
      "amount": 1500000,
      "description": "Cash received"
    },
    {
      "accountId": "revenue-account-id",
      "entryType": "credit",
      "amount": 1500000,
      "description": "Booking revenue"
    }
  ]
}
```

**Response**: Transaction object with journal entries

#### Record Revenue
```http
POST /api/accounting/revenue
Content-Type: application/json

{
  "amount": 2000000,
  "description": "Marketplace product sales",
  "category": "marketplace_revenue",
  "debitAccountId": "cash-account-id",
  "creditAccountId": "revenue-account-id"
}
```

#### Record Expense
```http
POST /api/accounting/expense
Content-Type: application/json

{
  "amount": 500000,
  "description": "Fuel costs for fleet",
  "category": "fuel_cost",
  "debitAccountId": "expense-account-id",
  "creditAccountId": "cash-account-id"
}
```

#### Get Trial Balance
```http
GET /api/accounting/trial-balance?startDate=2025-01-01&endDate=2025-12-31
```

**Response**:
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "accounts": [
    {
      "accountNumber": "1000",
      "accountName": "Cash",
      "accountType": "asset",
      "debit": 5000000,
      "credit": 0,
      "balance": 5000000
    },
    {
      "accountNumber": "4000",
      "accountName": "Booking Revenue",
      "accountType": "revenue",
      "debit": 0,
      "credit": 10000000,
      "balance": -10000000
    }
  ],
  "totalDebits": 15000000,
  "totalCredits": 15000000,
  "isBalanced": true
}
```

#### Get Account Balance
```http
GET /api/accounting/accounts/:accountId/balance?startDate=2025-01-01&endDate=2025-12-31
```

### Financial Reports

#### Generate Profit & Loss Report
```http
POST /api/reports/profit-loss
Content-Type: application/json

{
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

**Response**:
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "revenue": {
    "bookingRevenue": 50000000,
    "marketplaceRevenue": 10000000,
    "affiliateRevenue": 2000000,
    "total": 62000000
  },
  "expenses": {
    "fuelCost": 15000000,
    "maintenance": 5000000,
    "salaries": 20000000,
    "marketing": 3000000,
    "total": 43000000
  },
  "grossProfit": 62000000,
  "operatingExpenses": 43000000,
  "operatingIncome": 19000000,
  "netIncome": 19000000
}
```

#### Generate Balance Sheet
```http
POST /api/reports/balance-sheet
Content-Type: application/json

{
  "asOfDate": "2025-12-31"
}
```

**Response**:
```json
{
  "asOfDate": "2025-12-31",
  "assets": {
    "currentAssets": {
      "cash": 10000000,
      "accountsReceivable": 5000000,
      "total": 15000000
    },
    "fixedAssets": {
      "vehicles": 100000000,
      "equipment": 20000000,
      "total": 120000000
    },
    "totalAssets": 135000000
  },
  "liabilities": {
    "currentLiabilities": {
      "accountsPayable": 3000000,
      "total": 3000000
    },
    "longTermLiabilities": {
      "loans": 50000000,
      "total": 50000000
    },
    "totalLiabilities": 53000000
  },
  "equity": {
    "capital": 60000000,
    "retainedEarnings": 22000000,
    "totalEquity": 82000000
  }
}
```

#### Generate Cash Flow Report
```http
POST /api/reports/cash-flow
Content-Type: application/json

{
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

### Budget Management

#### Create Budget
```http
POST /api/budget
Content-Type: application/json

{
  "name": "2026 Annual Budget",
  "fiscalYear": 2026,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "budgetedRevenue": 100000000,
  "budgetedExpenses": 70000000,
  "categoryAllocations": {
    "fuel_cost": 20000000,
    "salaries": 30000000,
    "marketing": 10000000,
    "maintenance": 10000000
  }
}
```

#### Update Budget Actuals
```http
PUT /api/budget/:budgetId/actuals
```

**Response**: Budget with variance analysis

#### Get All Budgets
```http
GET /api/budget
```

### Tax Management

#### Calculate Tax
```http
POST /api/tax/calculate
Content-Type: application/json

{
  "taxType": "income_tax",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "taxableAmount": 19000000,
  "taxRate": 20,
  "filingDueDate": "2026-03-31"
}
```

**Response**:
```json
{
  "id": "uuid",
  "taxType": "income_tax",
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "taxableAmount": 19000000,
  "taxRate": 20,
  "taxAmount": 3800000,
  "filingStatus": "pending",
  "filingDueDate": "2026-03-31"
}
```

#### Get Tax Records
```http
GET /api/tax?taxType=income_tax&startDate=2025-01-01&endDate=2025-12-31
```

#### Update Filing Status
```http
PATCH /api/tax/:taxRecordId/status
Content-Type: application/json

{
  "filingStatus": "filed",
  "filingDate": "2026-03-15"
}
```

## Double-Entry Bookkeeping Principles

### Account Types and Normal Balances

| Account Type | Normal Balance | Increases With | Decreases With |
|--------------|----------------|----------------|----------------|
| Asset        | Debit          | Debit          | Credit         |
| Liability    | Credit         | Credit         | Debit          |
| Equity       | Credit         | Credit         | Debit          |
| Revenue      | Credit         | Credit         | Debit          |
| Expense      | Debit          | Debit          | Credit         |

### Example Transactions

#### Recording Revenue
```
Debit:  Cash (Asset)           +1,500,000
Credit: Revenue (Revenue)                  +1,500,000
```

#### Recording Expense
```
Debit:  Fuel Expense (Expense)  +500,000
Credit: Cash (Asset)                        -500,000
```

#### Purchasing Equipment
```
Debit:  Equipment (Asset)      +10,000,000
Credit: Cash (Asset)                        -5,000,000
Credit: Loan Payable (Liability)            -5,000,000
```

### Validation Rules

1. **Double-Entry Balance**: Total debits must equal total credits
2. **Account Type Validation**: Entries must match account types
3. **Transaction Atomicity**: All entries succeed or fail together
4. **Period Locking**: Closed periods cannot be modified
5. **Trial Balance**: System maintains balanced books at all times

## Financial Period Management

### Period Lifecycle

```
┌──────┐    ┌────────┐    ┌────────┐
│ Open │───▶│ Closed │───▶│ Locked │
└──────┘    └────────┘    └────────┘
```

- **Open**: Transactions can be posted
- **Closed**: Period closed, soft lock (reversible)
- **Locked**: Hard lock, no modifications allowed

### Creating Periods

Periods are automatically created but can be manually managed:

```typescript
{
  "name": "Q1 2026",
  "periodType": "quarter",
  "fiscalYear": 2026,
  "quarter": 1,
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "status": "open"
}
```

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=financial_db

# Application
PORT=3011
NODE_ENV=development

# API
API_PREFIX=api
API_VERSION=v1
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm 8+

### Install Dependencies
```bash
cd services/financial
pnpm install
```

### Database Setup
```bash
# Create database
createdb financial_db

# Run migrations (auto-sync in development)
pnpm run start:dev
```

### Run Service
```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## Docker Deployment

```yaml
services:
  financial-service:
    build:
      context: ./services/financial
    ports:
      - "3011:3011"
    environment:
      - DB_HOST=postgres
      - DB_DATABASE=financial_db
    depends_on:
      - postgres
```

## Usage Examples

### Complete Revenue Cycle

```typescript
// 1. Customer pays for booking
const transaction = await fetch('http://localhost:3011/api/accounting/revenue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 500000,
    description: 'Booking #12345',
    category: 'booking_revenue',
    debitAccountId: 'cash-account-id',
    creditAccountId: 'revenue-account-id'
  })
});

// 2. Update budget actuals
await fetch('http://localhost:3011/api/budget/budget-id/actuals', {
  method: 'PUT'
});

// 3. Generate monthly report
const report = await fetch('http://localhost:3011/api/reports/profit-loss', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    startDate: '2025-11-01',
    endDate: '2025-11-30'
  })
});
```

## Best Practices

### Transaction Management
- Always use double-entry transactions
- Include descriptive references for audit trails
- Validate amounts before posting
- Use appropriate transaction categories

### Period Closing
- Reconcile all accounts before closing
- Generate reports for the period
- Review variance analysis
- Lock periods after final approval

### Chart of Accounts
- Follow standard account numbering
- Use consistent naming conventions
- Maintain logical account hierarchy
- Document custom accounts

### Reporting
- Schedule regular report generation
- Compare period-over-period trends
- Monitor key financial ratios
- Archive reports for compliance

## Security Considerations

- All financial operations require authentication
- Role-based access control for sensitive operations
- Audit logging for all transactions
- Period locking prevents unauthorized modifications
- Rate limiting on API endpoints (100 requests/minute)

## Compliance & Audit

### Audit Trail
- Complete transaction history
- User attribution for all changes
- Timestamp tracking
- Immutable journal entries

### Data Retention
- Transactions: Permanent retention
- Reports: 7 years minimum
- Tax records: Per regulatory requirements
- Budget history: Full fiscal year + 3 years

## Performance Optimization

- Indexed queries on transaction dates and account IDs
- Materialized views for report generation
- Batch processing for bulk transactions
- Connection pooling for database efficiency

## Error Handling

### Common Errors

- `DOUBLE_ENTRY_IMBALANCE`: Debits ≠ Credits
- `ACCOUNT_NOT_FOUND`: Invalid account reference
- `PERIOD_CLOSED`: Attempting to modify closed period
- `INVALID_ACCOUNT_TYPE`: Entry type mismatch with account type

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## API Rate Limits

- 100 requests per minute per IP
- Burst allowance: 120 requests
- Rate limit headers included in responses

## Support & Documentation

For integration questions or issues:
- Review API documentation above
- Check error response messages
- Consult double-entry accounting principles
- Contact financial systems team

## Technology Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **ORM**: TypeORM 0.3
- **Database**: PostgreSQL 14+
- **Validation**: class-validator, class-transformer
- **Rate Limiting**: @nestjs/throttler

## License

Proprietary - Big Bus Platform
