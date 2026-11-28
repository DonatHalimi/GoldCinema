const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const RecoveryToken = require('../models/securityQuestionRecoveryToken');
const User = require('../models/user');
const UserSecurityQuestions = require('../models/userSecurityQuestions');
const AuditLog = require('../models/auditLog');
const { addSecurityEvent } = require('../utils/securityEvents');
const {
    normalizeQuestionText,
    validateQuestionPayload,
    encryptAnswer,
    decryptAnswer,
    REQUIRED_QUESTION_COUNT,
} = require('../services/securityQuestionService');

const AUDIT_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

async function writeSecurityAudit({ req, user, action, severity = 'info', description }) {
    const ip = req.ip || req.socket?.remoteAddress || null;
    try {
        await AuditLog.create({
            category: 'auth',
            action,
            method: req.method,
            path: req.originalUrl,
            statusCode: severity === 'warning' ? 401 : 200,
            actor: {
                userId: user?._id || null,
                email: user?.email || null,
                ip,
                userAgent: req.headers['user-agent'] || null,
            },
            resource: { type: 'user_security_questions', id: user?._id ? String(user._id) : null },
            metadata: description ? { description } : undefined,
            severity,
            expiresAt: new Date(Date.now() + AUDIT_RETENTION_MS),
        });
    } catch (error) {
        console.error('[security-questions] Audit event could not be persisted:', error.message);
    }
}

async function requireCurrentPassword(user, currentPassword) {
    if (!user.passwordHash) {
        const error = new Error('Set a password for this account before managing security questions.');
        error.status = 409;
        throw error;
    }
    const matches = await bcrypt.compare(String(currentPassword || ''), user.passwordHash);
    if (!matches) {
        const error = new Error('Current password is incorrect.');
        error.status = 401;
        throw error;
    }
}

async function getSecurityQuestions(req, res, next) {
    try {
        const doc = await UserSecurityQuestions.findOne({ user: req.user.id })
            .select('_id questions._id questions.questionText questions.answerEnc questions.updatedAt updatedAt')
            .lean();

        return res.json({
            questions: (doc?.questions || []).map((question) => {
                let answer = '';
                if (question.answerEnc) {
                    try { answer = decryptAnswer(question.answerEnc); }
                    catch { answer = ''; }
                }
                return {
                    id: String(question._id),
                    questionText: question.questionText,
                    answer,
                    updatedAt: question.updatedAt || doc.updatedAt,
                };
            }),
        });
    } catch (error) {
        return next(error);
    }
}

async function replaceSecurityQuestions(req, res, next) {
    try {
        const { currentPassword, questions } = req.body;
        const validation = validateQuestionPayload(questions);
        if (!validation.valid) return res.status(400).json({ error: validation.error });

        const user = await User.findById(req.user.id).select('+passwordHash');
        if (!user) return res.status(404).json({ error: 'User not found.' });
        await requireCurrentPassword(user, currentPassword);
        const isFirstConfiguration = !(await UserSecurityQuestions.exists({ user: user._id }));

        const now = new Date();
        const storedQuestions = questions.map((question) => ({
            questionText: String(question.questionText).trim(),
            normalizedQuestionText: normalizeQuestionText(question.questionText),
            answerEnc: encryptAnswer(question.answer),
            createdAt: now,
            updatedAt: now,
        }));

        await UserSecurityQuestions.findOneAndUpdate(
            { user: user._id },
            { $set: { user: user._id, questions: storedQuestions, version: crypto.randomUUID() } },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        await RecoveryToken.deleteMany({ user: user._id, consumedAt: null });

        await addSecurityEvent(user, {
            type: isFirstConfiguration ? 'security_questions_configured' : 'security_questions_updated',
            title: isFirstConfiguration ? 'Security Questions Configured' : 'Security Questions Updated',
            description: `${REQUIRED_QUESTION_COUNT} security questions were ${isFirstConfiguration ? 'configured' : 'replaced'}.`,
        });
        await user.save();
        await writeSecurityAudit({ req, user, action: isFirstConfiguration ? 'security_questions.configured' : 'security_questions.updated' });

        return res.json({ message: 'Security questions saved successfully.', configured: true });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        return next(error);
    }
}

async function deleteSecurityQuestions(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('+passwordHash');
        if (!user) return res.status(404).json({ error: 'User not found.' });
        await requireCurrentPassword(user, req.body.currentPassword);

        await Promise.all([
            UserSecurityQuestions.deleteOne({ user: user._id }),
            RecoveryToken.deleteMany({ user: user._id, consumedAt: null }),
        ]);
        await addSecurityEvent(user, {
            type: 'security_questions_removed',
            title: 'Security Questions Removed',
            description: 'Security-question recovery was disabled for this account.',
        });
        await user.save();
        await writeSecurityAudit({ req, user, action: 'security_questions.deleted' });

        return res.json({ message: 'Security questions removed successfully.', configured: false });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        return next(error);
    }
}

module.exports = { getSecurityQuestions, replaceSecurityQuestions, deleteSecurityQuestions };