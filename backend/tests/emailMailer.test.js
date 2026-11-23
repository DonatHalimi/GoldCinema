const test = require('node:test');
const assert = require('node:assert/strict');
const nodemailer = require('nodemailer');
const EmailTemplate = require('../src/models/emailTemplate');

const originalFindOne = EmailTemplate.findOne;
const originalCreateTransport = nodemailer.createTransport;
const originalSmtpHost = process.env.SMTP_HOST;
const messages = [];

process.env.SMTP_HOST = 'smtp.test';
nodemailer.createTransport = () => ({
    sendMail: async (message) => {
        messages.push(message);
        return { messageId: `test-${messages.length}` };
    },
});
EmailTemplate.findOne = () => ({ lean: async () => null });

const mailer = require('../src/utils/mailer');

test('existing email dispatchers render defaults and preserve delivery-specific options', async (t) => {
    t.after(() => {
        EmailTemplate.findOne = originalFindOne;
        nodemailer.createTransport = originalCreateTransport;
        if (originalSmtpHost === undefined) delete process.env.SMTP_HOST;
        else process.env.SMTP_HOST = originalSmtpHost;
    });

    await mailer.sendVerificationEmail({
        to: 'verify@example.test',
        name: 'Alex',
        verificationUrl: 'https://example.test/verify?token=short-lived',
    });
    await mailer.sendPasswordResetEmail({
        to: 'reset@example.test',
        name: 'Alex',
        resetUrl: 'https://example.test/reset?token=short-lived',
    });
    await mailer.sendTwoFactorCode({ to: '2fa@example.test', name: 'Alex', code: '654321' });
    await mailer.sendContactEmail({
        name: 'Alex',
        email: 'alex@example.test',
        subject: 'Question',
        message: 'Hello support',
    });
    await mailer.sendLoginAlertEmail({
        to: 'login@example.test',
        name: 'Alex',
        time: 'Today',
        ipAddress: '192.0.2.1',
        loginMethod: 'Passkey',
    });
    await mailer.sendOrderEmail({
        to: 'order@example.test',
        name: 'Alex',
        subject: 'Order received',
        text: 'Your order is ready.',
        html: '<p>Your order is ready.</p><script>alert(1)</script>',
    });
    await mailer.sendGiftCardEmail({
        recipientEmail: 'gift@example.test',
        recipientName: 'Sam',
        senderName: 'Alex',
        initialValue: 25,
        code: 'GC-TEST-1',
        message: 'Enjoy the show!',
    });
    await mailer.sendGiftCardEmail({
        recipientEmail: 'gift-no-message@example.test',
        recipientName: 'Sam',
        senderName: 'Alex',
        initialValue: 25,
        code: 'GC-TEST-2',
        message: '',
    });
    await mailer.sendTicketEmail('ticket@example.test', {
        _id: 'ORDER-1',
        totalAmount: 12,
        createdAt: new Date('2026-01-01T10:00:00Z'),
        user: { name: 'Alex', email: 'ticket@example.test' },
        movie: { title: 'The Example' },
        showtime: { startTime: new Date('2026-01-02T18:00:00Z') },
        seats: ['A1', 'A2'],
    }, 'data:image/png;base64,cXJjb2Rl');

    assert.equal(messages.length, 9);
    assert.match(messages[0].html, /https:\/\/example\.test\/verify\?token=short-lived/);
    assert.match(messages[1].html, /https:\/\/example\.test\/reset\?token=short-lived/);
    assert.match(messages[2].html, /654321/);
    assert.equal(messages[3].to, 'donat.halimi03@gmail.com');
    assert.equal(messages[3].replyTo, 'alex@example.test');
    assert.match(messages[4].html, /Passkey/);
    assert.equal(messages[5].subject, 'Order received');
    assert.match(messages[5].html, /Your order is ready/);
    assert.doesNotMatch(messages[5].html, /<script/);
    assert.match(messages[6].html, /Enjoy the show!/);
    assert.doesNotMatch(messages[7].html, /Enjoy the show!/);
    assert.equal(messages[8].attachments[0].filename, 'qrcode.png');
    assert.equal(messages[8].attachments[0].cid, 'qrcode@goldcinema');
    assert.match(messages[8].html, /cid:qrcode@goldcinema/);
});
