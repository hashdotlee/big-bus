import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Config from 'react-native-config';
import { storage } from '@utils/storage';
import { STORAGE_KEYS } from '@utils/constants';

const API_URL = Config.API_URL || 'http://localhost:80';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              });

              const { accessToken } = response.data;
              await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Clear auth data and redirect to login
            await storage.multiRemove([
              STORAGE_KEYS.AUTH_TOKEN,
              STORAGE_KEYS.REFRESH_TOKEN,
              STORAGE_KEYS.USER_DATA,
            ]);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: { email: string; password: string; name: string; phone: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<{ name: string; phone: string; email: string }>) {
    const response = await this.client.put('/auth/profile', data);
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await this.client.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }

  // Booking endpoints
  async searchRoutes(from: string, to: string, date: string) {
    const response = await this.client.get('/booking/search', {
      params: { from, to, date },
    });
    return response.data;
  }

  async getSchedules(routeId: string, date: string) {
    const response = await this.client.get(`/booking/routes/${routeId}/schedules`, {
      params: { date },
    });
    return response.data;
  }

  async getAvailableSeats(scheduleId: string) {
    const response = await this.client.get(`/booking/schedules/${scheduleId}/seats`);
    return response.data;
  }

  async createBooking(data: {
    scheduleId: string;
    seatIds: string[];
    passengerInfo: {
      name: string;
      phone: string;
      email: string;
    };
  }) {
    const response = await this.client.post('/booking/bookings', data);
    return response.data;
  }

  async getBookings(params?: { status?: string; page?: number; limit?: number }) {
    const response = await this.client.get('/booking/bookings', { params });
    return response.data;
  }

  async getBookingById(id: string) {
    const response = await this.client.get(`/booking/bookings/${id}`);
    return response.data;
  }

  async cancelBooking(id: string, reason?: string) {
    const response = await this.client.post(`/booking/bookings/${id}/cancel`, { reason });
    return response.data;
  }

  // Payment endpoints
  async createPayment(bookingId: string, method: string) {
    const response = await this.client.post('/payment/create', {
      bookingId,
      method,
    });
    return response.data;
  }

  async getPaymentStatus(paymentId: string) {
    const response = await this.client.get(`/payment/status/${paymentId}`);
    return response.data;
  }

  async processPaymentCallback(data: any) {
    const response = await this.client.post('/payment/callback', data);
    return response.data;
  }

  // Vehicle tracking endpoints
  async getVehicleLocation(vehicleId: string) {
    const response = await this.client.get(`/vehicle/vehicles/${vehicleId}/location`);
    return response.data;
  }

  async trackVehicle(scheduleId: string) {
    const response = await this.client.get(`/vehicle/schedules/${scheduleId}/track`);
    return response.data;
  }

  // Notification endpoints
  async getNotifications(params?: { page?: number; limit?: number }) {
    const response = await this.client.get('/notification/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    const response = await this.client.put(`/notification/notifications/${id}/read`);
    return response.data;
  }

  async deleteNotification(id: string) {
    const response = await this.client.delete(`/notification/notifications/${id}`);
    return response.data;
  }

  async updateFCMToken(token: string) {
    const response = await this.client.post('/notification/fcm-token', { token });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
