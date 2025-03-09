import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ArticleList from '@/components/ArticleList';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to Echo
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your community-driven news aggregator
            </p>
            {!isAuthenticated && (
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Stories</h2>
        <ArticleList />
      </section>
    </main>
  );
} 