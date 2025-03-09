'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';

interface UserStats {
  articlesCount: number;
  commentsCount: number;
  totalVotes: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await api.get<UserStats>('/user/stats');
      if (response.error) throw new Error(response.error);
      if (response.data) setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.username}!
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/submit"
            className="button-primary"
          >
            Submit New Article
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Articles
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats?.articlesCount || 0}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Comments
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats?.commentsCount || 0}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Votes Received
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats?.totalVotes || 0}
            </dd>
          </div>
        </div>
      </div>

      {/* Add more dashboard sections here */}
    </div>
  );
} 