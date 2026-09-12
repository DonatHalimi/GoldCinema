const {
    generatePasskeyRegistrationOptions,
    verifyPasskeyRegistration,
    generatePasskeyAuthenticationOptions,
    verifyPasskeyAuthentication,
    getPasskeys,
    getPasskeyAuthenticationOptions,
    updatePasskeyName,
    generatePasskeyRemovalChallenge,
    removePasskey,
} = require('../controllers/passkeys');
const { requireAuth } = require('../middleware/auth');

const express = require('express');
const router = express.Router();

router.post('/passkeys/register/options', requireAuth, generatePasskeyRegistrationOptions);
router.post('/passkeys/register/verify', requireAuth, verifyPasskeyRegistration);
router.post('/passkeys/login/options', generatePasskeyAuthenticationOptions);
router.post('/passkeys/login/verify', verifyPasskeyAuthentication);
router.get('/passkeys', requireAuth, getPasskeys);
router.post('/passkeys/authenticate/options', requireAuth, getPasskeyAuthenticationOptions);
router.post('/passkeys/:id/remove/options', requireAuth, generatePasskeyRemovalChallenge);
router.put('/passkeys/:id/name', requireAuth, updatePasskeyName);
router.delete('/passkeys/:id', requireAuth, removePasskey);

module.exports = router;