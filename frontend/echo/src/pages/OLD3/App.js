import React, { useState } from 'react';
import Navbar from './Navbar';
import ArticleList from './ArticleList';
import TrendingArticles from './TrendingArticles'; // Import TrendingArticles component
import './App.css';

function App() {
  const [filter, setFilter] = useState({ type: null, value: null });

  return (
    <div>
      <Navbar setFilter={setFilter} />
      {/* Add TrendingArticles section above the main article list */}
      <TrendingArticles />
      <ArticleList filter={filter} />
    </div>
  );
}

export default App;

