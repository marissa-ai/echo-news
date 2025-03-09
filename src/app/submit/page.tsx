'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

const categories = [
  'Technology',
  'Science',
  'Politics',
  'Business',
  'Entertainment',
  'Sports',
  'Health',
  'Other',
];

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    try {
      const response = await api.post('/articles', {
        title,
        url,
        description,
        category,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Submit a New Article
          </h2>
        </div>
      </div>

      <div className="mt-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                required
                className="input"
                placeholder="Enter the article title"
              />
            </div>
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                name="url"
                id="url"
                required
                className="input"
                placeholder="https://example.com/article"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="mt-1">
              <select
                id="category"
                name="category"
                required
                className="input"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="input"
                placeholder="Provide a brief description of the article"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="button-primary"
            >
              {loading ? 'Submitting...' : 'Submit Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 