import React from 'react';
import axios from 'axios';
import ArticleCard from './ArticleCard';
import './ArticleList.css'; // Add CSS for list styling

const ArticleList = () => {
  const [articles, setArticles] = React.useState([]);

  React.useEffect(() => {
    axios
      .get('http://localhost:5000/articles')
      .then((response) => {
        setArticles(response.data);
      })
      .catch((error) => {
        console.error('Error fetching articles:', error);
      });
  }, []);

  return (
    <div className="article-list">
      {articles.length === 0 ? (
        <p>No articles available.</p>
      ) : (
        articles.map((article) => <ArticleCard key={article.article_id} article={article} />)
      )}
    </div>
  );
};

export default ArticleList;

