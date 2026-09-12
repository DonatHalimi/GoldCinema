const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  register,
  login,
  googleLogin,
  facebookLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
  refreshToken,
  verifyEmail,
  resendVerification,
  me,
  updateProfile,
  verifyLoginMfa,
  setupTotp,
  verifyTotpSetup,
  enableEmail2fa,
  verifyEmail2faSetup,
  disable2fa,
  disable2faMethod,
  resendLoginMfaCode,
  updateLoginAlerts,
  getTrustedDevices,
  revokeTrustedDevice,
  getSecurityActivity,
  generateBackupCodesRoute,
  exportSecurityLogs,
  getSessions,
  revokeSession,
  revokeAllOtherSessions,
  logoutAllDevices,
  logout,
  enableSms2fa,
  verifySms2faSetup,
  sendEmail2faDisableCode,
  sendSms2faDisableCode,
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
    deleteAccountSchema,
  },
} = require('../validations');
const {
  sixDigitCodeSchema,
  disable2faSchema,
  verifyLoginMfaSchema,
  resendLoginMfaSchema,
  loginAlertsSchema,
  disable2faMethodSchema,
  smsPhoneSchema,
  verifySms2faSchema,
} = require('../validations/auth');

const router = express.Router();

// Registration & Login
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/google', validateBody(googleLoginSchema), googleLogin);
router.post('/facebook', validateBody(facebookLoginSchema), facebookLogin);

// Password
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);
router.put('/change-password', requireAuth, validateBody(changePasswordSchema), changePassword);

// Account
router.delete('/account', requireAuth, validateBody(deleteAccountSchema), deleteAccount);

// Tokens & Email Verification
router.post('/refresh-token', refreshToken);
router.get('/verify-email', validateQuery(verifyEmailQuerySchema), verifyEmail);
router.post('/resend-verification', requireAuth, resendVerification);

// Profile
router.get('/me', requireAuth, me);
router.put('/profile', requireAuth, updateProfile);

// Two-Factor Authentication
router.post('/2fa/verify-login', validateBody(verifyLoginMfaSchema), verifyLoginMfa);

router.post('/2fa/totp/setup', requireAuth, setupTotp);
router.post('/2fa/totp/verify', requireAuth, validateBody(sixDigitCodeSchema), verifyTotpSetup);

router.post('/2fa/email/enable', requireAuth, enableEmail2fa);
router.post('/2fa/email/verify', requireAuth, validateBody(sixDigitCodeSchema), verifyEmail2faSetup);

router.post('/2fa/sms/enable', requireAuth, validateBody(smsPhoneSchema), enableSms2fa);
router.post('/2fa/sms/verify', requireAuth, validateBody(verifySms2faSchema), verifySms2faSetup);

router.post('/2fa/disable', requireAuth, validateBody(disable2faSchema), disable2fa);
router.post('/2fa/email/disable-code', requireAuth, sendEmail2faDisableCode);

router.post('/2fa/sms/disable-code', requireAuth, sendSms2faDisableCode);
router.post('/2fa/disable-method', requireAuth, validateBody(disable2faMethodSchema), disable2faMethod);

router.post('/2fa/login-resend', validateBody(resendLoginMfaSchema), resendLoginMfaCode);

// Security
router.put('/security/login-alerts', requireAuth, validateBody(loginAlertsSchema), updateLoginAlerts);

router.get('/devices', requireAuth, getTrustedDevices);
router.delete('/devices/:deviceId', requireAuth, revokeTrustedDevice);

router.get('/security/activity', requireAuth, getSecurityActivity);
router.post('/security/backup-codes', requireAuth, generateBackupCodesRoute);
router.get('/security/export-logs', requireAuth, exportSecurityLogs);

// Sessions
router.get('/sessions', requireAuth, getSessions);
router.delete('/sessions/:id', requireAuth, revokeSession);
router.delete('/sessions/revoke-all', requireAuth, revokeAllOtherSessions);

// Logout
router.post('/logout-all', requireAuth, logoutAllDevices)
router.post('/logout', logout);

module.exports = router;