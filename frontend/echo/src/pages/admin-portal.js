import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { API_ENDPOINTS } from '../config/api';

const AdminPortal = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.articles.list, {
          params: { status: 'Pending' },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Add the JWT token if you have it
          }
        });
        setArticles(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.response?.data?.message || 'Failed to fetch articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleArticleAction = async (articleId, action) => {
    try {
      await axios.post(`${API_ENDPOINTS.articles.list}/${articleId}/moderate`, {
        action: action,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Remove the article from the list after successful action
      setArticles(articles.filter(article => article.article_id !== articleId));
      setError(null);
    } catch (err) {
      console.error(`Error ${action} article:`, err);
      setError(err.response?.data?.message || `Failed to ${action} article`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Admin Portal</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Portal</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Articles</h2>
          
          {articles.length === 0 ? (
            <p>No pending articles to review.</p>
          ) : (
            <div className="space-y-4">
              {articles.map(article => (
                <div key={article.article_id} className="border rounded p-4">
                  <h3 className="text-lg font-medium">{article.title}</h3>
                  <p className="text-gray-600 mt-2">{article.text}</p>
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => handleArticleAction(article.article_id, 'approve')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleArticleAction(article.article_id, 'reject')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal; 