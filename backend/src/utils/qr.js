const QRCode = require('qrcode');

const generateQRTicket = async (ticketPayload) => {
    try {
        const compactPayload = JSON.stringify({
            orderId: ticketPayload.orderId,
            userId: ticketPayload.userId,
            seats: ticketPayload.seats,
        });

        const dataUrl = await QRCode.toDataURL(compactPayload, {
            errorCorrectionLevel: 'L',
            margin: 1,
            width: 500,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return dataUrl;
    } catch (err) {
        console.error('QR Generation Error:', err);
        throw new Error('Failed to generate QR ticket');
    }
};

module.exports = { generateQRTicket };