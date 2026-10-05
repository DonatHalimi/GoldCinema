const express = require('express');
const router = express.Router();
const { createContact, getContacts, updateContactStatus, deleteContact } = require('../controllers/contacts');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/', createContact);
router.get('/', requireAuth, requireAdmin, getContacts);
router.put('/:id', requireAuth, requireAdmin, updateContactStatus);
router.delete('/:id', requireAuth, requireAdmin, deleteContact);

module.exports = router;