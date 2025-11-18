import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '@store/authStore';
import { Card, Button } from '@components';
import { colors, spacing, typography, borderRadius } from '@utils/theme';
import { ROUTES } from '@utils/constants';

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();

  const quickActions = [
    { icon: 'search', label: 'Tìm chuyến', route: ROUTES.SEARCH },
    { icon: 'confirmation-number', label: 'Vé của tôi', route: ROUTES.BOOKINGS },
    { icon: 'location-on', label: 'Theo dõi xe', route: ROUTES.TRACK_BUS },
    { icon: 'notifications', label: 'Thông báo', route: ROUTES.NOTIFICATIONS },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào!</Text>
            <Text style={styles.userName}>{user?.name || 'Khách hàng'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.PROFILE)}>
            <View style={styles.avatar}>
              <Icon name="person" size={24} color={colors.primary.contrast} />
            </View>
          </TouchableOpacity>
        </View>

        <Card style={styles.searchCard}>
          <Text style={styles.searchTitle}>Đặt vé xe khách</Text>
          <Text style={styles.searchSubtitle}>
            Tìm và đặt vé xe khách nhanh chóng, tiện lợi
          </Text>
          <Button
            title="Tìm chuyến ngay"
            onPress={() => navigation.navigate(ROUTES.SEARCH)}
            fullWidth
            style={styles.searchButton}
          />
        </Card>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={() => navigation.navigate(action.route)}>
                <View style={styles.actionIcon}>
                  <Icon name={action.icon} size={28} color={colors.primary.main} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>

          <Card style={styles.featureCard}>
            <Icon name="qr-code" size={32} color={colors.primary.main} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Vé điện tử QR Code</Text>
              <Text style={styles.featureDescription}>
                Lên xe dễ dàng chỉ với mã QR
              </Text>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <Icon name="payment" size={32} color={colors.primary.main} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Thanh toán đa dạng</Text>
              <Text style={styles.featureDescription}>
                VNPay, Momo, ZaloPay, hoặc tiền mặt
              </Text>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <Icon name="notifications-active" size={32} color={colors.primary.main} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Thông báo thời gian thực</Text>
              <Text style={styles.featureDescription}>
                Cập nhật trạng thái vé liên tục
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  userName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary.main,
  },
  searchTitle: {
    ...typography.h4,
    color: colors.primary.contrast,
    marginBottom: spacing.xs,
  },
  searchSubtitle: {
    ...typography.body2,
    color: colors.primary.contrast,
    opacity: 0.9,
    marginBottom: spacing.md,
  },
  searchButton: {
    backgroundColor: colors.primary.contrast,
  },
  quickActions: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  actionItem: {
    width: '25%',
    padding: spacing.xs,
    alignItems: 'center',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
  },
  features: {
    marginBottom: spacing.lg,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  featureTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.body2,
    color: colors.text.secondary,
  },
});

export default HomeScreen;
