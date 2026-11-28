const mongoose = require('mongoose');
const { Schema } = mongoose;

const securityQuestionSchema = new Schema(
    {
        questionText: { type: String, required: true, trim: true, minlength: 10, maxlength: 200 },
        normalizedQuestionText: { type: String, required: true, select: false },
        answerEnc: { type: String, required: true, select: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const userSecurityQuestionsSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
        version: { type: String, required: true },
        questions: {
            type: [securityQuestionSchema],
            default: [],
            validate: {
                validator: (questions) => questions.length === 3
                    && new Set(questions.map((question) => question.normalizedQuestionText)).size === 3,
                message: 'Exactly three distinct security questions are required.',
            },
        },
    },
    { timestamps: true, collection: 'user_security_questions' }
);

module.exports = mongoose.models.UserSecurityQuestions || mongoose.model('UserSecurityQuestions', userSecurityQuestionsSchema);