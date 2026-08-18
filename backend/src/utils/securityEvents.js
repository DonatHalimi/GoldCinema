async function addSecurityEvent(user, { type, title, description }) {
    if (!user) return;

    user.securityEvents = user.securityEvents || [];

    user.securityEvents.push({
        type,
        title,
        description,
        createdAt: new Date(),
    });
}

function buildSessionMeta(req, loginMethod = 'password') {
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || req.ip || null;

    const userAgent = req.headers['user-agent'] || null;
    const deviceLabel = parseDeviceLabel(userAgent);

    return {
        ipAddress,
        userAgent,
        deviceLabel,
        loginMethod,
        lastActiveAt: new Date(),
    };
}

function parseDeviceLabel(ua) {
    if (!ua) return 'Unknown Device';

    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    if (/Edg\//.test(ua)) browser = 'Edge';
    else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
    else if (/Firefox\//.test(ua)) browser = 'Firefox';
    else if (/Chrome\//.test(ua)) browser = 'Chrome';
    else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
    else if (/MSIE|Trident/.test(ua)) browser = 'Internet Explorer';

    if (/Windows NT 10/.test(ua)) os = 'Windows 10';
    else if (/Windows NT 11/.test(ua)) os = 'Windows 11';
    else if (/Windows NT/.test(ua)) os = 'Windows';
    else if (/iPhone/.test(ua)) os = 'iPhone';
    else if (/iPad/.test(ua)) os = 'iPad';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/Mac OS X/.test(ua)) os = 'macOS';
    else if (/Linux/.test(ua)) os = 'Linux';
    else if (/CrOS/.test(ua)) os = 'ChromeOS';

    return `${browser} on ${os}`;
}


module.exports = { addSecurityEvent, buildSessionMeta };