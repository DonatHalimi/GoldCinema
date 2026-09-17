const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getManifest, getBundle, getMissingTranslations } = require('../controllers/i18n');
const { validateParams } = require('../validations');
const { i18nParamsSchema } = require('../validations/translationKey');

const router = express.Router();

router.get('/manifest', getManifest);
router.get('/:locale/:namespace', validateParams(i18nParamsSchema), getBundle);
router.get('/admin/gaps', requireAuth, requireAdmin, getMissingTranslations);

module.exports = router;