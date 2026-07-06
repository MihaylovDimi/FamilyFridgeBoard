import axios from 'axios';
import { auth } from './firebase';

/**
 * Axios instance pointing at the Express backend.
 * A request interceptor fetches the current Firebase ID token and
 * attaches it as a Bearer header on every call.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor — attach Firebase ID token ───────────────────────────

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error('Failed to get Firebase ID token:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — surface error messages ────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ??
      error.message ??
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default api;
