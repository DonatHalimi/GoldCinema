import { AnimatePresence } from 'framer-motion';
import { Globe, LogOut, RefreshCw, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import api from '../../../api/client';

import SessionCard from './SessionCard';
import SessionEmptyState from './SessionEmptyState';
import SessionRevokeAllModal from './SessionRevokeAllModal';
import SessionSkeleton from './SessionSkeleton';

export default function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(null);
    const [revokingAll, setRevokingAll] = useState(false);
    const [showConfirmAll, setShowConfirmAll] = useState(false);

    const otherSessionsCount = sessions.filter((session) => !session.isCurrent).length;

    async function loadSessions() {
        try {
            setLoading(true);

            const { data } = await api.get('/auth/sessions');

            setSessions(data.sessions || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load sessions. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSessions();
    }, []);

    async function handleRevoke(id) {
        try {
            setRevoking(id);

            const { data } = await api.delete(`/auth/sessions/${id}`);

            setSessions((previous) => previous.filter((session) => session.id !== id));

            toast.success(data.message || 'Session revoked.');
        } catch (error) {
            if (error.response?.status === 404) {
                toast.info(
                    'Session was already expired or removed. Refreshing list.'
                );

                loadSessions();
            } else {
                toast.error(
                    error.response?.data?.error ||
                    error.message ||
                    'Failed to revoke session.'
                );
            }
        } finally {
            setRevoking(null);
        }
    }

    async function handleRevokeAll() {
        try {
            setRevokingAll(true);

            const { data } = await api.delete('/auth/sessions/revoke-all');

            setSessions((previous) => previous.filter((session) => session.isCurrent));

            toast.success(data.message || 'All other sessions signed out.');

            setShowConfirmAll(false);
        } catch (error) {
            toast.error(error.response?.data?.error || error.message || 'Failed to sign out other sessions.');
        } finally {
            setRevokingAll(false);
        }
    }

    return (
        <div>
            <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                Sessions
            </h2>

            <p className="mt-2 text-sm text-marquee-muted">
                Every device or browser that's currently signed into
                your account. Revoke any session you don't recognise.
            </p>

            {!loading && (
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-marquee-line bg-marquee-panel p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 text-marquee-gold">
                            <Globe size={18} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-marquee-cream">
                                {sessions.length} active session
                                {sessions.length !== 1 ? 's' : ''}
                            </p>

                            <p className="text-xs text-marquee-muted">
                                {otherSessionsCount > 0
                                    ? `${otherSessionsCount} other device${otherSessionsCount !== 1
                                        ? 's'
                                        : ''
                                    } signed in`
                                    : 'Only this device is signed in'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            id="refresh-sessions"
                            type="button"
                            onClick={loadSessions}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50"
                        >
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>

                        {otherSessionsCount > 0 && (
                            <button
                                id="revoke-all-sessions"
                                type="button"
                                onClick={() => setShowConfirmAll(true)}
                                disabled={revokingAll}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 transition hover:border-red-500/50 hover:bg-red-500/8 hover:text-red-300 disabled:opacity-50"
                            >
                                <LogOut size={12} />
                                Sign out everywhere else
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-5 space-y-3">
                {loading ? (
                    <>
                        <SessionSkeleton />
                        <SessionSkeleton />
                    </>
                ) : sessions.length === 0 ? (
                    <SessionEmptyState />
                ) : (
                    <AnimatePresence
                        initial={false}
                        mode="popLayout"
                    >
                        {sessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onRevoke={handleRevoke}
                                revoking={revoking === session.id}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {!loading && sessions.length > 0 && (
                <p className="mt-6 flex items-start gap-2 text-xs text-marquee-muted/70">
                    <Shield size={13} className="mt-0.5 shrink-0 text-marquee-goldDim" />

                    If you see a session you don't recognise, revoke it
                    immediately and consider changing your password.
                </p>
            )}

            <SessionRevokeAllModal
                isOpen={showConfirmAll}
                count={otherSessionsCount}
                loading={revokingAll}
                onCancel={() => setShowConfirmAll(false)}
                onConfirm={handleRevokeAll}
            />
        </div>
    );
}