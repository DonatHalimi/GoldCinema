
import {
    CheckCircle2,
    ChevronDown,
    Globe,
    Link2,
    Loader2,
    Unlink2,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import {
    getSocialAccounts,
    linkSocialAccount,
    sendSocialUnlinkCode,
    startGithubAccountLink,
    startGoogleAccountLink,
    unlinkSocialAccount,
} from '../../../api/socialAccounts';
import { setInitialPassword } from '../../../api/auth';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../ui/modals/Modal';
import MarqueeSelect from '../../ui/MarqueeSelect';

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

const PROVIDERS = [
    {
        id: 'google',
        label: 'Google',
        description: 'Use your Google account to sign in to GoldCinema.',
        Icon: Globe,
    },
    {
        id: 'facebook',
        label: 'Facebook',
        description: 'Use your Facebook account to sign in to GoldCinema.',
        Icon: Globe,
    },
    {
        id: 'github',
        label: 'GitHub',
        description: 'Use your GitHub account to sign in to GoldCinema.',
        Icon: Globe,
    },
];

const SOCIAL_ERROR_MESSAGES = {
    last_login_method:
        'This is your only sign-in method. Connect another method or add a password before unlinking it.',
    github_unlink_requires_confirmation:
        'GitHub unlinking requires password confirmation or a connected sign-in method.',
    social_action_conflict:
        'This social account is already linked to another GoldCinema account or cannot be changed.',
    social_verification_failed:
        'The social account could not be verified.',
    session_changed:
        'Your session changed during authentication. Please try again.',
    invalid_state:
        'The GitHub authentication request could not be verified. Please try again.',
    github_failed:
        'GitHub authentication failed. Please try again.',
    google_failed:
        'Google authentication failed. Please try again.',
    google_configuration_missing:
        'Google account linking is not configured on the backend. Set GOOGLE_CLIENT_SECRET and GOOGLE_CALLBACK_URL, then register the callback URL in Google Cloud Console.',
    password_required:
        'Create a password before disconnecting a connected account.',
    google_denied:
        'Google account linking was cancelled.',
    google_unlink_requires_confirmation:
        'Google unlinking requires password confirmation or a connected sign-in method.',
    user_not_found:
        'Your GoldCinema account could not be found.',
};

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        fallback
    );
}

function loadFacebookSdk() {
    return new Promise((resolve, reject) => {
        if (!FACEBOOK_APP_ID) {
            reject(new Error('Facebook App ID is not configured.'));
            return;
        }

        const initializeFacebook = () => {
            if (!window.FB) {
                reject(new Error('Facebook SDK could not be initialized.'));
                return;
            }

            if (!window.__goldCinemaFacebookInitialized) {
                window.FB.init({
                    appId: FACEBOOK_APP_ID,
                    cookie: true,
                    xfbml: false,
                    version: 'v22.0',
                });

                window.__goldCinemaFacebookInitialized = true;
            }

            resolve();
        };

        if (window.FB) {
            initializeFacebook();
            return;
        }

        window.fbAsyncInit = initializeFacebook;

        const existingScript = document.getElementById('facebook-jssdk');

        if (existingScript) {
            existingScript.addEventListener(
                'error',
                () => reject(new Error('Could not load Facebook authentication.')),
                { once: true }
            );
            return;
        }

        const script = document.createElement('script');

        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;

        script.onerror = () => {
            reject(new Error('Could not load Facebook authentication.'));
        };

        document.body.appendChild(script);
    });
}

async function requestFacebookAccessToken() {
    await loadFacebookSdk();

    return new Promise((resolve, reject) => {
        window.FB.login(
            (response) => {
                const accessToken = response?.authResponse?.accessToken;

                if (!accessToken) {
                    reject(new Error('Facebook authentication was cancelled or did not return an access token.'));
                    return;
                }

                resolve(accessToken);
            },
            {
                scope: 'public_profile,email',
                auth_type: 'rerequest',
            }
        );
    });
}

export default function SocialAccounts() {
    const { user } = useAuth();

    const [accounts, setAccounts] = useState(null);
    const [loading, setLoading] = useState(true);

    const [busyProvider, setBusyProvider] = useState(null);

    const [unlinkProvider, setUnlinkProvider] = useState(null);
    const [unlinkForm, setUnlinkForm] = useState({
        currentPassword: '',
        method: 'totp',
        code: '',
    });
    const unlinkCodeRefs = useRef([]);

    const [sendingCode, setSendingCode] = useState(false);
    const [unlinking, setUnlinking] = useState(false);

    const [showSetPassword, setShowSetPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [settingPassword, setSettingPassword] = useState(false);

    async function refreshAccounts(showError = true) {
        try {
            const data = await getSocialAccounts();

            setAccounts({
                linkedProviders: data.linkedProviders || [],
                hasPassword: Boolean(data.hasPassword),
                hasPasskeys: Boolean(data.hasPasskeys),
                twoFactor: {
                    enabled: Boolean(data.twoFactor?.enabled),
                    methods: data.twoFactor?.methods || [],
                },
            });

            return data;
        } catch (error) {
            if (showError) {
                toast.error(
                    getErrorMessage(error, 'Could not load connected accounts.')
                );
            }

            return null;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshAccounts();

        const params = new URLSearchParams(window.location.search);

        const action = params.get('socialAction');
        const provider = params.get('provider');
        const errorCode = params.get('socialError');

        if (action && provider) {
            const providerName =
                provider.charAt(0).toUpperCase() + provider.slice(1);

            if (action === 'linked') {
                toast.success(`${providerName} account connected successfully.`);
            } else if (action === 'unlinked') {
                toast.success(`${providerName} account disconnected successfully.`);
            }

            refreshAccounts(false);
        }

        if (errorCode) {
            toast.error(
                SOCIAL_ERROR_MESSAGES[errorCode] ||
                'The social account operation could not be completed.'
            );
        }

        if (action || provider || errorCode) {
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );
        }
    }, []);

    function updateLinkedProviders(provider, linked) {
        setAccounts((current) => {
            if (!current) return current;

            const providers = new Set(current.linkedProviders || []);

            if (linked) {
                providers.add(provider);
            } else {
                providers.delete(provider);
            }

            return {
                ...current,
                linkedProviders: [...providers],
            };
        });
    }

    async function handleLink(provider) {
        if (busyProvider) return;

        if (provider === 'github') {
            setBusyProvider('github');
            startGithubAccountLink();
            return;
        }

        if (provider === 'google') {
            setBusyProvider('google');
            startGoogleAccountLink();
            return;
        }

        setBusyProvider(provider);

        try {
            const accessToken = await requestFacebookAccessToken();

            const data = await linkSocialAccount('facebook', {
                accessToken,
            });

            updateLinkedProviders(provider, true);

            toast.success(
                data.message ||
                `${provider} account connected successfully.`
            );

            await refreshAccounts(false);
        } catch (error) {
            toast.error(getErrorMessage(error, `Could not connect ${provider}.`));
        } finally {
            setBusyProvider(null);
        }
    }

    function openUnlinkDialog(provider) {
        if (!accounts) return;

        setUnlinkForm({
            currentPassword: '',
            method: accounts.twoFactor.methods[0] || 'totp',
            code: '',
        });
        setUnlinkProvider(provider);
    }

    function handleUnlinkCodeChange(index, value) {
        if (!/^\d*$/.test(value)) return;

        const digits = value.slice(-6);
        const nextCode = unlinkForm.code.padEnd(6, ' ').split('');
        for (let offset = 0; offset < digits.length && index + offset < 6; offset += 1) {
            nextCode[index + offset] = digits[offset];
        }

        const code = nextCode.join('').replace(/\s/g, '');
        setUnlinkForm((current) => ({ ...current, code }));

        const focusIndex = Math.min(index + Math.max(digits.length, 1), 5);
        if (digits && focusIndex !== index) {
            unlinkCodeRefs.current[focusIndex]?.focus();
        }
    }

    function handleUnlinkCodeKeyDown(index, event) {
        if (event.key === 'Backspace' && !unlinkForm.code[index] && index > 0) {
            unlinkCodeRefs.current[index - 1]?.focus();
        }
    }

    function handleUnlinkCodePaste(event) {
        const pastedCode = event.clipboardData.getData('text').trim();
        if (!/^\d{6}$/.test(pastedCode)) return;

        event.preventDefault();
        setUnlinkForm((current) => ({ ...current, code: pastedCode }));
        unlinkCodeRefs.current[5]?.focus();
    }

    function closeUnlinkDialog() {
        if (unlinking || sendingCode) return;

        setUnlinkProvider(null);
    }

    async function handleSendVerificationCode() {
        if (!unlinkProvider || sendingCode || !unlinkForm.currentPassword.trim() || !['email', 'sms'].includes(unlinkForm.method)) {
            return;
        }

        setSendingCode(true);
        try {
            const data = await sendSocialUnlinkCode(
                unlinkProvider,
                unlinkForm.method,
                unlinkForm.currentPassword
            );
            toast.success(data.message || 'Verification code sent.');
        } catch (error) {
            toast.error(
                getErrorMessage(error, 'Could not send the verification code.')
            );
        } finally {
            setSendingCode(false);
        }
    }

    async function handleConfirmUnlink() {
        if (!unlinkProvider || unlinking) return;

        const hasPassword = accounts?.hasPassword;

        if (!hasPassword) {
            setUnlinkProvider(null);
            setShowSetPassword(true);
            return;
        }

        if (hasPassword && !unlinkForm.currentPassword.trim()) {
            toast.error('Enter your current password.');
            return;
        }

        if (accounts?.twoFactor.enabled && !unlinkForm.code.trim()) {
            toast.error('Enter your two-factor verification code.');
            return;
        }

        setUnlinking(true);
        setBusyProvider(unlinkProvider);

        try {
            const payload = {};

            if (hasPassword) payload.currentPassword = unlinkForm.currentPassword;

            if (accounts?.twoFactor.enabled) {
                payload.method = unlinkForm.method;
                payload.code = unlinkForm.code.trim();
            }

            const data = await unlinkSocialAccount(
                unlinkProvider,
                payload
            );

            updateLinkedProviders(unlinkProvider, false);

            toast.success(
                data.message ||
                `${unlinkProvider} account disconnected successfully.`
            );

            setUnlinkProvider(null);

            await refreshAccounts(false);
        } catch (error) {
            toast.error(getErrorMessage(error, `Could not disconnect ${unlinkProvider}.`));
        } finally {
            setUnlinking(false);
            setBusyProvider(null);
        }
    }

    async function handleSetPassword() {
        if (settingPassword) return;

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setSettingPassword(true);

        try {
            await setInitialPassword(newPassword);

            setAccounts((current) =>
                current
                    ? { ...current, hasPassword: true }
                    : current
            );

            setNewPassword('');
            setConfirmPassword('');
            setShowSetPassword(false);

            toast.success('Password created successfully. You can now unlink providers securely.');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Could not create a password.'));
        } finally {
            setSettingPassword(false);
        }
    }

    if (loading) {
        return (
            <section className="mt-12 rounded-xl border border-marquee-line bg-marquee-panel p-6">
                <div className="flex items-center gap-2 text-sm text-marquee-muted">
                    <Loader2 size={16} className="animate-spin" />
                    Loading connected accounts...
                </div>
            </section>
        );
    }

    if (!accounts) {
        return (
            <section className="mt-12 rounded-xl border border-marquee-line bg-marquee-panel p-6">
                <p className="text-sm text-marquee-muted">
                    Connected-account information could not be loaded.
                </p>

                <button
                    type="button"
                    onClick={() => {
                        setLoading(true);
                        refreshAccounts();
                    }}
                    className="mt-4 rounded-lg border border-marquee-gold px-4 py-2 text-sm text-marquee-gold transition hover:bg-marquee-gold hover:text-marquee-bg"
                >
                    Retry
                </button>
            </section>
        );
    }

    const linkedProviders = accounts.linkedProviders || [];
    const hasPassword = accounts.hasPassword;
    const hasTwoFactor = accounts.twoFactor.enabled;
    const availableTwoFactorMethods = accounts.twoFactor.methods || [];

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {PROVIDERS.map(({ id, label, description, Icon }) => {
                    const connected = linkedProviders.includes(id);
                    const isBusy = busyProvider === id;
                    const requiresPassword = connected && !hasPassword;

                    return (
                        <div key={id} className="flex flex-col gap-4 rounded-xl border border-marquee-line bg-marquee-bg p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 text-marquee-gold">
                                    <Icon size={21} />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-semibold text-marquee-cream">
                                            {label}
                                        </h3>

                                        {connected && (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
                                                <CheckCircle2 size={11} />
                                                Connected
                                            </span>
                                        )}

                                        {!connected && (
                                            <span className="inline-flex items-center rounded-full border border-marquee-line bg-marquee-panel2 px-2 py-0.5 text-[10px] font-medium text-marquee-muted">
                                                Not connected
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-xs leading-relaxed text-marquee-muted">
                                        {description}
                                    </p>

                                    {requiresPassword && (
                                        <p className="mt-2 text-xs text-yellow-400">
                                            Create a password to verify before disconnecting this account.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center">
                                {requiresPassword ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowSetPassword(true)}
                                        disabled={Boolean(busyProvider)}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-marquee-gold/40 bg-marquee-gold/10 px-4 py-2 text-xs font-semibold text-marquee-gold transition hover:bg-marquee-gold/20 disabled:opacity-40"
                                    >
                                        Create Password
                                    </button>
                                ) : connected ? (
                                    <button
                                        type="button"
                                        onClick={() => openUnlinkDialog(id)}
                                        disabled={Boolean(busyProvider)}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {isBusy ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Unlink2 size={14} />
                                        )}

                                        Unlink
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleLink(id)}
                                        disabled={Boolean(busyProvider)}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-marquee-line px-4 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {isBusy ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Link2 size={14} />
                                        )}

                                        Link
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 rounded-lg border border-marquee-line bg-marquee-panel2/50 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-relaxed text-marquee-muted">
                        <span className="font-semibold text-marquee-cream">
                            Security:
                        </span>{' '}
                        Disconnecting a provider requires your current
                        GoldCinema password. Create one first if your account
                        does not have a password yet.
                    </p>
                </div>
            </div>

            <Modal
                isOpen={Boolean(unlinkProvider)}
                onClose={closeUnlinkDialog}
                title={`Disconnect ${unlinkProvider
                    ? unlinkProvider.charAt(0).toUpperCase() +
                    unlinkProvider.slice(1)
                    : ''
                    }`}
                closeDisabled={unlinking || sendingCode}
            >
                <p className="text-sm leading-relaxed text-marquee-muted">
                    {hasPassword
                        ? 'Enter your current GoldCinema password to disconnect this account.'
                        : 'Create a GoldCinema password first to verify this disconnect.'}
                </p>

                {hasPassword && (
                    <div className="mt-5">
                        <label htmlFor="social-unlink-password" className="mb-2 block text-xs font-medium text-marquee-muted">
                            Current password
                        </label>

                        <input
                            id="social-unlink-password"
                            type="password"
                            autoComplete="current-password"
                            value={unlinkForm.currentPassword}
                            onChange={(event) =>
                                setUnlinkForm((current) => ({
                                    ...current,
                                    currentPassword: event.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-3 py-3 text-sm text-marquee-cream outline-none transition focus:border-marquee-gold"
                            placeholder="Enter your current password"
                        />
                    </div>
                )}

                {hasTwoFactor && (
                    <div className="mt-5 space-y-3">
                        <div>
                            <label htmlFor="social-unlink-method" className="mb-2 block text-xs font-medium text-marquee-muted">
                                Two-factor method
                            </label>

                            <MarqueeSelect
                                id="social-unlink-method"
                                value={unlinkForm.method}
                                onChange={(method) =>
                                    setUnlinkForm((current) => ({
                                        ...current,
                                        method,
                                        code: '',
                                    }))
                                }
                                options={availableTwoFactorMethods.map((method) => ({
                                    value: method,
                                    label:
                                        method === 'totp'
                                            ? 'Authenticator app'
                                            : method === 'email'
                                                ? 'Email'
                                                : 'SMS',
                                }))}
                                maxWidth="max-w-none"
                            />
                        </div>

                        {['email', 'sms'].includes(unlinkForm.method) && (
                            <button
                                type="button"
                                onClick={handleSendVerificationCode}
                                disabled={sendingCode || !unlinkForm.currentPassword.trim()}
                                className="inline-flex items-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-xs font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {sendingCode && <Loader2 size={13} className="animate-spin" />}
                                Send verification code
                            </button>
                        )}

                        <div>
                            <label htmlFor="social-unlink-code" className="mb-2 block text-xs font-medium text-marquee-muted">
                                {unlinkForm.method === 'totp'
                                    ? 'Authenticator code'
                                    : 'Verification code'}
                            </label>

                            <div onPaste={handleUnlinkCodePaste} className="flex justify-between gap-2">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <input
                                        key={index}
                                        id={index === 0 ? 'social-unlink-code' : undefined}
                                        ref={(element) => {
                                            unlinkCodeRefs.current[index] = element;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                                        maxLength={1}
                                        value={unlinkForm.code[index] || ''}
                                        disabled={unlinking}
                                        onChange={(event) =>
                                            handleUnlinkCodeChange(index, event.target.value)
                                        }
                                        onKeyDown={(event) =>
                                            handleUnlinkCodeKeyDown(index, event)
                                        }
                                        className="h-12 w-12 rounded-md border border-marquee-line bg-marquee-panel2 text-center text-lg font-semibold text-marquee-cream outline-none transition focus:border-marquee-gold disabled:opacity-50"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={closeUnlinkDialog}
                        disabled={unlinking || sendingCode}
                        className="rounded-lg border border-marquee-line px-4 py-2.5 text-xs font-medium text-marquee-muted transition hover:text-marquee-cream disabled:opacity-40"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirmUnlink}
                        disabled={
                            unlinking ||
                            sendingCode ||
                            !unlinkForm.currentPassword.trim() ||
                            (hasTwoFactor && unlinkForm.code.length !== 6)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-marquee-gold px-5 py-2 font-semibold text-zinc-950 transition hover:bg-opacity-90 disabled:opacity-50"
                    >
                        {unlinking ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Unlink2 size={14} />
                        )}

                        Confirm unlink
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={showSetPassword}
                onClose={() => {
                    if (!settingPassword) {
                        setShowSetPassword(false);
                    }
                }}
                title="Create Password"
                closeDisabled={settingPassword}
            >
                <p className="text-sm leading-relaxed text-marquee-muted">
                    Add a GoldCinema password as a backup sign-in method. It is
                    required before disconnecting your last linked provider.
                </p>

                <div className="mt-5">
                    <label htmlFor="oauth-account-email" className="mb-2 block text-xs font-medium text-marquee-muted">
                        Account email
                    </label>

                    <input
                        id="oauth-account-email"
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="w-full cursor-not-allowed rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-3 text-sm text-marquee-muted"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="oauth-new-password" className="mb-2 block text-xs font-medium text-marquee-muted">
                        New password
                    </label>

                    <input
                        id="oauth-new-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={newPassword}
                        onChange={(event) =>
                            setNewPassword(event.target.value)
                        }
                        placeholder="At least 8 characters"
                        className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-3 py-3 text-sm text-marquee-cream outline-none transition focus:border-marquee-gold"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="oauth-confirm-password" className="mb-2 block text-xs font-medium text-marquee-muted">
                        Confirm password
                    </label>

                    <input
                        id="oauth-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        placeholder="Re-enter your password"
                        className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-3 py-3 text-sm text-marquee-cream outline-none transition focus:border-marquee-gold"
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSetPassword}
                        disabled={
                            settingPassword ||
                            !newPassword ||
                            !confirmPassword
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-marquee-gold px-5 py-2 font-semibold text-zinc-950 transition hover:bg-opacity-90 disabled:opacity-50"
                    >
                        {settingPassword && <Loader2 size={14} className="animate-spin" />}
                        Create Password
                    </button>
                </div>
            </Modal>
        </div>
    );
}