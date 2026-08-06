import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { validateForm, registerSchema } from '../validations';
import { Field, PasswordField, PasswordStrength, SocialLoginButton } from '../components/ui/FormUI';
import { FacebookIcon, GoogleIcon } from '../components/ui/Icons';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

export default function Register() {
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const googleBtnRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [touched, setTouched] = useState({});

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const isFormValid =
    name.trim() !== '' &&
    email.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    passwordsMatch &&
    !fieldErrors.name &&
    !fieldErrors.email &&
    !fieldErrors.password &&
    !fieldErrors.confirmPassword;

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

    const { valid, errors } = await validateForm(registerSchema, {
      name,
      email,
      password,
      confirmPassword,
    });

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

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  return (
    <div className="mx-auto flex max-w-md items-center py-20">
      <div className="w-full rounded-2xl border border-marquee-line bg-marquee-panel2 p-9">
        <h1 className="mb-6 text-center font-serif text-3xl font-bold text-marquee-cream">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Full name"
            type="text"
            value={name}
            onChange={setName}
            onBlur={() => handleBlur('name')}
            touched={touched.name}
            required
            error={fieldErrors.name}
          />

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => handleBlur('email')}
            touched={touched.email}
            required
            error={fieldErrors.email}
          />
          <PasswordField
            label="Password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              validateField('password', value);
            }}
            error={fieldErrors.password}
          />

          {password.length > 0 && (
            <PasswordStrength password={password} />
          )}

          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              validateField('confirmPassword', value);
            }}
            error={fieldErrors.confirmPassword}
          />

          {confirmPassword.length > 0 && (
            <div
              className={`mt-2 rounded-md border px-3 py-2 text-xs ${passwordsMatch
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
                }`}
            >
              {passwordsMatch
                ? '✓ Passwords match'
                : '✕ Passwords do not match'}
            </div>
          )}

          {fieldErrors.form && <p className="text-sm text-marquee-marquee">{fieldErrors.form}</p>}
          {error && <p className="text-sm text-marquee-marquee">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !isFormValid}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              'Create account'
            )}
          </button>

          <SocialLoginButtons
            submitting={submitting}
            googleBtnRef={googleBtnRef}
            onGoogle={handleGoogleLogin}
            onFacebook={handleFacebookLogin}
          />
        </form >

        <p className="mt-6 text-left text-sm text-marquee-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-marquee-gold hover:text-marquee-goldBright">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}