import { KeyRound, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { renamePasskey } from '../../../api/auth';
import { useAuth } from '../../../context/AuthContext';
import Modal from './Modal';

export default function RenamePasskeyModal({ passkey, onClose, onSuccess }) {
    const { user } = useAuth();

    const [name, setName] = useState(passkey?.name || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const displayName = user?.name || user?.email?.split('@')[0] || 'User';

    const getSuggestions = () => {
        const suggestions = [
            `${displayName}'s PC`,
            'MacBook TouchID',
            'Windows Hello',
            'Phone Passkey',
        ];

        const deviceType = passkey?.deviceType?.toLowerCase() || '';

        if (deviceType.includes('single') || deviceType.includes('cross')) {
            suggestions.unshift('Security Key', 'YubiKey'
            );
        }

        return suggestions;
    };

    const suggestions = getSuggestions();

    const handleRename = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setError('Please enter a valid passkey name.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await renamePasskey(id, name);

            toast.success('Passkey renamed successfully');

            onSuccess(response.data.passkey);
        } catch (err) {
            toast.error('Failed to rename passkey.');

            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to rename passkey. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={Boolean(passkey)}
            onClose={onClose}
            title="Rename Passkey"
            closeDisabled={loading}
        >
            <p className="mt-4 text-sm text-marquee-muted">
                Give this passkey a recognizable name or choose
                a quick suggestion below.
            </p>

            <form
                onSubmit={handleRename}
                className="mt-5 space-y-4"
            >
                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-marquee-muted">
                        Passkey Name
                    </label>

                    <div className="relative flex items-center">
                        <KeyRound className="absolute left-3.5 h-4 w-4 text-marquee-muted" />

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder={`e.g. ${displayName}'s PC`}
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 py-2.5 pl-10 pr-4 text-sm text-marquee-cream placeholder-marquee-muted/50 outline-none focus:border-marquee-gold disabled:opacity-60"
                        />
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="mr-1 inline-flex items-center gap-1 text-xs text-marquee-muted">
                            <Sparkles className="h-3 w-3 text-marquee-gold" />
                            Suggestions:
                        </span>

                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() =>
                                    setName(suggestion)
                                }
                                disabled={loading}
                                className="rounded-full border border-marquee-line/70 bg-marquee-panel2 px-2.5 py-1 text-xs font-medium text-marquee-cream transition hover:border-marquee-gold hover:bg-marquee-gold/10 disabled:opacity-50"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition hover:border-marquee-gold hover:text-marquee-cream disabled:opacity-50"
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
        </Modal>
    );
}