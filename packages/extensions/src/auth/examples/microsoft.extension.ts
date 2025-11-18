import {
  BaseOAuth2ProviderExtension,
  OAuth2Scope,
  OAuth2GrantType,
  OAuth2AuthorizationRequest,
  OAuth2AuthorizationResponse,
  OAuth2TokenRequest,
  OAuth2TokenResponse,
  OAuth2UserProfile,
} from '../oauth2-provider.extension';

/**
 * Microsoft OAuth2 Provider Extension
 * Supports Microsoft Account, Azure AD, and Office 365 authentication
 */
export class MicrosoftOAuth2Extension extends BaseOAuth2ProviderExtension {
  readonly id = 'microsoft';
  readonly name = 'Microsoft';
  readonly version = '1.0.0';
  description = 'Microsoft OAuth2 authentication provider';
  author = 'Big Bus';

  getSupportedScopes(): OAuth2Scope[] {
    return [
      {
        name: 'openid',
        description: 'OpenID Connect authentication',
        required: true,
      },
      {
        name: 'profile',
        description: 'Access user profile information',
        required: true,
      },
      {
        name: 'email',
        description: 'Access user email address',
        required: true,
      },
      {
        name: 'User.Read',
        description: 'Read user profile',
        required: false,
      },
      {
        name: 'offline_access',
        description: 'Refresh token access',
        required: false,
      },
    ];
  }

  getSupportedGrantTypes(): OAuth2GrantType[] {
    return [
      OAuth2GrantType.AUTHORIZATION_CODE,
      OAuth2GrantType.REFRESH_TOKEN,
      OAuth2GrantType.CLIENT_CREDENTIALS,
    ];
  }

  async getAuthorizationUrl(
    request: OAuth2AuthorizationRequest,
  ): Promise<OAuth2AuthorizationResponse> {
    const state = this.generateState();
    const scope = request.scope?.join(' ') || 'openid profile email';

    const params = {
      client_id: this.providerConfig.clientId,
      response_type: 'code',
      redirect_uri: request.redirectUri,
      scope,
      state,
      response_mode: 'query',
      prompt: request.prompt,
      login_hint: request.loginHint,
    };

    const authorizationUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${this.buildQueryString(params)}`;

    return {
      authorizationUrl,
      state,
    };
  }

  async exchangeCodeForToken(request: OAuth2TokenRequest): Promise<OAuth2TokenResponse> {
    // In a real implementation, call Microsoft token endpoint
    // const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    //   method: 'POST',
    //   body: new URLSearchParams({
    //     client_id: this.providerConfig.clientId,
    //     client_secret: this.providerConfig.clientSecret,
    //     code: request.code,
    //     redirect_uri: request.redirectUri,
    //     grant_type: 'authorization_code',
    //   }),
    // });

    // Mock response
    return {
      accessToken: `ms_access_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
      refreshToken: `ms_refresh_${Date.now()}`,
      scope: 'openid profile email User.Read',
      idToken: 'mock_id_token',
    };
  }

  async getUserProfile(accessToken: string): Promise<OAuth2UserProfile> {
    // In a real implementation, call Microsoft Graph API
    // const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    // });

    // Mock response
    return {
      id: 'ms_user_123456',
      email: 'user@example.com',
      emailVerified: true,
      name: 'John Doe',
      givenName: 'John',
      familyName: 'Doe',
      picture: 'https://graph.microsoft.com/v1.0/me/photo/$value',
      locale: 'en-US',
    };
  }

  async refreshAccessToken(request: any): Promise<OAuth2TokenResponse> {
    // In a real implementation, call Microsoft token endpoint with refresh_token grant
    return {
      accessToken: `ms_access_refreshed_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: 'openid profile email User.Read',
    };
  }

  async revokeToken(request: any): Promise<boolean> {
    // Microsoft doesn't have a standard revoke endpoint for consumer accounts
    // For Azure AD apps, you would call the logout endpoint
    return true;
  }
}
