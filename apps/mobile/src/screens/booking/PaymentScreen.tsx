import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Button, Card, Input } from '@components';
import { colors, spacing, typography } from '@utils/theme';
import { useBookingStore } from '@store/bookingStore';
import { useAuthStore } from '@store/authStore';
import { ROUTES, PAYMENT_METHODS } from '@utils/constants';

const PaymentScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { createBooking, selectedSchedule, selectedSeats } = useBookingStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  const handlePayment = async () => {
    try {
      const booking = await createBooking({
        scheduleId: selectedSchedule?.id || '',
        seatIds: selectedSeats,
        passengerInfo: { name, phone, email },
      });
      navigation.navigate(ROUTES.BOOKING_CONFIRMATION, { bookingId: booking.id });
    } catch (error) {
      Alert.alert('Lỗi', 'Đặt vé thất bại');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.title}>Thông tin hành khách</Text>
          <Input label="Họ tên" placeholder="Nhập họ tên" value={name} onChangeText={setName} />
          <Input label="Số điện thoại" placeholder="Nhập số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Email" placeholder="Nhập email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        </Card>
        <Card style={styles.mt}>
          <Text style={styles.title}>Phương thức thanh toán</Text>
          <Text style={styles.method}>Tiền mặt</Text>
        </Card>
        <Button title="Xác nhận đặt vé" onPress={handlePayment} fullWidth style={styles.mt} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  content: { padding: spacing.lg },
  title: { ...typography.h5, marginBottom: spacing.md },
  method: { ...typography.body1 },
  mt: { marginTop: spacing.md },
});

export default PaymentScreen;
