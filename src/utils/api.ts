const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchWithAuth<T>(endpoint),
  
  post: <T>(endpoint: string, data: any) =>
    fetchWithAuth<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(endpoint: string, data: any) =>
    fetchWithAuth<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchWithAuth<T>(endpoint, {
      method: 'DELETE',
    }),
}; 