import axios from 'axios';
import { reportClientLog } from './clientLogs';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:4000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (!originalRequest) return Promise.reject(err);

    const is401 = err.response?.status === 401;

    const isLoginRequest = originalRequest.url?.includes('/auth/login');

    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh-token');

    if (!originalRequest?.url?.includes('/client-logs')) {
      reportClientLog({
        level: 'error',
        message: `API request failed: ${originalRequest?.method?.toUpperCase() || '?'} ${originalRequest?.url || '?'} — ${message}`,
        url: window.location.href,
        context: { status: err.response?.status },
      });
    }

    if (is401 && isRefreshRequest) {
      window.dispatchEvent(new Event('auth:logout'));

      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    if (is401 && !originalRequest._retry && !isLoginRequest && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true, });

        return api(originalRequest);
      } catch (refreshErr) {
        window.dispatchEvent(new Event('auth:logout'));

        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export default api;