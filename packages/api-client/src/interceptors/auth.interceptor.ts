import { InternalAxiosRequestConfig } from 'axios';

// Token storage utility (can be replaced with more sophisticated storage)
let authToken: string | null = null;

export const setToken = (token: string | null): void => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }
};

export const getToken = (): string | null => {
  if (authToken) return authToken;

  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }

  return null;
};

export const clearToken = (): void => {
  authToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const authInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getToken();

  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
};
