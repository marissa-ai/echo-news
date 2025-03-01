import React, { useState } from 'react';
import Navbar from './Navbar';
import ArticleList from './ArticleList';
import './App.css';

function App() {
  const [filter, setFilter] = useState({ type: null, value: null });

  return (
    <div>
      <Navbar setFilter={setFilter} />
      <ArticleList filter={filter} />
    </div>
  );
}

export default App;

