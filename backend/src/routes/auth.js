const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  register,
  login,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleLogin,
  facebookLogin,
  me,
  logout,
  changePassword,
  deleteAccount,
  updateProfile,
} = require('../controllers/auth');
const {
  validateBody,
  validateQuery,
  auth: { registerSchema, loginSchema, googleLoginSchema, facebookLoginSchema, verifyEmailQuerySchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, deleteAccountSchema },
} = require('../validations');

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/google', validateBody(googleLoginSchema), googleLogin);
router.post('/facebook', validateBody(facebookLoginSchema), facebookLogin);
router.post('/refresh-token', refreshToken);
router.get('/verify-email', validateQuery(verifyEmailQuerySchema), verifyEmail);
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);
router.post('/resend-verification', requireAuth, resendVerification);
router.get('/me', requireAuth, me);
router.put('/profile', requireAuth, updateProfile);
router.post('/logout', logout);
router.put('/change-password', requireAuth, validateBody(changePasswordSchema), changePassword);

router.delete('/account', requireAuth, validateBody(deleteAccountSchema), deleteAccount);

module.exports = router;