import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function Field({
    label,
    type,
    value,
    onChange,
    required,
    error,
    onBlur,
}) {
    const [focused, setFocused] = useState(false);

    return (
        <label className="relative block w-full">
            <span className="mb-1 block text-sm text-marquee-muted">
                {label}
            </span>

            <input
                type={type}
                value={value}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                    setFocused(false);
                    onBlur?.();
                }}
                className={`w-full rounded-md border bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition
        ${error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-marquee-line focus:border-marquee-gold'
                    }`}
            />

            {error && focused && (
                <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-md border border-red-500/30 bg-red-950/90 px-3 py-2 text-xs text-red-300 shadow-lg backdrop-blur-sm">
                    {error}
                </div>
            )}
        </label>
    );
}

export function PasswordStrength({ password }) {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];

    const score = checks.filter(Boolean).length;

    const labels = [
        'Too weak',
        'Weak',
        'Fair',
        'Good',
        'Strong',
    ];

    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded ${i <= score
                            ? 'bg-marquee-gold'
                            : 'bg-zinc-700'
                            }`}
                    />
                ))}
            </div>

            {password && (
                <p className="text-xs text-marquee-muted">
                    {labels[score]}
                </p>
            )}
        </div>
    );
}

export function SocialLoginButton({
    icon,
    children,
    onClick,
    disabled = false,
    google = false,
    buttonRef,
}) {
    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex h-[48px] w-full items-center justify-center gap-3 rounded-full border border-marquee-gold bg-transparent px-6 font-semibold text-marquee-gold disabled:opacity-40">
            {icon}
            <span>{children}</span>
        </button>
    );
}

export function PasswordField({
    value,
    onChange,
    error,
    label = "Password",
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Field
                label={label}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                error={error}
            />

            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-marquee-muted hover:text-marquee-gold"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    );
}