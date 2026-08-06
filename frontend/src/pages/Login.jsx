import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { validateForm, loginSchema, forgotPasswordSchema } from '../validations';
import { SocialLoginButton, PasswordField, Field } from '../components/ui/FormUI';
import { FacebookIcon, GoogleIcon } from '../components/ui/Icons';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import RememberMeCheckbox from '../components/auth/RememberMeCheckbox';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';

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
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
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
        callback: ({ credential }) => handleGoogleLogin(credential),
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

  async function handleGoogleLogin(credential) {
    setSubmitting(true);
    setError('');

    try {
      await loginWithGoogle(credential);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Google login failed.'
      );
    } finally {
      setSubmitting(false);
    }
  }

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
      <div className="w-full rounded-2xl border border-marquee-line bg-marquee-panel2 p-9">
        <h1 className="mb-6 text-center font-serif text-3xl font-bold text-marquee-cream">
          Welcome back
        </h1>

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

          <PasswordField
            value={password}
            onChange={(value) => {
              setPassword(value);
              validateField('password', value);
            }}
            error={fieldErrors.password}
          />

          {fieldErrors.form && <p className="text-sm text-marquee-marquee">{fieldErrors.form}</p>}
          {error && <p className="text-sm text-marquee-marquee">{error}</p>}

          <div className="mt-4 flex items-center justify-between">
            <RememberMeCheckbox
              checked={rememberMe}
              onChange={() => setRememberMe(prev => !prev)}
            />

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

          <SocialLoginButtons
            submitting={submitting}
            googleBtnRef={googleBtnRef}
            onGoogle={handleGoogleLogin}
            onFacebook={handleFacebookLogin}
          />
        </form>

        <p className="mt-6 text-left text-sm text-marquee-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-marquee-gold hover:text-marquee-goldBright">
            Create an account
          </Link>
        </p>

        {isForgotModalOpen && (
          <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
        )}
      </div>
    </div>
  );
}