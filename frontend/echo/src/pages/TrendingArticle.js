import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ArticleCard from './ArticleCard'; // Reuse ArticleCard component
import './ArticleCard.css'; // Optional: Reuse existing styles

const TrendingArticles = () => {
  const [trendingArticles, setTrendingArticles] = useState([]);

  useEffect(() => {
    // Fetch trending articles from the backend
    axios
      .get('http://localhost:5000/articles/trending')
      .then((response) => {
        setTrendingArticles(response.data);
      })
      .catch((error) => {
        console.error('Error fetching trending articles:', error);
      });
  }, []);

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

