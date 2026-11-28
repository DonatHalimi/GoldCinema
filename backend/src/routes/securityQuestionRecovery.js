const express = require('express');
const rateLimit = require('express-rate-limit');
const requireSameOrigin = require('../middleware/requireSameOrigin');
const { validateBody } = require('../validations/common');
const {
    initializeRecoverySchema,
    verifyRecoverySchema,
} = require('../validations/securityQuestions');
const {
    initializeRecovery,
    verifyRecoveryAnswers,
    resetPasswordWithRecoveryToken,
    completeLoginWithRecoveryToken,
} = require('../controllers/securityQuestionRecovery');

const router = express.Router();

const recoveryIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many recovery requests. Please try again later.' },
});

const recoveryCompleteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many recovery sign-in attempts. Please try again later.',
    },
});

router.post('/recovery/questions/init', recoveryIpLimiter, requireSameOrigin, validateBody(initializeRecoverySchema), initializeRecovery);
router.post('/recovery/questions/verify', recoveryIpLimiter, requireSameOrigin, validateBody(verifyRecoverySchema), verifyRecoveryAnswers);
router.post('/reset-password', recoveryIpLimiter, resetPasswordWithRecoveryToken);
router.post('/recovery/questions/complete-login', recoveryCompleteLimiter, completeLoginWithRecoveryToken);

module.exports = router;