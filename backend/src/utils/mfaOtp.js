const bcrypt = require('bcryptjs');
const { sendTwoFactorCode } = require('./mailer');
const { EMAIL_OTP_TTL_MS, SMS_OTP_TTL_MS } = require('../middleware/auth');
const { sendSms } = require('./smsClient');

const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

async function issueEmailOtp(user, { pending = false } = {}) {
    const code = generateOtpCode();

    user.twoFactor.emailOtpHash = await bcrypt.hash(code, 10);
    user.twoFactor.emailOtpExpiresAt = new Date(Date.now() + EMAIL_OTP_TTL_MS);
    if (pending) user.twoFactor.pendingMethod = 'email';

    await user.save();
    await sendTwoFactorCode({ to: user.email, name: user.name, code });
}

async function issueSmsOtp(user, { save = true, pending = false } = {}) {
    const phoneNumber = pending ? user.twoFactor.pendingPhoneNumber : user.phoneNumber;
    if (!phoneNumber) {
        throw Object.assign(new Error('No phone number on file.'), { status: 400 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    user.twoFactor.smsOtpHash = await bcrypt.hash(code, 10);
    user.twoFactor.smsOtpExpiresAt = new Date(Date.now() + SMS_OTP_TTL_MS);

    await sendSms(phoneNumber, `Your GoldCinema verification code is ${code}. It expires in 5 minutes.`);

    if (save) await user.save();
    return code;
}


module.exports = { generateOtpCode, issueEmailOtp, issueSmsOtp };