import { create } from 'zustand';
import { storage } from '@utils/storage';
import { STORAGE_KEYS } from '@utils/constants';
import apiService from '@services/api';
import socketService from '@services/socket';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiService.login(email, password);
      const { user, accessToken, refreshToken } = response;

      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await storage.setItem(STORAGE_KEYS.USER_DATA, user);

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Connect to socket after login
      await socketService.connect();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiService.register(data);
      const { user, accessToken, refreshToken } = response;

      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await storage.setItem(STORAGE_KEYS.USER_DATA, user);

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Connect to socket after registration
      await socketService.connect();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });

      await apiService.logout();

      await storage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      socketService.disconnect();

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });

      const token = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await storage.getItem<User>(STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });

        // Fetch fresh user data
        try {
          const response = await apiService.getProfile();
          await storage.setItem(STORAGE_KEYS.USER_DATA, response.user);
          set({ user: response.user });

          // Connect to socket
          await socketService.connect();
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Load user error:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiService.updateProfile(data);
      const updatedUser = response.user;

      await storage.setItem(STORAGE_KEYS.USER_DATA, updatedUser);

      set({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Update profile failed',
        isLoading: false,
      });
      throw error;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null });

      await apiService.changePassword(oldPassword, newPassword);

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Change password failed',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
