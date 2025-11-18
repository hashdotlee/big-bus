import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Card, Loading } from '@components';
import { colors, spacing, typography } from '@utils/theme';
import { useBookingStore } from '@store/bookingStore';
import { formatTime, formatCurrency } from '@utils/helpers';
import { ROUTES } from '@utils/constants';

const ScheduleScreen = ({ navigation, route }: any) => {
  const { schedules, isLoadingSchedules, getSchedules, selectSchedule, searchResults } = useBookingStore();
  const { from, to, date } = route.params;

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    const routeId = searchResults[0]?.id || 'route-1';
    await getSchedules(routeId, date);
  };

  const handleSelectSchedule = (schedule: any) => {
    selectSchedule(schedule);
    navigation.navigate(ROUTES.SEAT_SELECTION, { scheduleId: schedule.id });
  };

  if (isLoadingSchedules) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectSchedule(item)}>
            <Card style={styles.card}>
              <Text style={styles.time}>{formatTime(item.departureTime)}</Text>
              <Text style={styles.price}>{formatCurrency(item.price)}</Text>
              <Text style={styles.seats}>Còn {item.availableSeats} chỗ</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  list: { padding: spacing.lg },
  card: { marginBottom: spacing.md },
  time: { ...typography.h4, color: colors.text.primary },
  price: { ...typography.body1, color: colors.primary.main, marginTop: spacing.xs },
  seats: { ...typography.body2, color: colors.text.secondary, marginTop: spacing.xs },
});

export default ScheduleScreen;
