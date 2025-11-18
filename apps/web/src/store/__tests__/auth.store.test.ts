import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../auth.store'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset store state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })
  })

  describe('initial state', () => {
    it('should have null user and token initially', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('setAuth', () => {
    it('should set user and token correctly', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84987654321',
        role: 'customer',
      }
      const mockToken = 'mock-access-token'

      act(() => {
        result.current.setAuth(mockUser, mockToken)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.accessToken).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should persist auth state to localStorage', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84987654321',
        role: 'customer',
      }
      const mockToken = 'mock-access-token'

      act(() => {
        result.current.setAuth(mockUser, mockToken)
      })

      const stored = localStorage.getItem('auth-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.user).toEqual(mockUser)
      expect(parsed.state.accessToken).toBe(mockToken)
      expect(parsed.state.isAuthenticated).toBe(true)
    })
  })

  describe('clearAuth', () => {
    it('should clear authentication state', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84987654321',
        role: 'customer',
      }

      // Set auth first
      act(() => {
        result.current.setAuth(mockUser, 'mock-token')
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Clear auth
      act(() => {
        result.current.clearAuth()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should remove auth data from localStorage', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84987654321',
        role: 'customer',
      }

      act(() => {
        result.current.setAuth(mockUser, 'mock-token')
      })

      act(() => {
        result.current.clearAuth()
      })

      const stored = localStorage.getItem('auth-storage')
      const parsed = JSON.parse(stored!)
      expect(parsed.state.user).toBeNull()
      expect(parsed.state.accessToken).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user data partially', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84987654321',
        role: 'customer',
      }

      act(() => {
        result.current.setAuth(mockUser, 'mock-token')
      })

      act(() => {
        result.current.updateUser({
          firstName: 'Jane',
          phone: '+84999999999',
        })
      })

      expect(result.current.user).toEqual({
        ...mockUser,
        firstName: 'Jane',
        phone: '+84999999999',
      })
    })

    it('should not update if user is null', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.updateUser({
          firstName: 'Jane',
        })
      })

      expect(result.current.user).toBeNull()
    })

    it('should persist updated user to localStorage', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84987654321',
        role: 'customer',
      }

      act(() => {
        result.current.setAuth(mockUser, 'mock-token')
      })

      act(() => {
        result.current.updateUser({ firstName: 'Jane' })
      })

      const stored = localStorage.getItem('auth-storage')
      const parsed = JSON.parse(stored!)
      expect(parsed.state.user.firstName).toBe('Jane')
    })
  })

  describe('persistence', () => {
    it('should restore state from localStorage on init', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84987654321',
        role: 'customer',
      }

      // Set data in localStorage
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: mockUser,
            accessToken: 'mock-token',
            isAuthenticated: true,
          },
          version: 0,
        })
      )

      // Create new hook instance (simulates page reload)
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.accessToken).toBe('mock-token')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })
})
