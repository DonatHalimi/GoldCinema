import api from './client';

export async function getSecurityQuestions() {
    const { data } = await api.get('/account/security-questions');
    return data;
}

export async function saveSecurityQuestions(currentPassword, questions) {
    const { data } = await api.put('/account/security-questions', { currentPassword, questions });
    return data;
}

export async function removeSecurityQuestions(currentPassword) {
    const { data } = await api.delete('/account/security-questions', { data: { currentPassword } });
    return data;
}

export async function initializeSecurityQuestionRecovery(emailOrUsername) {
    const { data } = await api.post('/auth/recovery/questions/init', { emailOrUsername });
    return data;
}

export async function verifySecurityQuestionRecovery(emailOrUsername, answers) {
    const { data } = await api.post('/auth/recovery/questions/verify', { emailOrUsername, answers });
    return data;
}

export async function completeSecurityQuestionLogin(recoveryToken) {
    const { data } = await api.post('/auth/recovery/questions/complete-login', { recoveryToken });
    return data;
}