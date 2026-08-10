const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const { OAuth2Client } = require('google-auth-library');
const { sendVerificationEmail } = require('../utils/mailer');
const { generateVerificationToken } = require('../utils/tokens');

const TRUSTED_DEVICE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;
const MFA_MAX_ATTEMPTS = 5;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_STAGES_MIN = [1, 5, 15, 60];
const DAY_MS = 24 * 60 * 60 * 1000;

const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).populate('role');
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }
    if (user.isActive === false) {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
};

function optionalAuth(req, res, next) {
  let token = req.cookies?.accessToken;

  if (!token) {
    const header = req.headers.authorization || '';
    token = header.startsWith('Bearer ') ? header.slice(7) : null;
  }

  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next();
  }

  next();
}

async function requireVerified(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required. Please log in again.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please log in again.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email address before ordering tickets.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    req.dbUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

async function checkTrustedDevice(req, res, next) {
  try {
    const rawToken = req.cookies.trustedDeviceToken;
    if (!rawToken) return next();

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      '_id': req.user?.id,
      'trustedDevices.tokenHash': tokenHash,
      'trustedDevices.expiresAt': { $gt: new Date() }
    });

    if (user) {
      req.isTrustedDevice = true;
      await User.updateOne(
        { _id: user._id, 'trustedDevices.tokenHash': tokenHash },
        { $set: { 'trustedDevices.$.lastUsedAt': new Date() } }
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}

const generateTokens = (userId, refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken, refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: refreshMaxAgeMs,
  });
};

async function getCustomerRoleId() {
  const role = await Role.findOneAndUpdate(
    { name: 'customer' },
    {
      $setOnInsert: {
        name: 'customer',
        description: 'Default role for registered users.',
      },
    },
    { upsert: true, new: true }
  );

  return role._id;
}

async function issueVerificationEmail(user) {
  const { token, expiresAt } = generateVerificationToken();
  user.verificationToken = token;
  user.verificationTokenExpiresAt = expiresAt;
  await user.save();

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl,
  });
}

module.exports = {
  TRUSTED_DEVICE_MAX_AGE_MS,
  EMAIL_OTP_TTL_MS,
  MFA_MAX_ATTEMPTS,
  MAX_FAILED_ATTEMPTS,
  LOCK_STAGES_MIN,
  DAY_MS,
  googleClient,
  requireAuth,
  optionalAuth,
  requireVerified,
  checkTrustedDevice,
  getCustomerRoleId,
  issueVerificationEmail,
  generateTokens,
  setCookies,
};