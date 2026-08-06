import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Loader2, X } from "lucide-react";
import { validateForm, forgotPasswordSchema } from "../../validations";
import { Field } from "../ui/FormUI";

export function ForgotPasswordModal({ isOpen, onClose }) {
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotFieldErrors, setForgotFieldErrors] = useState({});
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotSubmitting, setForgotSubmitting] = useState(false);

    const { forgotPassword } = useAuth();

    if (!isOpen) return null;

    async function handleForgotPassword(e) {
        e.preventDefault();

        setForgotSubmitting(true);
        setForgotMessage('');
        setForgotFieldErrors({});

        const { valid, errors } = await validateForm(
            forgotPasswordSchema,
            { email: forgotEmail }
        );

        if (!valid) {
            setForgotFieldErrors(errors);
            setForgotSubmitting(false);
            return;
        }

        try {
            const data = await forgotPassword(
                forgotEmail.trim().toLowerCase()
            );

            setForgotMessage(data.message);
            setForgotEmail('');

            setTimeout(() => {
                onClose();
                setForgotMessage('');
                setForgotFieldErrors({});
            }, 2000);

        } catch (err) {
            setForgotMessage(
                err.message || "Unable to send reset email."
            );
        } finally {
            setForgotSubmitting(false);
        }
    }

    return (
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-marquee-line bg-marquee-panel2 p-6 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-marquee-cream">
                            Reset your password
                        </h2>

                        <p className="mt-1 text-sm text-marquee-muted">
                            Enter your email to receive a secure reset link.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>


                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <label className="block">
                        <span className="mb-1 block text-sm text-marquee-muted">
                            Email
                        </span>

                        <Field
                            type="email"
                            value={forgotEmail}
                            onChange={(value) => setForgotEmail(value)}
                            error={forgotFieldErrors.email}
                        />

                        {forgotFieldErrors.email && (
                            <span className="mt-1 block text-xs text-marquee-marquee">
                                {forgotFieldErrors.email}
                            </span>
                        )}
                    </label>

                    <button
                        type="submit"
                        disabled={forgotSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {forgotSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                {forgotSubmitting
                                    ? "Sending link..."
                                    : "Send reset link"
                                }
                            </>
                        ) : (
                            'Send reset link'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}