import React, { useState } from 'react';
import Navbar from './Navbar';
import ArticleList from './ArticleList';
import Form from './Form';

const App = () => {
  const [page, setPage] = useState('home'); // Tracks which page to display

  return (
    <div>
      <Navbar setPage={setPage} />

      <main style={{ padding: '20px' }}>
        {page === 'home' && (
          <>
            <h1>Welcome to Echo</h1>
            <section>
              <h2>Articles</h2>
              <ArticleList />
            </section>
            <section>
              <h2>Submit an Article</h2>
              <Form />
            </section>
          </>
        )}

        {page === 'news' && (
          <>
            <h1>News</h1>
            <section>
              <h2>Articles</h2>
              <ArticleList />
            </section>
          </>
        )}

        {page === 'submit' && (
          <>
            <h1>Submit an Article</h1>
            <Form />
          </>
        )}
      </main>
    </div>
  );
};

export default App;

