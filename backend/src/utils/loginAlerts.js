const { sendLoginAlertEmail } = require('./mailer');

function notifyLoginAlert(user, req, loginMethod) {
    if (user.loginAlerts === false) return;

    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;

    sendLoginAlertEmail({
        to: user.email,
        name: user.name,
        time: new Date().toUTCString(),
        ipAddress,
        loginMethod,
    }).catch((err) => console.error('[mailer] Failed to send login alert:', err));
}

module.exports = { notifyLoginAlert };