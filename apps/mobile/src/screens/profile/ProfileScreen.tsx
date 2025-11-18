import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '@store/authStore';
import { Card } from '@components';
import { colors, spacing, typography, borderRadius } from '@utils/theme';
import { ROUTES } from '@utils/constants';
import { getInitials } from '@utils/helpers';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      icon: 'person',
      label: 'Chỉnh sửa hồ sơ',
      route: ROUTES.EDIT_PROFILE,
    },
    {
      icon: 'lock',
      label: 'Đổi mật khẩu',
      route: ROUTES.CHANGE_PASSWORD,
    },
    {
      icon: 'notifications',
      label: 'Thông báo',
      route: ROUTES.NOTIFICATIONS,
    },
    {
      icon: 'settings',
      label: 'Cài đặt',
      route: ROUTES.SETTINGS,
    },
    {
      icon: 'help',
      label: 'Trợ giúp',
      route: ROUTES.HELP,
      divider: true,
    },
  ];

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(user?.name || 'User')}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.route)}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIcon}>
                    <Icon name={item.icon} size={24} color={colors.primary.main} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
              {item.divider && <View style={styles.divider} />}
            </View>
          ))}

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Icon name="logout" size={24} color={colors.error} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.error }]}>Đăng xuất</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Text style={styles.version}>Phiên bản 1.0.0</Text>
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
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h2,
    color: colors.primary.contrast,
  },
  name: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    ...typography.body1,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  version: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default ProfileScreen;
