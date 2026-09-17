const express = require('express');
const rateLimit = require('express-rate-limit');
const { optionalAuth } = require('../middleware/auth');
const { createClientLog } = require('../controllers/clientLogs');

const router = express.Router();

const clientLogLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/', clientLogLimiter, optionalAuth, createClientLog);

module.exports = router;