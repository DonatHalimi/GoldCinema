const express = require('express');
const router = express.Router();
const { createContact, getContacts, updateContactStatus, deleteContact } = require('../controllers/contacts');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');

router.post('/', createContact);
router.get('/', requireAuth, requirePermission('contacts:read'), getContacts);
router.put('/:id', requireAuth, requirePermission('contacts:manage'), updateContactStatus);
router.delete('/:id', requireAuth, requirePermission('contacts:manage'), deleteContact);

module.exports = router;