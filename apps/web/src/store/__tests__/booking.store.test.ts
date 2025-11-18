import { renderHook, act } from '@testing-library/react'
import { useBookingStore } from '../booking.store'

describe('useBookingStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBookingStore.setState({
      searchParams: null,
      selectedSchedule: null,
      selectedSeats: [],
      passengerInfo: null,
    })
  })

  describe('initial state', () => {
    it('should have null/empty initial values', () => {
      const { result } = renderHook(() => useBookingStore())

      expect(result.current.searchParams).toBeNull()
      expect(result.current.selectedSchedule).toBeNull()
      expect(result.current.selectedSeats).toEqual([])
      expect(result.current.passengerInfo).toBeNull()
    })
  })

  describe('setSearchParams', () => {
    it('should set search parameters correctly', () => {
      const { result } = renderHook(() => useBookingStore())

      const mockParams = {
        origin: 'Hanoi',
        destination: 'Ho Chi Minh City',
        date: '2024-12-25',
        passengers: 2,
      }

      act(() => {
        result.current.setSearchParams(mockParams)
      })

      expect(result.current.searchParams).toEqual(mockParams)
    })

    it('should update search parameters when called multiple times', () => {
      const { result } = renderHook(() => useBookingStore())

      const firstParams = {
        origin: 'Hanoi',
        destination: 'Da Nang',
        date: '2024-12-25',
        passengers: 1,
      }

      const secondParams = {
        origin: 'Ho Chi Minh City',
        destination: 'Nha Trang',
        date: '2024-12-30',
        passengers: 3,
      }

      act(() => {
        result.current.setSearchParams(firstParams)
      })
      expect(result.current.searchParams).toEqual(firstParams)

      act(() => {
        result.current.setSearchParams(secondParams)
      })
      expect(result.current.searchParams).toEqual(secondParams)
    })
  })

  describe('setSelectedSchedule', () => {
    it('should set selected schedule', () => {
      const { result } = renderHook(() => useBookingStore())

      const mockSchedule = {
        id: 'schedule-1',
        departureTime: '08:00',
        arrivalTime: '20:00',
        price: 350000,
        availableSeats: 20,
      }

      act(() => {
        result.current.setSelectedSchedule(mockSchedule)
      })

      expect(result.current.selectedSchedule).toEqual(mockSchedule)
    })
  })

  describe('setSelectedSeats', () => {
    it('should set selected seats array', () => {
      const { result } = renderHook(() => useBookingStore())

      const seats = ['A1', 'A2', 'B1']

      act(() => {
        result.current.setSelectedSeats(seats)
      })

      expect(result.current.selectedSeats).toEqual(seats)
    })

    it('should replace previous seats when called again', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setSelectedSeats(['A1', 'A2'])
      })
      expect(result.current.selectedSeats).toEqual(['A1', 'A2'])

      act(() => {
        result.current.setSelectedSeats(['B1', 'B2', 'B3'])
      })
      expect(result.current.selectedSeats).toEqual(['B1', 'B2', 'B3'])
    })

    it('should handle empty seats array', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setSelectedSeats(['A1'])
      })
      expect(result.current.selectedSeats).toEqual(['A1'])

      act(() => {
        result.current.setSelectedSeats([])
      })
      expect(result.current.selectedSeats).toEqual([])
    })
  })

  describe('setPassengerInfo', () => {
    it('should set passenger information', () => {
      const { result } = renderHook(() => useBookingStore())

      const passengerInfo = {
        passengers: [
          {
            name: 'John Doe',
            phone: '+84987654321',
            email: 'john@example.com',
          },
          {
            name: 'Jane Doe',
            phone: '+84987654322',
            email: 'jane@example.com',
          },
        ],
        contactInfo: {
          email: 'john@example.com',
          phone: '+84987654321',
        },
      }

      act(() => {
        result.current.setPassengerInfo(passengerInfo)
      })

      expect(result.current.passengerInfo).toEqual(passengerInfo)
    })
  })

  describe('clearBooking', () => {
    it('should reset all booking state to initial values', () => {
      const { result } = renderHook(() => useBookingStore())

      // Set all values first
      act(() => {
        result.current.setSearchParams({
          origin: 'Hanoi',
          destination: 'HCMC',
          date: '2024-12-25',
          passengers: 2,
        })
        result.current.setSelectedSchedule({ id: 'schedule-1' })
        result.current.setSelectedSeats(['A1', 'A2'])
        result.current.setPassengerInfo({ name: 'John' })
      })

      // Verify values are set
      expect(result.current.searchParams).not.toBeNull()
      expect(result.current.selectedSchedule).not.toBeNull()
      expect(result.current.selectedSeats.length).toBeGreaterThan(0)
      expect(result.current.passengerInfo).not.toBeNull()

      // Clear booking
      act(() => {
        result.current.clearBooking()
      })

      // Verify all values are reset
      expect(result.current.searchParams).toBeNull()
      expect(result.current.selectedSchedule).toBeNull()
      expect(result.current.selectedSeats).toEqual([])
      expect(result.current.passengerInfo).toBeNull()
    })

    it('should work when called on already empty state', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.clearBooking()
      })

      expect(result.current.searchParams).toBeNull()
      expect(result.current.selectedSchedule).toBeNull()
      expect(result.current.selectedSeats).toEqual([])
      expect(result.current.passengerInfo).toBeNull()
    })
  })

  describe('booking flow', () => {
    it('should support complete booking flow', () => {
      const { result } = renderHook(() => useBookingStore())

      // Step 1: Search
      act(() => {
        result.current.setSearchParams({
          origin: 'Hanoi',
          destination: 'HCMC',
          date: '2024-12-25',
          passengers: 2,
        })
      })
      expect(result.current.searchParams?.origin).toBe('Hanoi')

      // Step 2: Select schedule
      act(() => {
        result.current.setSelectedSchedule({
          id: 'schedule-1',
          price: 350000,
        })
      })
      expect(result.current.selectedSchedule?.id).toBe('schedule-1')

      // Step 3: Select seats
      act(() => {
        result.current.setSelectedSeats(['A1', 'A2'])
      })
      expect(result.current.selectedSeats).toHaveLength(2)

      // Step 4: Enter passenger info
      act(() => {
        result.current.setPassengerInfo({
          passengers: [{ name: 'John' }, { name: 'Jane' }],
        })
      })
      expect(result.current.passengerInfo).toBeTruthy()

      // Verify all data is present
      expect(result.current.searchParams).not.toBeNull()
      expect(result.current.selectedSchedule).not.toBeNull()
      expect(result.current.selectedSeats.length).toBe(2)
      expect(result.current.passengerInfo).not.toBeNull()
    })
  })
})
