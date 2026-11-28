const yup = require('yup');

const currentPasswordSchema = yup.object({
    currentPassword: yup.string().required('Current password is required.'),
}).noUnknown(true);

const replaceSecurityQuestionsSchema = yup.object({
    currentPassword: yup.string().required('Current password is required.'),
    questions: yup.array().of(yup.object({
        questionText: yup.string().trim().min(10).max(200).required(),
        answer: yup.string().max(256).required(),
    }).noUnknown(true)).length(3).required(),
}).noUnknown(true);

const initializeRecoverySchema = yup.object({
    emailOrUsername: yup.string().trim().min(3).max(254).required(),
}).noUnknown(true);

const verifyRecoverySchema = yup.object({
    emailOrUsername: yup.string().trim().min(3).max(254).required(),
    answers: yup.array().of(yup.object({
        questionId: yup.string().required(),
        answer: yup.string().max(256).required(),
    }).noUnknown(true)).length(3).required(),
}).noUnknown(true);

module.exports = {
    currentPasswordSchema,
    replaceSecurityQuestionsSchema,
    initializeRecoverySchema,
    verifyRecoverySchema,
};
