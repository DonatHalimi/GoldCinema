import api from './client';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export async function getSocialAccounts() {
    const { data } = await api.get('/auth/connected-accounts');

    return data;
}

export async function linkSocialAccount(provider, payload) {
    const { data } = await api.post(`/auth/connected-accounts/${provider}/link`, payload);

    return data;
}

export async function sendSocialUnlinkCode(provider, method, currentPassword) {
    const { data } = await api.post(`/auth/connected-accounts/${provider}/unlink-code`, { method, currentPassword });

    return data;
}

export async function unlinkSocialAccount(provider, payload) {
    const { data } = await api.post(`/auth/connected-accounts/${provider}/unlink`, payload);

    return data;
}

export function startGithubAccountLink() {
    window.location.assign(`${API_BASE}/auth/connected-accounts/github/link`);
}

export function startGithubAccountUnlink() {
    window.location.assign(`${API_BASE}/auth/connected-accounts/github/unlink`);
}

export function startGoogleAccountLink() {
    window.location.assign(`${API_BASE}/auth/connected-accounts/google/link`);
}

export function startGoogleAccountUnlink() {
    window.location.assign(`${API_BASE}/auth/connected-accounts/google/unlink`);
}