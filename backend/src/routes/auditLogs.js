const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
const { getAuditLogs, getAuditLogById } = require('../controllers/auditLogs');

const router = express.Router();

router.use(requireAuth, requirePermission('admin:access'));

router.get('/', getAuditLogs);
router.get('/:id', getAuditLogById);

module.exports = router;