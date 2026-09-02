const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const {
    generatePasswordResetToken,
    generateMfaPendingToken,
    verifyMfaPendingToken,
    generateBackupCodes,
    generateDeviceToken,
    hashDeviceToken,
} = require('../utils/tokens');
const { sendVerificationEmail, sendPasswordResetEmail, sendTwoFactorCode, sendLoginAlertEmail } = require('../utils/mailer');
const { authenticator } = require('@otplib/preset-default');
const LoginAttempt = require('../models/loginAttempt');
const qrcode = require('qrcode');
const crypto = require('crypto');
const { generateTokens, setCookies, issueVerificationEmail, googleClient, TRUSTED_DEVICE_MAX_AGE_MS, EMAIL_OTP_TTL_MS, MFA_MAX_ATTEMPTS, MAX_FAILED_ATTEMPTS, LOCK_STAGES_MIN, DAY_MS, } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { issueEmailOtp, issueSmsOtp } = require('../utils/mfaOtp');
const { findOrCreateSocialUser, completeSocialLogin } = require('../services/socialAuth');
const { notifyLoginAlert } = require('../utils/loginAlerts');
const { issueTrustedDevice } = require('../utils/deviceTrust');
const { addSecurityEvent, buildSessionMeta } = require('../utils/securityEvents');

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

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

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.', user: { id: user._id, email: user.email } });
    } catch (err) {
        next(err);
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
            return res.status(423).json({ message: `Too many failed attempts. Try again in ${waitMinutes} minute(s).` });
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

        notifyLoginAlert(user, req, 'Password');

        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        user.lockStage = 0;

        if (user.twoFactor?.enabled && user.twoFactor.methods?.length > 0) {
            const trustedEntry = findTrustedDeviceEntry(user, req);

            if (trustedEntry) {
                trustedEntry.lastUsedAt = new Date();
            } else {
                const mfaToken = generateMfaPendingToken(user._id);
                const methods = user.twoFactor.methods;

                if (methods.includes('email')) {
                    await issueEmailOtp(user, { save: false });
                }

                if (methods.includes('sms')) {
                    await issueSmsOtp(user, { save: false });
                }

                await addSecurityEvent(user, {
                    type: 'login_password_mfa_pending',
                    title: 'Successful Login',
                    description: `IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown'} - Reason: password_ok_mfa_pending`,
                });

                await user.save();

                await recordAttempt({ email, user, req, success: true, reason: 'password_ok_mfa_pending' });

                return res.status(200).json({ mfaRequired: true, methods, mfaToken, rememberMe });
            }
        }

        const refreshExpiresIn = rememberMe ? '30d' : '7d';
        const refreshMaxAgeMs = rememberMe ? 30 * DAY_MS : 7 * DAY_MS;

        if (rememberMe) await issueTrustedDevice(user, req, res);

        const { accessToken, refreshToken } = generateTokens(user._id, refreshExpiresIn);

        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: new Date(Date.now() + refreshMaxAgeMs),
            createdAt: new Date(),
            rememberMe,
            ...buildSessionMeta(req, 'password'),
        });

        await addSecurityEvent(user, {
            type: 'login_password',
            title: 'Successful Login',
            description: `IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown'} - Method: password`,
        });

        await user.save();

        setCookies(res, accessToken, refreshToken, refreshMaxAgeMs);

        await recordAttempt({ email, user, req, success: true, reason: 'success' });

        createNotification({
            userId: user._id,
            title: 'New Login Detected',
            message: 'You successfully logged in to GoldCinema account.',
            type: 'login',
            link: '/account/security',
            metadata: {
                ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
                time: new Date().toISOString(),
            },
        });

        return res.json({
            message: 'Logged in successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        await recordAttempt({
            email,
            user: null,
            req,
            success: false,
            reason: 'server_error',
        });

        return res.status(500).json({ error: error.message });
    }
}

async function googleLogin(req, res, next) {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ error: 'Google credential is required.' });

        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const email = payload?.email?.toLowerCase();

        if (!email || !payload?.email_verified) return res.status(400).json({ error: 'Google account could not be verified.' });

        const name = payload.name || payload.given_name || email.split('@')[0];
        const user = await findOrCreateSocialUser(email, name, 'google');
        const result = await completeSocialLogin({ req, res, user, provider: 'Google' });

        if (result.mfaRequired) return res.json({ message: 'Two-factor authentication required.', ...result });

        return res.json({
            message: 'Logged in with Google successfully',
            user: { id: result.user._id, name: result.user.name, email: result.user.email, role: result.user.role },
        });
    } catch (error) {
        next(error);
    }
}

async function facebookLogin(req, res, next) {
    try {
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ error: 'Facebook access token is required.' });

        const debugTokenUrl =
            `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}` +
            `&access_token=${encodeURIComponent(`${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`)}`;
        const debugResponse = await fetch(debugTokenUrl);
        const debugData = await debugResponse.json();

        if (!debugData?.data?.is_valid || debugData.data.app_id !== process.env.FACEBOOK_APP_ID) return res.status(400).json({ error: 'Facebook account could not be verified.' });

        const profileUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`;
        const profileResponse = await fetch(profileUrl);
        const profileData = await profileResponse.json();
        const email = profileData?.email?.toLowerCase();

        if (!email) return res.status(400).json({ error: 'Facebook email permission is required.' });

        const name = profileData.name || email.split('@')[0];
        const user = await findOrCreateSocialUser(email, name, 'facebook');
        const result = await completeSocialLogin({ req, res, user, provider: 'Facebook' });

        if (result.mfaRequired) return res.json({ message: 'Two-factor authentication required.', ...result });

        return res.json({
            message: 'Logged in with Facebook successfully',
            user: { id: result.user._id, name: result.user.name, email: result.user.email, role: result.user.role },
        });
    } catch (error) {
        next(error);
    }
}

async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(200).json({ message: 'If that account exists, a password reset link has been sent to the email address on file.' });

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

        return res.json({ message: 'If that account exists, a password reset link has been sent to the email address on file.' });
    } catch (err) {
        return next(err);
    }
}

async function resetPassword(req, res, next) {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({ passwordResetToken: token });
        if (!user) return res.status(400).json({ error: 'This password reset link is invalid.' });

        if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date()) {
            user.passwordResetToken = null;
            user.passwordResetExpiresAt = null;
            await user.save();
            return res.status(400).json({ error: 'This password reset link has expired. Please request a new one.', code: 'TOKEN_EXPIRED' });
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
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const match = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });

        if (currentPassword === newPassword) return res.status(400).json({ error: 'New password must be different from your current password.' });

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.refreshTokens = [];
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
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ error: 'Incorrect password.' });

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

async function refreshToken(req, res) {
    try {
        const currentRefreshToken = req.cookies?.refreshToken;

        if (!currentRefreshToken) return res.status(401).json({ message: 'No refresh token provided' });

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
            await User.updateOne({ _id: decoded.id }, { $set: { refreshTokens: [] } });

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(403).json({ message: 'Invalid refresh token. All sessions revoked for security.' });
        }

        const now = new Date();
        const currentTokenData = user.refreshTokens.find((rt) => rt.token === currentRefreshToken);

        if (!currentTokenData) return res.status(403).json({ message: 'Invalid refresh token' });

        const updatedRefreshTokens = user.refreshTokens.filter((rt) => rt.token !== currentRefreshToken && rt.expiresAt > now);

        const remainingMs = currentTokenData.expiresAt - Date.now();

        const remainingDays = Math.ceil(remainingMs / DAY_MS);

        const newTokens = generateTokens(user._id, `${remainingDays} d`);

        updatedRefreshTokens.push({
            token: newTokens.refreshToken,
            expiresAt: currentTokenData.expiresAt,
            createdAt: new Date(),
            rememberMe: currentTokenData.rememberMe,
            ipAddress: currentTokenData.ipAddress || null,
            userAgent: currentTokenData.userAgent || null,
            deviceLabel: currentTokenData.deviceLabel || null,
            loginMethod: currentTokenData.loginMethod || null,
            lastActiveAt: new Date(),
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

        if (!token) return res.status(400).json({ error: 'Verification token is required.' });

        const user = await User.findOne({ verificationToken: token });

        if (!user) return res.status(400).json({ error: 'This verification link is invalid.' });

        if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) return res.status(400).json({ error: 'This verification link has expired. Please request a new one.', code: 'TOKEN_EXPIRED' });

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

        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (user.emailVerified) return res.status(400).json({ error: 'This account is already verified.' });

        await issueVerificationEmail(user);
        res.json({ message: 'Verification email sent.' });
    } catch (err) {
        next(err);
    }
}

async function me(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .populate('role')
            .select('-passwordHash -refreshTokens');

        if (!user) return res.status(404).json({ error: 'User not found' });

        const roleName = user.role?.name || user.role || 'user';
        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: roleName,
                emailVerified: user.emailVerified,
                twoFactor: {
                    enabled: user.twoFactor.enabled,
                    methods: user.twoFactor.methods || [],
                },
                loginAlerts: user.loginAlerts
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateProfile(req, res, next) {
    try {
        const { name, email } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found.', });

        if (email && email.toLowerCase() !== user.email) {
            const exists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id }, });
            if (exists) return res.status(400).json({ error: 'Email already in use.', });

            user.email = email.toLowerCase();
            user.emailVerified = false;

            await issueVerificationEmail(user);
        }

        if (name) user.name = name;

        await user.save();

        res.json({
            message: 'Profile updated successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
            },
        });
    } catch (err) {
        next(err);
    }
}

function setTrustedDeviceCookie(res, rawToken) {
    res.cookie('trustedDevice', rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: TRUSTED_DEVICE_MAX_AGE_MS,
    });
}

function findTrustedDeviceEntry(user, req) {
    const raw = req.cookies?.trustedDevice;
    if (!raw) return null;
    const hash = hashDeviceToken(raw);
    return user.trustedDevices?.find((d) => d.tokenHash === hash && d.expiresAt > new Date()) || null;
}

async function verifyLoginMfa(req, res, next) {
    try {
        const { mfaToken, code, method, rememberMe, trustDevice } = req.body;

        let decoded;

        try {
            decoded = verifyMfaPendingToken(mfaToken);
        } catch {
            return res.status(401).json({ error: 'MFA session expired. Please log in again.', });
        }

        const user = await User.findById(decoded.id)
            .select(
                '+twoFactor.totpSecret ' +
                '+twoFactor.emailOtpHash ' +
                '+twoFactor.emailOtpExpiresAt ' +
                '+twoFactor.smsOtpHash ' +
                '+twoFactor.smsOtpExpiresAt ' +
                '+twoFactor.backupCodes.codeHash'
            )
            .populate('role');

        if (!user || !user.twoFactor?.enabled) return res.status(400).json({ error: 'Two-factor authentication is not active on this account.' });

        if (user.mfaLockUntil && user.mfaLockUntil > new Date()) {
            const waitMinutes = Math.ceil((user.mfaLockUntil - Date.now()) / 60000);
            return res.status(423).json({ error: `Too many failed codes. Try again in ${waitMinutes} minute(s).` });
        }

        let verified = false;
        let verifiedMethod = method;

        const normalizedCode = String(code || '').trim();

        if (method === 'totp' && user.twoFactor.methods.includes('totp')) {
            try {
                verified = authenticator.verify({
                    secret: user.twoFactor.totpSecret,
                    token: normalizedCode,
                });
            } catch (err) {
                verified = false;
            }
        } else if (method === 'email' && user.twoFactor.methods.includes('email')) {
            verified = !!user.twoFactor.emailOtpHash &&
                user.twoFactor.emailOtpExpiresAt > new Date() &&
                (await bcrypt.compare(normalizedCode, user.twoFactor.emailOtpHash));

            if (verified) {
                verifiedMethod = 'email';
            }
        } else if (method === 'sms' && user.twoFactor.methods.includes('sms')) {
            verified = !!user.twoFactor.smsOtpHash &&
                user.twoFactor.smsOtpExpiresAt > new Date() &&
                (await bcrypt.compare(normalizedCode, user.twoFactor.smsOtpHash));
            if (verified) verifiedMethod = 'sms';
        }

        if (!verified && user.twoFactor.backupCodes?.length) {
            for (const backupCode of user.twoFactor.backupCodes) {
                if (!backupCode.usedAt && backupCode.codeHash) {
                    const matches = await bcrypt.compare(normalizedCode, backupCode.codeHash);

                    if (matches) {
                        backupCode.usedAt = new Date();
                        verified = true;
                        verifiedMethod = 'backup_code';
                        break;
                    }
                }
            }
        }

        if (!verified) {
            user.mfaFailedAttempts = (user.mfaFailedAttempts || 0) + 1;
            if (user.mfaFailedAttempts >= MFA_MAX_ATTEMPTS) {
                user.mfaLockUntil = new Date(Date.now() + 15 * 60 * 1000);
                user.mfaFailedAttempts = 0;
            }

            await user.save();

            return res.status(401).json({ error: 'Invalid or expired code.' });
        }

        user.mfaFailedAttempts = 0;
        user.mfaLockUntil = null;

        user.twoFactor.emailOtpHash = undefined;
        user.twoFactor.emailOtpExpiresAt = undefined;

        user.twoFactor.smsOtpHash = undefined;
        user.twoFactor.smsOtpExpiresAt = undefined;

        if (trustDevice) {
            const rawToken = generateDeviceToken();

            const deviceLabel = (req.headers['user-agent'] || 'Unknown device').slice(0, 120);

            user.trustedDevices = user.trustedDevices || [];

            user.trustedDevices.push({
                tokenHash: hashDeviceToken(rawToken),
                label: deviceLabel,
                expiresAt: new Date(
                    Date.now() +
                    TRUSTED_DEVICE_MAX_AGE_MS
                ),
            });

            setTrustedDeviceCookie(
                res,
                rawToken
            );

            await addSecurityEvent(user, {
                type: 'device_added',
                title: `Trusted Device Added (${deviceLabel})`,
                description:
                    'Device authorized for trusted sessions',
            });
        }

        const refreshExpiresIn = rememberMe ? '30d' : '7d';
        const refreshMaxAgeMs = rememberMe ? 30 * DAY_MS : 7 * DAY_MS;

        const { accessToken, refreshToken } = generateTokens(user._id, refreshExpiresIn);

        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: new Date(
                Date.now() +
                refreshMaxAgeMs
            ),
            createdAt: new Date(),
            rememberMe,
            ...buildSessionMeta(
                req,
                'mfa'
            ),
        });

        let loginMethodLabel;

        switch (verifiedMethod) {
            case 'totp':
                loginMethodLabel = 'Authenticator App';
                break;
            case 'email':
                loginMethodLabel = 'Email 2FA';
                break;
            case 'backup_code':
                loginMethodLabel = 'Backup Code';
                break;
            case 'sms':
                loginMethodLabel = 'SMS 2FA';
                break;
            default:
                loginMethodLabel = 'MFA';
        }

        await addSecurityEvent(user, {
            type: 'login_mfa',
            title: 'Successful Login',
            description: `IP: ${req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown'} - Method: ${loginMethodLabel}`,
        });

        createNotification({
            userId: user._id,
            title: 'New Login Detected',
            message: 'You successfully logged in to GoldCinema account.',
            type: 'login',
            link: '/account/security',
            metadata: {
                ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
                time: new Date().toISOString(),
            },
        });

        await user.save();

        setCookies(
            res,
            accessToken,
            refreshToken,
            refreshMaxAgeMs
        );

        return res.json({
            message: 'Logged in successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
}

async function setupTotp(req, res, next) {
    try {
        const user = await User.findById(req.user.id);

        const secret = authenticator.generateSecret();
        user.twoFactor.pendingMethod = 'totp';
        user.twoFactor.pendingTotpSecret = secret;
        await user.save();

        const otpauth = authenticator.keyuri(
            user.email,
            'GoldCinema',
            secret
        );

        const qrDataUrl = await qrcode.toDataURL(otpauth);

        res.json({ qrDataUrl, secret });
    } catch (err) {
        next(err);
    }
}

async function verifyTotpSetup(req, res, next) {
    try {
        const { code } = req.body;

        if (!code) return res.status(400).json({ error: 'Verification code is required' });

        const user = await User.findById(req.user.id).select('+twoFactor.pendingTotpSecret');

        if (!user.twoFactor.pendingTotpSecret) return res.status(400).json({ error: "No authenticator setup found" });

        const valid = authenticator.check(
            code,
            user.twoFactor.pendingTotpSecret
        );

        if (!valid) return res.status(400).json({ error: "Invalid authenticator code" });

        user.twoFactor.enabled = true;

        if (!user.twoFactor.methods.includes('totp')) user.twoFactor.methods.push('totp');

        user.twoFactor.totpSecret = user.twoFactor.pendingTotpSecret;

        user.twoFactor.pendingTotpSecret = null;
        user.twoFactor.pendingMethod = null;

        const backupCodes = generateBackupCodes();

        user.twoFactor.backupCodes = await Promise.all(backupCodes.map(async (code) => ({ codeHash: await bcrypt.hash(code, 10) })));

        await user.save();
        res.json({ message: "Authenticator app enabled", backupCodes });
    } catch (err) {
        next(err);
    }
}

async function enableEmail2fa(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        await issueEmailOtp(user, { pending: true });
        res.json({ message: 'Verification code sent to your email.' });
    } catch (err) {
        next(err);
    }
}

async function verifyEmail2faSetup(req, res, next) {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id).select('+twoFactor.emailOtpHash +twoFactor.emailOtpExpiresAt');

        const valid =
            user.twoFactor?.emailOtpHash &&
            user.twoFactor.emailOtpExpiresAt > new Date() &&
            (await bcrypt.compare(code, user.twoFactor.emailOtpHash));

        if (!valid) return res.status(400).json({ error: 'Invalid or expired code.' });

        user.twoFactor.enabled = true;

        if (!user.twoFactor.methods.includes('email')) user.twoFactor.methods.push('email');

        user.twoFactor.pendingMethod = null;
        user.twoFactor.emailOtpHash = undefined;
        user.twoFactor.emailOtpExpiresAt = undefined;

        const backupCodes = generateBackupCodes();
        user.twoFactor.backupCodes = await Promise.all(backupCodes.map(async (c) => ({ codeHash: await bcrypt.hash(c, 10) })));

        await user.save();
        res.json({ message: 'Email 2FA enabled.', backupCodes });
    } catch (err) {
        next(err);
    }
}

async function disable2fa(req, res, next) {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.id);

        if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Incorrect password.' });

        user.twoFactor = {
            enabled: false,
            methods: [],
            backupCodes: []
        };

        user.trustedDevices = [];
        await user.save();

        res.json({ message: 'Two-factor authentication disabled.' });
    } catch (err) {
        next(err);
    }
}

async function disable2faMethod(req, res, next) {
    try {
        const { password, method } = req.body;

        if (!method || !['email', 'totp', 'sms'].includes(method)) return res.status(400).json({ error: 'Invalid 2FA method.' });

        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Incorrect password.' });

        const currentMethods = user.twoFactor?.methods || [];

        if (!currentMethods.includes(method)) return res.status(400).json({ error: 'This 2FA method is not enabled.' });

        const methods = currentMethods.filter(
            (currentMethod) => currentMethod !== method
        );

        user.twoFactor = {
            enabled: methods.length > 0,
            methods,
            backupCodes: methods.length > 0
                ? user.twoFactor.backupCodes
                : []
        };

        if (methods.length === 0) user.trustedDevices = [];

        await user.save();

        res.json({
            message: method === 'email'
                ? 'Email two-factor authentication disabled.'
                : 'Authenticator app two-factor authentication disabled.',
            twoFactor: user.twoFactor
        });
    } catch (err) {
        next(err);
    }
}

async function resendLoginMfaCode(req, res, next) {
    try {
        const { mfaToken, method } = req.body;

        let decoded;
        try {
            decoded = verifyMfaPendingToken(mfaToken);
        } catch {
            return res.status(401).json({ error: 'MFA session expired. Please log in again.' });
        }

        const user = await User.findById(decoded.id).select('+twoFactor.lastResendAt +twoFactor.resendCount +twoFactor.resendWindowStart');

        if (!user?.twoFactor?.enabled) return res.status(400).json({ error: 'Two-factor authentication is not active on this account.' });

        const resolvedMethod = method && user.twoFactor.methods.includes(method)
            ? method
            : user.twoFactor.methods.find((m) => m === 'email' || m === 'sms');

        if (!resolvedMethod) return res.status(400).json({ error: 'Code resend is not available for this account.' });

        const now = new Date();

        if (user.twoFactor.lastResendAt && now - user.twoFactor.lastResendAt < RESEND_COOLDOWN_MS) {
            const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - user.twoFactor.lastResendAt)) / 1000);
            return res.status(429).json({ error: `Please wait ${waitSec}s before requesting another code.` });
        }

        if (!user.twoFactor.resendWindowStart || now - user.twoFactor.resendWindowStart > RESEND_WINDOW_MS) {
            user.twoFactor.resendWindowStart = now;
            user.twoFactor.resendCount = 0;
        }

        if (user.twoFactor.resendCount >= RESEND_MAX_PER_WINDOW) return res.status(429).json({ error: 'Too many code requests. Please try again later or log in again.' });

        user.twoFactor.resendCount += 1;
        user.twoFactor.lastResendAt = now;

        if (resolvedMethod === 'sms') {
            await issueSmsOtp(user, { save: false });
        } else {
            await issueEmailOtp(user, { save: false });
        }

        await user.save();
        res.json({ message: 'Code resent.' });
    } catch (err) {
        next(err);
    }
}

async function enableSms2fa(req, res, next) {
    try {
        const { phoneNumber } = req.body;
        const user = await User.findById(req.user.id);

        user.twoFactor.pendingMethod = 'sms';
        user.twoFactor.pendingPhoneNumber = phoneNumber;
        await issueSmsOtp(user, { pending: true });
        res.json({ message: 'Verification code sent to your phone.' });
    } catch (err) {
        next(err);
    }
}

async function verifySms2faSetup(req, res, next) {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id)
            .select('+twoFactor.smsOtpHash +twoFactor.smsOtpExpiresAt +twoFactor.pendingPhoneNumber');

        const valid =
            user.twoFactor?.smsOtpHash &&
            user.twoFactor.smsOtpExpiresAt > new Date() &&
            (await bcrypt.compare(code, user.twoFactor.smsOtpHash));

        if (!valid) return res.status(400).json({ error: 'Invalid or expired code.' });

        user.phoneNumber = user.twoFactor.pendingPhoneNumber;
        user.phoneVerified = true;
        user.twoFactor.enabled = true;

        if (!user.twoFactor.methods.includes('sms')) user.twoFactor.methods.push('sms');

        user.twoFactor.pendingMethod = null;
        user.twoFactor.pendingPhoneNumber = undefined;
        user.twoFactor.smsOtpHash = undefined;
        user.twoFactor.smsOtpExpiresAt = undefined;

        const backupCodes = generateBackupCodes();
        user.twoFactor.backupCodes = await Promise.all(
            backupCodes.map(async (c) => ({ codeHash: await bcrypt.hash(c, 10) }))
        );

        await user.save();
        res.json({ message: 'SMS 2FA enabled.', backupCodes });
    } catch (err) {
        next(err);
    }
}

async function updateLoginAlerts(req, res, next) {
    try {
        const userId = req.user._id;
        const { loginAlerts } = req.body;

        if (typeof loginAlerts !== 'boolean') return res.status(400).json({ error: 'Invalid value for loginAlerts.' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        user.loginAlerts = loginAlerts;
        await user.save();

        return res.json({ message: 'Login alerts updated successfully.', loginAlerts: user.loginAlerts });
    } catch (error) {
        next(error);
    }
}

async function getTrustedDevices(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('trustedDevices');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const devices = user.trustedDevices.map(device => ({
            _id: device._id,
            label: device.label || 'Unknown Device',
            createdAt: device.createdAt,
            lastUsedAt: device.lastUsedAt,
            expiresAt: device.expiresAt,
        }));

        res.json({ devices });
    } catch (err) {
        next(err);
    }
}

async function revokeTrustedDevice(req, res, next) {
    try {
        const { deviceId } = req.params;
        const { password } = req.body;

        if (!password) return res.status(400).json({ error: 'Password is required to revoke a device.' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Incorrect password.' });

        const device = user.trustedDevices.id(deviceId) || user.trustedDevices.find((d) => d._id.toString() === deviceId);
        const deviceLabel = device?.label || 'Unknown Device';

        const initialLength = user.trustedDevices.length;
        user.trustedDevices = user.trustedDevices.filter((d) => d._id.toString() !== deviceId);

        if (user.trustedDevices.length === initialLength) return res.status(404).json({ error: 'Device not found.' });

        user.securityEvents.push({
            title: 'Trusted Device Revoked',
            description: `Removed trusted status for ${deviceLabel}`,
            type: 'device_revoked',
            createdAt: new Date(),
        });

        await user.save();

        res.json({ message: 'Device removed successfully.' });
    } catch (err) {
        next(err);
    }
}

async function getSecurityActivity(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('createdAt passkeys trustedDevices securityEvents');

        if (!user) return res.status(404).json({ error: 'User not found' });

        const activities = [];

        if (user.createdAt) {
            activities.push({
                id: 'account-created',
                title: 'Account created',
                description: 'Your account was successfully registered',
                date: user.createdAt,
                type: 'account',
            });
        }

        if (user.passkeys && Array.isArray(user.passkeys)) {
            user.passkeys.forEach((pk, index) => {
                activities.push({
                    id: `passkey-${pk.credentialId || index}`,
                    title: `Passkey Registered (${pk.name || 'Passkey'})`,
                    description: `Device type: ${pk.deviceType || 'Unknown'}`,
                    date: pk.createdAt || new Date(),
                    type: 'passkey',
                });
            });
        }

        if (user.securityEvents && Array.isArray(user.securityEvents)) {
            user.securityEvents.forEach((ev) => {
                activities.push({
                    id: `event-${ev._id}`,
                    title: ev.title,
                    description: ev.description,
                    date: ev.createdAt || new Date(),
                    type: ev.type,
                });
            });
        }

        try {
            const loginAttempts = await LoginAttempt.find({ user: user._id })
                .sort({ createdAt: -1 })
                .limit(10);

            loginAttempts.forEach((attempt) => {
                activities.push({
                    id: `login-attempt-${attempt._id}`,
                    title: attempt.success ? 'Successful Login' : 'Failed Login Attempt',
                    description: `IP: ${attempt.ip || 'Unknown'} - Reason: ${attempt.reason || 'N/A'}`,
                    date: attempt.createdAt || new Date(),
                    type: attempt.success ? 'login_success' : 'login_failed',
                });
            });
        } catch (attemptErr) {
            console.error('Failed to fetch login attempts for activity:', attemptErr);
        }

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ activities });
    } catch (err) {
        next(err);
    }
}

async function generateBackupCodesRoute(req, res) {
    try {
        const user = req.user;

        if (!user.twoFactor?.enabled || !user.twoFactor?.methods?.includes('totp'))
            return res.status(400).json({ error: 'Authenticator App 2FA must be enabled to generate backup codes.', });

        const now = new Date();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        const lastRegenerated = user.twoFactor.backupCodesRegeneratedAt;
        let regenerationCount = user.twoFactor.backupCodesRegenerationCount || 0;

        if (!lastRegenerated || now.getTime() - new Date(lastRegenerated).getTime() >= twentyFourHours) regenerationCount = 0;

        if (regenerationCount >= 3) {
            const resetAt = new Date(new Date(lastRegenerated).getTime() + twentyFourHours);
            const remainingMs = resetAt.getTime() - now.getTime();
            const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

            return res.status(429).json({
                error: `You have reached the backup code regeneration limit. Please try again in approximately ${remainingHours} hour${remainingHours === 1 ? '' : 's'}.`,
                limit: 3,
                regenerationCount,
                resetAt,
            });
        }

        const rawCodes = Array.from({ length: 8 }, () =>
            crypto.randomBytes(4).toString('hex').toUpperCase()
        );

        const hashedCodes = await Promise.all(
            rawCodes.map(async (code) => ({
                codeHash: await bcrypt.hash(code, 10),
                usedAt: null,
            }))
        );

        user.twoFactor.backupCodes = hashedCodes;
        user.twoFactor.backupCodesRegenerationCount = regenerationCount + 1;
        user.twoFactor.backupCodesRegeneratedAt = now;

        await user.save();

        res.json({
            success: true,
            backupCodes: rawCodes,
            regenerationCount: regenerationCount + 1,
            regenerationLimit: 3,
            remainingRegenerations: 3 - (regenerationCount + 1),
            resetAt: new Date(now.getTime() + twentyFourHours),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate backup codes.' });
    }
}

async function exportSecurityLogs(req, res) {
    try {
        const user = await User.findById(req.user._id).select('securityEvents');

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const activities = [
            ...(user.securityEvents || []),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const logData = activities.map(
            (item) => ({
                Event: item.title,
                Description: item.description || '',
                Type: item.type,
                Timestamp: new Date(item.createdAt).toISOString(),
            })
        );

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="goldcinema-security-activity-log.json"');

        return res.status(200).send(JSON.stringify(logData, null, 2));
    } catch (err) {
        return res.status(500).json({ error: 'Failed to export security logs.' });
    }
}

async function getSessions(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('refreshTokens');
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const currentRefreshToken = req.cookies?.refreshToken || null;
        const now = new Date();

        const sessions = user.refreshTokens
            .filter((rt) => !rt.revokedAt && rt.expiresAt > now)
            .map((rt) => ({
                id: rt._id,
                deviceLabel: rt.deviceLabel || 'Unknown Device',
                ipAddress: rt.ipAddress || null,
                userAgent: rt.userAgent || null,
                loginMethod: rt.loginMethod || 'password',
                rememberMe: rt.rememberMe || false,
                createdAt: rt.createdAt,
                expiresAt: rt.expiresAt,
                lastActiveAt: rt.lastActiveAt || rt.createdAt,
                isCurrent: !!(currentRefreshToken && rt.token === currentRefreshToken),
            }))
            .sort((a, b) => {
                if (a.isCurrent) return -1;
                if (b.isCurrent) return 1;
                return new Date(b.lastActiveAt) - new Date(a.lastActiveAt);
            });

        res.json({ sessions });
    } catch (err) {
        next(err);
    }
}

async function revokeSession(req, res, next) {
    try {
        const { id } = req.params;

        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized. Authentication required.', });

        const currentRefreshToken = req.cookies?.refreshToken || null;

        const user = await User.findById(req.user.id).select('refreshTokens');

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const target = user.refreshTokens.find((rt) => rt._id.toString() === id);

        if (!target) return res.status(404).json({ error: 'Session not found.' });

        if (currentRefreshToken && target.token === currentRefreshToken) return res.status(400).json({ error: 'You cannot revoke your current session this way. Use Sign Out instead.', });

        user.refreshTokens = user.refreshTokens.filter((rt) => rt._id.toString() !== id);
        await addSecurityEvent(user, {
            type: 'session_revoked',
            title: 'Session Revoked',
            description: `Ended session on device: ${target.deviceLabel || 'Unknown Device'}`,
        });

        await user.save();

        return res.json({ message: 'Session revoked successfully.' });
    } catch (err) {
        next(err);
    }
}

async function revokeAllOtherSessions(req, res, next) {
    try {
        const currentRefreshToken = req.cookies?.refreshToken || null;

        const user = await User.findById(req.user.id).select('refreshTokens');
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const beforeCount = user.refreshTokens.length;

        if (currentRefreshToken) {
            user.refreshTokens = user.refreshTokens.filter((rt) => rt.token === currentRefreshToken);
        } else {
            user.refreshTokens = [];
        }

        const revokedCount = beforeCount - user.refreshTokens.length;

        await user.save();
        res.json({ message: `Signed out of ${revokedCount} other session(s) successfully.`, revokedCount, });
    } catch (err) {
        next(err);
    }
}

async function logoutAllDevices(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('refreshTokens');
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const revokedCount = user.refreshTokens.length;
        user.refreshTokens = [];
        user.tokensInvalidatedAt = new Date();

        await addSecurityEvent(user, {
            type: 'logout_all_devices',
            title: 'Logged Out of All Devices',
            description: `Ended ${revokedCount} active session(s)`,
        });

        await user.save();

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.json({
            message: `Logged out of all devices (${revokedCount} session${revokedCount === 1 ? '' : 's'} ended).`,
            revokedCount,
        });
    } catch (err) {
        next(err);
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
    generateTokens,
    setCookies,
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
    updateProfile,
    setupTotp,
    verifyTotpSetup,
    enableEmail2fa,
    verifyEmail2faSetup,
    verifyLoginMfa,
    resendLoginMfaCode,
    disable2fa,
    disable2faMethod,
    enableSms2fa,
    verifySms2faSetup,
    updateLoginAlerts,
    getTrustedDevices,
    revokeTrustedDevice,
    getSecurityActivity,
    generateBackupCodesRoute,
    exportSecurityLogs,
    getSessions,
    revokeSession,
    revokeAllOtherSessions,
    logoutAllDevices,
    logout,
};