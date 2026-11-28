import { FacebookIcon, GithubIcon, GoogleIcon } from '../ui/Icons';

function SocialIconButton({ icon, onClick, disabled, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className="group flex h-12 w-full items-center justify-center rounded-xl border border-marquee-gold bg-transparent text-marquee-gold transition hover:bg-marquee-gold/10 hover:text-marquee-goldBright disabled:opacity-40"
        >
            {icon}
        </button>
    );
}

export default function SocialLoginButtons({
    googleBtnRef,
    onFacebookLogin,
    handleGithub,
    disabled,
}) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="relative">
                <SocialIconButton
                    icon={<GoogleIcon className="h-5 w-5" />}
                    disabled={disabled}
                    label="Continue with Google"
                />
                <div ref={googleBtnRef} className="absolute inset-0 z-10 cursor-pointer opacity-0 [&_iframe]:!h-full [&_iframe]:!w-full" />
            </div>

            <SocialIconButton
                icon={<FacebookIcon className="h-5 w-5" />}
                onClick={onFacebookLogin}
                disabled={disabled}
                label="Continue with Facebook"
            />

            <SocialIconButton
                icon={<GithubIcon variant="login" className="h-5 w-5" />}
                onClick={() => handleGithub?.()}
                disabled={disabled}
                label="Continue with GitHub"
            />
        </div>
    );
}