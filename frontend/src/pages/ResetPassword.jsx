import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateForm, resetPasswordSchema } from '../validations';
import { Field, PasswordField, PasswordStrength } from '../components/ui/FormUI';
import { Loader2 } from 'lucide-react';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [searchParams] = useSearchParams();

    const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

    useEffect(() => {
        if (!token) {
            setError('Missing reset token. Please request a new password reset link.');
        }
    }, [token]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setFieldErrors({});

        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: 'Passwords do not match.' });
            setSubmitting(false);
            return;
        }

        const validation = await validateForm(resetPasswordSchema, { token, password });
        if (!validation.valid) {
            setFieldErrors(validation.errors);
            setSubmitting(false);
            return;
        }

        try {
            const data = await resetPassword(token, password);
            setMessage(data.message);
            setPassword('');
            setConfirmPassword('');

            window.setTimeout(() => navigate('/login', { replace: true }), 1200);
        } catch (err) {
            setError(err.message || 'Unable to reset password.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-md px-6 py-20">
            <div className="rounded-2xl border border-marquee-line bg-marquee-panel2 p-6 shadow-2xl">
                <h1 className="mb-2 font-serif text-3xl font-bold text-marquee-cream">Choose a new password</h1>
                <p className="mb-6 text-sm text-marquee-muted">
                    Enter a new password for your GoldCinema account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordField
                        label="New password"
                        value={password}
                        onChange={(value) => {
                            setPassword(value);
                            validateField('password', value);
                        }}
                        error={fieldErrors.password}
                    />

                    {password.length > 0 && (

                        <PasswordStrength password={password} />
                    )}

                    <PasswordField
                        label="Confirm new password"
                        value={confirmPassword}
                        onChange={(value) => {
                            setConfirmPassword(value);
                            validateField('confirmPassword', value);
                        }}
                        error={fieldErrors.confirmPassword}
                    />

                    {confirmPassword.length > 0 && (
                        <div
                            className={`mt-2 rounded-md border px-3 py-2 text-xs ${passwordsMatch
                                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                : 'border-red-500/30 bg-red-500/10 text-red-400'
                                }`}
                        >
                            {passwordsMatch
                                ? '✓ Passwords match'
                                : '✕ Passwords do not match'}
                        </div>
                    )}

                    {error && <p className="text-sm text-marquee-marquee">{error}</p>}
                    {message && <p className="text-sm text-marquee-gold">{message}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                {submitting ? 'Updating password...' : 'Update password'}
                            </>
                        ) : (
                            'Update password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}