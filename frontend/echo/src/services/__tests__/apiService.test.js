import ApiService from '../apiService';
import { API_ENDPOINTS } from '../../config/api';

describe('ApiService', () => {
  beforeEach(() => {
    // Clear fetch mock before each test
    global.fetch.mockClear();
  });

  it('makes a GET request correctly', async () => {
    const mockResponse = { data: 'test' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await ApiService.request(API_ENDPOINTS.articles.list);
    
    expect(global.fetch).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.list,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('makes a POST request correctly', async () => {
    const mockResponse = { id: 1 };
    const mockData = { title: 'Test' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await ApiService.request(API_ENDPOINTS.articles.submit, {
      method: 'POST',
      body: JSON.stringify(mockData),
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.submit,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(mockData),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('handles API errors correctly', async () => {
    const errorMessage = 'Not Found';
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: errorMessage }),
    });

    await expect(ApiService.request(API_ENDPOINTS.articles.list))
      .rejects
      .toThrow(errorMessage);
  });

  it('handles network errors correctly', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(ApiService.request(API_ENDPOINTS.articles.list))
      .rejects
      .toThrow('Network Error');
  });

  it('includes authorization header when token exists', async () => {
    const mockToken = 'test-token';
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(() => mockToken),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await ApiService.request(API_ENDPOINTS.articles.list);
    
    expect(global.fetch).toHaveBeenCalledWith(
      API_ENDPOINTS.articles.list,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`,
        }),
      })
    );
  });

  describe('getArticles', () => {
    it('calls request with correct parameters', async () => {
      const mockParams = { status: 'Approved' };
      const mockResponse = { articles: [] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      await ApiService.getArticles(mockParams);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_ENDPOINTS.articles.list}?status=Approved`,
        expect.any(Object)
      );
    });
  });

  describe('submitArticle', () => {
    it('calls request with correct parameters', async () => {
      const mockArticle = { title: 'Test Article' };
      const mockResponse = { article_id: 1 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      await ApiService.submitArticle(mockArticle);
      
      expect(global.fetch).toHaveBeenCalledWith(
        API_ENDPOINTS.articles.submit,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockArticle),
        })
      );
    });
  });
}); 