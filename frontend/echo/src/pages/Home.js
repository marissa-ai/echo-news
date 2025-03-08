import React, { useEffect, useState } from 'react';
import ApiService from '../services/apiService';
import ArticleCard from './ArticleCard';

const Home = () => {
  const [topArticle, setTopArticle] = useState(null);
  const [topArticles, setTopArticles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch the top article
        const topArticleData = await ApiService.request(API_ENDPOINTS.articles.top);
        setTopArticle(topArticleData);

        // Fetch the top 8 upvoted articles in the last 8 hours
        const top8Data = await ApiService.request(API_ENDPOINTS.articles.top8);
        setTopArticles(top8Data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message || 'Failed to fetch articles');
      }
    };

    fetchArticles();
  }, []);

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  return (
    <div className="home-container">
      <h2>Welcome to Echo</h2>
      {topArticle && (
        <div className="top-article-section">
          <h3>Top Article</h3>
          <ArticleCard article={topArticle} />
        </div>
      )}
      <h3>Top 8 Articles in the Last 8 Hours</h3>
      <div className="articles-grid">
        {topArticles.length > 0 ? (
          topArticles.map((article) => (
            <ArticleCard key={article.article_id} article={article} />
          ))
        ) : (
          <p>No trending articles available.</p>
        )}
      </div>
    </div>
  );
};

export default Home;

