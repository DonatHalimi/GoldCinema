const QRCode = require('qrcode');

const generateQRTicket = async (ticketPayload) => {
    try {
        // Keep payload clean & concise to reduce matrix density
        const compactPayload = JSON.stringify({
            orderId: ticketPayload.orderId,
            userId: ticketPayload.userId,
            seats: ticketPayload.seats,
        });

        const dataUrl = await QRCode.toDataURL(compactPayload, {
            errorCorrectionLevel: 'L', // 'L' (Low) creates the simplest, lowest-density QR grid
            margin: 4,                  // Clear white padding around the code
            width: 500,                 // High-res output so it's sharp on all screens
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