import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-primary font-bold text-xl">
              Echo
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/submit"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Submit News
                </Link>
                <span className="text-gray-500 text-sm">
                  Welcome, {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 