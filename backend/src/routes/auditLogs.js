const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getAuditLogs, getAuditLogById } = require('../controllers/auditLogs');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/', getAuditLogs);
router.get('/:id', getAuditLogById);

module.exports = router;