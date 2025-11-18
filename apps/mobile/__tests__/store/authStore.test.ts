import {renderHook, act, waitFor} from '@testing-library/react-native';
import {useAuthStore} from '@store/authStore';

// Mock fetch globally
global.fetch = jest.fn();

describe('authStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const {result} = renderHook(() => useAuthStore());
    act(() => {
      result.current.clearAuth();
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const {result} = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'user',
      };
      const mockToken = 'mock-jwt-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({user: mockUser, token: mockToken}),
      });

      const {result} = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle login failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const {result} = renderHook(() => useAuthStore());

      await expect(
        act(async () => {
          await result.current.login('wrong@example.com', 'wrongpassword');
        })
      ).rejects.toThrow('Login failed');

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during login', async () => {
      let resolveLogin: any;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      (global.fetch as jest.Mock).mockImplementationOnce(() => loginPromise);

      const {result} = renderHook(() => useAuthStore());

      act(() => {
        result.current.login('test@example.com', 'password123');
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the login
      await act(async () => {
        resolveLogin({
          ok: true,
          json: async () => ({
            user: {id: '1', email: 'test@example.com', fullName: 'Test', role: 'user'},
            token: 'token',
          }),
        });
        await loginPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('loginWithOAuth', () => {
    it('should successfully login with Google OAuth', async () => {
      const mockUser = {
        id: '2',
        email: 'google@example.com',
        fullName: 'Google User',
        role: 'user',
      };
      const mockToken = 'oauth-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({user: mockUser, token: mockToken}),
      });

      const {result} = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loginWithOAuth('google', 'google-oauth-token');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should successfully login with Facebook OAuth', async () => {
      const mockUser = {
        id: '3',
        email: 'facebook@example.com',
        fullName: 'Facebook User',
        role: 'user',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({user: mockUser, token: 'fb-token'}),
      });

      const {result} = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loginWithOAuth('facebook', 'fb-oauth-token');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle OAuth login failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const {result} = renderHook(() => useAuthStore());

      await expect(
        act(async () => {
          await result.current.loginWithOAuth('google', 'invalid-token');
        })
      ).rejects.toThrow('OAuth login failed');

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '4',
        email: 'newuser@example.com',
        fullName: 'New User',
        role: 'user',
      };
      const mockToken = 'new-user-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({user: mockUser, token: mockToken}),
      });

      const {result} = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register(
          'newuser@example.com',
          'password123',
          'New User'
        );
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle registration failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const {result} = renderHook(() => useAuthStore());

      await expect(
        act(async () => {
          await result.current.register(
            'existing@example.com',
            'password123',
            'Existing User'
          );
        })
      ).rejects.toThrow('Registration failed');

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user data on logout', async () => {
      const {result} = renderHook(() => useAuthStore());

      // First login
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {id: '1', email: 'test@example.com', fullName: 'Test', role: 'user'},
          token: 'token',
        }),
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and token directly', () => {
      const {result} = renderHook(() => useAuthStore());

      const mockUser = {
        id: '5',
        email: 'direct@example.com',
        fullName: 'Direct User',
        role: 'user',
      };

      act(() => {
        result.current.setUser(mockUser, 'direct-token');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('direct-token');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('clearAuth', () => {
    it('should clear all auth data', async () => {
      const {result} = renderHook(() => useAuthStore());

      // First set some data
      act(() => {
        result.current.setUser(
          {id: '1', email: 'test@example.com', fullName: 'Test', role: 'user'},
          'token'
        );
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Clear auth
      act(() => {
        result.current.clearAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
