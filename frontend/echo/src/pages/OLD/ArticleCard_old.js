import React from 'react';
import './ArticleCard.css'; // Add CSS for styling the card

const ArticleCard = ({ article }) => {
  return (
    <div className="article-card">
      <img
        src={article.image_url || 'https://via.placeholder.com/150'}
        alt={article.title}
        className="article-image"
      />
      <div className="article-content">
        <h2>
          <a href={article.source_url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h2>
        <p>By {article.author} | {article.publisher}</p>
        <p className="article-description">{article.description}</p>
        <small>Published: {new Date(article.timestamp).toLocaleString()}</small>
      </div>
    </div>
  );
};

export default ArticleCard;

