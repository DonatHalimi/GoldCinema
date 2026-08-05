import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Field } from './Login';
import { validateForm, resetPasswordSchema } from '../validations';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [searchParams] = useSearchParams();

    const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

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
                    <div className="relative">
                        <Field
                            label="New password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={setPassword}
                            required
                            error={fieldErrors.password}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-9 text-marquee-muted hover:text-marquee-gold"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="relative">
                        <Field
                            label="Confirm new password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            required
                            error={fieldErrors.confirmPassword}
                        />

                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-9 text-marquee-muted hover:text-marquee-gold"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && <p className="text-sm text-marquee-marquee">{error}</p>}
                    {message && <p className="text-sm text-marquee-gold">{message}</p>}

                    <button
                        type="submit"
                        disabled={submitting || !token}
                        className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:opacity-40"
                    >
                        {submitting ? 'Updating password...' : 'Update password'}
                    </button>
                </form>
            </div>
        </div>
    );
}