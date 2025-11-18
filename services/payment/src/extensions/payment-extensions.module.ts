import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtensionRegistry } from '@big-bus/extensions';

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
export class PaymentExtensionsModule {}
