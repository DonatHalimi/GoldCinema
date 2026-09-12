import api from './client';

export async function logoutAllDevices() {
    const { data } = await api.post('/auth/logout-all');

    return data;
};

export async function deleteAccount(password) {
    const { data } = await api.delete('/auth/account', {
        data: {
            password,
        },
    });

    return data;
};

export async function getActivityData() {
    const { data } = await api.get('/auth/security/activity');

    return data;
};

export async function getSessions() {
    const { data } = await api.get('/auth/sessions');

    return data;
};

export async function revokeSession(id) {
    const { data } = await api.delete(`/auth/sessions/${id}`);

    return data;
};

export async function revokeAllSessions() {
    const { data } = await api.delete('/auth/sessions/revoke-all');

    return data;
};

export async function updateLoginAlerts(loginAlerts) {
    const { data } = await api.put('/auth/security/login-alerts', { loginAlerts });

    return data;
};

export async function getProfile() {
    const { data } = await api.get('/auth/me');

    return data;
};

export async function getPasskeys() {
    const { data } = await api.get('/auth/passkeys');

    return data;
};

export async function getPasskeyRegistrationOptions() {
    const { data } = await api.post('/auth/passkeys/register/options');

    return data;
};

export async function getPasskeyLoginOptions() {
    const { data } = await api.post('/auth/passkeys/login/options');

    return data;
};

export async function verifyPasskeyRegistration(attestation) {
    const { data } = await api.post('/auth/passkeys/register/verify', attestation);

    return data;
};

export async function verifyPasskeyLogin(rememberMe, authResponse) {
    const { data } = await api.post('/auth/passkeys/login/verify', {
        rememberMe: rememberMe,
        ...authResponse,
    });

    return data;
};

export async function getPasskeyRemovalChallenge(id) {
    const { data } = await api.post(`/auth/passkeys/${id}/remove/options`);

    return data;
};

export async function deletePasskey(id, assertion) {
    const { data } = await api.delete(`/auth/passkeys/${id}`, {
        data: {
            assertion,
        },
    });

    return data;
};

export async function renamePasskey(id, name) {
    const { data } = await api.put(`/auth/passkeys/${id}/name`, { name });

    return data;
};

export async function updateProfile(form) {
    const { data } = await api.put('/auth/profile', {
        name: form.name,
        email: form.email,
    });

    return data;
};

export async function updatePassword(passwordForm) {
    const { data } = await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
    });

    return data;
};

export async function resendEmailVerification() {
    const { data } = await api.post('/auth/resend-verification');

    return data;
};

export async function getTrustedDevices() {
    const { data } = await api.get('/auth/devices');

    return data;
};

export async function revokeDevice(id, password, confirmation) {
    const { data } = await api.delete(`/auth/devices/${id}`, {
        data: {
            password,
            confirmation,
        },
    });

    return data;
};

export async function activateEmail2FA() {
    const { data } = await api.post('/auth/2fa/email/enable');

    return data;
};

export async function resendMfaCode(mfaToken, method) {
    const { data } = await api.post('/auth/2fa/resend', { mfaToken, method, });

    return data;
};

export async function activateSms2FA(phoneNumber) {
    const { data } = await api.post('/auth/2fa/sms/enable', { phoneNumber });

    return data;
};

export async function verifySms2FA(codeToSubmit) {
    const { data } = await api.post('/auth/2fa/sms/verify', { code: codeToSubmit, });

    return data;
};

export async function generateBackupCodes() {
    const { data } = await api.post('/auth/security/backup-codes');

    return data;
};


export async function exportLogs() {
    const response = await api.get('/auth/security/export-logs', { responseType: 'blob' });

    return response;
};

export async function verifyEmail2FA(codeToSubmit) {
    const { data } = await api.post('/auth/2fa/email/verify', { code: codeToSubmit, });

    return data;
};

export async function sendEmail2FADisableCode(password) {
    const { data } = await api.post('/auth/2fa/email/disable-code', {
        password,
    });

    return data;
};

export async function sendSms2FADisableCode(password) {
    const { data } = await api.post('/auth/2fa/sms/disable-code', {
        password,
    });

    return data;
};

export async function disable2FA(password, method, code) {
    const { data } = await api.post('/auth/2fa/disable-method', {
        password,
        method,
        code,
    });

    return data;
};

export async function setupTotp2FA() {
    const { data } = await api.post('/auth/2fa/totp/setup');

    return data;
};

export async function verifyTotp2FA(codeToSubmit) {
    const { data } = await api.post('/auth/2fa/totp/verify', { code: codeToSubmit });

    return data;
};

export async function registerUser(name, email, password) {
    const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
    });

    return data;
};

export async function loginUser(email, password, rememberMe = false) {
    const { data } = await api.post('/auth/login', {
        email,
        password,
        rememberMe,
    });

    return data;
};

export async function forgotUserPassword(email) {
    const { data } = await api.post('/auth/forgot-password', {
        email,
    });

    return data;
};

export async function resetUserPassword(token, password) {
    const { data } = await api.post('/auth/reset-password', {
        token,
        password,
    });

    return data;
};

export async function verifyUserLogin(mfaToken, code, method, rememberMe, trustDevice) {
    const { data } = await api.post('/auth/2fa/verify-login', {
        mfaToken,
        code,
        method,
        rememberMe,
        trustDevice,
    });

    return data;
};

export async function loginUserWithGoogle(credential) {
    const { data } = await api.post('/auth/google', {
        credential,
    });

    return data;
};

export async function loginUserWithFacebook(accessToken) {
    const { data } = await api.post('/auth/facebook', {
        accessToken,
    });

    return data;
};

export async function changeUserPassword(currentPassword, newPassword) {
    const { data } = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
    });

    return data;
};

export async function deleteUserAccount(password) {
    const { data } = await api.delete('/auth/account', {
        data: { password },
    });

    return data;
};

export async function logoutUser() {
    const { data } = await api.post('/auth/logout');

    return data;
};

export async function verifyUserEmail(token) {
    const { data } = await api.get(`/auth/verify-email?token=${token}`);

    return data;
};