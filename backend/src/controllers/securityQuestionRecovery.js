const crypto = require('crypto');
const User = require('../models/user');
const UserSecurityQuestions = require('../models/userSecurityQuestions');
const RecoveryAttempt = require('../models/securityQuestionRecoveryAttempt');
const RecoveryToken = require('../models/securityQuestionRecoveryToken');
const AuditLog = require('../models/auditLog');
const {
    REQUIRED_QUESTION_COUNT,
    RECOVERY_TOKEN_TTL_MS,
    MAX_FAILED_ATTEMPTS,
    ATTEMPT_WINDOW_MS,
    LOCKOUT_MS,
    ATTEMPT_RETENTION_MS,
    DUMMY_ANSWER_ENC,
    compareSubmittedAnswers,
    hashRecoveryKey,
    hashOpaqueToken,
} = require('../services/securityQuestionService');
const bcrypt = require('bcryptjs');
const { issueLoginSession } = require('./auth');
const { normalizeIdentifier, escapeRegex, getClientIp, recoveryKeys} = require('../utils/securityQuestions');
const GENERIC_INIT_MESSAGE = 'If this account has security questions configured, they can be used to continue account recovery.';
const GENERIC_VERIFY_MESSAGE = 'One or more answers did not match.';
const AUDIT_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

async function findRecoveryLock(identifier, req, accountId = null) {
    const { accountKey, ipKey } = recoveryKeys(identifier, req, accountId);
    return RecoveryAttempt.findOne({
        $or: [
            { scope: 'account', keyHash: accountKey },
            { scope: 'ip', keyHash: ipKey },
        ],
        lockedUntil: { $gt: new Date() },
    }).select('lockedUntil').lean();
}

async function recordFailure(identifier, req, accountId = null) {
    const { accountKey, ipKey } = recoveryKeys(identifier, req, accountId);
    const now = new Date();
    const cutoff = new Date(now.getTime() - ATTEMPT_WINDOW_MS);
    const expiresAt = new Date(now.getTime() + ATTEMPT_RETENTION_MS);
    const lockedUntil = new Date(now.getTime() + LOCKOUT_MS);

    const expiredWindow = {
        $or: [
            { $eq: [{ $type: '$windowStartedAt' }, 'missing'] },
            { $lte: ['$windowStartedAt', cutoff] },
        ],
    };
    const nextCount = {
        $cond: [expiredWindow, 1, { $add: [{ $ifNull: ['$failedAttempts', 0] }, 1] }],
    };

    await Promise.all([
        ['account', accountKey],
        ['ip', ipKey],
    ].map(([scope, keyHash]) => RecoveryAttempt.collection.findOneAndUpdate(
        { scope, keyHash },
        [{
            $set: {
                scope,
                keyHash,
                windowStartedAt: { $cond: [expiredWindow, now, '$windowStartedAt'] },
                failedAttempts: nextCount,
                lockedUntil: { $cond: [{ $gte: [nextCount, MAX_FAILED_ATTEMPTS] }, lockedUntil, '$lockedUntil'] },
                expiresAt,
                updatedAt: now,
                createdAt: { $ifNull: ['$createdAt', now] },
            },
        }],
        { upsert: true, returnDocument: 'after' }
    )));
}

async function writeRecoveryAudit({ req, user, action, severity = 'warning', statusCode }) {
    try {
        await AuditLog.create({
            category: 'auth',
            action,
            method: req.method,
            path: req.originalUrl,
            statusCode: statusCode ?? (severity === 'info' ? 200 : 400),
            actor: {
                userId: user?._id || null,
                email: user?.email || null,
                ip: getClientIp(req),
                userAgent: req.headers['user-agent'] || null,
            },
            resource: { type: 'security_question_recovery', id: user?._id ? String(user._id) : null },
            severity,
            expiresAt: new Date(Date.now() + AUDIT_RETENTION_MS),
        });
    } catch (error) {
        console.error('[security-question-recovery] Audit event could not be persisted:', error.message);
    }
}

async function lookupUser(identifier) {
    const normalized = normalizeIdentifier(identifier);
    if (!normalized) return null;
    if (normalized.includes('@')) {
        return User.findOne({ email: normalized, deletedAt: null }).select('_id email name isActive');
    }

    const escaped = escapeRegex(normalized);
    const matches = await User.find({
        name: { $regex: `^${escaped}$`, $options: 'i' },
        deletedAt: null,
    }).select('_id email name isActive').limit(2);
    return matches.length === 1 ? matches[0] : null;
}

async function initializeRecovery(req, res, next) {
    try {
        const { emailOrUsername } = req.body;
        const user = await lookupUser(emailOrUsername);
        const questionSet = user && user.isActive !== false
            ? await UserSecurityQuestions.findOne({ user: user._id }).select('_id questions._id questions.questionText')
            : null;
        const questions = questionSet?.questions?.length === REQUIRED_QUESTION_COUNT
            ? questionSet.questions.map((question) => ({ questionId: String(question._id), questionText: question.questionText }))
            : [];

        return res.status(200).json({ message: GENERIC_INIT_MESSAGE, questions });
    } catch (error) {
        return next(error);
    }
}

async function verifyRecoveryAnswers(req, res, next) {
    const { emailOrUsername, answers } = req.body;
    const normalizedIdentifier = normalizeIdentifier(emailOrUsername);

    try {
        const user = await lookupUser(normalizedIdentifier);
        const activeLock = await findRecoveryLock(normalizedIdentifier, req, user?._id || null);
        if (activeLock) {
            const waitSeconds = Math.max(1, Math.ceil((new Date(activeLock.lockedUntil).getTime() - Date.now()) / 1000));
            res.set('Retry-After', String(waitSeconds));
            return res.status(429).json({ error: 'Recovery is temporarily locked. Please try again later.', retryAfter: waitSeconds });
        }

        const questionSet = user && user.isActive !== false
            ? await UserSecurityQuestions.findOne({ user: user._id }).select('version questions._id questions.answerEnc')
            : null;
        const configuredQuestions = questionSet?.questions?.length === REQUIRED_QUESTION_COUNT;

        const comparisonQuestions = configuredQuestions
            ? questionSet.questions
            : Array.from({ length: REQUIRED_QUESTION_COUNT }, (_, index) => ({
                _id: `unavailable-${index}`,
                answerEnc: DUMMY_ANSWER_ENC,
            }));
        const answersMatch = await compareSubmittedAnswers(comparisonQuestions, answers);

        if (!user || user.isActive === false || !configuredQuestions || !answersMatch) {
            await recordFailure(normalizedIdentifier, req, user?._id || null);
            await writeRecoveryAudit({ req, user, action: 'security_questions.recovery_failed', statusCode: 400 });
            return res.status(400).json({ error: GENERIC_VERIFY_MESSAGE });
        }

        const rawToken = crypto.randomBytes(32).toString('base64url');
        const expiresAt = new Date(Date.now() + RECOVERY_TOKEN_TTL_MS);
        await RecoveryToken.deleteMany({ user: user._id, consumedAt: null });
        await RecoveryToken.create({
            user: user._id,
            tokenHash: hashOpaqueToken(rawToken),
            purpose: 'password_reset',
            questionVersion: questionSet.version,
            expiresAt,
            issuedIpHash: hashRecoveryKey(`ip:${getClientIp(req)}`),
        });

        const { accountKey } = recoveryKeys(normalizedIdentifier, req, user._id);
        await RecoveryAttempt.deleteOne({ scope: 'account', keyHash: accountKey });
        await writeRecoveryAudit({ req, user, action: 'security_questions.recovery_succeeded', severity: 'info' });

        return res.json({ verificationToken: rawToken, expiresAt: expiresAt.toISOString() });
    } catch (error) {
        return next(error);
    }
}

async function resetPasswordWithRecoveryToken(req, res, next) {
    try {
        const rawToken = req.body?.token;
        if (typeof rawToken !== 'string' || !rawToken) return next();
        const token = rawToken;
        const rawPassword = req.body?.password;
        const tokenHash = hashOpaqueToken(token);
        const recovery = await RecoveryToken.findOne({
            tokenHash,
            purpose: 'password_reset',
            consumedAt: null,
            expiresAt: { $gt: new Date() },
        }).select('+tokenHash');

        if (!recovery) return next();
        if (typeof rawPassword !== 'string' || rawPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

        const password = rawPassword;

        const user = await User.findById(recovery.user).select('+passwordHash');
        if (!user || user.isActive === false) return res.status(400).json({ error: 'This recovery token is invalid or has expired.' });

        const passwordHash = await bcrypt.hash(password, 12);
        const consumed = await RecoveryToken.findOneAndUpdate(
            { _id: recovery._id, consumedAt: null, expiresAt: { $gt: new Date() } },
            { $set: { consumedAt: new Date() } },
            { new: true }
        );

        if (!consumed) return res.status(400).json({ error: 'This recovery token is invalid or has already been used.' });

        const currentQuestionSet = await UserSecurityQuestions.findOne({ user: user._id }).select('version').lean();
        if (!currentQuestionSet || currentQuestionSet.version !== recovery.questionVersion) return res.status(400).json({ error: 'This recovery token is invalid or has expired.' });

        user.passwordHash = passwordHash;
        user.passwordResetToken = null;
        user.passwordResetExpiresAt = null;
        user.refreshTokens = [];
        user.tokensInvalidatedAt = new Date();
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        user.lockStage = 0;
        user.authProviders = user.authProviders || [];
        if (!user.authProviders.includes('password')) user.authProviders.push('password');
        user.securityEvents = user.securityEvents || [];
        user.securityEvents.push({
            type: 'password_reset_security_questions',
            title: 'Password Reset Completed',
            description: 'Password reset completed through security-question recovery.',
            createdAt: new Date(),
        });
        await user.save();

        await writeRecoveryAudit({ req, user, action: 'security_questions.password_reset_completed', severity: 'info' });
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        return next(error);
    }
}

async function completeLoginWithRecoveryToken(req, res, next) {
    try {
        const { recoveryToken } = req.body || {};

        if (!recoveryToken || typeof recoveryToken !== 'string') {
            return res.status(400).json({ error: 'Recovery token is required.' });
        }

        const tokenHash = crypto
            .createHash('sha256')
            .update(recoveryToken)
            .digest('hex');

        const recovery = await RecoveryToken.findOne({
            tokenHash,
            purpose: 'password_reset',
            consumedAt: null,
            expiresAt: { $gt: new Date() },
        });

        if (!recovery) return res.status(400).json({ error: 'This recovery token is invalid or has expired.', });

        const user = await User.findById(recovery.user).populate('role');
        if (!user || user.isActive === false) return res.status(400).json({ error: 'This recovery token is invalid or has expired.', });

        const currentQuestionSet = await UserSecurityQuestions.findOne({
            user: user._id,
        }).select('version').lean();
        if (!currentQuestionSet || currentQuestionSet.version !== recovery.questionVersion) {
            return res.status(400).json({
                error: 'This recovery token is invalid or has expired.',
            });
        }

        const consumed = await RecoveryToken.findOneAndUpdate(
            { _id: recovery._id, consumedAt: null, expiresAt: { $gt: new Date() } },
            { $set: { consumedAt: new Date() } },
            { new: true }
        );
        if (!consumed) return res.status(400).json({ error: 'This recovery token is invalid or has already been used.', });

        const sessionResult = await issueLoginSession(user, req, res, {
            rememberMe: false,
        });

        await writeRecoveryAudit({
            req,
            user,
            action: 'security_questions.session_issued',
            severity: 'info',
        });

        return res.status(200).json(sessionResult);
    } catch (error) {
        return next(error);
    }
}

module.exports = { initializeRecovery, verifyRecoveryAnswers, resetPasswordWithRecoveryToken, completeLoginWithRecoveryToken };