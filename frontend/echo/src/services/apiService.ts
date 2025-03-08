const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiService {
  static async request(endpoint: string, method: string = 'GET', data?: any) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(response.statusText || 'API request failed');
    }

    return response.json();
  }

  static async getArticles(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/articles${queryString}`);
  }

  static async getArticleById(id: number) {
    return this.request(`/articles/${id}`);
  }

  static async submitArticle(article: Record<string, any>) {
    return this.request('/articles', 'POST', article);
  }

  static async updateArticle(id: number, article: Record<string, any>) {
    return this.request(`/articles/${id}`, 'PUT', article);
  }

  static async deleteArticle(id: number) {
    return this.request(`/articles/${id}`, 'DELETE');
  }

  static async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', 'POST', credentials);
  }

  static async register(userData: Record<string, any>) {
    return this.request('/auth/register', 'POST', userData);
  }

  static async getCurrentUser() {
    return this.request('/auth/me');
  }
} 