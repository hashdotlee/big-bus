# Notification Service

Notification service for Big Bus booking system. Handles email, SMS, push notifications, and Zalo OA integration.

## Features

### 📧 Email Notifications
- SMTP integration
- HTML email templates with Handlebars
- Attachment support
- Bulk email sending

### 📱 SMS Notifications
- Twilio integration
- Vietnam SMS providers (ESMS, VietGuys)
- OTP support
- Bulk SMS sending

### 🔔 Push Notifications
- Firebase Cloud Messaging (FCM)
- iOS and Android support
- Topic-based messaging
- Multicast support

### 💬 Zalo OA Integration
- Text messages
- Template messages
- Image sharing
- User profile retrieval

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Message Queue**: RabbitMQ
- **Cache**: Redis
- **Email**: Nodemailer
- **SMS**: Twilio / ESMS
- **Push**: Firebase Admin SDK
- **Templates**: Handlebars

## Prerequisites

- Node.js 20+
- RabbitMQ
- Redis
- SMTP server credentials
- Twilio/ESMS account (for SMS)
- Firebase project (for push notifications)
- Zalo OA account (for Zalo integration)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

## Environment Variables

See `.env.example` for all available environment variables.

### Required Configuration

1. **SMTP Configuration** (for email)
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USER
   - SMTP_PASSWORD

2. **SMS Configuration** (choose one)
   - Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
   - ESMS: ESMS_API_KEY, ESMS_SECRET_KEY

3. **Firebase Configuration** (for push)
   - FIREBASE_PROJECT_ID
   - FIREBASE_PRIVATE_KEY
   - FIREBASE_CLIENT_EMAIL

4. **Zalo Configuration** (optional)
   - ZALO_OA_ID
   - ZALO_OA_SECRET
   - ZALO_OA_REFRESH_TOKEN

## Running the Service

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker build -t big-bus-notification .
docker run -p 3005:3005 --env-file .env big-bus-notification
```

## API Documentation

Once running, visit: http://localhost:3005/api/docs

## API Endpoints

### Email
- `POST /api/v1/email/send` - Send email notification
- `GET /api/v1/email/health` - Check email service health

### SMS
- `POST /api/v1/sms/send` - Send SMS notification
- `GET /api/v1/sms/health` - Check SMS service health

### Push
- `POST /api/v1/push/send` - Send push notification
- `POST /api/v1/push/multicast` - Send to multiple devices
- `POST /api/v1/push/topic` - Send to topic
- `POST /api/v1/push/subscribe` - Subscribe to topic
- `POST /api/v1/push/unsubscribe` - Unsubscribe from topic
- `GET /api/v1/push/health` - Check push service health

### Zalo
- `POST /api/v1/zalo/send` - Send Zalo template message
- `POST /api/v1/zalo/text` - Send Zalo text message
- `POST /api/v1/zalo/image` - Send Zalo image
- `GET /api/v1/zalo/profile/:userId` - Get user profile
- `GET /api/v1/zalo/health` - Check Zalo service health

## Email Templates

Templates are located in `src/common/templates/email/` and use Handlebars syntax.

### Available Templates
- `booking-confirmation.hbs` - Booking confirmation email
- `payment-success.hbs` - Payment success notification
- `booking-reminder.hbs` - Trip reminder email

### Creating Custom Templates

1. Create a new `.hbs` file in `src/common/templates/email/`
2. Use Handlebars syntax with available helpers:
   - `{{formatDate date "format"}}`
   - `{{formatCurrency amount}}`
   - `{{#if condition}}...{{/if}}`
   - `{{#each items}}...{{/each}}`

## Example Usage

### Send Email
```bash
curl -X POST http://localhost:3005/api/v1/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "user@example.com",
    "template": "booking-confirmation",
    "subject": "Booking Confirmation",
    "data": {
      "customerName": "John Doe",
      "bookingCode": "BB123456",
      "route": "Hanoi - Ho Chi Minh",
      "departureDate": "2024-01-15",
      "departureTime": "08:00",
      "seatNumbers": "A1, A2",
      "totalAmount": 500000
    }
  }'
```

### Send SMS
```bash
curl -X POST http://localhost:3005/api/v1/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "+84901234567",
    "template": "sms-booking-confirmation",
    "message": "Your booking BB123456 is confirmed",
    "data": {
      "bookingCode": "BB123456"
    }
  }'
```

### Send Push Notification
```bash
curl -X POST http://localhost:3005/api/v1/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "device-token-here",
    "template": "push-booking-status",
    "title": "Booking Confirmed",
    "body": "Your trip to HCMC is confirmed",
    "data": {
      "bookingId": "123",
      "screen": "BookingDetails"
    }
  }'
```

## RabbitMQ Integration

The service uses RabbitMQ queues for async processing:

- `notifications.email` - Email queue
- `notifications.sms` - SMS queue
- `notifications.push` - Push notification queue
- `notifications.zalo` - Zalo message queue

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Monitoring

Health check endpoints are available for each notification type:
- `/api/v1/email/health`
- `/api/v1/sms/health`
- `/api/v1/push/health`
- `/api/v1/zalo/health`

## Troubleshooting

### Email not sending
- Check SMTP credentials
- Verify SMTP server allows connections
- Check firewall rules for SMTP port

### SMS failing
- Verify provider credentials
- Check phone number format (include country code)
- Ensure sufficient balance in SMS provider account

### Push notifications not delivered
- Verify Firebase credentials
- Check device token is valid
- Ensure FCM is enabled in Firebase console

### Zalo messages not sending
- Verify OA credentials
- Check access token is valid
- Ensure user has subscribed to OA

## License

MIT
