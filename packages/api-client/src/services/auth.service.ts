import { BaseApiClient } from '../base-client';
import { SERVICE_URLS } from '../config';
import { setToken, clearToken } from '../interceptors';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export class AuthService extends BaseApiClient {
  constructor() {
    super({ baseURL: SERVICE_URLS.auth });
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/login', data);
    setToken(response.accessToken);
    return response;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/register', data);
    setToken(response.accessToken);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/logout');
    } finally {
      clearToken();
    }
  }

  async refreshToken(data: RefreshTokenDto): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/refresh', data);
    setToken(response.accessToken);
    return response;
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    return this.get('/me');
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    return this.post('/change-password', data);
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    return this.post('/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    return this.post('/reset-password', data);
  }

  async loginWithGoogle(token: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/oauth/google', { token });
    setToken(response.accessToken);
    return response;
  }

  async loginWithFacebook(token: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/oauth/facebook', { token });
    setToken(response.accessToken);
    return response;
  }

  async loginWithZalo(code: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/oauth/zalo', { code });
    setToken(response.accessToken);
    return response;
  }
}
