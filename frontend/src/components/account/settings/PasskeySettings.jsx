import { startRegistration } from '@simplewebauthn/browser';
import { BadgeCheck, Fingerprint, KeyRound, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// import DisablePasskeyModal from '../../ui/modals/DisablePasskeyModal';
import RenamePasskeyModal from '../../ui/modals/RenamePasskeyModal';
import { getPasskeyRegistrationOptions, getPasskeys, verifyPasskeyRegistration } from '../../../api/auth';

export default function PasskeySettings() {
    const [passkeys, setPasskeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [selectedPasskeyForRemoval, setSelectedPasskeyForRemoval] = useState(null);
    const [selectedPasskeyForRename, setSelectedPasskeyForRename] = useState(null);

    useEffect(() => {
        fetchPasskeys();
    }, []);

    const fetchPasskeys = async () => {
        try {
            const res = await getPasskeys();
            setPasskeys(res.data.passkeys || []);
        } catch (err) {
            toast.error('Failed to load passkeys.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterPasskey = async () => {
        try {
            setRegistering(true);

            const optRes = await getPasskeyRegistrationOptions();
            const optionsJSON = optRes.data;

            const attResp = await startRegistration({ optionsJSON });

            await verifyPasskeyRegistration(attResp);

            toast.success('Passkey registered successfully!');
            fetchPasskeys();
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                toast.info('Passkey registration cancelled or timed out.');
            } else {
                toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to register passkey.');
            }
        } finally {
            setRegistering(false);
        }
    };

    const handleRemovalSuccess = (removedId) => {
        setPasskeys((prev) => prev.filter((p) => p.id !== removedId));
        setSelectedPasskeyForRemoval(null);
    };

    const handleRenameSuccess = (updatedPasskey) => {
        setPasskeys((prev) =>
            prev.map((p) => (p.id === updatedPasskey.id ? { ...p, name: updatedPasskey.name } : p))
        );
        setSelectedPasskeyForRename(null);
    };

    return (
        <>
            <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                        <KeyRound className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-marquee-cream">
                                Passkeys
                            </h3>

                            {passkeys.length > 0 && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                                    <BadgeCheck className="h-4 w-4" />
                                    Active
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm text-marquee-muted">
                            Manage your registered passkeys for fast, secure passwordless login
                        </p>
                    </div>
                </div>

                {passkeys.length > 0 && (
                    <div className="mt-5 space-y-3">
                        {passkeys.map((passkey) => (
                            <div key={passkey.id} className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                                        <Fingerprint className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-marquee-cream">
                                            {passkey.name || 'Passkey'}
                                        </p>

                                        <p className="text-xs text-marquee-muted">
                                            Added on {new Date(passkey.createdAt).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPasskeyForRename(passkey)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-marquee-line px-3 py-1.5 text-xs font-semibold text-marquee-muted transition hover:bg-marquee-line/50 hover:text-marquee-cream"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedPasskeyForRemoval(passkey)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleRegisterPasskey}
                        disabled={registering || loading}
                        className="inline-flex items-center gap-2 rounded-full border border-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-zinc-950 disabled:opacity-50"
                    >
                        <Fingerprint className="h-4 w-4" />
                        {registering ? 'Registering...' : 'Add Passkey'}
                    </button>
                </div>
            </div>

            {/* {selectedPasskeyForRemoval && (
                <DisablePasskeyModal
                    id={selectedPasskeyForRemoval.id}
                    passkeyName={selectedPasskeyForRemoval.name}
                    onClose={() => setSelectedPasskeyForRemoval(null)}
                    onSuccess={handleRemovalSuccess}
                />
            )} */}

            {selectedPasskeyForRename && (
                <RenamePasskeyModal
                    passkey={selectedPasskeyForRename}
                    onClose={() => setSelectedPasskeyForRename(null)}
                    onSuccess={handleRenameSuccess}
                />
            )}
        </>
    );
}