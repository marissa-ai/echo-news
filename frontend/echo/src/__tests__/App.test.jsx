import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from '../pages/index';
import ApiService from '../services/apiService';

// Mock the ApiService
jest.mock('../services/apiService', () => ({
  __esModule: true,
  default: {
    getArticles: jest.fn()
  }
}));

// Mock the child components
jest.mock('../components/Navbar', () => {
  return function MockNavbar({ setPage }) {
    return (
      <nav>
        <button onClick={() => setPage('home')}>Home</button>
        <button onClick={() => setPage('news')}>News</button>
        <button onClick={() => setPage('submit')}>Submit</button>
      </nav>
    );
  };
});

const mockArticles = [
  { id: 1, title: 'Test Article 1', content: 'Test content 1', created_at: '2024-03-08T12:00:00Z' },
  { id: 2, title: 'Test Article 2', content: 'Test content 2', created_at: '2024-03-08T12:00:00Z' }
];

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApiService.getArticles.mockResolvedValue(mockArticles);
  });

  it('renders home page by default', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Welcome to Echo')).toBeInTheDocument();
    expect(screen.getByText('Your source for the latest news and stories that matter')).toBeInTheDocument();
    expect(screen.getByText('Latest Articles')).toBeInTheDocument();
  });

  it('navigates to news page when news is clicked', async () => {
    await act(async () => {
      render(<App />);
    });

    const newsButton = screen.getByText('News');
    await act(async () => {
      fireEvent.click(newsButton);
    });

    expect(screen.getByText('News Feed')).toBeInTheDocument();
    expect(screen.queryByText('Welcome to Echo')).not.toBeInTheDocument();
  });

  it('navigates to submit page when submit is clicked', async () => {
    await act(async () => {
      render(<App />);
    });

    const submitButton = screen.getByText('Submit');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Submit an Article')).toBeInTheDocument();
    expect(screen.getByText('Share your story with the Echo community')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Submit Article' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title:')).toBeInTheDocument();
    expect(screen.getByLabelText('Text:')).toBeInTheDocument();
  });

  it('navigates back to home page when home is clicked', async () => {
    await act(async () => {
      render(<App />);
    });

    const homeButton = screen.getByText('Home');
    await act(async () => {
      fireEvent.click(homeButton);
    });

    expect(screen.getByText('Welcome to Echo')).toBeInTheDocument();
    expect(screen.getByText('Latest Articles')).toBeInTheDocument();
  });

  it('shows submit article button on home page', () => {
    render(<App />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit Article' });
    expect(submitButton).toBeInTheDocument();
    
    fireEvent.click(submitButton);
    expect(screen.getByText('Submit an Article')).toBeInTheDocument();
  });
}); 