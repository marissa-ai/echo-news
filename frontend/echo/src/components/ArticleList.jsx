import React, { useEffect, useState } from 'react';
import ApiService from '../services/apiService';

export const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await ApiService.getArticles();
        setArticles(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
        setLoading(false);
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
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center text-muted p-4">
        No articles found
      </div>
    );
  }

  return (
    <div className="grid-container" data-testid="article-list">
      {articles.map((article) => (
        <article key={article.id} className="card hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="heading-3 line-clamp-2">{article.title}</h2>
              <p className="text-muted text-sm">
                {new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <p className="text-foreground/80 line-clamp-3">{article.content}</p>
            <div className="pt-4">
              <button className="button button-ghost text-sm">Read more →</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ArticleList; 