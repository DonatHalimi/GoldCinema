const METHOD_CONFIG = {
    password: {
        label: 'Password',
        color: 'text-marquee-gold border-marquee-gold/40 bg-marquee-gold/10',
    },
    google: {
        label: 'Google',
        color: 'text-red-400 border-red-400/40 bg-red-400/10',
    },
    facebook: {
        label: 'Facebook',
        color: 'text-blue-400 border-blue-400/40 bg-blue-400/10',
    },
    passkey: {
        label: 'Passkey',
        color: 'text-purple-400 border-purple-400/40 bg-purple-400/10',
    },
    mfa: {
        label: 'MFA',
        color: 'text-green-400 border-green-400/40 bg-green-400/10',
    },
    register: {
        label: 'Sign up',
        color: 'text-marquee-muted border-marquee-muted/40 bg-marquee-muted/10',
    },
};

export default function SessionMethodBadge({ method }) {
    const config = METHOD_CONFIG[method] || METHOD_CONFIG.password;

    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${config.color}`}>
            {config.label}
        </span>
    );
}