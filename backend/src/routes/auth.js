const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  register,
  login,
  refreshToken,
  verifyEmail,
  resendVerification,
  googleLogin,
  facebookLogin,
  me,
  logout,
} = require('../controllers/auth');
const {
  validateBody,
  validateQuery,
  auth: { registerSchema, loginSchema, googleLoginSchema, facebookLoginSchema, verifyEmailQuerySchema },
} = require('../validations');

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/google', validateBody(googleLoginSchema), googleLogin);
router.post('/facebook', validateBody(facebookLoginSchema), facebookLogin);
router.post('/refresh-token', refreshToken);
router.get('/verify-email', validateQuery(verifyEmailQuerySchema), verifyEmail);
router.post('/resend-verification', requireAuth, resendVerification);
router.get('/me', requireAuth, me);
router.post('/logout', logout);

module.exports = router;