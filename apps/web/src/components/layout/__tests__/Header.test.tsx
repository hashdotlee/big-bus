import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../Header'
import { useAuth } from '@/hooks/useAuth'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock useAuth hook
jest.mock('@/hooks/useAuth')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Header', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      })
    })

    it('should render Big Bus logo', () => {
      render(<Header />)
      expect(screen.getByText('Big Bus')).toBeInTheDocument()
    })

    it('should render Search link', () => {
      render(<Header />)
      const searchLink = screen.getByText('Search')
      expect(searchLink).toBeInTheDocument()
      expect(searchLink.closest('a')).toHaveAttribute('href', '/search')
    })

    it('should render Login and Register links', () => {
      render(<Header />)

      const loginLink = screen.getByText('Login')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login')

      const registerLink = screen.getByText('Register')
      expect(registerLink).toBeInTheDocument()
      expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
    })

    it('should not render authenticated user links', () => {
      render(<Header />)

      expect(screen.queryByText('My Bookings')).not.toBeInTheDocument()
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
      expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })
  })

  describe('when user is authenticated', () => {
    const mockLogout = jest.fn()

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+84987654321',
          role: 'customer',
        },
        isAuthenticated: true,
        login: jest.fn(),
        logout: mockLogout,
        register: jest.fn(),
      })
    })

    it('should render Big Bus logo', () => {
      render(<Header />)
      expect(screen.getByText('Big Bus')).toBeInTheDocument()
    })

    it('should render Search link', () => {
      render(<Header />)
      const searchLink = screen.getByText('Search')
      expect(searchLink).toBeInTheDocument()
    })

    it('should render authenticated user links', () => {
      render(<Header />)

      const bookingsLink = screen.getByText('My Bookings')
      expect(bookingsLink).toBeInTheDocument()
      expect(bookingsLink.closest('a')).toHaveAttribute('href', '/bookings')

      const profileLink = screen.getByText('Profile')
      expect(profileLink).toBeInTheDocument()
      expect(profileLink.closest('a')).toHaveAttribute('href', '/profile')

      const logoutButton = screen.getByText('Logout')
      expect(logoutButton).toBeInTheDocument()
    })

    it('should not render Login and Register links', () => {
      render(<Header />)

      expect(screen.queryByText('Login')).not.toBeInTheDocument()
      expect(screen.queryByText('Register')).not.toBeInTheDocument()
    })

    it('should call logout function when Logout button is clicked', () => {
      render(<Header />)

      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)

      expect(mockLogout).toHaveBeenCalledTimes(1)
    })
  })

  describe('navigation structure', () => {
    it('should have proper semantic HTML structure', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      })

      render(<Header />)

      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()

      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should have all links accessible', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      })

      render(<Header />)

      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)

      links.forEach((link) => {
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('styling', () => {
    it('should apply correct CSS classes to header', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      })

      render(<Header />)

      const header = screen.getByRole('banner')
      expect(header).toHaveClass('bg-white', 'shadow-sm')
    })

    it('should apply hover styles to navigation links', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      })

      render(<Header />)

      const searchLink = screen.getByText('Search')
      expect(searchLink).toHaveClass('hover:text-primary-600')
    })
  })
})
