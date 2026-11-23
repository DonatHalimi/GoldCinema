const nodemailer = require('nodemailer');
const { renderEmailTemplate } = require('../services/emailTemplateService');

let cachedTransporter = null;

function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    if (!process.env.SMTP_HOST) {
        console.warn(
            '[mailer] SMTP_HOST is not set — emails will be logged to the console instead of sent. ' +
            'Run MailHog (see README) or set SMTP_* env vars to send real emails.'
        );
        cachedTransporter = {
            sendMail: async (options) => {
                console.log('\n[mailer] (dev mode, no SMTP configured) Would send email:');
                console.log(`  To: ${options.to}`);
                console.log(`  Subject: ${options.subject}`);
                console.log(`  ${options.text || options.html}\n`);
                return { messageId: 'dev-console-log' };
            },
        };
        return cachedTransporter;
    }

    cachedTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 1025,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
            : undefined,
    });

    return cachedTransporter;
}

async function sendTemplatedEmail({ slug, to, variables = {}, attachments, replyTo, useSamples = false }) {
    if (!to) throw new Error('No email recipient provided');
    const rendered = await renderEmailTemplate(slug, variables, { useSamples });
    const message = {
        from: process.env.SMTP_FROM || 'GoldCinema <no-reply@goldcinema.example>',
        to,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
    };
    if (replyTo) message.replyTo = replyTo;
    if (attachments) message.attachments = attachments;
    return getTransporter().sendMail(message);
}

async function sendVerificationEmail({ to, name, verificationUrl }) {
    return sendTemplatedEmail({
        slug: 'email_verification',
        to,
        variables: { name, verificationUrl, currentYear: String(new Date().getFullYear()) },
    });
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
    return sendTemplatedEmail({
        slug: 'password_reset',
        to,
        variables: { name, resetUrl, currentYear: String(new Date().getFullYear()) },
    });
}

async function sendOrderEmail({ to, name, subject, text, html, templateKey = 'generic_order' }) {
    return sendTemplatedEmail({
        slug: templateKey,
        to,
        variables: { name: name || '', subject, text: text || '', html: html || '' },
    });
}

async function sendTicketEmail(to, order, qrDataUrl) {
    const rawQrDataUrl = qrDataUrl || order.qrTicket?.dataUrl;
    const startDate = order.showtime?.startTime ? new Date(order.showtime.startTime) : null;
    const showtimeDate = startDate
        ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '28.07.2026';
    const showtimeTime = startDate
        ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        : '17:30';
    const seatsList = Array.isArray(order.seats) ? order.seats.join(', ') : '19';
    const totalPaid = typeof order.totalAmount === 'number'
        ? order.totalAmount.toFixed(2)
        : (order.ticketAmount || 6.00).toFixed(2);
    const attachments = [];
    let qrImageSrc = '';

    if (rawQrDataUrl) {
        const base64Data = rawQrDataUrl.replace(/^data:image\/\w+;base64,/, '');
        attachments.push({
            filename: 'qrcode.png',
            content: Buffer.from(base64Data, 'base64'),
            cid: 'qrcode@goldcinema',
        });
        qrImageSrc = 'cid:qrcode@goldcinema';
    }

    return sendTemplatedEmail({
        slug: 'ticket_confirmation',
        to,
        attachments,
        variables: {
            orderId: String(order._id || 'WPW2H73'),
            movieTitle: order.movie?.title || 'Your Movie',
            posterUrl: order.movie?.posterUrl || 'https://via.placeholder.com/300x450?text=GoldCinema',
            showtimeDate,
            showtimeTime,
            cinemaName: order.showtime?.cinema?.name || 'GoldCinema',
            address: order.showtime?.cinema?.location?.address || '',
            city: order.showtime?.cinema?.location?.city || '',
            country: order.showtime?.cinema?.location?.country || '',
            screenName: order.showtime?.screen?.name || order.showtime?.hall || 'GoldCinema Hall',
            row: order.row || 'C',
            seats: seatsList,
            ticketType: order.ticketType || `1 Regular VIP (${totalPaid})`,
            totalPaid,
            customerName: order.user?.name || 'Valued Customer',
            customerEmail: order.user?.email || to,
            paymentType: order.paymentType || 'CREDIT',
            purchaseDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : '27.07.2026',
            qrImageSrc,
            currentYear: String(new Date().getFullYear()),
        },
    });
}

async function sendTwoFactorCode({ to, name, code }) {
    if (!to) throw new Error('No email recipient provided');
    return sendTemplatedEmail({
        slug: 'two_factor_code',
        to,
        variables: { name: name || 'there', code, currentYear: String(new Date().getFullYear()) },
    });
}

async function sendContactEmail({ name, email, subject, message }) {
    if (!email || !message) throw new Error('Required contact fields are missing');
    return sendTemplatedEmail({
        slug: 'contact_notification',
        to: 'donat.halimi03@gmail.com',
        replyTo: email,
        variables: {
            name,
            email,
            displaySubject: subject || 'General Inquiry',
            emailSubject: subject || 'New Message',
            message,
            currentYear: String(new Date().getFullYear()),
        },
    });
}

async function sendLoginAlertEmail({ to, name, time, ipAddress, loginMethod }) {
    if (!to) throw new Error('No email recipient provided');
    return sendTemplatedEmail({
        slug: 'login_alert',
        to,
        variables: {
            name: name || 'there',
            time: time || new Date().toUTCString(),
            ipAddress: ipAddress || 'Unknown IP',
            loginMethod: loginMethod || 'Standard Login',
            currentYear: String(new Date().getFullYear()),
        },
    });
}

async function sendGiftCardEmail(giftCard) {
    const amount = giftCard.initialValue.toFixed(2);
    return sendTemplatedEmail({
        slug: 'gift_card_delivery',
        to: giftCard.recipientEmail,
        variables: {
            recipientName: giftCard.recipientName,
            senderName: giftCard.senderName,
            amount,
            giftCardCode: giftCard.code,
            message: giftCard.message || '',
            currentYear: String(new Date().getFullYear()),
        },
    });
}

module.exports = {
    getTransporter,
    sendTemplatedEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendOrderEmail,
    sendTicketEmail,
    sendTwoFactorCode,
    sendContactEmail,
    sendLoginAlertEmail,
    sendGiftCardEmail,
};
