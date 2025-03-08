import { ApiService } from '@/services/apiService';

jest.mock('@/services/apiService');

describe('ApiService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('makes a GET request correctly', async () => {
    const mockResponse = { data: 'test' };
    ApiService.request.mockResolvedValueOnce(mockResponse);

    const result = await ApiService.request('/test', 'GET');
    expect(result).toEqual(mockResponse);
    expect(ApiService.request).toHaveBeenCalledWith('/test', 'GET');
  });

  it('makes a POST request correctly', async () => {
    const mockData = { test: 'data' };
    const mockResponse = { success: true };
    ApiService.request.mockResolvedValueOnce(mockResponse);

    const result = await ApiService.request('/test', 'POST', mockData);
    expect(result).toEqual(mockResponse);
    expect(ApiService.request).toHaveBeenCalledWith('/test', 'POST', mockData);
  });

  it('handles API errors correctly', async () => {
    const errorMessage = 'API Error';
    ApiService.request.mockRejectedValueOnce(new Error(errorMessage));

    await expect(ApiService.request('/test')).rejects.toThrow(errorMessage);
  });

  it('handles network errors correctly', async () => {
    ApiService.request.mockRejectedValueOnce(new Error('Network error'));
    await expect(ApiService.request('/test')).rejects.toThrow('Network error');
  });

  it('includes authorization header when token exists', async () => {
    const mockResponse = {};
    ApiService.request.mockResolvedValueOnce(mockResponse);

    await ApiService.request('/test');
    expect(ApiService.request).toHaveBeenCalledWith('/test');
  });

  describe('getArticles', () => {
    it('calls request with correct parameters', async () => {
      const mockArticles = [{ id: 1, title: 'Test' }];
      ApiService.getArticles.mockResolvedValueOnce(mockArticles);

      const result = await ApiService.getArticles();
      expect(result).toEqual(mockArticles);
    });
  });

  describe('submitArticle', () => {
    it('calls request with correct parameters', async () => {
      const mockArticle = { title: 'Test', content: 'Content' };
      const mockResponse = { id: 1, ...mockArticle };
      ApiService.submitArticle.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.submitArticle(mockArticle);
      expect(result).toEqual(mockResponse);
    });
  });
}); 