import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storage';

const api = axios.create({
  baseURL: '/', // We'll handle the full path in the interceptor
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  config => {
    // Add /api prefix to all requests except those that already have it
    if (!config.url?.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }

    const token = localStorage.getItem(STORAGE_KEYS.AUTH.JWT_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Handle unauthorized (e.g., redirect to login)
          localStorage.removeItem(STORAGE_KEYS.AUTH.JWT_TOKEN);
          window.location.href = '/login';
          break;
        case 403:
          // Handle forbidden
          console.error('Forbidden access:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
