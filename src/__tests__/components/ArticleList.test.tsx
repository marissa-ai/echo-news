import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticleList from '@/components/ArticleList';

const mockArticles = [
  {
    id: '1',
    title: 'Test Article 1',
    description: 'Test description 1',
    category: 'Technology',
    author: 'John Doe',
    created_at: '2024-02-20T12:00:00Z',
    votes: 10,
    comments_count: 5,
  },
  {
    id: '2',
    title: 'Test Article 2',
    description: 'Test description 2',
    category: 'Science',
    author: 'Jane Smith',
    created_at: '2024-02-19T12:00:00Z',
    votes: 5,
    comments_count: 3,
  },
];

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockArticles),
  })
) as jest.Mock;

describe('ArticleList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<ArticleList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders articles after loading', async () => {
    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    const errorMessage = 'Failed to fetch articles';
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      })
    ) as jest.Mock;

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch articles')).toBeInTheDocument();
    });
  });

  it('displays vote counts correctly', async () => {
    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('10')).toBeInTheDocument(); // First article votes
    expect(screen.getByText('5')).toBeInTheDocument(); // Second article votes
  });

  it('displays comment counts correctly', async () => {
    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('5 Comments')).toBeInTheDocument();
    expect(screen.getByText('3 Comments')).toBeInTheDocument();
  });

  it('formats dates correctly', async () => {
    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Note: The actual formatted date text will depend on the date-fns format string
    expect(screen.getByText(/Feb 20, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Feb 19, 2024/)).toBeInTheDocument();
  });
}); 