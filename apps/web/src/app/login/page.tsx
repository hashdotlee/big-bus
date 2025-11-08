'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn, loginError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login(formData, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Login</h2>

            {loginError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {(loginError as any)?.message || 'Login failed. Please try again.'}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/forgot-password"
                className="text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            <div className="mt-4 text-center text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
