import { reportClientLog } from '../api/clientLogs';

export function logClientError(error, context = {}) {
    reportClientLog({
        level: 'error',
        message: error?.message || String(error),
        stack: error?.stack,
        url: window.location.href,
        context,
    });
}

export function logClientWarning(message, context = {}) {
    reportClientLog({ level: 'warning', message, url: window.location.href, context });
}

export function initGlobalErrorLogging() {
    window.addEventListener('error', (event) => {
        logClientError(event.error || new Error(event.message), { type: 'window.onerror' });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        logClientError(reason instanceof Error ? reason : new Error(String(reason)), { type: 'unhandledrejection' });
    });
}