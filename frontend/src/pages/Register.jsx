import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Field } from './Login';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { validateForm, registerSchema } from '../validations';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

export default function Register() {
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const googleBtnRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);

  useEffect(() => {
    if (!googleClientId) return;

    const loadGoogleScript = () => {
      if (document.getElementById('google-gsi-script')) {
        initializeGoogle();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    };

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          try {
            setSubmitting(true);
            await loginWithGoogle(credential);
            navigate('/', { replace: true, state: {} });
          } catch (err) {
            setError(err.response?.data?.error || err.message || 'Google registration failed.');
          } finally {
            setSubmitting(false);
          }
        },
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          size: 'large',
          width: '350',
        });
        setGoogleReady(true);
      }
    };

    loadGoogleScript();
  }, [googleClientId, navigate, loginWithGoogle]);

  useEffect(() => {
    if (!facebookAppId) return;

    const initFacebook = () => {
      if (window.FB) {
        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v22.0',
        });
        setFacebookReady(true);
      }
    };

    if (window.FB) {
      initFacebook();
      return;
    }

    window.fbAsyncInit = initFacebook;

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [facebookAppId]);

  async function handleFacebookLogin() {
    if (!facebookAppId) {
      setError('Facebook App ID is missing in .env file.');
      return;
    }

    if (!window.FB) {
      setError('Facebook SDK is still loading. Please try again in a moment.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await new Promise((resolve) => {
        window.FB.login((fbResponse) => resolve(fbResponse), {
          scope: 'public_profile',
        });
      });

      if (!response?.authResponse?.accessToken) {
        throw new Error('Facebook registration was cancelled or failed.');
      }

      await loginWithFacebook(response.authResponse.accessToken);
      navigate('/', { replace: true, state: {} });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Facebook registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitting(true);
    setError('');
    setFieldErrors({});

    const { valid, errors } = await validateForm(registerSchema, { name, email, password });

    if (!valid) {
      setFieldErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      await register(name, email, password);

      navigate('/', {
        replace: true,
        state: {},
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="mb-8 text-center font-serif text-3xl font-bold text-marquee-cream">
        Create your account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" type="text" value={name} onChange={setName} required error={fieldErrors.name} />
        <Field label="Email" type="email" value={email} onChange={setEmail} required error={fieldErrors.email} />
        <div className="relative">
          <Field
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            required
            error={fieldErrors.password}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
            className="absolute right-3 top-9 text-marquee-muted hover:text-marquee-gold"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>
        {fieldErrors.form && <p className="text-sm text-marquee-marquee">{fieldErrors.form}</p>}
        {error && <p className="text-sm text-marquee-marquee">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:opacity-40"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        {/* Custom Google Button Container */}
        <div className="group relative h-[48px] w-full overflow-hidden rounded-full border border-marquee-gold transition hover:bg-marquee-gold">
          <div className="flex h-full w-full items-center justify-center gap-3 px-6 font-semibold text-marquee-gold transition group-hover:text-marquee-bg">
            <LogIn className="h-5 w-5 stroke-[2]" />
            <span>Continue with Google</span>
          </div>

          <div
            ref={googleBtnRef}
            className="absolute inset-0 z-10 cursor-pointer opacity-0 [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!scale-125 [&_iframe]:!transform-gpu"
          />
        </div>

        {/* Custom Facebook Button */}
        <button
          type="button"
          onClick={handleFacebookLogin}
          disabled={submitting}
          className="flex h-[48px] w-full items-center justify-center gap-3 rounded-full border border-marquee-gold bg-transparent px-6 font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-40"
        >
          <LogIn className="h-5 w-5 stroke-[2]" />
          <span>Continue with Facebook</span>
        </button>
      </form>

      <p className="mt-6 text-left text-sm text-marquee-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-marquee-gold hover:text-marquee-goldBright">
          Sign in
        </Link>
      </p>
    </div>
  );
}