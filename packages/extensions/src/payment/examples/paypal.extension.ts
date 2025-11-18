import {
  BasePaymentGatewayExtension,
  PaymentRequest,
  PaymentResponse,
  PaymentCallback,
  RefundRequest,
  RefundResponse,
  PaymentStatus,
  CurrencyCode,
  PaymentMethodType,
  SupportedPaymentMethod,
} from '../payment-gateway.extension';

/**
 * PayPal Payment Gateway Extension
 * Example implementation for international payments
 */
export class PayPalPaymentExtension extends BasePaymentGatewayExtension {
  readonly id = 'paypal';
  readonly name = 'PayPal';
  readonly version = '1.0.0';
  description = 'PayPal payment gateway for international transactions';
  author = 'Big Bus';

  getSupportedPaymentMethods(): SupportedPaymentMethod[] {
    return [
      {
        type: PaymentMethodType.E_WALLET,
        name: 'PayPal Wallet',
        description: 'Pay with your PayPal account',
        icon: 'paypal',
        minAmount: 1,
        supportedCurrencies: [
          CurrencyCode.USD,
          CurrencyCode.EUR,
          CurrencyCode.SGD,
        ],
      },
      {
        type: PaymentMethodType.CARD,
        name: 'Card via PayPal',
        description: 'Pay with credit/debit card through PayPal',
        icon: 'credit-card',
        minAmount: 1,
        supportedCurrencies: [
          CurrencyCode.USD,
          CurrencyCode.EUR,
          CurrencyCode.SGD,
        ],
      },
    ];
  }

  getSupportedCurrencies(): CurrencyCode[] {
    return [CurrencyCode.USD, CurrencyCode.EUR, CurrencyCode.SGD];
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In a real implementation, call PayPal API
      // const paypal = require('@paypal/checkout-server-sdk');
      // const request = new paypal.orders.OrdersCreateRequest();
      // const order = await client.execute(request);

      const transactionId = `paypal_${Date.now()}`;
      const paymentUrl = `https://www.paypal.com/checkoutnow?token=${transactionId}`;

      return {
        success: true,
        paymentUrl,
        transactionId,
        gatewayTransactionId: transactionId,
        status: PaymentStatus.PENDING,
        amount: request.amount,
        currency: request.currency,
        metadata: {
          orderId: request.orderId,
        },
      };
    } catch (error) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        message: error.message,
        errorCode: 'PAYPAL_ERROR',
      };
    }
  }

  async handleCallback(data: any): Promise<PaymentCallback> {
    return {
      gatewayTransactionId: data.id,
      orderId: data.purchase_units?.[0]?.custom_id,
      amount: parseFloat(data.purchase_units?.[0]?.amount?.value || '0'),
      currency: data.purchase_units?.[0]?.amount?.currency_code as CurrencyCode,
      status:
        data.status === 'COMPLETED' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
      transactionDate: new Date(data.create_time),
      metadata: data,
      rawData: data,
    };
  }

  verifySignature(data: any, signature: string): boolean {
    // In a real implementation, verify PayPal webhook signature
    return true;
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // In a real implementation, call PayPal refund API
      return {
        success: true,
        refundId: `paypal_ref_${Date.now()}`,
        gatewayRefundId: `ref_${Date.now()}`,
        amount: request.amount,
        status: PaymentStatus.REFUNDED,
      };
    } catch (error) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        message: error.message,
      };
    }
  }

  getTransactionFee(amount: number, currency: CurrencyCode): number {
    // PayPal fee: 2.9% + fixed fee
    return amount * 0.029 + 0.3;
  }
}
