import React, { useEffect, useState } from 'react';
import ApiService from '../services/apiService';

export const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await ApiService.getArticles();
        // Ensure we're getting an array from the response
        const articlesData = response.articles || response.data || [];
        setArticles(Array.isArray(articlesData) ? articlesData : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
        setLoading(false);
        setArticles([]); // Ensure articles is an empty array on error
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div 
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" 
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4" data-testid="error-message">
        {error}
      </div>
    );
  }

  if (!Array.isArray(articles) || articles.length === 0) {
    return (
      <div className="text-center text-muted p-4" data-testid="no-articles">
        No articles found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4" data-testid="article-list">
      {articles.map((article) => (
        <article key={article.id || Math.random()} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold line-clamp-2">{article.title}</h2>
              <p className="text-gray-500 text-sm">
                {article.created_at ? new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Date not available'}
              </p>
            </div>
            <p className="text-gray-600 line-clamp-3">{article.text || article.content}</p>
            <div className="pt-4">
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                onClick={() => window.open(article.url, '_blank')}
              >
                Read more →
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ArticleList; 