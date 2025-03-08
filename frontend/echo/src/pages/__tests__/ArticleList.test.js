import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ArticleList from '../ArticleList';
import ApiService from '../../services/apiService';

// Mock ApiService
jest.mock('../../services/apiService');

describe('ArticleList', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<ArticleList />);
    expect(screen.getByText('Loading articles...')).toBeInTheDocument();
  });

  it('renders error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch articles';
    ApiService.getArticles.mockRejectedValueOnce(new Error(errorMessage));

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('renders "No articles available" when articles array is empty', async () => {
    ApiService.getArticles.mockResolvedValueOnce({ articles: [], total: 0 });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('No articles available.')).toBeInTheDocument();
    });
  });

  it('renders articles when data is loaded successfully', async () => {
    const mockArticles = {
      articles: [
        {
          article_id: 1,
          title: 'Test Article 1',
          description: 'Test Description 1',
          category: 'Technology',
          tags: ['test'],
          submitted_by: 'testuser',
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          article_id: 2,
          title: 'Test Article 2',
          description: 'Test Description 2',
          category: 'Science',
          tags: ['test'],
          submitted_by: 'testuser',
          created_at: '2023-01-02T00:00:00Z',
        },
      ],
      total: 2,
    };

    ApiService.getArticles.mockResolvedValueOnce(mockArticles);

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    });
  });

  it('calls ApiService.getArticles with correct parameters', async () => {
    ApiService.getArticles.mockResolvedValueOnce({ articles: [], total: 0 });

    render(<ArticleList />);

    await waitFor(() => {
      expect(ApiService.getArticles).toHaveBeenCalledWith({ status: 'Approved' });
    });
  });
}); 