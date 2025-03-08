const request = jest.fn();
const getArticles = jest.fn();
const getArticleById = jest.fn();
const submitArticle = jest.fn();
const updateArticle = jest.fn();
const deleteArticle = jest.fn();
const login = jest.fn();
const register = jest.fn();
const getCurrentUser = jest.fn();

export const ApiService = {
  request,
  getArticles,
  getArticleById,
  submitArticle,
  updateArticle,
  deleteArticle,
  login,
  register,
  getCurrentUser,
}; 