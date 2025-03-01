import React from 'react';
import './index.css';
import Navbar from './Navbar';
import ArticleList from './ArticleList';
import Form from './Form';

const Home = () => {
  return (
    <div>
      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <main style={{ padding: '20px' }}>
        <h1>Welcome to Echo</h1>

        {/* Article List Component */}
        <section>
          <h2>Articles</h2>
          <ArticleList />
        </section>

        {/* Form Component */}
        <section>
          <h2>Submit an Article</h2>
          <Form />
        </section>
      </main>
    </div>
  );
};

export default Home;

