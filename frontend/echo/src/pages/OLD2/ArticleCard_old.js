import React from 'react';
import './ArticleCard.css'; // Styling for the article card
import axios from 'axios'; // For API calls

const ArticleCard = ({ article }) => {
  const handleVote = (voteType) => {
    axios
      .post('http://localhost:5000/articles/vote', {
        article_id: article.article_id,
        vote_type: voteType,
      })
      .then((response) => {
        console.log(`${voteType} recorded successfully`);
        // Optionally re-fetch articles to update vote counts
      })
      .catch((error) => {
        console.error('Error recording vote:', error);
      });
  };

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
        <p>{article.description}</p>
        <small>Published: {new Date(article.timestamp).toLocaleString()}</small>

        <div className="voting-section">
          <button
            className="vote-button upvote"
            onClick={() => handleVote('upvote')}
          >
            👍 Upvote ({article.upvotes})
          </button>
          <button
            className="vote-button downvote"
            onClick={() => handleVote('downvote')}
          >
            👎 Downvote ({article.downvotes})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;

