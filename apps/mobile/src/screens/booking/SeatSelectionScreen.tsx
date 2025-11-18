import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Button, Loading } from '@components';
import { colors, spacing, typography } from '@utils/theme';
import { useBookingStore } from '@store/bookingStore';
import { ROUTES } from '@utils/constants';

const SeatSelectionScreen = ({ navigation, route }: any) => {
  const { scheduleId } = route.params;
  const { seats, selectedSeats, isLoadingSeats, getSeats, toggleSeat } = useBookingStore();

  useEffect(() => {
    getSeats(scheduleId);
  }, []);

  const handleContinue = () => {
    navigation.navigate(ROUTES.PAYMENT);
  };

  if (isLoadingSeats) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.seatGrid}>
          {seats.map((seat) => (
            <TouchableOpacity
              key={seat.id}
              style={[
                styles.seat,
                seat.status === 'booked' && styles.seatBooked,
                seat.status === 'selected' && styles.seatSelected,
              ]}
              onPress={() => toggleSeat(seat.id)}
              disabled={seat.status === 'booked'}>
              <Text style={styles.seatNumber}>{seat.number}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.selectedText}>Đã chọn: {selectedSeats.length} ghế</Text>
        <Button title="Tiếp tục" onPress={handleContinue} disabled={selectedSeats.length === 0} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  content: { padding: spacing.lg },
  seatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  seat: { width: 60, height: 60, backgroundColor: colors.success, borderRadius: 8, justifyContent: 'center', alignItems: 'center', margin: spacing.xs },
  seatBooked: { backgroundColor: colors.text.disabled },
  seatSelected: { backgroundColor: colors.primary.main },
  seatNumber: { ...typography.body1, color: colors.primary.contrast },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border.light },
  selectedText: { ...typography.body1, marginBottom: spacing.md },
});

export default SeatSelectionScreen;
