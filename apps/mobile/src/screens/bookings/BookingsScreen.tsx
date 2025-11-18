import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useBookingStore } from '@store/bookingStore';
import { Card, Loading } from '@components';
import { colors, spacing, typography } from '@utils/theme';
import { formatDate, formatTime, formatCurrency } from '@utils/helpers';
import { ROUTES } from '@utils/constants';

const BookingsScreen = ({ navigation }: any) => {
  const { bookings, isLoadingBookings, getBookings } = useBookingStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      await getBookings();
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      case 'completed':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  const renderBookingItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(ROUTES.BOOKING_DETAIL, { bookingId: item.id })}>
      <Card style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View>
            <Text style={styles.routeText}>
              {item.route?.from} → {item.route?.to}
            </Text>
            <Text style={styles.dateText}>
              {formatDate(item.schedule?.departureTime)} • {formatTime(item.schedule?.departureTime)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Icon name="event-seat" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              Số ghế: {item.seatIds?.join(', ')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="payments" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {formatCurrency(item.totalPrice)}
            </Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <Text style={styles.bookingId}>Mã đặt vé: {item.id.substring(0, 8)}</Text>
          <Icon name="chevron-right" size={24} color={colors.text.secondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isLoadingBookings && !refreshing) {
    return <Loading fullScreen message="Đang tải danh sách vé..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vé của tôi</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="confirmation-number" size={64} color={colors.text.disabled} />
          <Text style={styles.emptyTitle}>Chưa có vé nào</Text>
          <Text style={styles.emptySubtitle}>
            Bạn chưa đặt vé nào. Hãy tìm và đặt vé ngay!
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  list: {
    padding: spacing.lg,
  },
  bookingCard: {
    marginBottom: spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  routeText: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dateText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  bookingId: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default BookingsScreen;
