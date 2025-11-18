import axios from 'axios';

/**
 * Creates a preconfigured Axios client for the frontend.
 * - Base URL is read from REACT_APP_API_BASE_URL with a safe default.
 * - Attaches Authorization header when a JWT token exists in localStorage.
 * - Provides simple error normalization.
 */
const rawBase =
  (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim()) ||
  // Default to backend dev port 3001; explicit scheme to avoid mixed-content issues
  'http://localhost:3001';

// Normalize base so it never ends with a trailing slash to avoid double slashes in requests
const baseURL = rawBase.replace(/\/+$/, '');

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow cookies if backend opts into credentials; harmless otherwise
  withCredentials: true,
});

// Request interceptor to include JWT token when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Attach Bearer token if present
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Attempt to extract a useful message
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Request failed';
    const status = error?.response?.status || 0;
    return Promise.reject({ message, status, raw: error });
  }
);

export default api;
