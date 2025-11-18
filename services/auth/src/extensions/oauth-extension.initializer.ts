import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtensionRegistry } from '@big-bus/extensions';
import {
  MicrosoftOAuth2Extension,
  AppleOAuth2Extension,
} from '@big-bus/extensions/auth/examples';

@Injectable()
export class OAuthExtensionInitializer implements OnModuleInit {
  private readonly logger = new Logger(OAuthExtensionInitializer.name);

  constructor(
    @Inject('OAUTH_EXTENSION_REGISTRY')
    private readonly registry: ExtensionRegistry,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.registerMicrosoft();
    await this.registerApple();

    const registered = this.registry.getAll();
    this.logger.log(
      `Registered ${registered.length} OAuth2 provider extensions: ${registered.map(e => e.id).join(', ')}`,
    );
  }

  private async registerMicrosoft() {
    if (!this.configService.get('MICROSOFT_OAUTH_ENABLED', false)) {
      return;
    }

    try {
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
      this.logger.log('Microsoft OAuth2 extension registered successfully');
    } catch (error) {
      this.logger.error('Failed to register Microsoft OAuth2 extension:', error);
    }
  }

  private async registerApple() {
    if (!this.configService.get('APPLE_OAUTH_ENABLED', false)) {
      return;
    }

    try {
      const apple = new AppleOAuth2Extension();
      await this.registry.register(apple);
      await apple.initialize({
        clientId: this.configService.get('APPLE_CLIENT_ID'),
        clientSecret: this.configService.get('APPLE_CLIENT_SECRET'),
        redirectUri: this.configService.get('APPLE_REDIRECT_URI'),
        authorizationUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
      });
      this.logger.log('Apple OAuth2 extension registered successfully');
    } catch (error) {
      this.logger.error('Failed to register Apple OAuth2 extension:', error);
    }
  }
}
