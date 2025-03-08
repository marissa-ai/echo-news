import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { ArticleList } from '../ArticleList.jsx';
import { ApiService } from '@/services/apiService';

// Mock the API service
jest.mock('@/services/apiService');

const mockArticles = [
  { id: 1, title: 'Test Article 1', content: 'Test content 1' },
  { id: 2, title: 'Test Article 2', content: 'Test content 2' },
];

describe('ArticleList', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    ApiService.getArticles.mockImplementation(() => new Promise(() => {}));

    render(<ArticleList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders articles when loaded successfully', async () => {
    ApiService.getArticles.mockResolvedValueOnce({ articles: mockArticles });

    await act(async () => {
      render(<ArticleList />);
    });

    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
  });

  it('renders error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch articles';
    ApiService.getArticles.mockRejectedValueOnce(new Error(errorMessage));

    await act(async () => {
      render(<ArticleList />);
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders empty state when no articles are returned', async () => {
    ApiService.getArticles.mockResolvedValueOnce({ articles: [] });

    await act(async () => {
      render(<ArticleList />);
    });

    expect(screen.getByText('No articles found')).toBeInTheDocument();
  });
}); 