/**
 * @big-bus/extensions
 * Extensible plugin architecture for Big Bus platform
 */

// Core
export * from './core/base-extension';
export * from './core/extension-registry';

// Payment Gateway Extensions
export * from './payment/payment-gateway.extension';

// OAuth2 Provider Extensions
export * from './auth/oauth2-provider.extension';

// AI Service Extensions
export * from './ai/ai-service.extension';

// Affiliate Extensions
export * from './affiliate/affiliate.extension';

// Marketplace Extensions
export * from './marketplace/marketplace.extension';

// Personalization Extensions
export * from './personalization/personalization.extension';

// Accounting Extensions
export * from './accounting/accounting.extension';
