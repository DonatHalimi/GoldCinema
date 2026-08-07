const yup = require('yup');

const registerSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Name is required.')
        .min(2, 'Name is too short.'),
    email: yup
        .string()
        .trim()
        .required('Email is required.')
        .email('A valid email is required.'),
    password: yup
        .string()
        .required('Password is required.')
        .min(8, 'Password must be at least 8 characters.'),
}).noUnknown(true);

const loginSchema = yup.object({
    email: yup
        .string()
        .trim()
        .required('Email is required.')
        .email('A valid email is required.'),

    password: yup
        .string()
        .required('Password is required.'),

    rememberMe: yup
        .boolean()
        .default(false),
}).noUnknown(true);

const refreshTokenSchema = yup.object({
    refreshToken: yup
        .string()
        .required('Refresh token is required.'),
}).noUnknown(true);

const verifyEmailQuerySchema = yup.object({
    token: yup
        .string()
        .required('Verification token is required.'),
}).noUnknown(true);

const forgotPasswordSchema = yup.object({
    email: yup
        .string()
        .trim()
        .required('Email is required.')
        .email('A valid email is required'),
}).noUnknown(true);

const resetPasswordSchema = yup.object({
    token: yup
        .string()
        .required('Reset token is required.'),
    password: yup
        .string()
        .required('Password is required.')
        .min(8, 'Password must be at least 8 characters.'),
}).noUnknown(true);

const googleLoginSchema = yup.object({
    credential: yup
        .string()
        .required('Google credential is required.'),
}).noUnknown(true);

const facebookLoginSchema = yup.object({
    accessToken: yup
        .string()
        .required('Facebook access token is required.'),
}).noUnknown(true);

const changePasswordSchema = yup.object({
    currentPassword: yup
        .string()
        .required('Current password is required.'),

    newPassword: yup
        .string()
        .required('New password is required.')
        .min(8, 'New password must be at least 8 characters.'),
}).noUnknown(true);

const deleteAccountSchema = yup.object({
    password: yup
        .string()
        .required('Password confirmation is required.'),
}).noUnknown(true);

const sixDigitCodeSchema = yup.object({
    code: yup
        .string()
        .trim()
        .required('Verification code is required.')
        .matches(/^\d{6}$/, 'Code must be exactly 6 digits.'),
}).noUnknown(true);

const disable2faSchema = yup.object({
    password: yup
        .string()
        .required('Password is required.'),
}).noUnknown(true);

const verifyLoginMfaSchema = yup.object({
    mfaToken: yup.string().required(),
    code: yup.string().required(),
    rememberMe: yup.boolean().optional(),
    trustDevice: yup.boolean().optional(),
});

const resendLoginMfaSchema = yup.object({
    mfaToken: yup
        .string()
        .required('MFA token is required.'),
}).noUnknown(true);

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    verifyEmailQuerySchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    googleLoginSchema,
    facebookLoginSchema,
    changePasswordSchema,
    deleteAccountSchema,
    sixDigitCodeSchema,
    disable2faSchema,
    verifyLoginMfaSchema,
    resendLoginMfaSchema,
};