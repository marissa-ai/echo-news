import React, { useEffect, useState } from 'react';
import { ApiService } from '@/services/apiService';

export const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await ApiService.getArticles();
        setArticles(response.articles);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (articles.length === 0) {
    return <div>No articles found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {articles.map((article) => (
        <div key={article.id} className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
          <p className="text-gray-600">{article.content}</p>
        </div>
      ))}
    </div>
  );
}; 