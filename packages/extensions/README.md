# @big-bus/extensions

Hệ thống extension mở rộng cho nền tảng Big Bus, cho phép tích hợp dễ dàng các dịch vụ bên thứ ba và mở rộng tính năng.

## Tính năng chính

- **Kiến trúc Plugin linh hoạt**: Dễ dàng thêm/xóa extensions mà không ảnh hưởng đến code hiện có
- **Type-safe**: Hoàn toàn TypeScript với strong typing
- **Extensible**: Hỗ trợ nhiều loại extension khác nhau
- **Registry Pattern**: Quản lý tập trung tất cả extensions
- **Hot-swappable**: Enable/disable extensions trong runtime

## Các loại Extension được hỗ trợ

### 1. Payment Gateway Extensions
Tích hợp các cổng thanh toán mới:
- ✅ Stripe
- ✅ PayPal
- ✅ VNPay (hiện có)
- ✅ Momo (hiện có)
- ✅ ZaloPay (hiện có)
- 🔄 Và nhiều hơn nữa...

### 2. OAuth2 Provider Extensions
Thêm các phương thức đăng nhập:
- ✅ Microsoft
- ✅ Apple
- ✅ Google (hiện có)
- ✅ Facebook (hiện có)
- ✅ Zalo (hiện có)
- 🔄 LinkedIn, Twitter, GitHub...

### 3. AI Service Extensions
Tích hợp AI cho customer care và analytics:
- 🤖 **Customer Support Chatbot**: OpenAI GPT, Claude, Gemini
- 📊 **Analytics AI**: Predictive analytics, anomaly detection
- 🔤 **NLP Services**: Sentiment analysis, classification, translation
- 💡 **Recommendation Engine**: Personalized recommendations

### 4. Affiliate Extensions
Quản lý chương trình affiliate marketing:
- 👥 Affiliate registration & management
- 💰 Commission tracking & calculation
- 📈 Performance analytics
- 💳 Automated payouts

### 5. Marketplace Extensions
Bán sản phẩm/dịch vụ cho khách đi xe:
- 🛍️ Product management
- 🛒 Shopping cart
- 📦 Order processing
- 📊 Inventory management

### 6. Personalization Extensions
Cá nhân hóa trải nghiệm người dùng:
- 🎯 Route recommendations
- 💲 Dynamic pricing optimization
- 🎨 Content personalization
- 🔍 User segmentation
- 🧪 A/B testing

### 7. Accounting Extensions
Quản lý tài chính và kế toán:
- 💼 Chart of accounts
- 📊 Financial statements (Income, Balance Sheet, Cash Flow)
- 💸 Tax calculation & reporting
- 📈 Budget management
- 📉 Financial metrics & KPIs

## Cài đặt

```bash
npm install @big-bus/extensions
```

## Sử dụng cơ bản

### 1. Khởi tạo Extension Registry

```typescript
import { ExtensionRegistry } from '@big-bus/extensions';

const registry = new ExtensionRegistry();
```

### 2. Đăng ký Payment Gateway Extension

```typescript
import { StripePaymentExtension } from '@big-bus/extensions/payment/examples';

// Tạo extension instance
const stripe = new StripePaymentExtension();

// Đăng ký với registry
await registry.register(stripe);

// Khởi tạo với config
await stripe.initialize({
  apiKey: process.env.STRIPE_API_KEY,
  apiSecret: process.env.STRIPE_API_SECRET,
  environment: 'production',
  returnUrl: 'https://bigbus.vn/payment/return',
  cancelUrl: 'https://bigbus.vn/payment/cancel',
});
```

### 3. Sử dụng Payment Gateway

```typescript
// Lấy extension từ registry
const paymentGateway = registry.get<StripePaymentExtension>('stripe');

// Tạo payment
const result = await paymentGateway.createPayment({
  amount: 500000,
  currency: CurrencyCode.VND,
  orderId: 'ORDER_123',
  orderDescription: 'Vé xe Hà Nội - Sài Gòn',
  customerEmail: 'customer@example.com',
  customerPhone: '0123456789',
  returnUrl: 'https://bigbus.vn/booking/success',
});

if (result.success) {
  // Redirect user to payment URL
  window.location.href = result.paymentUrl;
}
```

### 4. Đăng ký OAuth2 Provider Extension

```typescript
import { MicrosoftOAuth2Extension } from '@big-bus/extensions/auth/examples';

const microsoft = new MicrosoftOAuth2Extension();
await registry.register(microsoft);

await microsoft.initialize({
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  redirectUri: 'https://bigbus.vn/auth/microsoft/callback',
  authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
});

// Generate authorization URL
const { authorizationUrl, state } = await microsoft.getAuthorizationUrl({
  redirectUri: 'https://bigbus.vn/auth/microsoft/callback',
  scope: ['openid', 'profile', 'email'],
});

// Redirect user to Microsoft login
window.location.href = authorizationUrl;

// After callback, exchange code for token
const tokens = await microsoft.exchangeCodeForToken({
  code: authorizationCode,
  redirectUri: 'https://bigbus.vn/auth/microsoft/callback',
  state: state,
});

// Get user profile
const profile = await microsoft.getUserProfile(tokens.accessToken);
```

### 5. Sử dụng AI Customer Support

```typescript
import { OpenAIChatExtension } from '@big-bus/extensions/ai/examples';

const chatbot = new OpenAIChatExtension();
await registry.register(chatbot);

await chatbot.initialize({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
});

// Chat with customer
const response = await chatbot.chat({
  messages: [
    {
      role: 'user',
      content: 'Tôi muốn đặt vé từ Hà Nội đi Sài Gòn',
    },
  ],
  userId: 'user_123',
  sessionId: 'session_abc',
});

console.log(response.message.content);

// Analyze intent
const intent = await chatbot.analyzeIntent('Tôi muốn hủy vé');
// => { intent: 'cancel_booking', confidence: 0.85 }
```

## Tạo Extension mới

### Ví dụ: Payment Gateway mới

```typescript
import {
  BasePaymentGatewayExtension,
  PaymentRequest,
  PaymentResponse,
  PaymentCallback,
  PaymentStatus,
  CurrencyCode,
  PaymentMethodType,
  SupportedPaymentMethod,
} from '@big-bus/extensions';

export class MyPaymentGateway extends BasePaymentGatewayExtension {
  readonly id = 'my-gateway';
  readonly name = 'My Payment Gateway';
  readonly version = '1.0.0';
  description = 'My custom payment gateway';

  getSupportedPaymentMethods(): SupportedPaymentMethod[] {
    return [
      {
        type: PaymentMethodType.CARD,
        name: 'Credit Card',
        supportedCurrencies: [CurrencyCode.VND, CurrencyCode.USD],
      },
    ];
  }

  getSupportedCurrencies(): CurrencyCode[] {
    return [CurrencyCode.VND, CurrencyCode.USD];
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Implement payment creation logic
    // Call your payment gateway API

    return {
      success: true,
      paymentUrl: 'https://payment-gateway.com/pay/...',
      transactionId: 'txn_123',
      status: PaymentStatus.PENDING,
      amount: request.amount,
      currency: request.currency,
    };
  }

  async handleCallback(data: any): Promise<PaymentCallback> {
    // Implement callback handling
    // Verify signature, parse response

    return {
      gatewayTransactionId: data.txnId,
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency as CurrencyCode,
      status: PaymentStatus.COMPLETED,
      transactionDate: new Date(),
    };
  }

  verifySignature(data: any, signature: string): boolean {
    // Implement signature verification
    return true;
  }
}
```

### Ví dụ: AI Service Extension

```typescript
import {
  BaseAIServiceExtension,
  AIServiceType,
  IRecommendationExtension,
  RecommendationRequest,
  RecommendationResponse,
} from '@big-bus/extensions';

export class MyRecommendationEngine
  extends BaseAIServiceExtension
  implements IRecommendationExtension
{
  readonly id = 'my-recommendation';
  readonly name = 'My Recommendation Engine';
  readonly version = '1.0.0';

  getSupportedServiceTypes(): AIServiceType[] {
    return [AIServiceType.RECOMMENDATION];
  }

  async getRecommendations(
    request: RecommendationRequest,
  ): Promise<RecommendationResponse> {
    // Implement recommendation logic
    // Call ML model, collaborative filtering, etc.

    return {
      recommendations: [
        {
          itemId: 'route_123',
          score: 0.95,
          reason: 'Based on your travel history',
        },
        {
          itemId: 'route_456',
          score: 0.87,
          reason: 'Popular among similar users',
        },
      ],
    };
  }

  async trackBehavior(userId: string, event: any): Promise<void> {
    // Track user behavior for improving recommendations
  }
}
```

## Sử dụng trong NestJS Service

### Payment Service Integration

```typescript
// services/payment/src/payment.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExtensionRegistry } from '@big-bus/extensions';
import { StripePaymentExtension, PayPalPaymentExtension } from '@big-bus/extensions/payment/examples';

@Injectable()
export class PaymentService implements OnModuleInit {
  private registry: ExtensionRegistry;

  constructor() {
    this.registry = new ExtensionRegistry();
  }

  async onModuleInit() {
    // Register payment gateways
    const stripe = new StripePaymentExtension();
    await this.registry.register(stripe);
    await stripe.initialize({
      apiKey: process.env.STRIPE_API_KEY,
      environment: 'production',
    });

    const paypal = new PayPalPaymentExtension();
    await this.registry.register(paypal);
    await paypal.initialize({
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      environment: 'production',
    });
  }

  async createPayment(gateway: string, request: any) {
    const paymentGateway = this.registry.get(gateway);
    if (!paymentGateway) {
      throw new Error(`Payment gateway ${gateway} not found`);
    }

    return await paymentGateway.createPayment(request);
  }

  getAvailableGateways() {
    return this.registry.getEnabledByCategory(ExtensionCategory.PAYMENT);
  }
}
```

### Auth Service Integration

```typescript
// services/auth/src/oauth.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExtensionRegistry } from '@big-bus/extensions';
import { MicrosoftOAuth2Extension, AppleOAuth2Extension } from '@big-bus/extensions/auth/examples';

@Injectable()
export class OAuthService implements OnModuleInit {
  private registry: ExtensionRegistry;

  constructor() {
    this.registry = new ExtensionRegistry();
  }

  async onModuleInit() {
    // Register OAuth providers
    const microsoft = new MicrosoftOAuth2Extension();
    await this.registry.register(microsoft);
    await microsoft.initialize({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      redirectUri: process.env.MICROSOFT_REDIRECT_URI,
    });

    const apple = new AppleOAuth2Extension();
    await this.registry.register(apple);
    await apple.initialize({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
      redirectUri: process.env.APPLE_REDIRECT_URI,
    });
  }

  async getAuthUrl(provider: string, redirectUri: string) {
    const oauth = this.registry.get(provider);
    if (!oauth) {
      throw new Error(`OAuth provider ${provider} not found`);
    }

    return await oauth.getAuthorizationUrl({ redirectUri });
  }
}
```

## Quản lý Extensions

### Liệt kê tất cả extensions

```typescript
const allExtensions = registry.getAll();
console.log(allExtensions.map(e => e.getMetadata()));
```

### Lọc theo category

```typescript
import { ExtensionCategory } from '@big-bus/extensions';

const paymentGateways = registry.getByCategory(ExtensionCategory.PAYMENT);
const aiServices = registry.getByCategory(ExtensionCategory.AI);
```

### Enable/Disable extension

```typescript
// Disable extension
registry.disable('stripe');

// Enable extension
registry.enable('stripe');

// Get only enabled extensions
const enabled = registry.getEnabled();
```

### Unregister extension

```typescript
await registry.unregister('stripe');
```

## Best Practices

1. **Validation**: Always validate extension configuration
2. **Error Handling**: Wrap extension calls in try-catch
3. **Logging**: Log extension activities for debugging
4. **Testing**: Write tests for custom extensions
5. **Documentation**: Document extension capabilities
6. **Security**: Never expose API keys in code, use environment variables

## Roadmap

- [ ] Dynamic extension loading from plugins directory
- [ ] Extension marketplace
- [ ] Extension versioning and updates
- [ ] Extension dependencies management
- [ ] Extension health monitoring
- [ ] Extension metrics and analytics
- [ ] Web UI for extension management

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT
