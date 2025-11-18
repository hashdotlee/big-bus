# Hướng dẫn tích hợp Extension System vào Big Bus

Tài liệu này hướng dẫn cách tích hợp hệ thống extension vào các service hiện có của Big Bus.

## Tổng quan

Extension system cho phép bạn dễ dàng thêm các tính năng mới mà không cần sửa đổi code hiện có:

- **Payment Service**: Thêm cổng thanh toán mới (Stripe, PayPal, v.v.)
- **Auth Service**: Thêm OAuth2 providers (Microsoft, Apple, v.v.)
- **Analytics Service**: Tích hợp AI cho dự đoán và phân tích
- **Booking Service**: Cá nhân hóa trải nghiệm, đề xuất tuyến đường

## Bước 1: Cài đặt Extension Package

```bash
# Tại thư mục root
pnpm install
pnpm --filter @big-bus/extensions build
```

## Bước 2: Tích hợp vào Payment Service

### 2.1. Cập nhật package.json

```json
// services/payment/package.json
{
  "dependencies": {
    "@big-bus/extensions": "workspace:*",
    // ... các dependencies khác
  }
}
```

### 2.2. Tạo Extension Module

```typescript
// services/payment/src/extensions/payment-extensions.module.ts
import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtensionRegistry } from '@big-bus/extensions';
import {
  StripePaymentExtension,
  PayPalPaymentExtension,
} from '@big-bus/extensions/payment/examples';

@Global()
@Module({
  providers: [
    {
      provide: 'PAYMENT_EXTENSION_REGISTRY',
      useFactory: () => new ExtensionRegistry(),
    },
  ],
  exports: ['PAYMENT_EXTENSION_REGISTRY'],
})
export class PaymentExtensionsModule implements OnModuleInit {
  constructor(
    @Inject('PAYMENT_EXTENSION_REGISTRY')
    private registry: ExtensionRegistry,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Register Stripe
    if (this.configService.get('STRIPE_ENABLED')) {
      const stripe = new StripePaymentExtension();
      await this.registry.register(stripe);
      await stripe.initialize({
        apiKey: this.configService.get('STRIPE_API_KEY'),
        apiSecret: this.configService.get('STRIPE_API_SECRET'),
        environment: this.configService.get('NODE_ENV'),
        returnUrl: this.configService.get('STRIPE_RETURN_URL'),
        cancelUrl: this.configService.get('STRIPE_CANCEL_URL'),
      });
    }

    // Register PayPal
    if (this.configService.get('PAYPAL_ENABLED')) {
      const paypal = new PayPalPaymentExtension();
      await this.registry.register(paypal);
      await paypal.initialize({
        clientId: this.configService.get('PAYPAL_CLIENT_ID'),
        clientSecret: this.configService.get('PAYPAL_CLIENT_SECRET'),
        environment: this.configService.get('NODE_ENV'),
      });
    }
  }
}
```

### 2.3. Cập nhật Payment Gateway Service

```typescript
// services/payment/src/modules/payment-gateways/payment-gateways.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ExtensionRegistry, ExtensionCategory } from '@big-bus/extensions';

@Injectable()
export class PaymentGatewaysService {
  constructor(
    @Inject('PAYMENT_EXTENSION_REGISTRY')
    private extensionRegistry: ExtensionRegistry,
    // ... other dependencies
  ) {}

  async createPayment(provider: string, request: any) {
    // Try to get from extension registry first
    const extension = this.extensionRegistry.get(provider);

    if (extension && extension.enabled) {
      return await extension.createPayment(request);
    }

    // Fallback to existing implementation
    switch (provider) {
      case 'vnpay':
        return this.vnpayService.createPaymentUrl(request);
      case 'momo':
        return this.momoService.createPaymentUrl(request);
      case 'zalopay':
        return this.zalopayService.createPaymentUrl(request);
      default:
        throw new Error(`Unknown payment provider: ${provider}`);
    }
  }

  async handleCallback(provider: string, data: any) {
    const extension = this.extensionRegistry.get(provider);

    if (extension && extension.enabled) {
      return await extension.handleCallback(data);
    }

    // Fallback to existing implementation
    switch (provider) {
      case 'vnpay':
        return this.vnpayService.handleCallback(data);
      // ... other providers
    }
  }

  getAvailableGateways() {
    // Combine existing + extension gateways
    const extensionGateways = this.extensionRegistry
      .getEnabledByCategory(ExtensionCategory.PAYMENT)
      .map(ext => ext.getMetadata());

    return {
      existing: ['vnpay', 'momo', 'zalopay'],
      extensions: extensionGateways,
    };
  }
}
```

### 2.4. Cập nhật App Module

```typescript
// services/payment/src/app.module.ts
import { PaymentExtensionsModule } from './extensions/payment-extensions.module';

@Module({
  imports: [
    // ... existing imports
    PaymentExtensionsModule,
  ],
})
export class AppModule {}
```

### 2.5. Environment Variables

```env
# services/payment/.env

# Stripe
STRIPE_ENABLED=true
STRIPE_API_KEY=sk_test_...
STRIPE_API_SECRET=...
STRIPE_RETURN_URL=https://bigbus.vn/payment/return
STRIPE_CANCEL_URL=https://bigbus.vn/payment/cancel

# PayPal
PAYPAL_ENABLED=true
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

## Bước 3: Tích hợp vào Auth Service

### 3.1. Tạo OAuth Extensions Module

```typescript
// services/auth/src/extensions/oauth-extensions.module.ts
import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtensionRegistry } from '@big-bus/extensions';
import {
  MicrosoftOAuth2Extension,
  AppleOAuth2Extension,
} from '@big-bus/extensions/auth/examples';

@Global()
@Module({
  providers: [
    {
      provide: 'OAUTH_EXTENSION_REGISTRY',
      useFactory: () => new ExtensionRegistry(),
    },
  ],
  exports: ['OAUTH_EXTENSION_REGISTRY'],
})
export class OAuthExtensionsModule implements OnModuleInit {
  constructor(
    @Inject('OAUTH_EXTENSION_REGISTRY')
    private registry: ExtensionRegistry,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Register Microsoft OAuth
    if (this.configService.get('MICROSOFT_OAUTH_ENABLED')) {
      const microsoft = new MicrosoftOAuth2Extension();
      await this.registry.register(microsoft);
      await microsoft.initialize({
        clientId: this.configService.get('MICROSOFT_CLIENT_ID'),
        clientSecret: this.configService.get('MICROSOFT_CLIENT_SECRET'),
        redirectUri: this.configService.get('MICROSOFT_REDIRECT_URI'),
        authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      });
    }

    // Register Apple OAuth
    if (this.configService.get('APPLE_OAUTH_ENABLED')) {
      const apple = new AppleOAuth2Extension();
      await this.registry.register(apple);
      await apple.initialize({
        clientId: this.configService.get('APPLE_CLIENT_ID'),
        clientSecret: this.configService.get('APPLE_CLIENT_SECRET'),
        redirectUri: this.configService.get('APPLE_REDIRECT_URI'),
        authorizationUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
      });
    }
  }
}
```

### 3.2. Cập nhật Auth Controller

```typescript
// services/auth/src/modules/auth/auth.controller.ts
import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ExtensionRegistry } from '@big-bus/extensions';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('OAUTH_EXTENSION_REGISTRY')
    private oauthRegistry: ExtensionRegistry,
    // ... other dependencies
  ) {}

  @Get(':provider/login')
  async oauthLogin(
    @Param('provider') provider: string,
    @Query('redirect_uri') redirectUri: string,
  ) {
    const oauth = this.oauthRegistry.get(provider);

    if (!oauth || !oauth.enabled) {
      throw new BadRequestException(`OAuth provider ${provider} not available`);
    }

    const { authorizationUrl, state } = await oauth.getAuthorizationUrl({
      redirectUri,
      scope: ['openid', 'profile', 'email'],
    });

    return { authorizationUrl, state };
  }

  @Get(':provider/callback')
  async oauthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const oauth = this.oauthRegistry.get(provider);

    if (!oauth || !oauth.enabled) {
      throw new BadRequestException(`OAuth provider ${provider} not available`);
    }

    // Exchange code for token
    const tokens = await oauth.exchangeCodeForToken({
      code,
      redirectUri: this.configService.get(`${provider.toUpperCase()}_REDIRECT_URI`),
      state,
    });

    // Get user profile
    const profile = await oauth.getUserProfile(tokens.accessToken);

    // Create or update user in database
    const user = await this.authService.findOrCreateOAuthUser({
      provider,
      providerId: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    // Generate JWT token
    const jwt = this.authService.generateJWT(user);

    return { user, token: jwt };
  }
}
```

## Bước 4: Tích hợp AI vào Analytics Service

### 4.1. Tạo AI Extensions Module

```typescript
// services/analytics/src/extensions/ai-extensions.module.ts
import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtensionRegistry } from '@big-bus/extensions';
import { OpenAIChatExtension } from '@big-bus/extensions/ai/examples';

@Global()
@Module({
  providers: [
    {
      provide: 'AI_EXTENSION_REGISTRY',
      useFactory: () => new ExtensionRegistry(),
    },
  ],
  exports: ['AI_EXTENSION_REGISTRY'],
})
export class AIExtensionsModule implements OnModuleInit {
  constructor(
    @Inject('AI_EXTENSION_REGISTRY')
    private registry: ExtensionRegistry,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Register OpenAI Chat
    if (this.configService.get('OPENAI_ENABLED')) {
      const openai = new OpenAIChatExtension();
      await this.registry.register(openai);
      await openai.initialize({
        apiKey: this.configService.get('OPENAI_API_KEY'),
        modelName: 'gpt-4',
        temperature: 0.7,
        maxTokens: 500,
      });
    }
  }
}
```

### 4.2. Tạo Customer Support Service

```typescript
// services/analytics/src/modules/customer-support/customer-support.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ExtensionRegistry, AIServiceType } from '@big-bus/extensions';

@Injectable()
export class CustomerSupportService {
  constructor(
    @Inject('AI_EXTENSION_REGISTRY')
    private aiRegistry: ExtensionRegistry,
  ) {}

  async chat(userId: string, message: string, sessionId: string) {
    // Get chatbot extension
    const chatbot = this.aiRegistry
      .getEnabledByCategory(ExtensionCategory.AI)
      .find(ext => ext.supportsServiceType(AIServiceType.CHATBOT));

    if (!chatbot) {
      throw new Error('No chatbot extension available');
    }

    const response = await chatbot.chat({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      userId,
      sessionId,
    });

    // Save conversation to database
    await this.saveConversation(userId, sessionId, message, response.message.content);

    return response;
  }

  async analyzeIntent(message: string) {
    const chatbot = this.aiRegistry.get('openai-chat');

    if (!chatbot || !chatbot.analyzeIntent) {
      return { intent: 'unknown', confidence: 0 };
    }

    return await chatbot.analyzeIntent(message);
  }
}
```

## Bước 5: Tạo Marketplace Service mới

```typescript
// services/marketplace/src/app.module.ts
import { Module } from '@nestjs/common';
import { MarketplaceExtensionsModule } from './extensions/marketplace-extensions.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    MarketplaceExtensionsModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
```

## Bước 6: Testing Extensions

### Unit Test

```typescript
// services/payment/src/extensions/__tests__/stripe.extension.spec.ts
import { StripePaymentExtension } from '@big-bus/extensions/payment/examples';
import { CurrencyCode, PaymentStatus } from '@big-bus/extensions';

describe('StripePaymentExtension', () => {
  let extension: StripePaymentExtension;

  beforeEach(async () => {
    extension = new StripePaymentExtension();
    await extension.initialize({
      apiKey: 'sk_test_123',
      environment: 'sandbox',
    });
  });

  it('should create payment successfully', async () => {
    const result = await extension.createPayment({
      amount: 100000,
      currency: CurrencyCode.VND,
      orderId: 'ORDER_123',
      orderDescription: 'Test order',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe(PaymentStatus.PENDING);
    expect(result.paymentUrl).toBeDefined();
  });

  it('should support VND currency', () => {
    expect(extension.supportsCurrency(CurrencyCode.VND)).toBe(true);
  });
});
```

## Bước 7: Monitoring và Logging

### Extension Activity Logger

```typescript
// shared/logger/extension-logger.ts
import { Logger } from '@nestjs/common';
import { ExtensionRegistry } from '@big-bus/extensions';

export class ExtensionLogger {
  private logger = new Logger('ExtensionRegistry');

  constructor(private registry: ExtensionRegistry) {
    this.setupLogging();
  }

  private setupLogging() {
    // Log extension registrations
    const originalRegister = this.registry.register.bind(this.registry);
    this.registry.register = async (extension) => {
      this.logger.log(`Registering extension: ${extension.id}`);
      const result = await originalRegister(extension);
      this.logger.log(`Extension registered: ${extension.id} v${extension.version}`);
      return result;
    };

    // Log extension calls
    this.logExtensionCalls();
  }

  private logExtensionCalls() {
    const extensions = this.registry.getAll();
    extensions.forEach(ext => {
      // Wrap methods with logging
      const metadata = ext.getMetadata();
      this.logger.log(`Extension ${metadata.id} methods logged`);
    });
  }
}
```

## Best Practices

### 1. Graceful Degradation
```typescript
async createPayment(provider: string, request: any) {
  try {
    const extension = this.registry.get(provider);
    if (extension?.enabled) {
      return await extension.createPayment(request);
    }
  } catch (error) {
    this.logger.error(`Extension ${provider} failed:`, error);
    // Fallback to default implementation
  }

  return this.fallbackPayment(request);
}
```

### 2. Configuration Validation
```typescript
async onModuleInit() {
  try {
    await extension.initialize(config);
  } catch (error) {
    this.logger.error(`Failed to initialize ${extension.id}:`, error);
    // Don't crash the app, just disable the extension
    extension.enabled = false;
  }
}
```

### 3. Feature Flags
```typescript
const extensionEnabled = this.configService.get(`${provider.toUpperCase()}_ENABLED`);
if (extensionEnabled) {
  await this.registry.register(extension);
}
```

## Troubleshooting

### Extension không load
- Kiểm tra environment variables
- Kiểm tra logs khi initialize
- Verify API keys

### Extension bị conflict
- Đảm bảo unique extension IDs
- Check category conflicts

### Performance issues
- Enable caching cho extension calls
- Monitor extension metrics
- Set timeouts cho external API calls

## Kết luận

Extension system giúp bạn:
- ✅ Dễ dàng thêm tính năng mới
- ✅ Không cần sửa code hiện có
- ✅ Test riêng biệt từng extension
- ✅ Enable/disable features linh hoạt
- ✅ Tái sử dụng code giữa các services

Hãy tham khảo README.md để biết thêm chi tiết về cách sử dụng từng loại extension.
