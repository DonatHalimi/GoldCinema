const TEXTBEE_API_URL = 'https://api.textbee.dev/api/v1/gateway/send-sms';

if (!process.env.TEXTBEE_API_KEY) {
    console.warn('[warn] TEXTBEE_API_KEY is not set. SMS 2FA will fail until configured.');
}

async function sendSms(phoneNumber, message) {
    const response = await fetch(TEXTBEE_API_URL, {
        method: 'POST',
        headers: {
            'x-api-key': process.env.TEXTBEE_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipients: [phoneNumber], message }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw Object.assign(new Error(`SMS delivery failed: ${text}`), { status: 502 });
    }

    return response.json();
}

module.exports = { sendSms };