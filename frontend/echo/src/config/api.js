const API_BASE_URL = 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        register: `${API_BASE_URL}/auth/register`,
        logout: `${API_BASE_URL}/auth/logout`,
    },
    articles: {
        list: `${API_BASE_URL}/articles`,
        submit: `${API_BASE_URL}/articles/submit`,
        vote: `${API_BASE_URL}/articles/vote`,
        top: `${API_BASE_URL}/articles/top`,
        top8: `${API_BASE_URL}/articles/top8`,
        trending: `${API_BASE_URL}/articles/trending`,
        moderate: (articleId) => `${API_BASE_URL}/articles/${articleId}/moderate`,
    },
    users: {
        profile: `${API_BASE_URL}/users`,
    },
};

export default API_BASE_URL; 