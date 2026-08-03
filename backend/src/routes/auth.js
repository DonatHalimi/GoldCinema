const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Role = require('../models/role');
const { requireAuth } = require('../middleware/auth');
const { generateVerificationToken } = require('../utils/tokens');
const { sendVerificationEmail } = require('../utils/mailer');

const router = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
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
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

async function getCustomerRoleId() {
  const role = await Role.findOneAndUpdate(
    { name: 'customer' },
    { $setOnInsert: { name: 'customer', description: 'Default role for registered users.' } },
    { upsert: true, new: true }
  );
  return role._id;
}

async function issueVerificationEmail(user, req) {
  const { token, expiresAt } = generateVerificationToken();
  user.verificationToken = token;
  user.verificationTokenExpiresAt = expiresAt;
  await user.save();

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

  await sendVerificationEmail({ to: user.email, name: user.name, verificationUrl });
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const defaultRole = await Role.findOne({ name: 'customers' });
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: defaultRole?._id,
      verificationToken,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

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
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('role');

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await user.save();

    setCookies(res, accessToken, refreshToken);
    res.json({ message: 'Logged in successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (jwtErr) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(403).json({ message: 'Expired or invalid refresh token' });
    }

    const user = await User.findOne({ 'refreshTokens.token': refreshToken });

    if (!user) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newTokens = generateTokens(user._id);

    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);

    user.refreshTokens.push({
      token: newTokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    setCookies(res, newTokens.accessToken, newTokens.refreshToken);
    return res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Verification token is required.' });

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'This verification link is invalid.' });
    }
    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      return res.status(400).json({
        error: 'This verification link has expired. Please request a new one.',
        code: 'TOKEN_EXPIRED',
      });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    res.json({ message: 'Email verified successfully.', user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/resend-verification', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.emailVerified) {
      return res.status(400).json({ error: 'This account is already verified.' });
    }

    await issueVerificationEmail(user, req);
    res.json({ message: 'Verification email sent.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('role')
      .select('-passwordHash -refreshTokens');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const roleName = user.role?.name || user.role || 'user';
    res.json({ user: { id: user._id, email: user.email, name: user.name, role: roleName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await User.updateOne(
      { 'refreshTokens.token': refreshToken },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;