import { AxiosResponse } from 'axios';

export const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // Log response in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
  }

  return response;
};
