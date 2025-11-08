import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { ApiClientConfig, DEFAULT_CONFIG } from './config';
import { authInterceptor, errorInterceptor, requestInterceptor, responseInterceptor } from './interceptors';

export class BaseApiClient {
  protected client: AxiosInstance;

  constructor(config: Partial<ApiClientConfig> = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    this.client = axios.create({
      baseURL: finalConfig.baseURL,
      timeout: finalConfig.timeout,
      withCredentials: finalConfig.withCredentials,
      headers: finalConfig.headers,
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptors
    this.client.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
    this.client.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

    // Response interceptors
    this.client.interceptors.response.use(responseInterceptor, errorInterceptor);
  }

  public setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  protected async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}
