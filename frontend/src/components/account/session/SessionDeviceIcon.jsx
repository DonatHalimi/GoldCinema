import { Monitor, Smartphone } from 'lucide-react';
import { isMobileUserAgent } from '../../../utils/sessionUtils';

export default function SessionDeviceIcon({ userAgent, isCurrentSession }) {
    const mobile = isMobileUserAgent(userAgent);
    const Icon = mobile ? Smartphone : Monitor;

    return (
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${isCurrentSession
            ? 'border-marquee-gold/40 bg-marquee-gold/15 text-marquee-goldBright'
            : 'border-marquee-line bg-marquee-panel2 text-marquee-muted'}`}
        >
            <Icon size={20} />
        </div>
    );
}