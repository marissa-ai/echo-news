import './ArticleList.css';
import React from 'react';
import axios from 'axios';

const ArticleList = () => {
  const [articles, setArticles] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    axios
      .get('http://localhost:5000/articles')
      .then((response) => {
        setArticles(response.data);
        setError(null); // Clear any previous errors
      })
      .catch((error) => {
        console.error('Error fetching articles:', error);
        setError('Failed to load articles. Please try again later.');
      });
  }, []);

  // Identify the lead article
  const leadArticle = articles.find((article) => article.isLead);

  // Filter out the lead article for other sections
  const otherArticles = leadArticle
    ? articles.filter((article) => !article.isLead)
    : articles;

  // Sort other articles by score for the top 10
  const top10Articles = [...otherArticles]
    .filter((article) => {
      const now = new Date();
      const articleTime = new Date(article.timestamp);
      return now - articleTime <= 12 * 60 * 60 * 1000; // Within the past 12 hours
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Get the remaining articles, sorted by recency
  const recentArticles = [...otherArticles]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(top10Articles.length);

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Lead Article Section */}
      {leadArticle && (
        <div className="lead-article">
          <img src={leadArticle.image} alt={leadArticle.title} />
          <h2>{leadArticle.title}</h2>
          <p>{leadArticle.description}</p>
          <small>
            Published on: {new Date(leadArticle.timestamp).toLocaleString()}
          </small>
        </div>
      )}

      {/* Top 10 Articles Section */}
      <section>
        <h2>Top Articles</h2>
        <ul className="top-articles">
          {top10Articles.map((article, index) => (
            <li key={index} className="article-item">
              <span className="category">{article.category}</span>
              <a href={article.source} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>{' '}
              by {article.publisher}
              <br />
              Score: {article.score}, Comments: {article.commentsCount}, Time:{' '}
              {new Date(article.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>

      {/* Recent Articles Section */}
      <section>
        <h2>Recent Articles</h2>
        <ul className="recent-articles">
          {recentArticles.map((article, index) => (
            <li key={index} className="article-item">
              <span className="category">{article.category}</span>
              <a href={article.source} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>{' '}
              by {article.publisher}
              <br />
              Score: {article.score}, Comments: {article.commentsCount}, Time:{' '}
              {new Date(article.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ArticleList;

