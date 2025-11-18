import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import SeatSelector from '@components/SeatSelector';
import {Seat} from '@store/bookingStore';

describe('SeatSelector Component', () => {
  const mockSeats: Seat[] = [
    {id: 's1', number: 'A1', isAvailable: true, price: 500000},
    {id: 's2', number: 'A2', isAvailable: true, price: 500000},
    {id: 's3', number: 'A3', isAvailable: false, price: 500000},
    {id: 's4', number: 'A4', isAvailable: true, price: 500000},
  ];

  const mockOnSelectSeat = jest.fn();
  const mockOnRemoveSeat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render seat selector', () => {
      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      expect(getByTestId('seat-selector')).toBeTruthy();
    });

    it('should render all seats', () => {
      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      mockSeats.forEach((seat) => {
        expect(getByTestId(`seat-${seat.number}`)).toBeTruthy();
      });
    });

    it('should render legend', () => {
      const {getByText} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      expect(getByText('Available')).toBeTruthy();
      expect(getByText('Selected')).toBeTruthy();
      expect(getByText('Unavailable')).toBeTruthy();
    });

    it('should render selected info', () => {
      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      expect(getByTestId('selected-info')).toBeTruthy();
    });
  });

  describe('Seat Selection', () => {
    it('should call onSelectSeat when available seat is pressed', () => {
      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      const seat = getByTestId('seat-A1');
      fireEvent.press(seat);

      expect(mockOnSelectSeat).toHaveBeenCalledWith(mockSeats[0]);
    });

    it('should not call onSelectSeat when unavailable seat is pressed', () => {
      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      const unavailableSeat = getByTestId('seat-A3');
      fireEvent.press(unavailableSeat);

      expect(mockOnSelectSeat).not.toHaveBeenCalled();
    });

    it('should call onRemoveSeat when selected seat is pressed', () => {
      const selectedSeats = [mockSeats[0]];

      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={selectedSeats}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      const seat = getByTestId('seat-A1');
      fireEvent.press(seat);

      expect(mockOnRemoveSeat).toHaveBeenCalledWith('s1');
    });

    it('should not select more seats than maxSeats', () => {
      const selectedSeats = [mockSeats[0], mockSeats[1]];

      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={selectedSeats}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
          maxSeats={2}
        />
      );

      const seat = getByTestId('seat-A4');
      fireEvent.press(seat);

      expect(mockOnSelectSeat).not.toHaveBeenCalled();
    });
  });

  describe('Selected Seats Display', () => {
    it('should display selected count', () => {
      const selectedSeats = [mockSeats[0], mockSeats[1]];

      const {getByText} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={selectedSeats}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      expect(getByText('Selected: 2/5')).toBeTruthy();
    });

    it('should display selected seat numbers', () => {
      const selectedSeats = [mockSeats[0], mockSeats[1]];

      const {getByText} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={selectedSeats}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      expect(getByText('Seats: A1, A2')).toBeTruthy();
    });

    it('should not display selected seats text when no seats selected', () => {
      const {queryByText} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      expect(queryByText(/Seats:/)).toBeNull();
    });

    it('should respect custom maxSeats', () => {
      const {getByText} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
          maxSeats={3}
        />
      );

      expect(getByText('Selected: 0/3')).toBeTruthy();
    });
  });

  describe('Seat Styling', () => {
    it('should apply different styles for available, selected, and unavailable seats', () => {
      const selectedSeats = [mockSeats[0]];

      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={selectedSeats}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      const selectedSeat = getByTestId('seat-A1');
      const availableSeat = getByTestId('seat-A2');
      const unavailableSeat = getByTestId('seat-A3');

      // Selected seat should have selected styles
      expect(selectedSeat.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#007AFF',
            borderColor: '#0056b3',
          }),
        ])
      );

      // Available seat should have available styles
      expect(availableSeat.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#fff',
            borderColor: '#28a745',
          }),
        ])
      );

      // Unavailable seat should have unavailable styles
      expect(unavailableSeat.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#e0e0e0',
            borderColor: '#999',
          }),
        ])
      );
    });
  });

  describe('Accessibility', () => {
    it('should disable unavailable seats', () => {
      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      const unavailableSeat = getByTestId('seat-A3');
      expect(unavailableSeat.props.accessibilityState.disabled).toBe(true);
    });

    it('should not disable available seats', () => {
      const {getByTestId} = render(
        <SeatSelector
          seats={mockSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      const availableSeat = getByTestId('seat-A1');
      expect(availableSeat.props.accessibilityState.disabled).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty seats array', () => {
      const {getByTestId} = render(
        <SeatSelector
          seats={[]}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      expect(getByTestId('seat-selector')).toBeTruthy();
      expect(getByTestId('selected-info')).toBeTruthy();
    });

    it('should handle all seats unavailable', () => {
      const unavailableSeats: Seat[] = mockSeats.map((seat) => ({
        ...seat,
        isAvailable: false,
      }));

      const {getByTestId} = render(
        <SeatSelector
          seats={unavailableSeats}
          selectedSeats={[]}
          onSelectSeat={mockOnSelectSeat}
          onRemoveSeat={mockOnRemoveSeat}
        />
      );

      unavailableSeats.forEach((seat) => {
        const seatElement = getByTestId(`seat-${seat.number}`);
        fireEvent.press(seatElement);
      });

      expect(mockOnSelectSeat).not.toHaveBeenCalled();
    });
  });
});
