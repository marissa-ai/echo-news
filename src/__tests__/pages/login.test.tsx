import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { AuthProvider } from '@/contexts/AuthContext';
import { api } from '@/utils/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock api
jest.mock('@/utils/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

describe('LoginPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders login form', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
      },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    (api.post as jest.Mock).mockResolvedValueOnce({ error: errorMessage });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    (api.post as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('redirects to register page when clicking create account link', async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const registerLink = screen.getByText('create a new account');
    expect(registerLink).toHaveAttribute('href', '/register');
  });
}); 