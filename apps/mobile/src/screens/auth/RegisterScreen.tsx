import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuthStore } from '@store/authStore';
import { Button, Input } from '@components';
import { colors, spacing, typography } from '@utils/theme';
import { validateEmail, validatePhone, validatePassword } from '@utils/helpers';
import { ROUTES } from '@utils/constants';

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, isLoading } = useAuthStore();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Tên là bắt buộc';
    }

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Đăng ký để bắt đầu</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            leftIcon="person"
            error={errors.name}
          />

          <Input
            label="Email"
            placeholder="Nhập email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            leftIcon="email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            leftIcon="phone"
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            leftIcon="lock"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            leftIcon="lock"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Đăng ký"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
              <Text style={styles.footerLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  registerButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  footerLink: {
    ...typography.body2,
    color: colors.primary.main,
    fontWeight: '600',
  },
});

export default RegisterScreen;
