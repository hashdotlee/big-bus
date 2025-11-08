'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Big Bus
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/search"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Search
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/bookings"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  My Bookings
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Profile
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
