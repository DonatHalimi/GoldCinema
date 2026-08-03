const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Builds (and caches) a nodemailer transporter from SMTP_* env vars.
 * Works with MailHog (no auth, just point SMTP_HOST/PORT at it), a real SMTP
 * provider (SendGrid, Postmark, etc. — set SMTP_USER/SMTP_PASSWORD), or, if
 * nothing is configured, falls back to logging emails to the console so
 * registration doesn't hard-fail in a fresh dev environment.
 */
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
        'Main Hall';


    const startDate = order.showtime?.startTime
        ? new Date(order.showtime.startTime)
        : null;


    const showtimeDate = startDate
        ? startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
        : 'Scheduled Date';


    const showtimeTime = startDate
        ? startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'Scheduled Time';

    const seatsList = Array.isArray(order.seats) ? order.seats.join(', ') : 'Assigned Seats';
    const totalPaid = typeof order.totalAmount === 'number'
        ? order.totalAmount.toFixed(2)
        : (order.ticketAmount || 0).toFixed(2);

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
        .qr-instruction { color: #111111; font-weight: bold; font-size: 14px; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
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
          <h2 style="color: #ffffff; margin-top: 0;">Your Ticket is Confirmed!</h2>
          <p style="color: #b3b3c2; font-size: 15px;">Show this email or scan your QR code at the entrance.</p>

          <div class="movie-card">
            <img src="${posterUrl}" alt="${escapeHtml(movieTitle)}" class="poster" />
            <div class="movie-details">
              <h3 class="movie-title">${escapeHtml(movieTitle)}</h3>
              <p class="detail-line"><strong>Cinema:</strong> ${escapeHtml(cinemaName)} ${location ? `(${escapeHtml(location)})` : ''}</p>
              <p class="detail-line"><strong>Hall / Screen:</strong> ${escapeHtml(screenName)}</p>
              <p class="detail-line"><strong>Date:</strong> ${escapeHtml(showtimeDate)}</p>
              <p class="detail-line"><strong>Time:</strong> ${escapeHtml(showtimeTime)}</p>
              <p class="detail-line"><strong>Seats:</strong> <span style="color: #d4af37; font-weight: bold;">${escapeHtml(seatsList)}</span></p>
            </div>
          </div>

          ${qrImgSrc
            ? `<div class="qr-section">
                   <img src="${qrImgSrc}" alt="Entry QR Code" class="qr-image" />
                   <div class="qr-instruction">Scan at Cinema Entrance</div>
                 </div>`
            : ''
        }

          <div class="order-summary">
            <p style="margin: 4px 0;"><strong>Order Reference:</strong> #${order._id}</p>
            <p style="margin: 4px 0;"><strong>Total Paid:</strong> $${totalPaid}</p>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GoldCinema. Enjoy your movie!
        </div>
      </div>
    </body>
    </html>
  `;

    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'GoldCinema <no-reply@goldcinema.example>',
        to,
        subject: `🎟️ Your GoldCinema Ticket: ${movieTitle}`,
        text: `Your ticket for ${movieTitle} is confirmed! Show reference #${order._id} at entrance. Seats: ${seatsList}.`,
        html: htmlContent,
        attachments,
    });
}

module.exports = { getTransporter, sendVerificationEmail, sendOrderEmail, sendTicketEmail };