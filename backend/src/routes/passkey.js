const {
    generatePasskeyRegistrationOptions,
    verifyPasskeyRegistration,
    generatePasskeyAuthenticationOptions,
    verifyPasskeyAuthentication,
    getPasskeys,
    updatePasskeyName,
    generatePasskeyRemovalChallenge,
    removePasskey,
} = require('../controllers/passkey');
const { requireAuth } = require('../middleware/auth');

const express = require('express');
const router = express.Router();

router.post('/passkeys/register/options', requireAuth, generatePasskeyRegistrationOptions);
router.post('/passkeys/register/verify', requireAuth, verifyPasskeyRegistration);
router.post('/passkeys/login/options', generatePasskeyAuthenticationOptions);
router.post('/passkeys/login/verify', verifyPasskeyAuthentication);
router.get('/passkeys', requireAuth, getPasskeys);
router.put('/passkeys/:id/name', requireAuth, updatePasskeyName);
router.post('/passkeys/reauth-challenge', requireAuth, generatePasskeyRemovalChallenge);
router.delete('/passkeys/:id', requireAuth, removePasskey);

module.exports = router;