import React from 'react';
import { render, screen } from '@testing-library/react';
import { ArticleList } from '@/components/layout/ArticleList';

describe('ArticleList', () => {
  const mockArticles = [
    {
      article_id: 1,
      title: 'First Test Article',
      description: 'First test description',
      category: 'Technology',
      submitted_by: 'Author One',
      created_at: '2024-03-08T12:00:00Z',
      upvotes: 10,
      downvotes: 2,
      tags: ['tech', 'test']
    },
    {
      article_id: 2,
      title: 'Second Test Article',
      description: 'Second test description',
      category: 'Science',
      submitted_by: 'Author Two',
      created_at: '2024-03-08T13:00:00Z',
      upvotes: 15,
      downvotes: 3,
      tags: ['science', 'test']
    }
  ];

  it('renders a list of articles', () => {
    render(<ArticleList articles={mockArticles} />);
    
    expect(screen.getByText('First Test Article')).toBeInTheDocument();
    expect(screen.getByText('Second Test Article')).toBeInTheDocument();
  });

  it('renders empty state when no articles are provided', () => {
    render(<ArticleList articles={[]} />);
    
    expect(screen.getByText('No articles found')).toBeInTheDocument();
  });

  it('renders article categories', () => {
    render(<ArticleList articles={mockArticles} />);
    
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
  });

  it('renders article authors', () => {
    render(<ArticleList articles={mockArticles} />);
    
    expect(screen.getByText('Author One')).toBeInTheDocument();
    expect(screen.getByText('Author Two')).toBeInTheDocument();
  });
}); 