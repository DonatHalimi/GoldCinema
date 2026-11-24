const QRCode = require('qrcode');

function buildTicketPayload(ticketPayload) {
    const concessions = (ticketPayload.concessions || []).map((item) => [
        item.catalogId || item.snack?._id?.toString() || item.snack?.toString() || '',
        item.name || item.snack?.name || 'Concession',
        item.quantity,
    ]);

    return JSON.stringify([
        ticketPayload.orderId,
        ticketPayload.seats,
        concessions,
    ]);
}

const generateQRTicket = async (ticketPayload) => {
    try {
        const compactPayload = buildTicketPayload(ticketPayload);

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

module.exports = { buildTicketPayload, generateQRTicket };