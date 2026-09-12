const express = require('express');
const router = express.Router();
const { createContact } = require('../controllers/contacts');

router.post('/', createContact);

module.exports = router;