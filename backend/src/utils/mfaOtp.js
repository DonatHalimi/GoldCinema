const bcrypt = require('bcryptjs');
const { sendTwoFactorCode } = require('./mailer');
const { EMAIL_OTP_TTL_MS } = require('../middleware/auth');

const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

async function issueEmailOtp(user, { pending = false } = {}) {
    const code = generateOtpCode();

    user.twoFactor.emailOtpHash = await bcrypt.hash(code, 10);
    user.twoFactor.emailOtpExpiresAt = new Date(Date.now() + EMAIL_OTP_TTL_MS);
    if (pending) user.twoFactor.pendingMethod = 'email';

    await user.save();
    await sendTwoFactorCode({ to: user.email, name: user.name, code });
}

module.exports = { issueEmailOtp, generateOtpCode };