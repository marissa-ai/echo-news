import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import ArticleList from '../components/ArticleList';
import ApiService from '../services/apiService';

// Mock the ApiService
jest.mock('../services/apiService', () => ({
  __esModule: true,
  default: {
    getArticles: jest.fn()
  }
}));

const mockArticles = [
  { id: 1, title: 'Test Article 1', content: 'Test content 1', created_at: '2024-03-08T12:00:00Z' },
  { id: 2, title: 'Test Article 2', content: 'Test content 2', created_at: '2024-03-08T12:00:00Z' }
];

describe('ArticleList Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    ApiService.getArticles.mockImplementation(() => new Promise(() => {}));
    await act(async () => {
      render(<ArticleList />);
    });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays articles when API call is successful', async () => {
    ApiService.getArticles.mockResolvedValue(mockArticles);

    await act(async () => {
      render(<ArticleList />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    expect(screen.getByText('Test content 1')).toBeInTheDocument();
    expect(screen.getByText('Test content 2')).toBeInTheDocument();
    
    // Check if dates are present
    const dates = screen.getAllByText('March 8, 2024');
    expect(dates).toHaveLength(2);
  });

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch articles';
    ApiService.getArticles.mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      render(<ArticleList />);
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays "No articles found" when API returns empty array', async () => {
    ApiService.getArticles.mockResolvedValue([]);

    await act(async () => {
      render(<ArticleList />);
    });

    await waitFor(() => {
      expect(screen.getByText('No articles found')).toBeInTheDocument();
    });
  });

  it('renders "Read more" buttons for each article', async () => {
    ApiService.getArticles.mockResolvedValue(mockArticles);

    await act(async () => {
      render(<ArticleList />);
    });

    await waitFor(() => {
      const readMoreButtons = screen.getAllByText('Read more →');
      expect(readMoreButtons).toHaveLength(mockArticles.length);
    });
  });
}); 