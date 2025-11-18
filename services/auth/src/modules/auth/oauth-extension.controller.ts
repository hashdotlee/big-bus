import { Controller, Get, Query, Param, BadRequestException, Inject, Logger } from '@nestjs/common';
import { ExtensionRegistry, IOAuth2ProviderExtension } from '@big-bus/extensions';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth/oauth')
export class OAuthExtensionController {
  private readonly logger = new Logger(OAuthExtensionController.name);

  constructor(
    @Inject('OAUTH_EXTENSION_REGISTRY')
    private readonly oauthRegistry: ExtensionRegistry,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('providers')
  getAvailableProviders() {
    const providers = this.oauthRegistry.getEnabled().map(ext => {
      const metadata = ext.getMetadata();
      const oauth = ext as IOAuth2ProviderExtension;
      return {
        id: metadata.id,
        name: metadata.name,
        version: metadata.version,
        supportedScopes: oauth.getSupportedScopes(),
      };
    });

    return {
      existing: [
        { id: 'google', name: 'Google', supportedScopes: ['openid', 'profile', 'email'] },
        { id: 'facebook', name: 'Facebook', supportedScopes: ['email', 'public_profile'] },
        { id: 'zalo', name: 'Zalo', supportedScopes: ['id', 'name', 'picture'] },
      ],
      extensions: providers,
    };
  }

  @Get(':provider/login')
  async initiateLogin(
    @Param('provider') provider: string,
    @Query('redirect_uri') redirectUri?: string,
  ) {
    const oauth = this.oauthRegistry.get<IOAuth2ProviderExtension>(provider);

    if (!oauth || !oauth.enabled) {
      throw new BadRequestException(`OAuth provider ${provider} not available`);
    }

    try {
      const defaultRedirectUri = this.configService.get(`${provider.toUpperCase()}_REDIRECT_URI`);
      const { authorizationUrl, state } = await oauth.getAuthorizationUrl({
        redirectUri: redirectUri || defaultRedirectUri,
        scope: ['openid', 'profile', 'email'],
      });

      this.logger.log(`Generated OAuth URL for ${provider}: ${authorizationUrl.substring(0, 50)}...`);

      return {
        provider,
        authorizationUrl,
        state,
      };
    } catch (error) {
      this.logger.error(`Error generating OAuth URL for ${provider}:`, error);
      throw new BadRequestException(`Failed to generate authorization URL: ${error.message}`);
    }
  }

  @Get(':provider/callback')
  async handleCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
  ) {
    if (error) {
      throw new BadRequestException(`OAuth error: ${error}`);
    }

    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    const oauth = this.oauthRegistry.get<IOAuth2ProviderExtension>(provider);

    if (!oauth || !oauth.enabled) {
      throw new BadRequestException(`OAuth provider ${provider} not available`);
    }

    try {
      // Exchange code for tokens
      const redirectUri = this.configService.get(`${provider.toUpperCase()}_REDIRECT_URI`);
      const tokens = await oauth.exchangeCodeForToken({
        code,
        redirectUri,
        state,
      });

      // Get user profile
      const profile = await oauth.getUserProfile(tokens.accessToken);

      this.logger.log(`OAuth callback successful for ${provider}, user: ${profile.email}`);

      // Find or create user in database
      const user = await this.authService.findOrCreateOAuthUser({
        provider,
        providerId: profile.id,
        email: profile.email,
        name: profile.name || `${profile.givenName || ''} ${profile.familyName || ''}`.trim(),
        picture: profile.picture,
        emailVerified: profile.emailVerified,
      });

      // Generate JWT token
      const jwt = this.authService.generateJWT(user);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
        token: jwt,
        provider,
      };
    } catch (error) {
      this.logger.error(`OAuth callback error for ${provider}:`, error);
      throw new BadRequestException(`OAuth authentication failed: ${error.message}`);
    }
  }

  @Get(':provider/refresh')
  async refreshToken(
    @Param('provider') provider: string,
    @Query('refresh_token') refreshToken: string,
  ) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const oauth = this.oauthRegistry.get<IOAuth2ProviderExtension>(provider);

    if (!oauth || !oauth.enabled) {
      throw new BadRequestException(`OAuth provider ${provider} not available`);
    }

    try {
      const tokens = await oauth.refreshAccessToken({ refreshToken });

      return {
        success: true,
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      };
    } catch (error) {
      this.logger.error(`Token refresh error for ${provider}:`, error);
      throw new BadRequestException(`Token refresh failed: ${error.message}`);
    }
  }
}
