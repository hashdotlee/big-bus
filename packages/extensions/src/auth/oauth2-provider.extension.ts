import { BaseExtension, ExtensionCategory } from '../core/base-extension';

/**
 * OAuth2 grant types
 */
export enum OAuth2GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  IMPLICIT = 'implicit',
  PASSWORD = 'password',
  CLIENT_CREDENTIALS = 'client_credentials',
  REFRESH_TOKEN = 'refresh_token',
}

/**
 * OAuth2 scope
 */
export interface OAuth2Scope {
  name: string;
  description: string;
  required?: boolean;
}

/**
 * OAuth2 provider configuration
 */
export interface OAuth2ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  scope?: string[];
  state?: string;
  responseType?: string;
  grantType?: OAuth2GrantType;
  [key: string]: any;
}

/**
 * OAuth2 authorization request
 */
export interface OAuth2AuthorizationRequest {
  redirectUri: string;
  scope?: string[];
  state?: string;
  prompt?: 'none' | 'consent' | 'select_account';
  loginHint?: string;
  [key: string]: any;
}

/**
 * OAuth2 authorization response
 */
export interface OAuth2AuthorizationResponse {
  authorizationUrl: string;
  state: string;
}

/**
 * OAuth2 token request
 */
export interface OAuth2TokenRequest {
  code: string;
  redirectUri: string;
  state?: string;
  [key: string]: any;
}

/**
 * OAuth2 token response
 */
export interface OAuth2TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  refreshToken?: string;
  scope?: string;
  idToken?: string;
  [key: string]: any;
}

/**
 * OAuth2 user profile
 */
export interface OAuth2UserProfile {
  id: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  locale?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  gender?: string;
  birthdate?: string;
  [key: string]: any;
}

/**
 * OAuth2 token refresh request
 */
export interface OAuth2RefreshTokenRequest {
  refreshToken: string;
}

/**
 * OAuth2 token revocation request
 */
export interface OAuth2TokenRevocationRequest {
  token: string;
  tokenTypeHint?: 'access_token' | 'refresh_token';
}

/**
 * Base interface for OAuth2 provider extensions
 */
export interface IOAuth2ProviderExtension extends BaseExtension {
  readonly category: ExtensionCategory.AUTHENTICATION;

  /**
   * Get supported scopes
   */
  getSupportedScopes(): OAuth2Scope[];

  /**
   * Get supported grant types
   */
  getSupportedGrantTypes(): OAuth2GrantType[];

  /**
   * Generate authorization URL
   */
  getAuthorizationUrl(request: OAuth2AuthorizationRequest): Promise<OAuth2AuthorizationResponse>;

  /**
   * Exchange authorization code for tokens
   */
  exchangeCodeForToken(request: OAuth2TokenRequest): Promise<OAuth2TokenResponse>;

  /**
   * Get user profile using access token
   */
  getUserProfile(accessToken: string): Promise<OAuth2UserProfile>;

  /**
   * Refresh access token
   */
  refreshAccessToken(request: OAuth2RefreshTokenRequest): Promise<OAuth2TokenResponse>;

  /**
   * Revoke token
   */
  revokeToken?(request: OAuth2TokenRevocationRequest): Promise<boolean>;

  /**
   * Validate access token
   */
  validateAccessToken?(accessToken: string): Promise<boolean>;

  /**
   * Parse ID token (for OIDC providers)
   */
  parseIdToken?(idToken: string): Promise<OAuth2UserProfile>;
}

/**
 * Abstract base class for OAuth2 provider extensions
 */
export abstract class BaseOAuth2ProviderExtension
  extends BaseExtension
  implements IOAuth2ProviderExtension
{
  readonly category = ExtensionCategory.AUTHENTICATION;
  protected providerConfig: OAuth2ProviderConfig;

  abstract getSupportedScopes(): OAuth2Scope[];
  abstract getSupportedGrantTypes(): OAuth2GrantType[];
  abstract getAuthorizationUrl(
    request: OAuth2AuthorizationRequest,
  ): Promise<OAuth2AuthorizationResponse>;
  abstract exchangeCodeForToken(request: OAuth2TokenRequest): Promise<OAuth2TokenResponse>;
  abstract getUserProfile(accessToken: string): Promise<OAuth2UserProfile>;

  async initialize(config: OAuth2ProviderConfig): Promise<void> {
    await super.initialize(config);
    this.providerConfig = config;
  }

  async refreshAccessToken(request: OAuth2RefreshTokenRequest): Promise<OAuth2TokenResponse> {
    throw new Error('Refresh token not implemented for this provider');
  }

  async revokeToken(request: OAuth2TokenRevocationRequest): Promise<boolean> {
    throw new Error('Token revocation not implemented for this provider');
  }

  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserProfile(accessToken);
      return true;
    } catch {
      return false;
    }
  }

  protected generateState(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  protected buildQueryString(params: Record<string, any>): string {
    return Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }
}
