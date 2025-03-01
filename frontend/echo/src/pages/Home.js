import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ArticleCard from './ArticleCard';

const Home = () => {
  const [topArticle, setTopArticle] = useState(null);
  const [topArticles, setTopArticles] = useState([]);

  useEffect(() => {
    // Fetch the top article
    axios
      .get('http://localhost:5000/articles/top')
      .then((response) => {
        setTopArticle(response.data);
      })
      .catch((error) => {
        console.error('Error fetching top article:', error);
      });

    // Fetch the top 8 upvoted articles in the last 8 hours
    axios
      .get('http://localhost:5000/articles/top8')
      .then((response) => {
        setTopArticles(response.data);
      })
      .catch((error) => {
        console.error('Error fetching top 8 articles:', error);
      });
  }, []);

  return (
    <div>
      <h2>Welcome to Echo</h2>
      {topArticle && (
        <div>
          <h3>Top Article</h3>
          <ArticleCard article={topArticle} />
        </div>
      )}
      <h3>Top 8 Articles in the Last 8 Hours</h3>
      {topArticles.length > 0 ? (
        topArticles.map((article) => (
          <ArticleCard key={article.article_id} article={article} />
        ))
      ) : (
        <p>No trending articles available.</p>
      )}
    </div>
  );
};

export default Home;

