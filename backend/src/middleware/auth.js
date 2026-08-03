
const jwt = require('jsonwebtoken');
const User = require('../models/user');

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

module.exports = { requireAuth, optionalAuth, requireVerified };