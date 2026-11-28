const crypto = require('crypto');

const REQUIRED_QUESTION_COUNT = 3;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;
const RECOVERY_TOKEN_TTL_MS = 10 * 60 * 1000;

function normalizeAnswer(answer) {
    return String(answer ?? '').normalize('NFKC').trim().toLowerCase();
}

function normalizeQuestionText(questionText) {
    return String(questionText ?? '')
        .normalize('NFKC')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

function validateQuestionPayload(questions) {
    if (!Array.isArray(questions) || questions.length !== REQUIRED_QUESTION_COUNT) {
        return { valid: false, error: `Exactly ${REQUIRED_QUESTION_COUNT} security questions are required.` };
    }

    const seen = new Set();
    for (let index = 0; index < questions.length; index += 1) {
        const questionText = String(questions[index]?.questionText ?? '').trim();
        const answer = normalizeAnswer(questions[index]?.answer);
        const normalizedQuestion = normalizeQuestionText(questionText);

        if (questionText.length < 10 || questionText.length > 200) {
            return { valid: false, error: `Question ${index + 1} must be between 10 and 200 characters.` };
        }
        if (answer.length > 256) {
            return { valid: false, error: `Answer ${index + 1} must be 256 characters or fewer.` };
        }
        if (answer.replace(/\s/g, '').length < 3) {
            return { valid: false, error: `Answer ${index + 1} must contain at least 3 non-whitespace characters.` };
        }
        if (seen.has(normalizedQuestion)) {
            return { valid: false, error: 'Security questions must be distinct.' };
        }
        seen.add(normalizedQuestion);
    }

    return { valid: true };
}


const ANSWER_ENC_ALGO = 'aes-256-gcm';
const ANSWER_ENC_IV_LEN = 12;
const ANSWER_ENC_TAG_LEN = 16;

let cachedKey = null;
function getAnswerKey() {
    if (cachedKey) return cachedKey;
    const raw = process.env.SECURITY_ANSWERS_KEY;
    if (!raw) throw new Error('SECURITY_ANSWERS_KEY is not configured.');
    const key = Buffer.from(raw, 'base64');
    if (key.length !== 32) throw new Error('SECURITY_ANSWERS_KEY must decode to exactly 32 bytes.');
    cachedKey = key;
    return key;
}

function encryptAnswer(answer) {
    const key = getAnswerKey();
    // Store the normalized plaintext so the edit form pre-fills the same
    // string that verification will compare against.
    const plaintext = normalizeAnswer(answer);
    const iv = crypto.randomBytes(ANSWER_ENC_IV_LEN);
    const cipher = crypto.createCipheriv(ANSWER_ENC_ALGO, key, iv);
    const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, ct]).toString('base64');
}

function decryptAnswer(payload) {
    if (!payload) return '';
    const key = getAnswerKey();
    const buf = Buffer.from(payload, 'base64');
    if (buf.length < ANSWER_ENC_IV_LEN + ANSWER_ENC_TAG_LEN) return '';
    const iv = buf.subarray(0, ANSWER_ENC_IV_LEN);
    const tag = buf.subarray(ANSWER_ENC_IV_LEN, ANSWER_ENC_IV_LEN + ANSWER_ENC_TAG_LEN);
    const ct = buf.subarray(ANSWER_ENC_IV_LEN + ANSWER_ENC_TAG_LEN);
    const decipher = crypto.createDecipheriv(ANSWER_ENC_ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

// Constant-time comparison of normalized answers.
function answersMatch(submitted, storedEnc) {
    if (!storedEnc) return false;
    let stored;
    try { stored = decryptAnswer(storedEnc); }
    catch { return false; }
    const a = Buffer.from(normalizeAnswer(submitted), 'utf8');
    const b = Buffer.from(stored, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

// A fixed dummy ciphertext, used when the account/question set is unavailable,
// so the comparison cost is identical regardless of whether the account exists.
const DUMMY_ANSWER_ENC = encryptAnswer('goldcinema-invalid-recovery-answer');

async function compareSubmittedAnswers(questionRecords, submittedAnswers) {
    const records = Array.isArray(questionRecords) ? questionRecords : [];
    const submitted = Array.isArray(submittedAnswers) ? submittedAnswers : [];
    const submittedById = new Map();
    let shapeIsValid = submitted.length === REQUIRED_QUESTION_COUNT && records.length === REQUIRED_QUESTION_COUNT;

    for (const entry of submitted) {
        const id = String(entry?.questionId ?? '');
        if (!id || submittedById.has(id)) shapeIsValid = false;
        else submittedById.set(id, String(entry?.answer ?? ''));
    }

    const comparisons = Array.from({ length: REQUIRED_QUESTION_COUNT }, (_, index) => {
        const question = records[index];
        const questionId = question ? String(question._id ?? question.id ?? '') : '';
        const answer = questionId && submittedById.has(questionId) ? submittedById.get(questionId) : '';
        if (!question || !questionId || !submittedById.has(questionId) || !question.answerEnc) {
            shapeIsValid = false;
            return answersMatch(answer, DUMMY_ANSWER_ENC);
        }
        return answersMatch(answer, question.answerEnc);
    });

    if (submittedById.size !== REQUIRED_QUESTION_COUNT) shapeIsValid = false;
    return shapeIsValid && comparisons.every(Boolean);
}

function calculateFailureState(existing, now = new Date()) {
    const currentTime = new Date(now).getTime();
    const previousStart = existing?.windowStartedAt ? new Date(existing.windowStartedAt).getTime() : 0;
    const inWindow = previousStart > 0 && currentTime - previousStart < ATTEMPT_WINDOW_MS;
    const failedAttempts = inWindow ? Number(existing?.failedAttempts || 0) + 1 : 1;
    return {
        failedAttempts,
        windowStartedAt: inWindow ? new Date(previousStart) : new Date(currentTime),
        lockedUntil: failedAttempts >= MAX_FAILED_ATTEMPTS ? new Date(currentTime + LOCKOUT_MS) : (existing?.lockedUntil || null),
        expiresAt: new Date(currentTime + ATTEMPT_RETENTION_MS),
    };
}

function hashRecoveryKey(value) {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET or JWT_SECRET must be configured for recovery protection.');
    return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}

function hashOpaqueToken(token) {
    return crypto.createHash('sha256').update(String(token)).digest('hex');
}

module.exports = {
    REQUIRED_QUESTION_COUNT,
    ATTEMPT_WINDOW_MS,
    MAX_FAILED_ATTEMPTS,
    LOCKOUT_MS,
    ATTEMPT_RETENTION_MS,
    RECOVERY_TOKEN_TTL_MS,
    DUMMY_ANSWER_ENC,
    normalizeAnswer,
    normalizeQuestionText,
    validateQuestionPayload,
    encryptAnswer,
    decryptAnswer,
    answersMatch,
    compareSubmittedAnswers,
    calculateFailureState,
    hashRecoveryKey,
    hashOpaqueToken,
};