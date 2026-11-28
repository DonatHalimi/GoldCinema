process.env.JWT_SECRET = process.env.JWT_SECRET || 'goldcinema-security-questions-test-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    normalizeAnswer,
    normalizeQuestionText,
    validateQuestionPayload,
    hashAnswer,
    verifyAnswer,
    compareSubmittedAnswers,
    calculateFailureState,
    MAX_FAILED_ATTEMPTS,
    ATTEMPT_WINDOW_MS,
    LOCKOUT_MS,
} = require('../src/services/securityQuestionService');

const validQuestions = () => [
    { questionText: 'What was the name of your first school?', answer: 'North High' },
    { questionText: 'What was the name of your first pet?', answer: 'Milo' },
    { questionText: 'In which city did your parents meet?', answer: 'Prizren' },
];

test('answer normalization trims and lowercases answers', () => {
    assert.equal(normalizeAnswer('  Blue  '), 'blue');
    assert.equal(normalizeAnswer('BLUE'), normalizeAnswer('  Blue  '));
});

test('question normalization collapses whitespace and is case-insensitive', () => {
    assert.equal(normalizeQuestionText('  First   SCHOOL? '), 'first school?');
});

test('answers are verified using salted bcrypt hashes', async () => {
    const hash = await hashAnswer('  Blue  ');
    assert.match(hash, /^\$2[aby]\$12\$/);
    assert.equal(await verifyAnswer('blue', hash), true);
    assert.equal(await verifyAnswer('green', hash), false);
});

test('exactly three distinct questions with non-empty answers are required', () => {
    assert.equal(validateQuestionPayload(validQuestions()).valid, true);

    const duplicates = validQuestions();
    duplicates[1].questionText = 'WHAT WAS THE NAME OF YOUR FIRST SCHOOL?';
    assert.equal(validateQuestionPayload(duplicates).valid, false);

    const shortAnswer = validQuestions();
    shortAnswer[0].answer = ' a ';
    assert.equal(validateQuestionPayload(shortAnswer).valid, false);

    const oversizedAnswer = validQuestions();
    oversizedAnswer[0].answer = 'a'.repeat(257);
    assert.equal(validateQuestionPayload(oversizedAnswer).valid, false);
});

test('verification checks every configured question and rejects mismatched question IDs', async () => {
    const records = await Promise.all(validQuestions().map(async (question, index) => ({
        _id: `question-${index + 1}`,
        answerHash: await hashAnswer(question.answer),
    })));
    const correctAnswers = validQuestions().map((question, index) => ({
        questionId: `question-${index + 1}`,
        answer: question.answer,
    }));
    assert.equal(await compareSubmittedAnswers(records, correctAnswers), true);

    const oneWrongAnswer = correctAnswers.map((entry, index) => index === 1 ? { ...entry, answer: 'wrong' } : entry);
    assert.equal(await compareSubmittedAnswers(records, oneWrongAnswer), false);

    const wrongIds = correctAnswers.map((entry, index) => index === 2 ? { ...entry, questionId: 'unknown' } : entry);
    assert.equal(await compareSubmittedAnswers(records, wrongIds), false);
});

test('five failed attempts trigger a 15-minute lockout and an expired window resets the count', () => {
    const now = new Date('2026-11-24T12:00:00.000Z');
    let state = null;
    for (let attempt = 0; attempt < MAX_FAILED_ATTEMPTS; attempt += 1) {
        state = calculateFailureState(state, now);
    }
    assert.equal(state.failedAttempts, 5);
    assert.equal(state.lockedUntil.getTime(), now.getTime() + LOCKOUT_MS);

    const afterWindow = calculateFailureState(state, new Date(now.getTime() + ATTEMPT_WINDOW_MS + 1000));
    assert.equal(afterWindow.failedAttempts, 1);
    assert.equal(afterWindow.windowStartedAt.getTime(), now.getTime() + ATTEMPT_WINDOW_MS + 1000);
});


test('audit redaction masks security answers in nested and array payloads', () => {
    const { redact } = require('../src/utils/redact');
    assert.deepEqual(redact({ answers: [{ questionId: 'q1', answer: 'secret answer' }] }), { answers: '[REDACTED]' });
    assert.deepEqual(redact({ questions: [{ questionText: 'A prompt', answer: 'secret answer' }] }), { questions: [{ questionText: 'A prompt', answer: '[REDACTED]' }] });
});
