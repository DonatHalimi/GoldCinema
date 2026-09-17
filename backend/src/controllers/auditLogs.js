const AuditLog = require('../models/auditLog');

const STATUS_RANGES = {
    '2xx': { $gte: 200, $lt: 300 },
    '3xx': { $gte: 300, $lt: 400 },
    '4xx': { $gte: 400, $lt: 500 },
    '5xx': { $gte: 500, $lt: 600 },
};

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getAuditLogs(req, res, next) {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100);
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.category) filter.category = req.query.category;

        if (req.query.severity) filter.severity = req.query.severity;

        if (req.query.method) {
            const methods = String(req.query.method)
                .split(',')
                .map((m) => m.trim().toUpperCase())
                .filter(Boolean);
            if (methods.length === 1) {
                filter.method = methods[0];
            } else if (methods.length > 1) {
                filter.method = { $in: methods };
            }
        }

        if (req.query.status) {
            const statusRaw = String(req.query.status).trim().toLowerCase();

            if (STATUS_RANGES[statusRaw]) {
                filter.statusCode = STATUS_RANGES[statusRaw];
            } else if (/^\d{3}$/.test(statusRaw)) {
                filter.statusCode = parseInt(statusRaw, 10);
            } else if (statusRaw.includes('-')) {
                const [min, max] = statusRaw.split('-').map((n) => parseInt(n, 10));
                if (!Number.isNaN(min) && !Number.isNaN(max)) filter.statusCode = { $gte: min, $lte: max };
            }
        }

        if (req.query.userId) filter['actor.userId'] = req.query.userId;

        if (req.query.from || req.query.to) {
            filter.createdAt = {};
            if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
            if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
        }

        if (req.query.search && String(req.query.search).trim()) {
            const term = escapeRegex(String(req.query.search).trim());
            const rx = new RegExp(term, 'i');

            const or = [
                { action: rx },
                { path: rx },
                { method: rx },
                { category: rx },
                { severity: rx },
                { 'actor.email': rx },
                { 'actor.userId': rx },
                { 'resource.type': rx },
                { 'resource.id': rx },
            ];

            if (/^\d{3}$/.test(term)) {
                or.push({ statusCode: parseInt(term, 10) });
            }
            or.push({ $expr: { $regexMatch: { input: { $toString: '$metadata' }, regex: term, options: 'i' } } });
            or.push({ $expr: { $regexMatch: { input: { $toString: '$changes' }, regex: term, options: 'i' } } });

            filter.$or = or;
        }

        const [data, total] = await Promise.all([
            AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            AuditLog.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data,
            total,
            page,
            pages: Math.ceil(total / limit) || 1,
        });
    } catch (err) {
        next(err);
    }
}

async function getAuditLogById(req, res, next) {
    try {
        const log = await AuditLog.findById(req.params.id);
        if (!log) return res.status(404).json({ error: 'Audit log entry not found.' });
        res.json({ success: true, data: log });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAuditLogs, getAuditLogById };