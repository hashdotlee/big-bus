import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Button, Input } from '@components';
import { colors, spacing } from '@utils/theme';
import { useAuthStore } from '@store/authStore';

const ChangePasswordScreen = ({ navigation }: any) => {
  const { changePassword, isLoading } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Đổi mật khẩu thất bại');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Mật khẩu cũ" value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
        <Input label="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Input label="Xác nhận mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <Button title="Đổi mật khẩu" onPress={handleChangePassword} loading={isLoading} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  content: { padding: spacing.lg },
});

export default ChangePasswordScreen;
