import { API_ENDPOINTS } from '../config/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(endpoint, config);
      
      // Handle non-2xx responses
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  static async login(credentials) {
    return this.request(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async register(userData) {
    return this.request(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Articles endpoints
  static async getArticles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_ENDPOINTS.articles.list}${queryString ? `?${queryString}` : ''}`;
    return this.request(url);
  }

  static async submitArticle(articleData) {
    return this.request(API_ENDPOINTS.articles.submit, {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  }

  static async moderateArticle(articleId, action) {
    return this.request(`${API_ENDPOINTS.articles.list}/${articleId}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  // User endpoints
  static async getUserProfile() {
    return this.request(API_ENDPOINTS.users.profile);
  }
}

export default ApiService; 