export default () => ({
  port: parseInt(process.env.PORT, 10) || 3005,
  serviceName: process.env.SERVICE_NAME || 'notification-service',
  environment: process.env.NODE_ENV || 'development',

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    queues: {
      email: process.env.RABBITMQ_QUEUE_EMAIL || 'notifications.email',
      sms: process.env.RABBITMQ_QUEUE_SMS || 'notifications.sms',
      push: process.env.RABBITMQ_QUEUE_PUSH || 'notifications.push',
      zalo: process.env.RABBITMQ_QUEUE_ZALO || 'notifications.zalo',
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: {
      name: process.env.SMTP_FROM_NAME || 'Big Bus',
      email: process.env.SMTP_FROM_EMAIL || 'noreply@bigbus.com',
    },
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    esms: {
      apiKey: process.env.ESMS_API_KEY,
      secretKey: process.env.ESMS_SECRET_KEY,
      brandName: process.env.ESMS_BRAND_NAME || 'BIGBUS',
    },
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },

  zalo: {
    oaId: process.env.ZALO_OA_ID,
    oaSecret: process.env.ZALO_OA_SECRET,
    refreshToken: process.env.ZALO_OA_REFRESH_TOKEN,
    apiUrl: process.env.ZALO_API_URL || 'https://openapi.zalo.me/v2.0',
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  templates: {
    dir: process.env.TEMPLATE_DIR || './src/common/templates',
  },
});
