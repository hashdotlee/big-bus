import { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // Add request timestamp
  config.headers.set('X-Request-Time', new Date().toISOString());

  // Add request ID for tracing
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  config.headers.set('X-Request-ID', requestId);

  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });
  }

  return config;
};
