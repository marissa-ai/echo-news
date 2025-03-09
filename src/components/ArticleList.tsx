import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  created_at: string;
  votes: number;
  comments_count: number;
}

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <article key={article.id} className="bg-white rounded-md shadow-sm p-6">
          <div className="flex items-start space-x-4">
            {/* Vote buttons */}
            <div className="flex flex-col items-center space-y-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ArrowUpIcon className="h-5 w-5 text-gray-500" />
              </button>
              <span className="text-sm font-medium text-gray-700">{article.votes}</span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ArrowDownIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Article content */}
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-xs font-medium text-primary bg-indigo-50 px-2 py-1 rounded">
                  {article.category}
                </span>
                <span className="text-sm text-gray-500">
                  Posted by {article.author} • {format(new Date(article.created_at), 'MMM d, yyyy')}
                </span>
              </div>

              <Link href={`/article/${article.id}`} className="block mt-2">
                <h3 className="text-xl font-semibold text-gray-900 hover:text-primary">
                  {article.title}
                </h3>
              </Link>

              <p className="mt-2 text-gray-500">{article.description}</p>

              <div className="mt-4 flex items-center space-x-4">
                <Link
                  href={`/article/${article.id}#comments`}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                  {article.comments_count} Comments
                </Link>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
} 