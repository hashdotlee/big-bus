import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import SearchScreen from '@screens/SearchScreen';
import {useBookingStore, Route} from '@store/bookingStore';

// Mock the booking store
jest.mock('@store/bookingStore');

describe('SearchScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockSearchRoutes = jest.fn();
  const mockSelectRoute = jest.fn();

  const mockRoutes: Route[] = [
    {
      id: '1',
      departure: 'Hanoi',
      destination: 'Saigon',
      departureTime: '08:00',
      arrivalTime: '20:00',
      price: 500000,
      availableSeats: 30,
      vehicleType: 'Limousine',
    },
    {
      id: '2',
      departure: 'Hanoi',
      destination: 'Saigon',
      departureTime: '14:00',
      arrivalTime: '02:00',
      price: 450000,
      availableSeats: 25,
      vehicleType: 'Sleeper',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useBookingStore as unknown as jest.Mock).mockReturnValue({
      searchRoutes: mockSearchRoutes,
      searchResults: [],
      isSearching: false,
      selectRoute: mockSelectRoute,
    });
  });

  describe('Rendering', () => {
    it('should render search screen correctly', () => {
      const {getByTestId, getByText} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      expect(getByTestId('search-screen')).toBeTruthy();
      expect(getByText('Search Bus Routes')).toBeTruthy();
      expect(getByTestId('departure-input')).toBeTruthy();
      expect(getByTestId('destination-input')).toBeTruthy();
      expect(getByTestId('date-input')).toBeTruthy();
      expect(getByTestId('search-button')).toBeTruthy();
    });

    it('should not show results when searchResults is empty', () => {
      const {queryByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      expect(queryByTestId('search-results')).toBeNull();
    });

    it('should show results when searchResults has data', () => {
      (useBookingStore as unknown as jest.Mock).mockReturnValue({
        searchRoutes: mockSearchRoutes,
        searchResults: mockRoutes,
        isSearching: false,
        selectRoute: mockSelectRoute,
      });

      const {getByTestId, getByText} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      expect(getByTestId('search-results')).toBeTruthy();
      expect(getByText('Found 2 routes')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('should update departure input', () => {
      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      const departureInput = getByTestId('departure-input');
      fireEvent.changeText(departureInput, 'Hanoi');

      expect(departureInput.props.value).toBe('Hanoi');
    });

    it('should update destination input', () => {
      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      const destinationInput = getByTestId('destination-input');
      fireEvent.changeText(destinationInput, 'Saigon');

      expect(destinationInput.props.value).toBe('Saigon');
    });

    it('should update date input', () => {
      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      const dateInput = getByTestId('date-input');
      fireEvent.changeText(dateInput, '2024-02-01');

      expect(dateInput.props.value).toBe('2024-02-01');
    });
  });

  describe('Search Submission', () => {
    it('should not search when fields are empty', () => {
      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      const searchButton = getByTestId('search-button');
      fireEvent.press(searchButton);

      expect(mockSearchRoutes).not.toHaveBeenCalled();
    });

    it('should call searchRoutes with correct parameters', async () => {
      mockSearchRoutes.mockResolvedValueOnce(undefined);

      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      const departureInput = getByTestId('departure-input');
      const destinationInput = getByTestId('destination-input');
      const dateInput = getByTestId('date-input');
      const searchButton = getByTestId('search-button');

      fireEvent.changeText(departureInput, 'Hanoi');
      fireEvent.changeText(destinationInput, 'Saigon');
      fireEvent.changeText(dateInput, '2024-02-01');
      fireEvent.press(searchButton);

      await waitFor(() => {
        expect(mockSearchRoutes).toHaveBeenCalledWith('Hanoi', 'Saigon', '2024-02-01');
      });
    });

    it('should handle search errors gracefully', async () => {
      mockSearchRoutes.mockRejectedValueOnce(new Error('Search failed'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      const departureInput = getByTestId('departure-input');
      const destinationInput = getByTestId('destination-input');
      const dateInput = getByTestId('date-input');
      const searchButton = getByTestId('search-button');

      fireEvent.changeText(departureInput, 'Hanoi');
      fireEvent.changeText(destinationInput, 'Saigon');
      fireEvent.changeText(dateInput, '2024-02-01');
      fireEvent.press(searchButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when searching', () => {
      (useBookingStore as unknown as jest.Mock).mockReturnValue({
        searchRoutes: mockSearchRoutes,
        searchResults: [],
        isSearching: true,
        selectRoute: mockSelectRoute,
      });

      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      const searchButton = getByTestId('search-button');
      expect(searchButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Route Selection', () => {
    it('should render route items correctly', () => {
      (useBookingStore as unknown as jest.Mock).mockReturnValue({
        searchRoutes: mockSearchRoutes,
        searchResults: mockRoutes,
        isSearching: false,
        selectRoute: mockSelectRoute,
      });

      const {getByText, getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      // Check first route
      expect(getByText('Hanoi → Saigon')).toBeTruthy();
      expect(getByText('500,000 VND')).toBeTruthy();
      expect(getByText('Departure: 08:00')).toBeTruthy();
      expect(getByText('Arrival: 20:00')).toBeTruthy();
      expect(getByText('Limousine')).toBeTruthy();
      expect(getByText('30 seats available')).toBeTruthy();
      expect(getByTestId('route-item-1')).toBeTruthy();
    });

    it('should call selectRoute and navigate when route is pressed', () => {
      (useBookingStore as unknown as jest.Mock).mockReturnValue({
        searchRoutes: mockSearchRoutes,
        searchResults: mockRoutes,
        isSearching: false,
        selectRoute: mockSelectRoute,
      });

      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      const routeItem = getByTestId('route-item-1');
      fireEvent.press(routeItem);

      expect(mockSelectRoute).toHaveBeenCalledWith(mockRoutes[0]);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('SeatSelection');
    });

    it('should render multiple route items', () => {
      (useBookingStore as unknown as jest.Mock).mockReturnValue({
        searchRoutes: mockSearchRoutes,
        searchResults: mockRoutes,
        isSearching: false,
        selectRoute: mockSelectRoute,
      });

      const {getByTestId, getByText} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      expect(getByTestId('route-item-1')).toBeTruthy();
      expect(getByTestId('route-item-2')).toBeTruthy();
      expect(getByText('450,000 VND')).toBeTruthy();
      expect(getByText('Sleeper')).toBeTruthy();
    });
  });

  describe('Results Display', () => {
    it('should show correct results count', () => {
      (useBookingStore as unknown as jest.Mock).mockReturnValue({
        searchRoutes: mockSearchRoutes,
        searchResults: mockRoutes,
        isSearching: false,
        selectRoute: mockSelectRoute,
      });

      const {getByText} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      expect(getByText('Found 2 routes')).toBeTruthy();
    });

    it('should show correct count for single result', () => {
      (useBookingStore as unknown as jest.Mock).mockReturnValue({
        searchRoutes: mockSearchRoutes,
        searchResults: [mockRoutes[0]],
        isSearching: false,
        selectRoute: mockSelectRoute,
      });

      const {getByText} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      expect(getByText('Found 1 routes')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper testIDs for automation', () => {
      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      expect(getByTestId('search-screen')).toBeTruthy();
      expect(getByTestId('departure-input')).toBeTruthy();
      expect(getByTestId('destination-input')).toBeTruthy();
      expect(getByTestId('date-input')).toBeTruthy();
      expect(getByTestId('search-button')).toBeTruthy();
    });

    it('should have testIDs for route items', () => {
      (useBookingStore as unknown as jest.Mock).mockReturnValue({
        searchRoutes: mockSearchRoutes,
        searchResults: mockRoutes,
        isSearching: false,
        selectRoute: mockSelectRoute,
      });

      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      mockRoutes.forEach((route) => {
        expect(getByTestId(`route-item-${route.id}`)).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search results', () => {
      (useBookingStore as unknown as jest.Mock).mockReturnValue({
        searchRoutes: mockSearchRoutes,
        searchResults: [],
        isSearching: false,
        selectRoute: mockSelectRoute,
      });

      const {queryByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      expect(queryByTestId('search-results')).toBeNull();
    });

    it('should handle partial form completion', () => {
      const {getByTestId} = render(
        <SearchScreen navigation={mockNavigation} />
      );

      const departureInput = getByTestId('departure-input');
      const searchButton = getByTestId('search-button');

      fireEvent.changeText(departureInput, 'Hanoi');
      fireEvent.press(searchButton);

      expect(mockSearchRoutes).not.toHaveBeenCalled();
    });
  });
});
