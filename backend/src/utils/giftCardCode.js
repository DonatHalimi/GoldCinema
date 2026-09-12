const crypto = require('crypto');
const GiftCard = require('../models/giftCard');

const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 3;
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const MAX_ATTEMPTS = 5;

function generateRawCode() {
    let code = '';
    const totalChars = SEGMENT_LENGTH * SEGMENT_COUNT;

    for (let i = 0; i < totalChars; i++) {
        code += CHARSET[crypto.randomInt(0, CHARSET.length)];
    }

    return code.match(new RegExp(`.{1,${SEGMENT_LENGTH}}`, 'g')).join('-');
}

async function generateUniqueGiftCardCode() {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const code = generateRawCode();
        const existing = await GiftCard.findOne({ code }).select('_id').lean();
        if (!existing) return code;
    }

    throw new Error('Failed to generate a unique gift card code after multiple attempts.');
}

module.exports = { generateUniqueGiftCardCode };