import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
};

const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="username">{user?.username}</div>
      <button onClick={() => login('test-token', mockUser)} data-testid="login-btn">
        Login
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('provides authentication state and methods', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('auth-status')).toHaveTextContent('logged-out');
    expect(getByTestId('username')).toBeEmpty();
  });

  it('handles login correctly', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      getByTestId('login-btn').click();
    });

    expect(getByTestId('auth-status')).toHaveTextContent('logged-in');
    expect(getByTestId('username')).toHaveTextContent('testuser');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  it('handles logout correctly', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login first
    act(() => {
      getByTestId('login-btn').click();
    });

    // Then logout
    act(() => {
      getByTestId('logout-btn').click();
    });

    expect(getByTestId('auth-status')).toHaveTextContent('logged-out');
    expect(getByTestId('username')).toBeEmpty();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('initializes with stored credentials', () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('auth-status')).toHaveTextContent('logged-in');
    expect(getByTestId('username')).toHaveTextContent('testuser');
  });
}); 