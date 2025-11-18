import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtensionRegistry } from '@big-bus/extensions';
import {
  StripePaymentExtension,
  PayPalPaymentExtension,
} from '@big-bus/extensions/payment/examples';

@Injectable()
export class PaymentExtensionInitializer implements OnModuleInit {
  private readonly logger = new Logger(PaymentExtensionInitializer.name);

  constructor(
    @Inject('PAYMENT_EXTENSION_REGISTRY')
    private readonly registry: ExtensionRegistry,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.registerStripe();
    await this.registerPayPal();

    const registered = this.registry.getAll();
    this.logger.log(
      `Registered ${registered.length} payment gateway extensions: ${registered.map(e => e.id).join(', ')}`,
    );
  }

  private async registerStripe() {
    if (!this.configService.get('STRIPE_ENABLED', false)) {
      return;
    }

    try {
      const stripe = new StripePaymentExtension();
      await this.registry.register(stripe);
      await stripe.initialize({
        apiKey: this.configService.get('STRIPE_API_KEY'),
        apiSecret: this.configService.get('STRIPE_API_SECRET'),
        environment: this.configService.get('NODE_ENV') === 'production' ? 'production' : 'sandbox',
        returnUrl: this.configService.get('STRIPE_RETURN_URL'),
        cancelUrl: this.configService.get('STRIPE_CANCEL_URL'),
        webhookSecret: this.configService.get('STRIPE_WEBHOOK_SECRET'),
      });
      this.logger.log('Stripe payment gateway extension registered successfully');
    } catch (error) {
      this.logger.error('Failed to register Stripe extension:', error);
    }
  }

  private async registerPayPal() {
    if (!this.configService.get('PAYPAL_ENABLED', false)) {
      return;
    }

    try {
      const paypal = new PayPalPaymentExtension();
      await this.registry.register(paypal);
      await paypal.initialize({
        clientId: this.configService.get('PAYPAL_CLIENT_ID'),
        clientSecret: this.configService.get('PAYPAL_CLIENT_SECRET'),
        environment: this.configService.get('NODE_ENV') === 'production' ? 'production' : 'sandbox',
        returnUrl: this.configService.get('PAYPAL_RETURN_URL'),
        cancelUrl: this.configService.get('PAYPAL_CANCEL_URL'),
      });
      this.logger.log('PayPal payment gateway extension registered successfully');
    } catch (error) {
      this.logger.error('Failed to register PayPal extension:', error);
    }
  }
}
