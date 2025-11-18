import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Button, Input, Card } from '@components';
import { colors, spacing, typography } from '@utils/theme';
import { useBookingStore } from '@store/bookingStore';
import { ROUTES } from '@utils/constants';

const SearchScreen = ({ navigation }: any) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { searchRoutes, isSearching } = useBookingStore();

  const handleSearch = async () => {
    try {
      await searchRoutes(from, to, date);
      navigation.navigate(ROUTES.SCHEDULE, { from, to, date });
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Input label="Điểm đi" placeholder="Nhập điểm đi" value={from} onChangeText={setFrom} leftIcon="location-on" />
          <Input label="Điểm đến" placeholder="Nhập điểm đến" value={to} onChangeText={setTo} leftIcon="location-on" />
          <Input label="Ngày đi" placeholder="Chọn ngày" value={date} onChangeText={setDate} leftIcon="event" />
          <Button title="Tìm chuyến" onPress={handleSearch} loading={isSearching} fullWidth />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  content: { padding: spacing.lg },
});

export default SearchScreen;
