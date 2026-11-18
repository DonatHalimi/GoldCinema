const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const { OAuth2Client } = require('google-auth-library');
const { sendVerificationEmail } = require('../utils/mailer');
const { generateVerificationToken } = require('../utils/tokens');
const crypto = require('crypto');

const TRUSTED_DEVICE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;
const SMS_OTP_TTL_MS = 5 * 60 * 1000;
const MFA_MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;
const RESEND_MAX_PER_WINDOW = 3;
const RESEND_WINDOW_MS = 10 * 60 * 1000;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_STAGES_MIN = [1, 5, 15, 60];
const DAY_MS = 24 * 60 * 60 * 1000;

function routeAllowsPendingRoleSelection(req) {
    const allowed = new Set(['me', 'select-role', 'switch-role', 'refresh-token', 'logout', 'logout-all']);
    const routePath = String(req.path || '').split('?')[0].replace(/\/+$/, '').replace(/^\/+/, '');
    const basePath = String(req.baseUrl || '').replace(/\/+$/, '');

    if (basePath.endsWith('/auth') && allowed.has(routePath)) return true;

    const originalPath = String(req.originalUrl || req.url || '')
        .split('?')[0]
        .replace(/\/+$/, '');
    return /(?:^|\/)auth\/(?:me|select-role|switch-role|refresh-token|logout|logout-all)$/.test(originalPath);
}

const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken ||
            (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

        if (!token) return res.status(401).json({ error: 'Authentication required.' });
        if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Authentication is not configured.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).populate('role roles');

        if (!user) return res.status(401).json({ error: 'User no longer exists.' });
        if (user.tokensInvalidatedAt && decoded.iat * 1000 < user.tokensInvalidatedAt.getTime()) return res.status(401).json({ error: 'Session invalidated. Please log in again.' });

        if (user.isActive === false || user.deletedAt) return res.status(403).json({ error: 'This account has been deactivated.' });

        const rawRefreshToken = req.cookies?.refreshToken;
        const session = rawRefreshToken
            ? user.refreshTokens.find((entry) => entry.token === rawRefreshToken)
            : null;

        if (!session || session.revokedAt || !session.expiresAt || session.expiresAt <= new Date()) return res.status(401).json({ error: 'Session is no longer active. Please log in again.' });

        const assignedRoles = user.roles?.length ? user.roles : (user.role ? [user.role] : []);
        const assignedRoleIds = new Set(assignedRoles.map((role) => String(role._id || role)));
        let activeRole = session.activeRole ? (typeof session.activeRole === 'object' && session.activeRole.name
            ? session.activeRole
            : await Role.findById(session.activeRole))
            : user.role;

        if (activeRole && !assignedRoleIds.has(String(activeRole._id || activeRole))) activeRole = null;

        const roleFlowRequest = routeAllowsPendingRoleSelection(req);
        if (!roleFlowRequest && decoded.roleId && !session.activeRole) return res.status(428).json({ error: 'Your assigned active role changed. Select an available role.', code: 'ROLE_SELECTION_REQUIRED' });

        if (!roleFlowRequest && decoded.roleId && activeRole && String(decoded.roleId) !== String(activeRole._id)) return res.status(401).json({ error: 'The active role for this session has changed. Refresh your session.', code: 'ROLE_SESSION_STALE' });

        const roleNames = assignedRoles.map((role) => String(role.name || '').toLowerCase());
        const requiresSelection = assignedRoles.length > 1 || roleNames.some((name) => ['admin', 'super_admin'].includes(name));
        const selectionComplete = session.roleSelectionComplete === true && Boolean(activeRole);

        req.user = user;
        req.authSession = session;
        req.activeRole = activeRole;
        req.assignedRoles = assignedRoles;
        req.roleSelectionRequired = requiresSelection && !selectionComplete;

        if (req.roleSelectionRequired && !roleFlowRequest) {
            return res.status(428).json({
                error: 'Choose an active role before accessing this resource.',
                code: 'ROLE_SELECTION_REQUIRED',
                roles: assignedRoles.map((role) => ({ id: String(role._id), name: role.name, description: role.description || '' })),
                user: {
                    id: String(user._id),
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: null,
                    activeRole: null,
                    roles: assignedRoles.map((role) => ({ id: String(role._id), name: role.name, description: role.description || '' })),
                    roleSelectionRequired: true,
                },
            });
        }

        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Authentication required.' });
        return next(error);
    }
};

function optionalAuth(req, res, next) {
    const token = req.cookies?.accessToken ||
        (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) return next();
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) { }
    return next();
}

async function requireVerified(req, res, next) {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Authentication required. Please log in again.' });
        const user = await User.findById(userId);
        if (!user) return res.status(401).json({ error: 'Account not found. Please log in again.' });
        if (!user.emailVerified) return res.status(403).json({ error: 'Please verify your email address before ordering tickets.', code: 'EMAIL_NOT_VERIFIED' });
        req.dbUser = user;
        return next();
    } catch (err) {
        return next(err);
    }
}

function requireAdmin(req, res, next) {
    const activeRole = req.activeRole || req.user?.role;
    const roleName = String(typeof activeRole === 'object' ? activeRole?.name : activeRole || '').toLowerCase();
    if (!['admin', 'super_admin'].includes(roleName)) return res.status(403).json({ error: 'Administrator access required.' });
    return next();
}

async function checkTrustedDevice(req, res, next) {
    try {
        const rawToken = req.cookies?.trustedDeviceToken;
        if (!rawToken) return next();
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const user = await User.findOne({
            _id: req.user?._id || req.user?.id,
            'trustedDevices.tokenHash': tokenHash,
            'trustedDevices.expiresAt': { $gt: new Date() },
        });
        if (user) {
            req.isTrustedDevice = true;
            await User.updateOne(
                { _id: user._id, 'trustedDevices.tokenHash': tokenHash },
                { $set: { 'trustedDevices.$.lastUsedAt': new Date() } }
            );
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

const generateTokens = (userId, sessionId, refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN) => {
    const accessToken = jwt.sign(
        { id: userId, sid: sessionId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
        { id: userId, sid: sessionId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: refreshExpiresIn }
    );
    return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken, refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000) => {
    const base = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };

    res.cookie('accessToken', accessToken, { ...base, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...base, maxAge: refreshMaxAgeMs });
};

async function getCustomerRoleId() {
    const role = await Role.findOneAndUpdate(
        { name: 'customer' },
        { $setOnInsert: { name: 'customer', description: 'Default role for registered users.' } },
        { upsert: true, new: true }
    );
    return role._id;
}

async function issueVerificationEmail(user) {
    const { token, expiresAt } = generateVerificationToken();
    user.verificationToken = token;
    user.verificationTokenExpiresAt = expiresAt;
    await user.save();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
    await sendVerificationEmail({ to: user.email, name: user.name, verificationUrl });
}

module.exports = {
    TRUSTED_DEVICE_MAX_AGE_MS, EMAIL_OTP_TTL_MS, MFA_MAX_ATTEMPTS,
    MAX_FAILED_ATTEMPTS, LOCK_STAGES_MIN, DAY_MS, SMS_OTP_TTL_MS,
    RESEND_COOLDOWN_MS, RESEND_MAX_PER_WINDOW, RESEND_WINDOW_MS,
    googleClient, requireAuth, optionalAuth, requireVerified, requireAdmin,
    checkTrustedDevice, getCustomerRoleId, issueVerificationEmail,
    generateTokens, setCookies,
};