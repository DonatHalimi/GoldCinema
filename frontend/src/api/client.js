import axios from 'axios';
import { reportClientLog } from './clientLogs';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    withCredentials: true,
});

let refreshPromise = null;
let roleSelectionEventDispatched = false;

function isAuthRequest(url = '') {
    return /\/auth\/(login|register|refresh-token|select-role|switch-role|logout|logout-all)/.test(url);
}

api.interceptors.response.use(
    (response) => {
        const url = response.config?.url || '';
        if (url.includes('/auth/select-role') || url.includes('/auth/switch-role') ||
            (url.includes('/auth/me') && response.data?.user?.roleSelectionRequired === false)) {
            roleSelectionEventDispatched = false;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        const status = error.response?.status;
        const url = originalRequest.url || '';
        const responseData = error.response?.data || {};

        if (status === 428 && responseData.code === 'ROLE_SELECTION_REQUIRED') {
            if (!roleSelectionEventDispatched) {
                roleSelectionEventDispatched = true;
                window.dispatchEvent(new CustomEvent('auth:role-selection-required', {
                    detail: { roles: responseData.roles || [], user: responseData.user || null },
                }));
            }
            return Promise.reject(error);
        }

        if (!url.includes('/client-logs') && (!status || status >= 500)) {
            const message = responseData.error || responseData.message || error.message || 'Unexpected API failure';
            reportClientLog({
                level: 'error',
                message: `API request failed: ${originalRequest.method?.toUpperCase() || '?'} ${url || '?'} — ${message}`,
                url: window.location.href,
                context: { status },
            });
        }

        const isRefreshRequest = url.includes('/auth/refresh-token');
        if (status === 401 && isRefreshRequest) {
            window.dispatchEvent(new Event('auth:logout'));
            return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry && !isAuthRequest(url)) {
            originalRequest._retry = true;
            try {
                if (!refreshPromise) {
                    refreshPromise = axios.post(
                        `${api.defaults.baseURL}/auth/refresh-token`,
                        {},
                        { withCredentials: true }
                    ).finally(() => { refreshPromise = null; });
                }
                await refreshPromise;
                return api(originalRequest);
            } catch (refreshError) {
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;