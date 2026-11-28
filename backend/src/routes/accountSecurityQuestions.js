const express = require('express');
const { requireAuth } = require('../middleware/auth');
const requireSameOrigin = require('../middleware/requireSameOrigin');
const { validateBody } = require('../validations/common');
const {
    currentPasswordSchema,
    replaceSecurityQuestionsSchema,
} = require('../validations/securityQuestions');
const {
    getSecurityQuestions,
    replaceSecurityQuestions,
    deleteSecurityQuestions,
} = require('../controllers/securityQuestions');

const router = express.Router();

router.get('/security-questions', requireAuth, getSecurityQuestions);
router.put('/security-questions', requireSameOrigin, requireAuth, validateBody(replaceSecurityQuestionsSchema), replaceSecurityQuestions);
router.delete('/security-questions', requireSameOrigin, requireAuth, validateBody(currentPasswordSchema), deleteSecurityQuestions);

module.exports = router;
