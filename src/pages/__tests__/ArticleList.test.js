import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ArticleList from '../../components/ArticleList';
import { ApiService } from '../../services/apiService';

jest.mock('../../services/apiService');

describe('ArticleList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    ApiService.getArticles.mockImplementation(() => new Promise(() => {}));
    
    await act(async () => {
      render(<ArticleList />);
    });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders articles when loaded successfully', async () => {
    const mockArticles = [
      { id: 1, title: 'Test Article 1', content: 'Content 1', createdAt: '2024-01-01' },
      { id: 2, title: 'Test Article 2', content: 'Content 2', createdAt: '2024-01-02' }
    ];
    
    ApiService.getArticles.mockResolvedValue(mockArticles);
    
    await act(async () => {
      render(<ArticleList />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    });
  });

  it('renders error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch articles';
    ApiService.getArticles.mockRejectedValue(new Error(errorMessage));
    
    await act(async () => {
      render(<ArticleList />);
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('renders empty state when no articles are returned', async () => {
    ApiService.getArticles.mockResolvedValue([]);
    
    await act(async () => {
      render(<ArticleList />);
    });

    await waitFor(() => {
      expect(screen.getByText('No articles found')).toBeInTheDocument();
    });
  });
}); 