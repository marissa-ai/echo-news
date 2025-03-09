import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Navbar', () => {
  it('renders login and register buttons when not authenticated', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Submit News')).not.toBeInTheDocument();
  });

  it('renders authenticated user navigation', () => {
    // Update mock to simulate authenticated state
    jest.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: { username: 'testuser' },
      isAuthenticated: true,
      logout: jest.fn(),
    });

    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Submit News')).toBeInTheDocument();
    expect(screen.getByText('Welcome, testuser')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = jest.fn();
    jest.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: { username: 'testuser' },
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    await userEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders the Echo logo/link', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    const logoLink = screen.getByText('Echo');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink.closest('a')).toHaveAttribute('href', '/');
  });
}); 