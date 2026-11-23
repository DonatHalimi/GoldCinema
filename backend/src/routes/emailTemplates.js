const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
const requireEmailTemplateAdmin = require('../middleware/emailTemplateAdmin');
const { validateBody, validateParams } = require('../validations/common');
const {
    emailTemplateCreateSchema,
    emailTemplateUpdateSchema,
    emailTemplatePreviewSchema,
    emailTemplateTestSchema,
    emailTemplateParamsSchema,
} = require('../validations/emailTemplate');
const {
    listEmailTemplates,
    getEmailTemplate,
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    previewEmailTemplate,
    resetEmailTemplate,
    sendTestEmail,
} = require('../controllers/emailTemplates');

const router = express.Router();
const testEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many test emails. Try again later.' },
});

const validateIdentifier = validateParams(emailTemplateParamsSchema);

router.use(requireAuth, requireEmailTemplateAdmin);
router.get('/', requirePermission('email-templates:read'), listEmailTemplates);
router.get('/:identifier', validateIdentifier, requirePermission('email-templates:read'), getEmailTemplate);
router.post('/', requirePermission('email-templates:create'), validateBody(emailTemplateCreateSchema), createEmailTemplate);
router.put('/:identifier', validateIdentifier, requirePermission('email-templates:update'), validateBody(emailTemplateUpdateSchema), updateEmailTemplate);
router.delete('/:identifier', validateIdentifier, requirePermission('email-templates:delete'), deleteEmailTemplate);
router.post('/:identifier/preview', validateIdentifier, requirePermission('email-templates:preview'), validateBody(emailTemplatePreviewSchema), previewEmailTemplate);
router.post('/:identifier/reset', validateIdentifier, requirePermission('email-templates:reset'), resetEmailTemplate);
router.post('/:identifier/test', validateIdentifier, requirePermission('email-templates:test'), testEmailLimiter, validateBody(emailTemplateTestSchema), sendTestEmail);

module.exports = router;
