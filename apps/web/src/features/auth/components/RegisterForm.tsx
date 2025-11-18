'use client';

/**
 * Register Form Component
 * Feature: Authentication
 */

import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@big-bus/ui';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading } = useAuth();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              leftIcon={<User className="w-5 h-5" />}
              value={formData.name}
              onChange={handleChange('name')}
              required
              fullWidth
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              leftIcon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={handleChange('email')}
              required
              fullWidth
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              leftIcon={<Phone className="w-5 h-5" />}
              value={formData.phone}
              onChange={handleChange('phone')}
              required
              fullWidth
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              leftIcon={<Lock className="w-5 h-5" />}
              value={formData.password}
              onChange={handleChange('password')}
              error={errors.password}
              helperText="Must be at least 8 characters"
              required
              fullWidth
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              leftIcon={<Lock className="w-5 h-5" />}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              required
              fullWidth
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
          >
            Create Account
          </Button>
          <p className="text-sm text-center text-neutral-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
