'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu không khớp!');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Vui lòng đồng ý với điều khoản sử dụng!');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual registration
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (error) {
      toast.error('Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary-blue text-2xl font-bold">BB</span>
          </div>
          <span className="text-2xl font-bold text-white">Big Bus</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Đăng ký tài khoản</CardTitle>
            <p className="text-center text-secondary-gray">
              Tạo tài khoản để trải nghiệm dịch vụ tốt nhất
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Họ *"
                  placeholder="Nguyễn"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  leftIcon={<User className="w-5 h-5" />}
                  required
                  fullWidth
                />

                <Input
                  label="Tên *"
                  placeholder="Văn A"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  leftIcon={<User className="w-5 h-5" />}
                  required
                  fullWidth
                />
              </div>

              <Input
                label="Email *"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<Mail className="w-5 h-5" />}
                required
                fullWidth
              />

              <Input
                label="Số điện thoại *"
                type="tel"
                placeholder="0901234567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                leftIcon={<Phone className="w-5 h-5" />}
                required
                fullWidth
              />

              <Input
                label="Mật khẩu *"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
                helperText="Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số"
                required
                fullWidth
              />

              <Input
                label="Xác nhận mật khẩu *"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
                required
                fullWidth
              />

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1 rounded"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                />
                <span className="text-sm text-secondary-gray">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-primary-blue hover:underline">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-primary-blue hover:underline">
                    Chính sách bảo mật
                  </Link>
                </span>
              </label>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Đăng ký
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-secondary-gray">
                    Hoặc đăng ký với
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['Google', 'Facebook', 'Zalo'].map((provider) => (
                  <Button
                    key={provider}
                    type="button"
                    variant="outline"
                    size="md"
                    className="w-full"
                  >
                    {provider}
                  </Button>
                ))}
              </div>

              <p className="text-center text-sm text-secondary-gray pt-4">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-primary-blue hover:underline font-medium">
                  Đăng nhập ngay
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
