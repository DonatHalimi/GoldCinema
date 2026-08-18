const { generateDeviceToken, hashDeviceToken } = require('./tokens');
const { TRUSTED_DEVICE_MAX_AGE_MS } = require('../middleware/auth');
const { addSecurityEvent } = require('./securityEvents');
const TRUSTED_DEVICE_COOKIE = 'trustedDevice';

function setTrustedDeviceCookie(res, rawToken) {
    res.cookie(TRUSTED_DEVICE_COOKIE, rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: TRUSTED_DEVICE_MAX_AGE_MS,
    });
}

function findTrustedDeviceEntry(user, req) {
    const raw = req.cookies?.[TRUSTED_DEVICE_COOKIE];
    if (!raw) return null;
    const hash = hashDeviceToken(raw);
    return user.trustedDevices?.find((d) => d.tokenHash === hash && d.expiresAt > new Date()) || null;
}

async function issueTrustedDevice(user, req, res, { label } = {}) {
    const rawToken = generateDeviceToken();
    const deviceLabel = (label || req.headers['user-agent'] || 'Unknown device').slice(0, 120);

    user.trustedDevices = user.trustedDevices || [];
    user.trustedDevices.push({
        tokenHash: hashDeviceToken(rawToken),
        label: deviceLabel,
        expiresAt: new Date(Date.now() + TRUSTED_DEVICE_MAX_AGE_MS),
        createdAt: new Date(),
    });

    await addSecurityEvent(user, {
        type: 'device_added',
        title: `Trusted Device Added (${deviceLabel})`,
        description: 'Device authorized for trusted sessions',
    });

    setTrustedDeviceCookie(res, rawToken);
}

module.exports = { issueTrustedDevice, findTrustedDeviceEntry, setTrustedDeviceCookie, TRUSTED_DEVICE_COOKIE };