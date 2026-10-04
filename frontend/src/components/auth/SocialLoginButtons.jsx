import { SocialLoginButton } from '../ui/FormUI';
import { FacebookIcon, GithubIcon, GoogleIcon } from '../ui/Icons';

export default function SocialLoginButtons({
    googleBtnRef,
    onFacebookLogin,
    handleGithub,
    disabled,
}) {
    console.log('SocialLoginButtons props:', {
        googleBtnRef,
        onFacebookLogin,
        handleGithub,
        disabled,
    });

    return (
        <>
            <div className="group relative h-[48px] w-full overflow-hidden rounded-full border border-marquee-gold">
                <SocialLoginButton
                    icon={<GoogleIcon className="h-5 w-5" />}
                    disabled={disabled}
                >
                    Continue with Google
                </SocialLoginButton>

                <div ref={googleBtnRef} className="absolute inset-0 z-10 cursor-pointer opacity-0 [&_iframe]:!h-full [&_iframe]:!w-full" />
            </div>

            <div className="group relative h-[48px] w-full overflow-hidden rounded-full border border-marquee-gold">
                <SocialLoginButton
                    icon={<FacebookIcon className="h-5 w-5" />}
                    onClick={onFacebookLogin}
                    disabled={disabled}
                >
                    Continue with Facebook
                </SocialLoginButton>
            </div>

            <div className="group relative h-[48px] w-full overflow-hidden rounded-full border border-marquee-gold">
                <SocialLoginButton
                    icon={<GithubIcon variant="login" className="h-5 w-5" />}
                    onClick={() => {
                        console.log('GITHUB BUTTON CLICKED');
                        handleGithub?.();
                    }}
                    disabled={disabled}
                >
                    Continue with GitHub
                </SocialLoginButton>
            </div>
        </>
    );
}