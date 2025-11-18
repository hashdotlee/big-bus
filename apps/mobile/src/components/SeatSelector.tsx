import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Seat} from '@store/bookingStore';

interface SeatSelectorProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSelectSeat: (seat: Seat) => void;
  onRemoveSeat: (seatId: string) => void;
  maxSeats?: number;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({
  seats,
  selectedSeats,
  onSelectSeat,
  onRemoveSeat,
  maxSeats = 5,
}) => {
  const isSeatSelected = (seatId: string) => {
    return selectedSeats.some((seat) => seat.id === seatId);
  };

  const handleSeatPress = (seat: Seat) => {
    if (!seat.isAvailable) {
      return;
    }

    const isSelected = isSeatSelected(seat.id);

    if (isSelected) {
      onRemoveSeat(seat.id);
    } else {
      if (selectedSeats.length >= maxSeats) {
        return; // Max seats reached
      }
      onSelectSeat(seat);
    }
  };

  const getSeatStyle = (seat: Seat) => {
    if (!seat.isAvailable) {
      return [styles.seat, styles.unavailableSeat];
    }
    if (isSeatSelected(seat.id)) {
      return [styles.seat, styles.selectedSeat];
    }
    return [styles.seat, styles.availableSeat];
  };

  return (
    <View style={styles.container} testID="seat-selector">
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.availableSeat]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.selectedSeat]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.unavailableSeat]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>

      <View style={styles.seatsGrid}>
        {seats.map((seat) => (
          <TouchableOpacity
            key={seat.id}
            style={getSeatStyle(seat)}
            onPress={() => handleSeatPress(seat)}
            disabled={!seat.isAvailable}
            testID={`seat-${seat.number}`}>
            <Text
              style={[
                styles.seatText,
                !seat.isAvailable && styles.unavailableSeatText,
                isSeatSelected(seat.id) && styles.selectedSeatText,
              ]}>
              {seat.number}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.selectedInfo} testID="selected-info">
        <Text style={styles.selectedCount}>
          Selected: {selectedSeats.length}/{maxSeats}
        </Text>
        {selectedSeats.length > 0 && (
          <Text style={styles.selectedSeatsText}>
            Seats: {selectedSeats.map((s) => s.number).join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  seat: {
    width: 50,
    height: 50,
    margin: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  availableSeat: {
    backgroundColor: '#fff',
    borderColor: '#28a745',
  },
  selectedSeat: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
  },
  unavailableSeat: {
    backgroundColor: '#e0e0e0',
    borderColor: '#999',
  },
  seatText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  selectedSeatText: {
    color: '#fff',
  },
  unavailableSeatText: {
    color: '#999',
  },
  selectedInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  selectedSeatsText: {
    fontSize: 14,
    color: '#666',
  },
});

export default SeatSelector;
