const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const User = require('../models/User');
const { generateTokens, setCookies } = require('./auth');

const rpName = 'GoldCinema';
const rpID = 'localhost';
const origin = 'http://localhost:3000';

async function generatePasskeyRegistrationOptions(req, res, next) {
    try {
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found.', });

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userName: user.email,
            attestationType: 'none',
            excludeCredentials: (user.passkeys || []).map(
                (passkey) => ({
                    id: passkey.credentialId,
                    transports: passkey.transports || [],
                })
            ),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform',
            },
        });

        user.passkeyRegistrationChallenge = options.challenge;
        await user.save();

        return res.json(options);
    } catch (error) {
        next(error);
    }
}

async function verifyPasskeyRegistration(req, res, next) {
    try {
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (!user.passkeyRegistrationChallenge) return res.status(400).json({ error: 'Passkey registration session expired.' });

        let verification;

        try {
            verification = await verifyRegistrationResponse({
                response: req.body,
                expectedChallenge: user.passkeyRegistrationChallenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
            });
        } catch (error) {
            console.error('PASSKEY REGISTRATION ERROR:', error);
            return res.status(400).json({ error: error.message || 'Passkey registration failed.' });
        }

        if (!verification.verified) return res.status(400).json({ error: 'Could not verify passkey.' });

        const { registrationInfo } = verification;
        const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

        const alreadyExists = (user.passkeys || []).some(
            (passkey) => passkey.credentialId === credential.id
        );

        if (alreadyExists) return res.status(409).json({ error: 'This passkey is already registered.' });

        user.passkeys.push({
            credentialId: credential.id,
            publicKey: Buffer.from(credential.publicKey),
            counter: credential.counter,
            deviceType: credentialDeviceType,
            backedUp: credentialBackedUp,
            transports: credential.transports || [],
            name: 'Passkey',
            createdAt: new Date(),
            lastUsedAt: null,
        });

        user.passkeyRegistrationChallenge = null;
        await user.save();

        return res.json({
            verified: true,
            message: 'Passkey registered successfully.',
        });
    } catch (error) {
        next(error);
    }
}

async function generatePasskeyAuthenticationOptions(req, res, next) {
    try {
        const options = await generateAuthenticationOptions({
            rpID,
            userVerification: 'preferred',
        });


        req.session = req.session || {};
        global.pendingChallenges = global.pendingChallenges || new Map();
        global.pendingChallenges.set(options.challenge, {
            createdAt: Date.now(),
        });

        res.json(options);
    } catch (error) {
        next(error);
    }
}

async function verifyPasskeyAuthentication(req, res, next) {
    try {
        const { id: credentialId } = req.body;

        const user = await User.findOne({ 'passkeys.credentialId': credentialId }).populate('role');

        if (!user) return res.status(401).json({ error: 'Passkey not recognized.' });

        const passkey = user.passkeys.find((item) => item.credentialId === credentialId);

        if (!passkey) return res.status(401).json({ error: 'Passkey is not registered for any account.' });

        let matchedChallenge = null;
        if (global.pendingChallenges) {
            for (const [challenge, data] of global.pendingChallenges.entries()) {
                if (Date.now() - data.createdAt > 300000) {
                    global.pendingChallenges.delete(challenge);
                } else {
                    matchedChallenge = challenge;
                }
            }
        }

        let verification;

        try {
            verification = await verifyAuthenticationResponse({
                response: req.body,
                expectedChallenge: matchedChallenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
                credential: {
                    id: passkey.credentialId,
                    publicKey: new Uint8Array(passkey.publicKey),
                    counter: passkey.counter,
                    transports: passkey.transports,
                },
            });
        } catch (error) {
            console.error('PASSKEY AUTHENTICATION ERROR:', error);
            return res.status(401).json({ error: 'Passkey authentication failed.' });
        }

        if (!verification.verified) return res.status(401).json({ error: 'Passkey authentication failed.' });


        if (matchedChallenge) {
            global.pendingChallenges.delete(matchedChallenge);
        }

        passkey.counter = verification.authenticationInfo.newCounter;
        passkey.lastUsedAt = new Date();
        await user.save();

        const refreshExpiresIn = req.body.rememberMe ? '30d' : '7d';
        const refreshMaxAgeMs = req.body.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

        const { accessToken, refreshToken } = generateTokens(user._id, refreshExpiresIn);

        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: new Date(Date.now() + refreshMaxAgeMs),
            createdAt: new Date(),
            rememberMe: req.body.rememberMe,
        });

        await user.save();
        setCookies(res, accessToken, refreshToken, refreshMaxAgeMs);

        return res.json({
            message: 'Logged in successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function getPasskeys(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('passkeys');

        if (!user) return res.status(404).json({ error: 'User not found.' });

        return res.json({
            passkeys: (user.passkeys || []).map((passkey) => ({
                id: passkey.credentialId,
                name: passkey.name || 'Passkey',
                createdAt: passkey.createdAt,
                lastUsedAt: passkey.lastUsedAt,
                deviceType: passkey.deviceType,
                backedUp: passkey.backedUp,
            })),
        });
    } catch (error) {
        next(error);
    }
}

async function updatePasskeyName(req, res, next) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || !name.trim()) return res.status(400).json({ error: 'Passkey name is required.' });

        const user = await User.findById(req.user._id || req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const passkey = user.passkeys.find(
            (p) => p.credentialId === id || (p._id && p._id.toString() === id)
        );

        if (!passkey) return res.status(404).json({ error: 'Passkey not found.' });

        passkey.name = name.trim();
        await user.save();

        return res.json({
            message: 'Passkey renamed successfully.',
            passkey: {
                id: passkey.credentialId || passkey._id,
                name: passkey.name,
                createdAt: passkey.createdAt,
                lastUsedAt: passkey.lastUsedAt,
                deviceType: passkey.deviceType,
                backedUp: passkey.backedUp,
            }
        });
    } catch (error) {
        console.error('Error updating passkey name:', error);
        next(error);
    }
}

// Add this helper to generate a challenge specifically for removal actions
async function generatePasskeyRemovalChallenge(req, res, next) {
    try {
        const options = await generateAuthenticationOptions({
            rpID,
            userVerification: 'required', // Forces OS PIN/biometrics prompt
        });

        global.pendingChallenges = global.pendingChallenges || new Map();
        global.pendingChallenges.set(options.challenge, {
            createdAt: Date.now(),
            userId: req.user.id,
        });

        return res.json(options);
    } catch (error) {
        next(error);
    }
}

async function removePasskey(req, res, next) {
    try {
        const { assertion } = req.body;
        const passkeyId = req.params.id;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const passkey = user.passkeys?.find((item) => item.credentialId === passkeyId);
        if (!passkey) return res.status(404).json({ error: 'Passkey not found.' });

        if (!assertion) {
            return res.status(400).json({ error: 'Device verification assertion is required.' });
        }

        // Find and validate the pending challenge
        let matchedChallenge = null;
        if (global.pendingChallenges) {
            for (const [challenge, data] of global.pendingChallenges.entries()) {
                if (Date.now() - data.createdAt > 300000 || data.userId !== req.user.id) {
                    global.pendingChallenges.delete(challenge);
                } else {
                    matchedChallenge = challenge;
                }
            }
        }

        if (!matchedChallenge) {
            return res.status(400).json({ error: 'Verification session expired. Please try again.' });
        }

        let verification;
        try {
            verification = await verifyAuthenticationResponse({
                response: assertion,
                expectedChallenge: matchedChallenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
                credential: {
                    id: passkey.credentialId,
                    publicKey: new Uint8Array(passkey.publicKey),
                    counter: passkey.counter,
                    transports: passkey.transports,
                },
            });
        } catch (error) {
            console.error('PASSKEY REMOVAL VERIFICATION ERROR:', error);
            return res.status(400).json({ error: 'Device verification failed.' });
        }

        if (!verification.verified) {
            return res.status(400).json({ error: 'Could not verify device identity.' });
        }

        global.pendingChallenges.delete(matchedChallenge);

        // Proceed to remove the passkey
        user.passkeys = user.passkeys.filter((item) => item.credentialId !== passkeyId);
        await user.save();

        return res.json({ message: 'Passkey removed successfully.' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    generatePasskeyRegistrationOptions,
    verifyRegistrationResponse: verifyPasskeyRegistration,
    verifyPasskeyRegistration,
    generatePasskeyAuthenticationOptions,
    verifyPasskeyAuthentication,
    getPasskeys,
    updatePasskeyName,
    generatePasskeyRemovalChallenge,
    removePasskey,
};