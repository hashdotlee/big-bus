import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Button, Input } from '@components';
import { colors, spacing } from '@utils/theme';
import { useAuthStore } from '@store/authStore';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleUpdate = async () => {
    try {
      await updateProfile({ name, phone });
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Cập nhật thất bại');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Họ tên" value={name} onChangeText={setName} />
        <Input label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Button title="Cập nhật" onPress={handleUpdate} loading={isLoading} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  content: { padding: spacing.lg },
});

export default EditProfileScreen;
