import { AxiosError } from 'axios';
import { clearToken } from './auth.interceptor';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

export class ApiException extends Error {
  public statusCode: number;
  public error?: string;
  public details?: any;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.statusCode = apiError.statusCode;
    this.error = apiError.error;
    this.details = apiError.details;
    this.name = 'ApiException';
  }
}

export const errorInterceptor = async (error: AxiosError): Promise<never> => {
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
  }

  // Handle network errors
  if (!error.response) {
    throw new ApiException({
      message: 'Network error. Please check your connection.',
      statusCode: 0,
      error: 'NETWORK_ERROR',
    });
  }

  const { status, data } = error.response;

  // Handle authentication errors
  if (status === 401) {
    clearToken();

    // Redirect to login if in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    throw new ApiException({
      message: 'Authentication required. Please login.',
      statusCode: 401,
      error: 'UNAUTHORIZED',
      details: data,
    });
  }

  // Handle authorization errors
  if (status === 403) {
    throw new ApiException({
      message: 'You do not have permission to perform this action.',
      statusCode: 403,
      error: 'FORBIDDEN',
      details: data,
    });
  }

  // Handle not found errors
  if (status === 404) {
    throw new ApiException({
      message: 'The requested resource was not found.',
      statusCode: 404,
      error: 'NOT_FOUND',
      details: data,
    });
  }

  // Handle validation errors
  if (status === 422) {
    throw new ApiException({
      message: 'Validation failed. Please check your input.',
      statusCode: 422,
      error: 'VALIDATION_ERROR',
      details: data,
    });
  }

  // Handle server errors
  if (status >= 500) {
    throw new ApiException({
      message: 'Server error. Please try again later.',
      statusCode: status,
      error: 'SERVER_ERROR',
      details: data,
    });
  }

  // Handle other errors
  throw new ApiException({
    message: (data as any)?.message || 'An unexpected error occurred.',
    statusCode: status,
    error: (data as any)?.error || 'UNKNOWN_ERROR',
    details: data,
  });
};
