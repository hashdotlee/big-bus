import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button, Card } from '@components';
import { colors, spacing, typography } from '@utils/theme';

const BookingConfirmationScreen = ({ navigation, route }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="check-circle" size={80} color={colors.success} />
        <Text style={styles.title}>Đặt vé thành công!</Text>
        <Text style={styles.subtitle}>Vé của bạn đã được xác nhận</Text>
        <Card style={styles.card}>
          <Text style={styles.info}>Mã đặt vé: {route.params?.bookingId?.substring(0, 8)}</Text>
        </Card>
        <Button title="Xem vé" onPress={() => navigation.popToTop()} fullWidth />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  content: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h3, marginTop: spacing.lg, marginBottom: spacing.xs },
  subtitle: { ...typography.body1, color: colors.text.secondary, marginBottom: spacing.xl },
  card: { width: '100%', marginBottom: spacing.xl },
  info: { ...typography.body1 },
});

export default BookingConfirmationScreen;
