import React from 'react';
import { render, screen } from '@testing-library/react';
import { ArticleCard } from '../components/layout/ArticleCard';

describe('ArticleCard', () => {
  const mockArticle = {
    article_id: 1,
    title: 'Test Article',
    description: 'Test description of the article',
    category: 'Technology',
    submitted_by: 'Test Author',
    created_at: '2024-03-08T12:00:00Z',
    upvotes: 10,
    downvotes: 2,
    tags: ['test', 'article']
  };

  it('renders article title and description', () => {
    render(<ArticleCard article={mockArticle} />);
    
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test description of the article')).toBeInTheDocument();
  });

  it('renders author name', () => {
    render(<ArticleCard article={mockArticle} />);
    
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('renders category and date', () => {
    render(<ArticleCard article={mockArticle} />);
    
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('March 8, 2024')).toBeInTheDocument();
  });

  it('renders vote counts', () => {
    render(<ArticleCard article={mockArticle} />);
    
    expect(screen.getByText('10')).toBeInTheDocument(); // upvotes
    expect(screen.getByText('2')).toBeInTheDocument(); // downvotes
  });

  it('renders article links correctly', () => {
    render(<ArticleCard article={mockArticle} />);
    
    const titleLink = screen.getByRole('link', { name: 'Test Article' });
    expect(titleLink).toHaveAttribute('href', '/article/1');

    const authorLink = screen.getByRole('link', { name: 'Test Author' });
    expect(authorLink).toHaveAttribute('href', '/user/Test Author');
  });
}); 