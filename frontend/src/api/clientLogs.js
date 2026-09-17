import api from './client';

export async function reportClientLog({ level = 'error', message, stack, url, context }) {
    try {
        await api.post('/client-logs', { level, message, stack, url, context });
    } catch {
    }
}