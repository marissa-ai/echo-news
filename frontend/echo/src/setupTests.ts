import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn();

// Mock modules
jest.mock('@/services/apiService', () => ({
  ApiService: {
    request: jest.fn(),
    getArticles: jest.fn(),
    getArticleById: jest.fn(),
    submitArticle: jest.fn(),
    updateArticle: jest.fn(),
    deleteArticle: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
  },
})); 