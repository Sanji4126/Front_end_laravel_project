import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // When running on production domain (e.g. Vercel), default to the live backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://laravel-backend-black.vercel.app/api';
  }
  return 'http://127.0.0.1:8000/api';
};

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry (401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
