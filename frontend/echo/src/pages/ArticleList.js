import React, { useEffect, useState } from 'react';
import ApiService from '../services/apiService';
import ArticleCard from './ArticleCard';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await ApiService.getArticles({ status: 'Approved' });
        setArticles(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message || 'Failed to fetch articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (isLoading) {
    return <div>Loading articles...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="article-list">
      {articles.length === 0 ? (
        <p>No articles available.</p>
      ) : (
        articles.map((article) => (
          <ArticleCard key={article.article_id} article={article} />
        ))
      )}
    </div>
  );
};

export default ArticleList;

