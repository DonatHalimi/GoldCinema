const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const Role = require('../models/role');
const { generateVerificationToken, generatePasswordResetToken } = require('../utils/tokens');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');
const LoginAttempt = require('../models/loginAttempt');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_STAGES_MIN = [1, 5, 15, 60];
const DAY_MS = 24 * 60 * 60 * 1000;


const generateTokens = (userId, refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: refreshExpiresIn }
    );

    return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken, refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshMaxAgeMs,
    });
};

async function getCustomerRoleId() {
    const role = await Role.findOneAndUpdate(
        { name: 'customer' },
        {
            $setOnInsert: {
                name: 'customer',
                description: 'Default role for registered users.',
            },
        },
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

    await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl,
    });
}

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const defaultRole = await Role.findOne({ name: 'customers' });
        const passwordHash = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const user = await User.create({
            name,
            email,
            passwordHash,
            role: defaultRole?._id,
            verificationToken,
        });

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await user.save();
        setCookies(res, accessToken, refreshToken);

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

        await sendVerificationEmail({
            to: user.email,
            name: user.name,
            verificationUrl,
        });

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.',
            user: { id: user._id, email: user.email },
        });
    } catch (err) {
        next(err);
    }
}

async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(200).json({
                message: 'If that account exists, a password reset link has been sent to the email address on file.',
            });
        }

        const { token, expiresAt } = generatePasswordResetToken();
        user.passwordResetToken = token;
        user.passwordResetExpiresAt = expiresAt;
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl,
        });

        return res.json({
            message: 'If that account exists, a password reset link has been sent to the email address on file.',
        });
    } catch (err) {
        return next(err);
    }
}

async function resetPassword(req, res, next) {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({ passwordResetToken: token });
        if (!user) {
            return res.status(400).json({ error: 'This password reset link is invalid.' });
        }

        if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date()) {
            user.passwordResetToken = null;
            user.passwordResetExpiresAt = null;
            await user.save();
            return res.status(400).json({
                error: 'This password reset link has expired. Please request a new one.',
                code: 'TOKEN_EXPIRED',
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        user.passwordHash = passwordHash;
        user.passwordResetToken = null;
        user.passwordResetExpiresAt = null;
        user.refreshTokens = [];
        await user.save();

        return res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        return next(err);
    }
}

async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const match = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ error: 'New password must be different from your current password.' });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.refreshTokens = []; // invalidate other sessions
        await user.save();

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (err) {
        next(err);
    }
}

async function deleteAccount(req, res, next) {
    try {
        const { password } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        user.isActive = false;
        user.deletedAt = new Date();
        user.refreshTokens = [];
        await user.save();

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({ message: 'Your account has been deactivated and will be permanently deleted after the grace period.' });
    } catch (err) {
        next(err);
    }
}

async function recordAttempt({ email, user, req, success, reason }) {
    try {
        await LoginAttempt.create({
            email: String(email || '').toLowerCase().trim(),
            user: user?._id || null,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            success,
            reason,
        });
    } catch (err) {
        console.error('Failed to record login attempt:', err);
    }
}

async function login(req, res) {
    const { email, password, rememberMe } = req.body;

    try {
        const user = await User.findOne({ email }).populate('role');

        if (user?.isActive === false) {
            await recordAttempt({ email, user, req, success: false, reason: 'inactive_account' });
            return res.status(403).json({ message: 'This account has been deactivated.' });
        }

        if (user?.lockUntil && user.lockUntil > new Date()) {
            await recordAttempt({ email, user, req, success: false, reason: 'locked' });
            const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                message: `Too many failed attempts. Try again in ${waitMinutes} minute(s).`,
            });
        }

        const passwordValid = user && (await bcrypt.compare(password, user.passwordHash));

        if (!passwordValid) {
            if (user) {
                user.failedLoginAttempts += 1;

                if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                    const stageIdx = Math.min(user.lockStage, LOCK_STAGES_MIN.length - 1);
                    const minutes = LOCK_STAGES_MIN[stageIdx];
                    user.lockUntil = new Date(Date.now() + minutes * 60 * 1000);
                    user.lockStage += 1;
                    user.failedLoginAttempts = 0;
                }

                await user.save();
            }

            await recordAttempt({ email, user, req, success: false, reason: 'invalid_credentials' });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        user.lockStage = 0;

        const refreshExpiresIn = rememberMe ? '30d' : '7d';
        const refreshMaxAgeMs = rememberMe ? 30 * DAY_MS : 7 * DAY_MS;

        const { accessToken, refreshToken } = generateTokens(
            user._id,
            refreshExpiresIn
        );

        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: new Date(Date.now() + refreshMaxAgeMs),
            createdAt: new Date(),
            rememberMe
        });

        await user.save();

        setCookies(res, accessToken, refreshToken, refreshMaxAgeMs);
        await recordAttempt({ email, user, req, success: true, reason: 'success' });

        res.json({
            message: 'Logged in successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        await recordAttempt({ email, user: null, req, success: false, reason: 'server_error' });
        res.status(500).json({ error: error.message });
    }
}

async function refreshToken(req, res) {
    try {
        const currentRefreshToken = req.cookies?.refreshToken;

        if (!currentRefreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        let decoded;
        try {
            decoded = jwt.verify(currentRefreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (jwtErr) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(403).json({ message: 'Expired or invalid refresh token' });
        }

        const user = await User.findOne({ 'refreshTokens.token': currentRefreshToken });

        if (!user) {
            await User.updateOne(
                { _id: decoded.id },
                { $set: { refreshTokens: [] } }
            );

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(403).json({ message: 'Invalid refresh token. All sessions revoked for security.' });
        }

        const now = new Date();
        const currentTokenData = user.refreshTokens.find(
            (rt) => rt.token === currentRefreshToken
        );

        if (!currentTokenData) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const updatedRefreshTokens = user.refreshTokens.filter(
            (rt) => rt.token !== currentRefreshToken && rt.expiresAt > now
        );

        const remainingMs = currentTokenData.expiresAt - Date.now();

        const remainingDays = Math.ceil(
            remainingMs / DAY_MS
        );

        const newTokens = generateTokens(
            user._id,
            `${remainingDays}d`
        );

        updatedRefreshTokens.push({
            token: newTokens.refreshToken,
            expiresAt: currentTokenData.expiresAt,
            createdAt: new Date(),
            rememberMe: currentTokenData.rememberMe,
        });

        user.refreshTokens = updatedRefreshTokens;
        await user.save();

        setCookies(res, newTokens.accessToken, newTokens.refreshToken);

        return res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function verifyEmail(req, res, next) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required.' });
        }

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ error: 'This verification link is invalid.' });
        }

        if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
            return res.status(400).json({
                error: 'This verification link has expired. Please request a new one.',
                code: 'TOKEN_EXPIRED',
            });
        }

        user.emailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiresAt = null;
        await user.save();

        res.json({ message: 'Email verified successfully.', user: user.toPublicJSON() });
    } catch (err) {
        next(err);
    }
}

async function resendVerification(req, res, next) {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ error: 'This account is already verified.' });
        }

        await issueVerificationEmail(user);
        res.json({ message: 'Verification email sent.' });
    } catch (err) {
        next(err);
    }
}

async function googleLogin(req, res, next) {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required.' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload?.email?.toLowerCase();

        if (!email || !payload?.email_verified) {
            return res.status(400).json({ error: 'Google account could not be verified.' });
        }

        const name = payload.name || payload.given_name || email.split('@')[0];

        let user = await User.findOne({ email }).populate('role');

        if (!user) {
            const roleId = await getCustomerRoleId();
            const passwordHash = await bcrypt.hash(
                `${Date.now()}-google-${Math.random().toString(36).slice(2)}`,
                10
            );

            user = await User.create({
                name,
                email,
                passwordHash,
                role: roleId,
                emailVerified: true,
            });

            user = await User.findById(user._id).populate('role');
        }

        user.name = user.name || name;
        user.emailVerified = true;

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await user.save();
        setCookies(res, accessToken, refreshToken);

        return res.json({
            message: 'Logged in with Google successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function facebookLogin(req, res, next) {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Facebook access token is required.' });
        }

        const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(`${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`)}`;
        const debugResponse = await fetch(debugTokenUrl);
        const debugData = await debugResponse.json();

        if (!debugData?.data?.is_valid || debugData.data.app_id !== process.env.FACEBOOK_APP_ID) {
            return res.status(400).json({ error: 'Facebook account could not be verified.' });
        }

        const profileUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`;
        const profileResponse = await fetch(profileUrl);
        const profileData = await profileResponse.json();
        const email = profileData?.email?.toLowerCase();

        if (!email) {
            return res.status(400).json({ error: 'Facebook email permission is required.' });
        }

        const name = profileData.name || email.split('@')[0];
        let user = await User.findOne({ email }).populate('role');

        if (!user) {
            const roleId = await getCustomerRoleId();
            const passwordHash = await bcrypt.hash(
                `${Date.now()}-facebook-${Math.random().toString(36).slice(2)}`,
                10
            );

            user = await User.create({
                name,
                email,
                passwordHash,
                role: roleId,
                emailVerified: true,
            });

            user = await User.findById(user._id).populate('role');
        }

        user.name = user.name || name;
        user.emailVerified = true;

        const { accessToken: appAccessToken, refreshToken } = generateTokens(user._id);
        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await user.save();
        setCookies(res, appAccessToken, refreshToken);

        return res.json({
            message: 'Logged in with Facebook successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function me(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .populate('role')
            .select('-passwordHash -refreshTokens');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const roleName = user.role?.name || user.role || 'user';
        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: roleName,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function logout(req, res) {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
        await User.updateOne(
            { 'refreshTokens.token': refreshToken },
            { $pull: { refreshTokens: { token: refreshToken } } }
        );
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
}

module.exports = {
    register,
    login,
    refreshToken,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    deleteAccount,
    googleLogin,
    facebookLogin,
    me,
    logout,
};