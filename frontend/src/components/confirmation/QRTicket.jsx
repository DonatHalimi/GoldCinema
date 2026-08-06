export default function QRTicket({ qrTicket }) {
    return (
        <div className="border-t border-dashed border-marquee-line px-6 py-6 text-center">
            {qrTicket?.dataUrl ? (
                <>
                    <p className="mb-4 text-xs uppercase tracking-widest text-marquee-goldDim">
                        Entry QR Ticket
                    </p>

                    <img
                        src={qrTicket.dataUrl}
                        alt="QR Ticket"
                        className="mx-auto h-48 w-48 rounded-lg bg-white p-3"
                    />

                    <p className="mt-4 text-xs text-marquee-muted">
                        Scan this QR code at the cinema entrance
                    </p>
                </>
            ) : (
                <p className="text-sm text-marquee-muted">
                    QR ticket is being generated...
                </p>
            )}
        </div>
    );
}