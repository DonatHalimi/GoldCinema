import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { validateForm, loginSchema, forgotPasswordSchema } from '../validations';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

export default function Login() {
  const { login, loginWithGoogle, loginWithFacebook, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const googleBtnRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotFieldErrors, setForgotFieldErrors] = useState({});
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({});

  const isFormValid =
    email.trim() !== '' &&
    password.trim() !== '' &&
    !fieldErrors.email &&
    !fieldErrors.password;

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
            navigate(from, { replace: true });
          } catch (err) {
            setError(err.response?.data?.error || err.message || 'Google login failed.');
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
  }, [googleClientId, navigate, from, loginWithGoogle]);

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
        throw new Error('Facebook login was cancelled or failed.');
      }

      await loginWithFacebook(response.authResponse.accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Facebook login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});

    const { valid, errors } = await validateForm(loginSchema, { email, password });

    if (!valid) {
      setFieldErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword(e) {
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
        setIsForgotModalOpen(false);
        setForgotMessage('');
        setForgotFieldErrors({});
      }, 2000);
    } catch (err) {
      setForgotMessage(err.message || 'Unable to send reset email.');
    } finally {
      setForgotSubmitting(false);
    }
  }

  async function validateField(field, value) {
    try {
      await loginSchema.validateAt(field, {
        [field]: value,
      });

      setFieldErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    } catch (err) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: err.message,
      }));
    }
  }

  return (
    <div className="mx-auto flex max-w-md items-center py-20">
      <div className="w-full rounded-2xl border border-marquee-line bg-marquee-panel2 p-9 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <h1 className="mb-2 text-center font-serif text-3xl font-bold text-marquee-cream">
          Welcome back
        </h1>

        <p className="mb-8 text-center text-sm text-marquee-muted">
          Log in to continue to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              validateField('email', value);
            }}
            required
            error={fieldErrors.email}
          />
          <div className="relative">
            <Field
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(value) => {
                setPassword(value);
                validateField('password', value);
              }}
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

          {fieldErrors.form && <p className="text-sm text-marquee-marquee">{fieldErrors.form}</p>}
          {error && <p className="text-sm text-marquee-marquee">{error}</p>}

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRememberMe((prev) => !prev)}
              className="flex cursor-pointer items-center gap-2 text-sm text-marquee-muted"
              aria-pressed={rememberMe}
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded border transition-all ${rememberMe
                  ? 'bg-marquee-gold border-marquee-gold text-zinc-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'border-zinc-700 bg-zinc-800/80 hover:border-zinc-500'
                  }`}
              >
                {rememberMe && <Check className="h-3 w-3 stroke-[3]" />}
              </span>

              <span>Keep me signed in</span>
            </button>

            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-sm text-marquee-gold hover:text-marquee-goldBright"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || !isFormValid}
            className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>

          <div className="group relative h-[48px] w-full overflow-hidden rounded-full border border-marquee-gold transition hover:bg-marquee-gold">
            <div className="flex h-full w-full items-center justify-center gap-3 px-6 font-semibold text-marquee-gold transition group-hover:text-marquee-bg">
              <GoogleIcon className="h-5 w-5" />
              <span>Continue with Google</span>
            </div>

            <div ref={googleBtnRef} className="absolute inset-0 z-10 cursor-pointer opacity-0 [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!scale-125 [&_iframe]:!transform-gpu" />
          </div>

          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={submitting}
            className="flex h-[48px] w-full items-center justify-center gap-3 rounded-full border border-marquee-gold bg-transparent px-6 font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-40"
          >
            <FacebookIcon className="h-5 w-5" />
            <span>Continue with Facebook</span>
          </button>
        </form>

        <p className="mt-6 text-left text-sm text-marquee-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-marquee-gold hover:text-marquee-goldBright">
            Create an account
          </Link>
        </p>

        {isForgotModalOpen && (
          <div
            onClick={() => {
              setIsForgotModalOpen(false);
              setForgotMessage('');
              setForgotFieldErrors({});
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-marquee-line bg-marquee-panel2 p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-marquee-cream">Reset your password</h2>
                  <p className="mt-1 text-sm text-marquee-muted">
                    Enter your email to receive a secure reset link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotMessage('');
                    setForgotFieldErrors({});
                  }}
                  aria-label="Close forgot password dialog"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm text-marquee-muted">Email</span>
                  <div className="relative">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-md border border-marquee-line bg-marquee-panel px-2.5 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold"
                    />
                  </div>
                  {forgotFieldErrors.email && <span className="mt-1 block text-xs text-marquee-marquee">{forgotFieldErrors.email}</span>}
                </label>

                {forgotMessage && <p className="text-sm text-marquee-gold">{forgotMessage}</p>}

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:opacity-40"
                >
                  {forgotSubmitting ? 'Sending link...' : 'Send reset link'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

export function GoogleIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.04H3.3v2.53A9.75 9.75 0 0 0 12 21.5z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.58a5.87 5.87 0 0 1 0-3.16V7.89H3.3a9.5 9.5 0 0 0 0 8.22l3.24-2.53z"
      />
      <path
        fill="#EA4335"
        d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.45 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38z"
      />
    </svg>
  );
}

export function FacebookIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.52-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.39A12 12 0 0 0 24 12z"
      />
    </svg>
  );
}