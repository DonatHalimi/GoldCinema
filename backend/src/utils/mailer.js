const nodemailer = require('nodemailer');

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

async function sendVerificationEmail({ to, name, verificationUrl }) {
  if (!to) {
    throw new Error('No email recipient provided');
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'GoldCinema <no-reply@goldcinema.example>',
    to,
    subject: 'Verify your GoldCinema account',
    text: `Hi ${name},\n\nPlease verify your email to start booking tickets:\n${verificationUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Please verify your email to start booking tickets on GoldCinema:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  if (!to) {
    throw new Error('No email recipient provided');
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'GoldCinema <no-reply@goldcinema.example>',
    to,
    subject: 'Reset your GoldCinema password',
    text: `Hi ${name},\n\nWe received a request to reset your GoldCinema password.\n\nUse this secure link to choose a new password:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.`,
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>We received a request to reset your GoldCinema password.</p>
      <p>Use the secure link below to choose a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  });
}

async function sendOrderEmail({ to, name, subject, text, html }) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'GoldCinema <no-reply@goldcinema.example>',
    to,
    subject,
    text,
    html,
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '127.0.0.1',
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false,
  auth: process.env.SMTP_USER
    ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    }
    : undefined,
});

async function sendTicketEmail(to, order, qrDataUrl) {
  const transporter = getTransporter();

  const rawQrDataUrl = qrDataUrl || order.qrTicket?.dataUrl;

  const movieTitle = order.movie?.title || 'Your Movie';

  const posterUrl =
    order.movie?.posterUrl ||
    'https://via.placeholder.com/300x450?text=GoldCinema';

  const cinema = order.showtime?.cinema;

  const cinemaName = cinema?.name || 'GoldCinema';

  const location = cinema?.location
    ? `${cinema.location.address}, ${cinema.location.city}, ${cinema.location.country}`
    : '';

  const screenName =
    order.showtime?.screen?.name ||
    order.showtime?.hall ||
    'GoldCinema Hall';

  const startDate = order.showtime?.startTime
    ? new Date(order.showtime.startTime)
    : null;

  const showtimeDate = startDate
    ? startDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '28.07.2026';

  const showtimeTime = startDate
    ? startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    : '17:30';

  const seatsList = Array.isArray(order.seats) ? order.seats.join(', ') : '19';
  const totalPaid = typeof order.totalAmount === 'number'
    ? order.totalAmount.toFixed(2)
    : (order.ticketAmount || 6.00).toFixed(2);

  const customerName = order.user?.name || 'Valued Customer';
  const customerEmail = order.user?.email || to;
  const paymentType = order.paymentType || 'CREDIT';
  const purchaseDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-GB') 
    : '27.07.2026';

  const rowName = order.row || 'C';
  const ticketType = order.ticketType || `1 Regular VIP (${totalPaid})`;

  const attachments = [];
  let qrImgSrc = '';

  if (rawQrDataUrl) {
    const base64Data = rawQrDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const qrBuffer = Buffer.from(base64Data, 'base64');

    attachments.push({
      filename: 'qrcode.png',
      content: qrBuffer,
      cid: 'qrcode@goldcinema',
    });
    qrImgSrc = 'cid:qrcode@goldcinema';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f0f12; color: #f3f3f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #18181c; border: 1px solid #2a2a32; border-radius: 12px; overflow: hidden; }
        .header { background-color: #000000; text-align: center; padding: 24px; border-bottom: 2px solid #d4af37; }
        .brand { font-size: 26px; font-weight: bold; letter-spacing: 2px; color: #d4af37; text-decoration: none; }
        .content { padding: 30px; }
        .movie-card { display: flex; gap: 20px; background-color: #222228; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
        .poster { width: 110px; height: 160px; object-fit: cover; border-radius: 6px; border: 1px solid #333; }
        .movie-details { flex: 1; }
        .movie-title { font-size: 22px; font-weight: bold; color: #ffffff; margin: 0 0 10px 0; }
        .detail-line { font-size: 14px; color: #b3b3c2; margin: 6px 0; }
        .detail-line strong { color: #f3f3f5; }
        .qr-section { text-align: center; background-color: #ffffff; padding: 24px; border-radius: 10px; margin: 24px 0; }
        .qr-image { width: 260px; height: 260px; display: block; margin: 0 auto; }
        .qr-code-text { font-size: 16px; font-weight: bold; color: #111111; margin-top: 10px; letter-spacing: 2px; }
        .instructions-box { background-color: #222228; border-left: 4px solid #d4af37; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 13px; color: #b3b3c2; line-height: 1.6; }
        .instructions-box h4 { color: #ffffff; margin: 0 0 8px 0; font-size: 14px; }
        .instructions-box ul { margin: 0; padding-left: 18px; }
        .instructions-box li { margin-bottom: 6px; }
        .order-summary { border-top: 1px dashed #33333d; padding-top: 16px; margin-top: 20px; font-size: 14px; color: #b3b3c2; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666677; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">GOLD<span style="color:#ffffff;">CINEMA</span></div>
        </div>
        <div class="content">
          <h2 style="color: #ffffff; margin-top: 0;">Electronic Ticket</h2>
          <p style="color: #b3b3c2; font-size: 15px;">This confirmation also serves as your receipt!</p>

          <div class="movie-card">
            <img src="${posterUrl}" alt="${escapeHtml(movieTitle)}" class="poster" />
            <div class="movie-details">
              <h3 class="movie-title">${escapeHtml(movieTitle)}</h3>
              <p class="detail-line"><strong>Time:</strong> ${escapeHtml(showtimeTime)}</p>
              <p class="detail-line"><strong>Date:</strong> ${escapeHtml(showtimeDate)}</p>
              <p class="detail-line"><strong>Cinema:</strong> ${escapeHtml(cinemaName)} ${location ? `(${escapeHtml(location)})` : ''}</p>
              <p class="detail-line"><strong>Screen / Hall:</strong> ${escapeHtml(screenName)}</p>
              <p class="detail-line"><strong>Row:</strong> ${escapeHtml(rowName)}</p>
              <p class="detail-line"><strong>Seats:</strong> <span style="color: #d4af37; font-weight: bold;">${escapeHtml(seatsList)}</span></p>
              <p class="detail-line"><strong>Ticket:</strong> ${escapeHtml(ticketType)}</p>
              <p class="detail-line"><strong>Price:</strong> ${totalPaid} EUR (all amounts include VAT)</p>
            </div>
          </div>

          ${qrImgSrc
      ? `<div class="qr-section">
                   <img src="${qrImgSrc}" alt="Entry QR Code" class="qr-image" />
                   <div class="qr-code-text">#${order._id || 'WPW2H73'}</div>
                 </div>`
      : ''
    }

          <div class="instructions-box">
            <h4>What to do at the cinema?</h4>
            <p style="margin: 0 0 10px 0; color: #f3f3f5;"><strong>Go straight to the entrance - skip the ticket control counter and show your QR Code.</strong></p>
            <ul>
              <li><strong>Via mobile phone:</strong> Display this confirmation email with the QR Code or use the mobile app and show the QR Code via the "My Tickets" section!</li>
              <li><strong>Via print:</strong> Show the QR Code. Please do not fold the QR Code and protect it from moisture and dirt.</li>
              <li><strong>Take care of your QR Code!</strong> After the first validation, this QR Code cannot be used for entry again.</li>
              <li>If you purchased more than one seat, please note: All guests must enter together at the ticket check.</li>
              <li>When buying food and drinks: It is also possible to get your printed tickets at the counter if preferred.</li>
            </ul>
          </div>

          <p style="font-size: 13px; color: #b3b3c2; font-style: italic; margin-top: 15px;">
            Please note that online tickets cannot be cancelled!
          </p>

          <div class="order-summary">
            <p style="margin: 4px 0;"><strong>User:</strong> ${escapeHtml(customerName)}, ${escapeHtml(customerEmail)}</p>
            <p style="margin: 4px 0;"><strong>Payment Type:</strong> ${escapeHtml(paymentType)}</p>
            <p style="margin: 4px 0;"><strong>Price:</strong> ${totalPaid} EUR</p>
            <p style="margin: 4px 0;"><strong>Purchase Date:</strong> ${escapeHtml(purchaseDate)}</p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0; color: #888899;">You can print your tickets using your booking code at GoldCinema kiosks.</p>
          <p style="margin: 0 0 10px 0; color: #f3f3f5; font-weight: bold;">Enjoy your movie and your stay at GoldCinema!</p>
          &copy; ${new Date().getFullYear()} GoldCinema Staff
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'GoldCinema <no-reply@goldcinema.example>',
    to,
    subject: `🎟️ Electronic Ticket: ${movieTitle}`,
    text: `Electronic ticket for ${movieTitle}. Time: ${showtimeTime}, Date: ${showtimeDate}. Screen: ${screenName}, Row: ${rowName}, Seat: ${seatsList}. Code: #${order._id || 'WPW2H73'}`,
    html: htmlContent,
    attachments,
  });
}

async function sendTwoFactorCode({ to, name, code }) {
  if (!to) throw new Error('No email recipient provided');

  const safeName = escapeHtml(name || 'there');
  const safeCode = escapeHtml(code);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f0f12; color: #f3f3f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #18181c; border: 1px solid #2a2a32; border-radius: 12px; overflow: hidden; }
        .header { background-color: #000000; text-align: center; padding: 24px; border-bottom: 2px solid #d4af37; }
        .brand { font-size: 26px; font-weight: bold; letter-spacing: 2px; color: #d4af37; text-decoration: none; }
        .content { padding: 30px; }
        .code-card { background-color: #222228; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px solid #2a2a32; }
        .code-display { font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #d4af37; margin: 10px 0; }
        .detail-line { font-size: 14px; color: #b3b3c2; line-height: 1.5; }
        .warning-text { border-top: 1px dashed #33333d; padding-top: 16px; margin-top: 20px; font-size: 13px; color: #666677; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666677; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">GOLD<span style="color:#ffffff;">CINEMA</span></div>
        </div>
        <div class="content">
          <h2 style="color: #ffffff; margin-top: 0;">Two-Factor Authentication</h2>
          <p class="detail-line">Hi <strong>${safeName}</strong>,</p>
          <p class="detail-line">Use the verification code below to complete your sign-in process.</p>

          <div class="code-card">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #b3b3c2; margin-bottom: 6px;">Your Security Code</div>
            <div class="code-display">${safeCode}</div>
            <div style="font-size: 13px; color: #b3b3c2; margin-top: 6px;">Expires in <strong>10 minutes</strong></div>
          </div>

          <div class="warning-text">
            If you did not request this code, please ignore this message or change your password to secure your account.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GoldCinema. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'GoldCinema <no-reply@goldcinema.example>',
    to,
    subject: `🔒 Your GoldCinema Verification Code: ${code}`,
    text: `Hi ${name},\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, secure your account immediately.`,
    html: htmlContent,
  });
}

async function sendContactEmail({ name, email, subject, message }) {
  if (!email || !message) {
    throw new Error('Required contact fields are missing');
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject || 'General Inquiry');
  const safeMessage = escapeHtml(message);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f0f12; color: #f3f3f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #18181c; border: 1px solid #2a2a32; border-radius: 12px; overflow: hidden; }
        .header { background-color: #000000; text-align: center; padding: 24px; border-bottom: 2px solid #d4af37; }
        .brand { font-size: 26px; font-weight: bold; letter-spacing: 2px; color: #d4af37; text-decoration: none; }
        .content { padding: 30px; }
        .detail-line { font-size: 14px; color: #b3b3c2; margin: 8px 0; }
        .detail-line strong { color: #f3f3f5; }
        .message-box { background-color: #222228; padding: 16px; border-radius: 8px; margin-top: 16px; border: 1px solid #2a2a32; white-space: pre-wrap; color: #f3f3f5; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666677; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">GOLD<span style="color:#ffffff;">CINEMA</span></div>
        </div>
        <div class="content">
          <h2 style="color: #ffffff; margin-top: 0;">New Contact Message</h2>
          <p class="detail-line"><strong>Name:</strong> ${safeName}</p>
          <p class="detail-line"><strong>Email:</strong> ${safeEmail}</p>
          <p class="detail-line"><strong>Subject:</strong> ${safeSubject}</p>
          <div style="margin-top: 20px; font-size: 14px; color: #b3b3c2;">Message:</div>
          <div class="message-box">${safeMessage}</div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GoldCinema Support System
        </div>
      </div>
    </body>
    </html>
    `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'GoldCinema <no-reply@goldcinema.example>',
    to: 'donat.halimi03@gmail.com',
    replyTo: email,
    subject: `[Contact Us] ${subject || 'New Message'}`,
    text: `You have received a new message from ${name} (${email}):\n\n${message}`,
    html: htmlContent,
  });
}

async function sendLoginAlertEmail({ to, name, time, ipAddress, loginMethod }) {
  if (!to) throw new Error('No email recipient provided');

  const safeName = escapeHtml(name || 'there');
  const safeTime = escapeHtml(time || new Date().toUTCString());
  const safeIp = escapeHtml(ipAddress || 'Unknown IP');
  const safeMethod = escapeHtml(loginMethod || 'Standard Login');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f0f12; color: #f3f3f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #18181c; border: 1px solid #2a2a32; border-radius: 12px; overflow: hidden; }
        .header { background-color: #000000; text-align: center; padding: 24px; border-bottom: 2px solid #d4af37; }
        .brand { font-size: 26px; font-weight: bold; letter-spacing: 2px; color: #d4af37; text-decoration: none; }
        .content { padding: 30px; }
        .alert-card { background-color: #222228; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #2a2a32; }
        .detail-line { font-size: 14px; color: #b3b3c2; margin: 6px 0; }
        .detail-line strong { color: #f3f3f5; }
        .warning-text { border-top: 1px dashed #33333d; padding-top: 16px; margin-top: 20px; font-size: 13px; color: #e74c3c; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666677; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">GOLD<span style="color:#ffffff;">CINEMA</span></div>
        </div>
        <div class="content">
          <h2 style="color: #ffffff; margin-top: 0;">New Sign-In Detected</h2>
          <p class="detail-line">Hi <strong>${safeName}</strong>,</p>
          <p class="detail-line">We noticed a new login to your GoldCinema account.</p>

          <div class="alert-card">
            <p class="detail-line"><strong>Method:</strong> ${safeMethod}</p>
            <p class="detail-line"><strong>Time:</strong> ${safeTime}</p>
            <p class="detail-line"><strong>IP Address:</strong> ${safeIp}</p>
          </div>

          <div class="warning-text">
            If this was you, you can safely ignore this email. If you did not sign in recently, please change your password immediately to secure your account.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GoldCinema Security Team
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'GoldCinema <no-reply@goldcinema.example>',
    to,
    subject: '⚠️ New Sign-In to your GoldCinema account',
    text: `Hi ${name},\n\nWe noticed a new login to your GoldCinema account via ${loginMethod} at ${safeTime} from IP: ${safeIp}.\n\nIf this wasn't you, please secure your account immediately.`,
    html: htmlContent,
  });
}

module.exports = {
  getTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderEmail,
  sendTicketEmail,
  sendTwoFactorCode,
  sendContactEmail,
  sendLoginAlertEmail
};