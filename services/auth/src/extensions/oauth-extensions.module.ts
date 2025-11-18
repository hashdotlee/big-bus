import { Module, Global } from '@nestjs/common';
import { ExtensionRegistry } from '@big-bus/extensions';

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
export class OAuthExtensionsModule {}
