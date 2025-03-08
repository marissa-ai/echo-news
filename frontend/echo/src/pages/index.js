import React, { useState } from 'react';
import Navbar from './Navbar';
import { ArticleList } from '../components/ArticleList';
import Form from './Form';

const App = () => {
  const [page, setPage] = useState('home');

  return (
    <div className="min-h-screen bg-background">
      <Navbar setPage={setPage} />

      <main className="container py-8">
        {page === 'home' && (
          <div className="space-y-12">
            <section className="text-center space-y-4">
              <h1 className="heading-1">Welcome to Echo</h1>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Your source for the latest news and stories that matter
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-2">Latest Articles</h2>
                <button 
                  onClick={() => setPage('submit')}
                  className="button button-primary px-4 py-2"
                >
                  Submit Article
                </button>
              </div>
              <ArticleList />
            </section>
          </div>
        )}

        {page === 'news' && (
          <div className="space-y-8">
            <section className="text-center">
              <h1 className="heading-1">News Feed</h1>
            </section>
            <ArticleList />
          </div>
        )}

        {page === 'submit' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <section className="text-center space-y-4">
              <h1 className="heading-1">Submit an Article</h1>
              <p className="text-muted">Share your story with the Echo community</p>
            </section>
            <div className="card">
              <Form />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

