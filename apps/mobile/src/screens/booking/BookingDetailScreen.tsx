import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Card, Loading } from '@components';
import { colors, spacing, typography } from '@utils/theme';
import { useBookingStore } from '@store/bookingStore';
import { formatDate, formatTime, formatCurrency } from '@utils/helpers';

const BookingDetailScreen = ({ route }: any) => {
  const { bookingId } = route.params;
  const { currentBooking, isLoadingBookings, getBookingById } = useBookingStore();

  useEffect(() => {
    getBookingById(bookingId);
  }, [bookingId]);

  if (isLoadingBookings || !currentBooking) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.qrCard}>
          <QRCode value={currentBooking.qrCode || currentBooking.id} size={200} />
        </Card>
        <Card>
          <Text style={styles.title}>Thông tin chuyến đi</Text>
          <Text style={styles.route}>{currentBooking.route?.from} → {currentBooking.route?.to}</Text>
          <Text style={styles.detail}>Ngày: {formatDate(currentBooking.schedule?.departureTime || '')}</Text>
          <Text style={styles.detail}>Giờ: {formatTime(currentBooking.schedule?.departureTime || '')}</Text>
          <Text style={styles.detail}>Ghế: {currentBooking.seatIds?.join(', ')}</Text>
          <Text style={styles.price}>Tổng: {formatCurrency(currentBooking.totalPrice)}</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  content: { padding: spacing.lg },
  qrCard: { alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.h5, marginBottom: spacing.md },
  route: { ...typography.h4, marginBottom: spacing.sm },
  detail: { ...typography.body1, color: colors.text.secondary, marginBottom: spacing.xs },
  price: { ...typography.h5, color: colors.primary.main, marginTop: spacing.md },
});

export default BookingDetailScreen;
