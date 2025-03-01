import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ArticleCard from './ArticleCard';
import './ArticleList.css';
import { debounce } from 'lodash'; // Import debounce from lodash for debouncing API calls

const ArticleList = ({ filter = {} }) => {
  const [articles, setArticles] = useState([]); // State for articles
  const [cache, setCache] = useState({}); // Cache to store previously fetched results

  useEffect(() => {
    // Memoize the cache key based on the filter
    const cacheKey = JSON.stringify(filter);

    // If data for this filter exists in the cache, use it
    if (cache[cacheKey]) {
      setArticles(cache[cacheKey]);
      return; // Exit early to avoid unnecessary API call
    }

    // Debounce the API call to prevent rapid successive calls
    const fetchArticles = debounce(() => {
      let url = 'http://localhost:5000/articles';

      // Append filter parameters if they exist
      if (filter?.type && filter?.value) {
        url += `?${filter.type}=${filter.value}`;
      }

      // Perform the API call
      axios
        .get(url)
        .then((response) => {
          // Store the result in the cache and update state
          setArticles(response.data);
          setCache((prevCache) => ({
            ...prevCache,
            [cacheKey]: response.data,
          }));
        })
        .catch((error) => {
          console.error('Error fetching articles:', error);
        });
    }, 300); // Set debounce delay to 300ms

    fetchArticles();

    // Cleanup function to cancel pending debounce calls
    return () => {
      fetchArticles.cancel();
    };
  }, [filter, cache]);

  return (
    <div className="article-list">
      {/* Render a message if no articles are available */}
      {articles.length === 0 ? (
        <p>No articles available.</p>
      ) : (
        // Render each article using the ArticleCard component
        articles.map((article) => (
          <ArticleCard key={article.article_id} article={article} />
        ))
      )}
    </div>
  );
};

export default ArticleList;

