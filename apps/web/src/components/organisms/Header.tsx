'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/atoms/Button';
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  Ticket,
  Bell
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isLoggedIn] = useState(false); // TODO: Get from auth context

  const navigation = [
    { name: 'Tuyến đường', href: '/routes' },
    { name: 'Lịch trình', href: '/schedules' },
    { name: 'Khuyến mãi', href: '/promotions' },
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Liên hệ', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">BB</span>
            </div>
            <span className="text-xl font-bold text-secondary-dark dark:text-white">
              Big Bus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-secondary-dark dark:text-gray-200 hover:text-primary-blue dark:hover:text-primary-blue transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden sm:inline-flex"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full" />
                </Button>

                {/* My Bookings */}
                <Link href="/my-bookings">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <Ticket className="w-5 h-5" />
                    <span className="hidden lg:inline">Vé của tôi</span>
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="w-5 h-5" />
                      <span className="hidden lg:inline">Tài khoản</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-secondary-dark dark:text-gray-200 hover:bg-secondary-light dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/my-bookings"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-secondary-light dark:hover:bg-gray-800 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Ticket className="w-5 h-5" />
                      Vé của tôi
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-secondary-light dark:hover:bg-gray-800 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Tài khoản
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-secondary-light dark:hover:bg-gray-800 rounded-lg w-full text-left">
                      <LogOut className="w-5 h-5" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-4">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="md" className="w-full">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" className="w-full">
                        Đăng ký
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
