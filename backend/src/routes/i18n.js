const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
const { getManifest, getBundle, getMissingTranslations } = require('../controllers/i18n');
const { validateParams } = require('../validations');
const { i18nParamsSchema } = require('../validations/translationKey');

const router = express.Router();

router.get('/manifest', getManifest);
router.get('/:locale/:namespace', validateParams(i18nParamsSchema), getBundle);
router.get('/admin/gaps', requireAuth, requirePermission('translations:manage'), getMissingTranslations);

module.exports = router;