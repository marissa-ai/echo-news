import React, { useEffect, useState } from 'react';
import ApiService from '../services/apiService';
import ArticleCard from './ArticleCard'; // Reuse ArticleCard component
import './ArticleCard.css'; // Optional: Reuse existing styles

const TrendingArticles = () => {
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingArticles = async () => {
      try {
        const data = await ApiService.request(API_ENDPOINTS.articles.trending);
        setTrendingArticles(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching trending articles:', err);
        setError(err.message || 'Failed to fetch trending articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingArticles();
  }, []);

  if (isLoading) {
    return <div>Loading trending articles...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="trending-articles-section">
      <div className="trending-title">Trending Articles</div>
      {trendingArticles.length === 0 ? (
        <p>No trending articles available.</p>
      ) : (
        trendingArticles.map((article) => (
          <ArticleCard key={article.article_id} article={article} />
        ))
      )}
    </div>
  );
};

export default TrendingArticles;

