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
  setupTotp,
  verifyTotpSetup,
  setupSms2fa,
  verifySms2faSetup,
  enableEmail2fa,
  verifyEmail2faSetup,
  enableSms2fa,
  disable2fa,
  verifyLoginMfa,
  resendLoginMfa,
  resendLoginMfaCode,
} = require('../controllers/auth');
const {
  validateBody,
  validateQuery,
  auth: {
    registerSchema,
    loginSchema,
    googleLoginSchema,
    facebookLoginSchema,
    verifyEmailQuerySchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    deleteAccountSchema
  },
} = require('../validations');
const { sixDigitCodeSchema, disable2faSchema, verifyLoginMfaSchema, resendLoginMfaSchema } = require('../validations/auth');

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
router.post('/2fa/totp/setup', requireAuth, setupTotp);
router.post('/2fa/totp/verify', requireAuth, validateBody(sixDigitCodeSchema), verifyTotpSetup);
router.post('/2fa/email/verify', requireAuth, validateBody(sixDigitCodeSchema), verifyEmail2faSetup);
router.post('/2fa/email/enable', requireAuth, enableEmail2fa);
router.post('/2fa/disable', requireAuth, validateBody(disable2faSchema), disable2fa);
router.post('/2fa/verify-login', validateBody(verifyLoginMfaSchema), verifyLoginMfa);
router.post('/2fa/login-resend', validateBody(resendLoginMfaSchema), resendLoginMfaCode);
router.delete('/account', requireAuth, validateBody(deleteAccountSchema), deleteAccount);

module.exports = router;