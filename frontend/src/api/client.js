import axios from 'axios';
import { reportClientLog } from './clientLogs';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/+$/, ''),
    withCredentials: true,
});

let refreshPromise = null;
let refreshController = null;
let roleSelectionEventDispatched = false;
let authRequestState = 'unauthenticated';
const SESSION_MARKER = 'goldcinema:session-active';

function isNonRefreshableAuthRequest(url = '') {
    return /\/auth\/(login|register|refresh-token|select-role|switch-role|logout|logout-all)(?:[/?]|$)/.test(url);
}

export function setAuthRequestState(state) {
    authRequestState = state;
    try {
        if (state === 'authenticated') window.localStorage.setItem(SESSION_MARKER, 'true');
        if (state === 'unauthenticated' || state === 'logging-out') window.localStorage.removeItem(SESSION_MARKER);
    } catch {
        // Authentication remains cookie-backed when browser storage is unavailable.
    }
}

export function getInitialAuthRequestState() {
    try {
        return window.localStorage.getItem(SESSION_MARKER) === 'true' ? 'checking' : 'unauthenticated';
    } catch {
        return 'unauthenticated';
    }
}

export async function beginAuthLogout() {
    setAuthRequestState('logging-out');
    refreshController?.abort();
    if (refreshPromise) {
        try {
            await refreshPromise;
        } catch {
            // A cancelled or rejected refresh must not delay local logout.
        }
    }
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

        if (error.code !== 'ERR_CANCELED' && !url.includes('/client-logs') && (!status || status >= 500)) {
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
            if (authRequestState === 'authenticated') {
                window.dispatchEvent(new Event('auth:logout'));
            }
            return Promise.reject(error);
        }

        const isCurrentProfileRequest = /\/auth\/me(?:[/?]|$)/.test(url);
        const canRefresh = authRequestState === 'authenticated' ||
            (authRequestState === 'checking' && isCurrentProfileRequest);
        if (
            status === 401 &&
            !originalRequest._retry &&
            !isNonRefreshableAuthRequest(url) &&
            authRequestState !== 'logging-out' &&
            canRefresh
        ) {
            originalRequest._retry = true;
            try {
                if (!refreshPromise) {
                    refreshController = new AbortController();
                    refreshPromise = axios.post(
                        `${api.defaults.baseURL}/auth/refresh-token`,
                        {},
                        { withCredentials: true, signal: refreshController.signal }
                    ).finally(() => {
                        refreshPromise = null;
                        refreshController = null;
                    });
                }
                await refreshPromise;
                if (authRequestState === 'logging-out') return Promise.reject(error);
                return api(originalRequest);
            } catch (refreshError) {
                if (authRequestState === 'authenticated') {
                    window.dispatchEvent(new Event('auth:logout'));
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;