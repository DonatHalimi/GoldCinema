import { SocialLoginButton } from '../ui/FormUI';
import { FacebookIcon, GoogleIcon } from '../ui/Icons';

export default function SocialLoginButtons({
    googleBtnRef,
    onFacebookLogin,
    disabled,
}) {
    return (
        <>
            <div className="group relative h-[48px] w-full overflow-hidden rounded-full border border-marquee-gold">
                <SocialLoginButton
                    icon={<GoogleIcon className="h-5 w-5" />}
                    disabled={disabled}
                >
                    Continue with Google
                </SocialLoginButton>

                <div
                    ref={googleBtnRef}
                    className="
          absolute inset-0 z-10 cursor-pointer opacity-0
          [&_iframe]:!h-full
          [&_iframe]:!w-full
          "
                />
            </div>
            <SocialLoginButton
                icon={<FacebookIcon className="h-5 w-5" />}
                onClick={onFacebookLogin}
                disabled={disabled}
            >
                Continue with Facebook
            </SocialLoginButton>
        </>
    );
}