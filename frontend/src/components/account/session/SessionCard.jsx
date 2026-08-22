import { motion } from 'framer-motion';
import { Clock, Globe, Key, Shield, Wifi } from 'lucide-react';
import { formatSessionDate, timeAgo } from '../../../utils/sessionUtils';
import SessionDeviceIcon from './SessionDeviceIcon';
import SessionMethodBadge from './SessionMethodBadge';

export default function SessionCard({
    session,
    onRevoke,
    revoking,
}) {
    const {
        deviceLabel,
        ipAddress,
        loginMethod,
        createdAt,
        expiresAt,
        lastActiveAt,
        isCurrent,
        rememberMe,
    } = session;

    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                x: -20,
            }}
            animate={{
                opacity: 1,
                x: 0,
            }}
            exit={{
                opacity: 0,
                x: '-100vw',
                scale: 0.95,
            }}
            transition={{
                duration: 0.4,
                ease: 'easeInOut',
            }}
            className={`relative flex flex-col gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-start sm:justify-between ${isCurrent
                ? 'border-marquee-gold/35 bg-marquee-gold/5'
                : 'border-marquee-line bg-marquee-bg hover:border-marquee-line/70'}`}
        >
            <div className="flex items-start gap-4">
                <SessionDeviceIcon
                    userAgent={session.userAgent}
                    isCurrentSession={isCurrent}
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-marquee-cream">
                            {deviceLabel}
                        </p>

                        {isCurrent && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-marquee-goldBright/15 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-marquee-goldBright">
                                <Wifi size={10} />
                                Current
                            </span>
                        )}

                        <SessionMethodBadge method={loginMethod} />

                        {rememberMe && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-marquee-muted/30 px-2 py-0.5 text-[10px] font-medium text-marquee-muted">
                                <Key size={9} />
                                Remembered
                            </span>
                        )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-marquee-muted">
                        {ipAddress && (
                            <span className="flex items-center gap-1">
                                <Globe
                                    size={11}
                                    className="text-marquee-goldDim"
                                />
                                {ipAddress}
                            </span>
                        )}

                        <span className="flex items-center gap-1">
                            <Clock
                                size={11}
                                className="text-marquee-goldDim"
                            />
                            Last active: {timeAgo(lastActiveAt)}
                        </span>

                        <span className="flex items-center gap-1">
                            <Shield
                                size={11}
                                className="text-marquee-goldDim"
                            />
                            Signed in: {formatSessionDate(createdAt)}
                        </span>

                        <span className="text-marquee-muted/60">
                            Expires: {formatSessionDate(expiresAt)}
                        </span>
                    </div>
                </div>
            </div>

            {!isCurrent && (
                <div className="flex shrink-0 items-center sm:pl-4">
                    <button
                        id={`revoke-session-${session.id}`}
                        type="button"
                        onClick={() => onRevoke(session.id)}
                        disabled={revoking}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition-all hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {revoking ? 'Revoking…' : 'Revoke'}
                    </button>
                </div>
            )}
        </motion.div>
    );
}