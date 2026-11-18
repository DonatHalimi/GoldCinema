const DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
];

function normalizeOrigin(value) {
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
}

function getAllowedOrigins() {
    return [
        ...DEFAULT_ALLOWED_ORIGINS,
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
    ]
        .filter(Boolean)
        .map(normalizeOrigin)
        .filter(Boolean);
}

function requireSameOrigin(req, res, next) {
    const source = req.get('origin') || req.get('referer');

    if (!source) return res.status(403).json({ error: 'The request origin could not be verified.', });

    const requestOrigin = normalizeOrigin(source);

    if (!requestOrigin || !getAllowedOrigins().includes(requestOrigin)) return res.status(403).json({ error: 'This request origin is not allowed.', });

    return next();
}

module.exports = requireSameOrigin;