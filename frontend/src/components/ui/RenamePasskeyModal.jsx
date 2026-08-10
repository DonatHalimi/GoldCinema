import { KeyRound, Loader2, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function RenamePasskeyModal({
    passkey,
    onClose,
    onSuccess,
}) {
    const { user } = useAuth();
    const [name, setName] = useState(passkey?.name || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const displayName = user?.name || user?.email?.split('@')[0] || 'User';

    const getSuggestions = () => {
        const suggestions = [`${displayName}'s PC`, 'MacBook TouchID', 'Windows Hello', 'Phone Passkey'];
        const devType = passkey?.deviceType?.toLowerCase() || '';

        if (devType.includes('single') || devType.includes('cross')) {
            suggestions.unshift('Security Key', 'YubiKey');
        }

        return suggestions;
    };

    const suggestions = getSuggestions();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleRename = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Please enter a valid passkey name.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.put(`/auth/passkeys/${passkey.id}/name`, {
                name: name.trim(),
            });

            toast.success('Passkey renamed successfully');
            onSuccess(res.data.passkey);
        } catch (err) {
            toast.error('Failed to rename passkey.');
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to rename passkey. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-xl border border-marquee-line bg-marquee-bg p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-marquee-line/50 pb-3">
                    <div className="flex items-center gap-3">
                        <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                            Rename Passkey
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-marquee-muted">
                        Give this passkey a recognizable name or choose a quick suggestion below.
                    </p>
                </div>

                <form onSubmit={handleRename} className="mt-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-marquee-muted uppercase tracking-wider mb-1">
                            Passkey Name
                        </label>
                        <div className="relative flex items-center">
                            <KeyRound className="absolute left-3.5 h-4 w-4 text-marquee-muted" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={`e.g. ${displayName}'s PC`}
                                required
                                className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 py-2.5 pl-10 pr-4 text-sm text-marquee-cream placeholder-marquee-muted/50 focus:border-marquee-gold focus:outline-none"
                            />
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-xs text-marquee-muted mr-1">
                                <Sparkles className="h-3 w-3 text-marquee-gold" /> Suggestions:
                            </span>
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => setName(suggestion)}
                                    className="rounded-full border border-marquee-line/70 bg-marquee-panel2 px-2.5 py-1 text-xs font-medium text-marquee-cream transition hover:border-marquee-gold hover:bg-marquee-gold/10"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted hover:border-marquee-gold"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="inline-flex items-center gap-2 rounded-full border border-marquee-gold bg-marquee-gold px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? 'Saving...' : 'Save Name'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}