export const CATEGORIES = [
    'api_request',
    'auth',
    'payment',
    'admin_mutation',
    'client_error',
    'client_event',
];

export const CATEGORY_LABELS = {
    api_request: 'API Request',
    auth: 'Authentication',
    payment: 'Payment',
    admin_mutation: 'Admin Mutation',
    client_error: 'Client Error',
    client_event: 'Client Event',
};

export const CATEGORY_STYLES = {
    api_request: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    auth: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    payment: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    admin_mutation:
        'bg-marquee-gold/10 text-marquee-gold border-marquee-gold/20',
    client_error: 'bg-red-500/10 text-red-400 border-red-500/20',
    client_event: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export const SEVERITIES = ['info', 'warning', 'error', 'critical'];

export const SEVERITY_LABELS = {
    info: 'Info',
    warning: 'Warning',
    error: 'Error',
    critical: 'Critical',
};

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export const STATUS_RANGES = [
    { value: '2xx', label: '2xx Success' },
    { value: '3xx', label: '3xx Redirect' },
    { value: '4xx', label: '4xx Client Error' },
    { value: '5xx', label: '5xx Server Error' },
];

export const getMethodStyle = (value) => {
    switch (value) {
        case 'GET':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'POST':
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'PUT':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'PATCH':
            return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'DELETE':
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        default:
            return 'bg-marquee-panel2 text-marquee-cream border-marquee-line';
    }
};

export const getStatusStyle = (value) => {
    switch (value) {
        case '2xx':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case '3xx':
            return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        case '4xx':
            return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        case '5xx':
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        default:
            return 'bg-marquee-panel2 text-marquee-cream border-marquee-line';
    }
};

export const getStatusLabel = (value) => STATUS_RANGES.find((item) => item.value === value)?.label || value;

export const getCategoryLabel = (value) => CATEGORY_LABELS[value] || value?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'Unknown';

export const getCategoryStyle = (value) => CATEGORY_STYLES[value] || 'bg-marquee-panel2 text-marquee-muted border-marquee-line';

export const getSeverityStyle = (value) => {
    switch (value) {
        case 'critical':
        case 'error':
            return 'bg-red-500/10 text-red-400 border-red-500/20';

        case 'warning':
            return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

        case 'info':
        default:
            return 'bg-marquee-gold/10 text-marquee-gold border-marquee-gold/20';
    }
};