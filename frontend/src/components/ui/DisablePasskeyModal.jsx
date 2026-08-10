import { Loader2, ShieldAlert, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';

export default function DisablePasskeyModal({
    id,
    passkeyName,
    onClose,
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Helper to convert base64url string to ArrayBuffer for WebAuthn API
    const bufferDecode = (value) => {
        const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
        const padLen = (4 - (base64.length % 4)) % 4;
        const padded = base64.padEnd(base64.length + padLen, '=');
        const binary = atob(padded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    };

    // Helper to convert ArrayBuffer to base64url string for backend payload
    const bufferEncode = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };

    const handleDisable = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Step 1: Request a WebAuthn re-authentication challenge from your backend
            const { data: challengeData } = await api.post('/auth/passkeys/reauth-challenge');

            const publicKeyOptions = {
                challenge: bufferDecode(challengeData.challenge),
                timeout: 60000,
                userVerification: 'required', // Forces OS PIN, Face ID, or Touch ID prompt
                rpID: challengeData.rpID || window.location.hostname,
                // Restrict selection to the specific passkey being deleted if provided
                allowCredentials: [{
                    id: bufferDecode(id),
                    type: 'public-key',
                }],
            };

            // Step 2: Prompt user for device biometric / PIN / Windows Hello
            const assertion = await navigator.credentials.get({
                publicKey: publicKeyOptions,
            });

            const authResponse = {
                id: assertion.id,
                rawId: bufferEncode(assertion.rawId),
                type: assertion.type,
                response: {
                    clientDataJSON: bufferEncode(assertion.response.clientDataJSON),
                    authenticatorData: bufferEncode(assertion.response.authenticatorData),
                    signature: bufferEncode(assertion.response.signature),
                    userHandle: assertion.response.userHandle ? bufferEncode(assertion.response.userHandle) : null,
                },
            };

            // Step 3: Send verification assertion along with the delete request
            await api.delete(`/auth/passkeys/${id}`, {
                data: { assertion: authResponse },
            });

            toast.success('Passkey removed successfully.');
            onSuccess(id);
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                setError('Verification was cancelled or timed out.');
            } else {
                toast.error('Failed to remove passkey');
                setError(
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    'Device verification failed. Please try again.'
                );
            }
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
                            Remove Passkey
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

                <div className="mt-4 space-y-3">
                    <p className="text-sm text-marquee-muted">
                        You are about to remove the passkey{' '}
                        <span className="font-medium text-marquee-cream">
                            {passkeyName || 'Passkey'}
                        </span>.
                    </p>

                    <div className="flex items-start gap-3 rounded-lg border border-marquee-line bg-marquee-panel2 p-3 text-xs text-marquee-muted">
                        <ShieldAlert className="h-5 w-5 shrink-0 text-marquee-gold" />
                        <span>
                            For security purposes, you will be prompted to verify your identity using your device security (Windows Hello, Touch ID, or Face ID) to confirm this removal.
                        </span>
                    </div>
                </div>

                <form onSubmit={handleDisable} className="mt-5 space-y-4">
                    {error && (
                        <p className="text-sm text-red-400">
                            {error}
                        </p>
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
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                            {loading ? 'Verifying...' : 'Verify & Remove'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}