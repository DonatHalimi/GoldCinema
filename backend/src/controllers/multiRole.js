const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');

const ACCESS_TTL = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const DAY_MS = 24 * 60 * 60 * 1000;

function cookieOptions(maxAge) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge,
    };
}

function clearAuthCookies(res) {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };
    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);
}

function assignedRolesFor(user) {
    return user.roles?.length ? user.roles : (user.role ? [user.role] : []);
}

function serializeRole(role) {
    return {
        id: String(role._id || role.id),
        name: role.name,
        description: role.description || '',
    };
}

function needsRoleSelection(roles) {
    const names = roles.map((role) => String(role.name || '').toLowerCase());
    return roles.length > 1 || names.some((name) => ['admin', 'super_admin'].includes(name));
}

async function getMe(req, res) {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
    });

    const roles = assignedRolesFor(req.user);
    const activeRole = req.activeRole || req.user.role || null;

    return res.json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            role: activeRole?.name || null,
            roles: roles.map(serializeRole),
            activeRole: activeRole ? serializeRole(activeRole) : null,
            roleSelectionRequired: req.roleSelectionRequired,
            emailVerified: req.user.emailVerified,
            twoFactor: {
                enabled: req.user.twoFactor?.enabled || false,
                methods: req.user.twoFactor?.methods || [],
            },
            loginAlerts: req.user.loginAlerts ?? true,
        },
    });
}

async function rotateSession(req, res, selectedRole) {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (!rawRefreshToken || !req.authSession) {
        const error = new Error('Your session has expired. Please log in again.');
        error.status = 401;
        throw error;
    }

    const user = req.user;
    const session = req.authSession;
    const sessionId = session._id;
    const now = new Date();
    const maxAge = Math.max(1000, new Date(session.expiresAt).getTime() - now.getTime());
    const refreshExpiresIn = session.rememberMe ? '30d' : REFRESH_TTL;

    const accessToken = jwt.sign(
        {
            id: user._id,
            sid: sessionId,
            activeRole: selectedRole.name,
            roleId: String(selectedRole._id),
        },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TTL }
    );

    const refreshToken = jwt.sign(
        { id: user._id, sid: sessionId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: refreshExpiresIn }
    );

    const update = await User.updateOne(
        {
            _id: user._id,
            refreshTokens: {
                $elemMatch: {
                    _id: sessionId,
                    token: rawRefreshToken,
                    revokedAt: null,
                    expiresAt: { $gt: now },
                },
            },
        },
        {
            $set: {
                'refreshTokens.$.token': refreshToken,
                'refreshTokens.$.activeRole': selectedRole._id,
                'refreshTokens.$.roleSelectionComplete': true,
                'refreshTokens.$.lastActiveAt': now,
            },
        }
    );

    if (!update.modifiedCount) {
        const error = new Error('This session has already changed. Please refresh and try again.');
        error.status = 409;
        throw error;
    }

    res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, cookieOptions(maxAge));
    await User.updateOne(
        { _id: user._id },
        {
            $push: {
                securityEvents: {
                    type: 'active_role_changed',
                    title: 'Active Role Changed',
                    description: `Session role changed to ${selectedRole.name}. IP: ${req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'Unknown'}`,
                    createdAt: now,
                }
            }
        }
    );

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: selectedRole.name,
            activeRole: serializeRole(selectedRole),
            roles: assignedRolesFor(user).map(serializeRole),
            roleSelectionRequired: false,
        },
    };
}

async function selectRole(req, res, next) {
    try {
        const { role } = req.body || {};
        if (!role) return res.status(400).json({ error: 'A role is required.', code: 'ROLE_REQUIRED' });

        const roles = assignedRolesFor(req.user);
        const selectedRole = roles.find((item) =>
            String(item._id || item).toLowerCase() === String(role).toLowerCase() ||
            String(item.name || '').toLowerCase() === String(role).toLowerCase()
        );

        if (!selectedRole) {
            return res.status(403).json({ error: 'This role is not assigned to your account.', code: 'ROLE_NOT_ASSIGNED' });
        }

        const roleDocument = selectedRole.name ? selectedRole : await Role.findById(selectedRole);
        if (!roleDocument) return res.status(400).json({ error: 'The selected role no longer exists.' });

        const result = await rotateSession(req, res, roleDocument);
        return res.json({ message: 'Active role selected successfully.', ...result });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        return next(error);
    }
}

async function switchRole(req, res, next) {
    return selectRole(req, res, next);
}

async function refreshSession(req, res) {
    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) return res.status(401).json({ error: 'No refresh token provided.' });

    try {
        const decoded = jwt.verify(rawToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).populate('role roles');
        const session = user?.refreshTokens?.find((entry) => entry.token === rawToken);
        const now = new Date();

        if (!user || user.isActive === false || user.deletedAt || !session || session.revokedAt || !session.expiresAt || session.expiresAt <= now) {
            clearAuthCookies(res);
            return res.status(401).json({ error: 'Refresh session is invalid or expired.' });
        }

        if (user.tokensInvalidatedAt && decoded.iat * 1000 < user.tokensInvalidatedAt.getTime()) {
            clearAuthCookies(res);
            return res.status(401).json({ error: 'Session invalidated. Please log in again.' });
        }

        const roles = assignedRolesFor(user);
        const allowedIds = new Set(roles.map((item) => String(item._id || item)));
        let activeRole = session.activeRole
            ? (typeof session.activeRole === 'object' && session.activeRole.name
                ? session.activeRole
                : await Role.findById(session.activeRole))
            : user.role;

        if (activeRole && !allowedIds.has(String(activeRole._id))) activeRole = null;

        let roleSelectionComplete = session.roleSelectionComplete === true && Boolean(activeRole);
        if (!roleSelectionComplete && !needsRoleSelection(roles)) {
            activeRole = roles[0]?.name ? roles[0] : await Role.findById(roles[0]);
            roleSelectionComplete = true;
        }

        const maxAge = Math.max(1000, new Date(session.expiresAt).getTime() - now.getTime());
        const sessionId = session._id;
        const accessPayload = { id: user._id, sid: sessionId };
        if (roleSelectionComplete && activeRole) {
            accessPayload.activeRole = activeRole.name;
            accessPayload.roleId = String(activeRole._id);
        }

        const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
        const refreshToken = jwt.sign(
            { id: user._id, sid: sessionId },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: session.rememberMe ? '30d' : REFRESH_TTL }
        );

        const update = await User.updateOne(
            { _id: user._id, 'refreshTokens.token': rawToken },
            {
                $set: {
                    'refreshTokens.$.token': refreshToken,
                    'refreshTokens.$.activeRole': roleSelectionComplete ? activeRole._id : null,
                    'refreshTokens.$.roleSelectionComplete': roleSelectionComplete,
                    'refreshTokens.$.lastActiveAt': now,
                },
            }
        );

        if (!update.modifiedCount) {
            clearAuthCookies(res);
            return res.status(401).json({ error: 'Refresh token was already rotated.' });
        }

        res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
        res.cookie('refreshToken', refreshToken, cookieOptions(maxAge));
        return res.json({ message: 'Token refreshed successfully.' });
    } catch (error) {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'Refresh token is invalid or expired.' });
    }
}

module.exports = { getMe, selectRole, switchRole, refreshSession, needsRoleSelection, assignedRolesFor };