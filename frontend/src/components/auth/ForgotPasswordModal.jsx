import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    forgotPasswordSchema,
    validateForm,
} from '../../validations';
import { Field } from '../ui/FormUI';
import Modal from '../ui/Modal';

export function ForgotPasswordModal({
    isOpen,
    onClose,
}) {
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotFieldErrors, setForgotFieldErrors] = useState({});
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotSubmitting, setForgotSubmitting] = useState(false);

    const { forgotPassword } = useAuth();

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        setForgotSubmitting(true);
        setForgotMessage('');
        setForgotFieldErrors({});

        const { valid, errors } = await validateForm(forgotPasswordSchema, { email: forgotEmail });

        if (!valid) {
            setForgotFieldErrors(errors);
            setForgotSubmitting(false);
            return;
        }

        try {
            const data = await forgotPassword(forgotEmail.trim().toLowerCase());

            setForgotMessage(data.message);
            setForgotEmail('');

            setTimeout(() => {
                onClose();
                setForgotMessage('');
                setForgotFieldErrors({});
            }, 2000);
        } catch (err) {
            setForgotMessage(err.message || 'Unable to send reset email.');
        } finally {
            setForgotSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reset your password"
            closeDisabled={forgotSubmitting}
            maxWidth="max-w-md"
        >
            <p className="mt-1 text-sm text-marquee-muted">
                Enter your email to receive a secure reset link.
            </p>

            <form onSubmit={handleForgotPassword} className="mt-5 space-y-4">
                <label className="block">
                    <span className="mb-1 block text-sm text-marquee-muted">
                        Email
                    </span>

                    <Field
                        type="email"
                        value={forgotEmail}
                        onChange={setForgotEmail}
                        error={forgotFieldErrors.email}
                    />

                    {forgotFieldErrors.email && (
                        <span className="mt-1 block text-xs text-red-400">
                            {forgotFieldErrors.email}
                        </span>
                    )}
                </label>

                {forgotMessage && (
                    <p className="text-sm text-marquee-muted">
                        {forgotMessage}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {forgotSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}

                    {forgotSubmitting ? 'Sending link...' : 'Send reset link'}
                </button>
            </form>
        </Modal>
    );
}