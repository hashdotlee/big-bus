# Payment Service

Payment processing and wallet management service for Big Bus booking system.

## Features

- **Payment Gateway Integration**
  - VNPay integration
  - Momo wallet integration
  - ZaloPay integration
  - Multi-currency support

- **Wallet System**
  - User wallet management
  - Balance tracking
  - Top-up functionality
  - Transaction history

- **Transaction Management**
  - Real-time transaction tracking
  - Payment status updates
  - Transaction history
  - Receipt generation

- **Refund Processing**
  - Automated refund processing
  - Refund status tracking
  - Partial and full refunds
  - Refund notifications

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **Cache**: Redis
- **API Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Running the Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### API Documentation

When running in development mode, Swagger documentation is available at:
http://localhost:3004/api/docs

## Payment Gateway Configuration

### VNPay

1. Register for VNPay merchant account
2. Get your TMN Code and Hash Secret
3. Update `.env` with your credentials

### Momo

1. Register for Momo Business account
2. Get Partner Code, Access Key, and Secret Key
3. Update `.env` with your credentials

### ZaloPay

1. Register for ZaloPay merchant account
2. Get App ID, Key1, and Key2
3. Update `.env` with your credentials

## Database Schema

### Tables

- `wallets` - User wallet information
- `transactions` - Payment transactions
- `payment_gateway_logs` - Gateway request/response logs
- `refunds` - Refund records

## API Endpoints

### Wallets

- `GET /wallets/my-wallet` - Get current user's wallet
- `POST /wallets/top-up` - Top up wallet
- `GET /wallets/balance` - Get wallet balance
- `GET /wallets/transactions` - Get wallet transaction history

### Transactions

- `POST /transactions/create` - Create new transaction
- `GET /transactions/:id` - Get transaction details
- `GET /transactions` - List all transactions
- `PATCH /transactions/:id/status` - Update transaction status

### Payment Gateways

- `POST /payment-gateways/vnpay/create` - Create VNPay payment
- `GET /payment-gateways/vnpay/callback` - VNPay callback
- `POST /payment-gateways/momo/create` - Create Momo payment
- `POST /payment-gateways/momo/notify` - Momo notification
- `POST /payment-gateways/zalopay/create` - Create ZaloPay payment
- `POST /payment-gateways/zalopay/callback` - ZaloPay callback

### Refunds

- `POST /refunds` - Request refund
- `GET /refunds/:id` - Get refund details
- `GET /refunds` - List refunds
- `PATCH /refunds/:id/process` - Process refund

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Environment Variables

See `.env.example` for all available configuration options.

## Security

- All payment data is encrypted
- PCI DSS compliance
- Secure webhook handling
- Request signature verification

## Support

For issues and questions, please contact the development team.
