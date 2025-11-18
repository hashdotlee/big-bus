import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '@store/authStore';
import { colors } from '@utils/theme';
import { ROUTES } from '@utils/constants';

// Auth Screens
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '@screens/home/HomeScreen';
import BookingsScreen from '@screens/bookings/BookingsScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';

// Booking Flow
import SearchScreen from '@screens/booking/SearchScreen';
import ScheduleScreen from '@screens/booking/ScheduleScreen';
import SeatSelectionScreen from '@screens/booking/SeatSelectionScreen';
import PaymentScreen from '@screens/booking/PaymentScreen';
import BookingConfirmationScreen from '@screens/booking/BookingConfirmationScreen';
import BookingDetailScreen from '@screens/booking/BookingDetailScreen';

// Other Screens
import TrackBusScreen from '@screens/tracking/TrackBusScreen';
import EditProfileScreen from '@screens/profile/EditProfileScreen';
import ChangePasswordScreen from '@screens/profile/ChangePasswordScreen';
import NotificationsScreen from '@screens/notifications/NotificationsScreen';
import SettingsScreen from '@screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === ROUTES.HOME) {
            iconName = 'home';
          } else if (route.name === ROUTES.BOOKINGS) {
            iconName = 'confirmation-number';
          } else if (route.name === ROUTES.PROFILE) {
            iconName = 'person';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        headerShown: false,
      })}>
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{ title: 'Trang chủ' }}
      />
      <Tab.Screen
        name={ROUTES.BOOKINGS}
        component={BookingsScreen}
        options={{ title: 'Vé của tôi' }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ title: 'Cá nhân' }}
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.SEARCH}
        component={SearchScreen}
        options={{ title: 'Tìm chuyến' }}
      />
      <Stack.Screen
        name={ROUTES.SCHEDULE}
        component={ScheduleScreen}
        options={{ title: 'Chọn lịch trình' }}
      />
      <Stack.Screen
        name={ROUTES.SEAT_SELECTION}
        component={SeatSelectionScreen}
        options={{ title: 'Chọn ghế' }}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT}
        component={PaymentScreen}
        options={{ title: 'Thanh toán' }}
      />
      <Stack.Screen
        name={ROUTES.BOOKING_CONFIRMATION}
        component={BookingConfirmationScreen}
        options={{ title: 'Xác nhận đặt vé', headerLeft: () => null }}
      />
      <Stack.Screen
        name={ROUTES.BOOKING_DETAIL}
        component={BookingDetailScreen}
        options={{ title: 'Chi tiết vé' }}
      />
      <Stack.Screen
        name={ROUTES.TRACK_BUS}
        component={TrackBusScreen}
        options={{ title: 'Theo dõi xe' }}
      />
      <Stack.Screen
        name={ROUTES.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{ title: 'Chỉnh sửa hồ sơ' }}
      />
      <Stack.Screen
        name={ROUTES.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
        options={{ title: 'Đổi mật khẩu' }}
      />
      <Stack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ title: 'Thông báo' }}
      />
      <Stack.Screen
        name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{ title: 'Cài đặt' }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
