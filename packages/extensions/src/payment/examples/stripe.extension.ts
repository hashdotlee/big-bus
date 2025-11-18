import {
  BasePaymentGatewayExtension,
  PaymentRequest,
  PaymentResponse,
  PaymentCallback,
  RefundRequest,
  RefundResponse,
  PaymentQueryRequest,
  PaymentQueryResponse,
  PaymentStatus,
  CurrencyCode,
  PaymentMethodType,
  SupportedPaymentMethod,
} from '../payment-gateway.extension';

/**
 * Stripe Payment Gateway Extension
 * Example implementation of payment gateway extension
 */
export class StripePaymentExtension extends BasePaymentGatewayExtension {
  readonly id = 'stripe';
  readonly name = 'Stripe';
  readonly version = '1.0.0';
  description = 'Stripe payment gateway integration';
  author = 'Big Bus';

  getSupportedPaymentMethods(): SupportedPaymentMethod[] {
    return [
      {
        type: PaymentMethodType.CARD,
        name: 'Credit/Debit Card',
        description: 'Pay with Visa, Mastercard, Amex, etc.',
        icon: 'credit-card',
        minAmount: 1000, // VND
        supportedCurrencies: [
          CurrencyCode.VND,
          CurrencyCode.USD,
          CurrencyCode.EUR,
          CurrencyCode.SGD,
        ],
      },
      {
        type: PaymentMethodType.E_WALLET,
        name: 'Digital Wallets',
        description: 'Apple Pay, Google Pay',
        icon: 'wallet',
        minAmount: 1000,
        supportedCurrencies: [
          CurrencyCode.VND,
          CurrencyCode.USD,
          CurrencyCode.EUR,
        ],
      },
      {
        type: PaymentMethodType.BANK_TRANSFER,
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        icon: 'bank',
        minAmount: 5000,
        supportedCurrencies: [CurrencyCode.VND, CurrencyCode.USD],
      },
    ];
  }

  getSupportedCurrencies(): CurrencyCode[] {
    return [
      CurrencyCode.VND,
      CurrencyCode.USD,
      CurrencyCode.EUR,
      CurrencyCode.THB,
      CurrencyCode.SGD,
    ];
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate request
      if (!this.validateAmount(request.amount, request.currency)) {
        return {
          success: false,
          status: PaymentStatus.FAILED,
          message: 'Invalid amount',
          errorCode: 'INVALID_AMOUNT',
        };
      }

      // In a real implementation, call Stripe API
      // const stripe = require('stripe')(this.gatewayConfig.apiKey);
      // const session = await stripe.checkout.sessions.create({...});

      // Mock response
      const transactionId = `stripe_${Date.now()}`;
      const paymentUrl = `https://checkout.stripe.com/pay/${transactionId}`;

      return {
        success: true,
        paymentUrl,
        transactionId,
        gatewayTransactionId: transactionId,
        status: PaymentStatus.PENDING,
        amount: this.formatAmount(request.amount, request.currency),
        currency: request.currency,
        metadata: {
          orderId: request.orderId,
          customerId: request.customerId,
        },
      };
    } catch (error) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        message: error.message,
        errorCode: 'STRIPE_ERROR',
      };
    }
  }

  async handleCallback(data: any): Promise<PaymentCallback> {
    // In a real implementation, verify Stripe webhook signature
    // const stripe = require('stripe')(this.gatewayConfig.apiKey);
    // const event = stripe.webhooks.constructEvent(data, signature, webhookSecret);

    return {
      gatewayTransactionId: data.id || data.transactionId,
      orderId: data.metadata?.orderId,
      amount: data.amount / 100, // Stripe uses cents
      currency: data.currency.toUpperCase() as CurrencyCode,
      status:
        data.status === 'succeeded' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      transactionDate: new Date(data.created * 1000),
      metadata: data.metadata,
      rawData: data,
    };
  }

  verifySignature(data: any, signature: string): boolean {
    // In a real implementation, verify Stripe signature
    // const stripe = require('stripe')(this.gatewayConfig.apiKey);
    // try {
    //   stripe.webhooks.constructEvent(data, signature, webhookSecret);
    //   return true;
    // } catch {
    //   return false;
    // }

    return true; // Mock implementation
  }

  async queryPayment(request: PaymentQueryRequest): Promise<PaymentQueryResponse> {
    try {
      // In a real implementation, call Stripe API
      // const stripe = require('stripe')(this.gatewayConfig.apiKey);
      // const paymentIntent = await stripe.paymentIntents.retrieve(request.gatewayTransactionId);

      return {
        success: true,
        transactionId: request.transactionId,
        gatewayTransactionId: request.gatewayTransactionId,
        orderId: request.orderId,
        status: PaymentStatus.COMPLETED,
      };
    } catch (error) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
      };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // In a real implementation, call Stripe API
      // const stripe = require('stripe')(this.gatewayConfig.apiKey);
      // const refund = await stripe.refunds.create({
      //   payment_intent: request.gatewayTransactionId,
      //   amount: request.amount * 100,
      // });

      return {
        success: true,
        refundId: `ref_${Date.now()}`,
        gatewayRefundId: `stripe_ref_${Date.now()}`,
        amount: request.amount,
        status: PaymentStatus.REFUNDED,
        message: 'Refund processed successfully',
      };
    } catch (error) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        message: error.message,
        errorCode: 'REFUND_FAILED',
      };
    }
  }

  getTransactionFee(amount: number, currency: CurrencyCode): number {
    // Stripe fee: 2.9% + $0.30 for international cards
    const percentageFee = amount * 0.029;
    const fixedFee = currency === CurrencyCode.VND ? 7000 : 0.3;
    return percentageFee + fixedFee;
  }

  async validateConfig(config: any): Promise<boolean> {
    return !!(config.apiKey && config.apiKey.startsWith('sk_'));
  }
}
