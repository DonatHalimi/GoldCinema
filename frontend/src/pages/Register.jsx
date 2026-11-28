import { startAuthentication } from '@simplewebauthn/browser';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import {
  KeyRound,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { getPasskeyLoginOptions, verifyPasskeyLogin } from '../api/auth';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';
import { Field, PasswordField, PasswordStrength } from '../components/ui/FormUI';
import { useAuth } from '../context/AuthContext';
import { registerSchema, validateForm } from '../validations';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

const springTransition = {
  type: 'spring',
  stiffness: 100,
  damping: 18,
};

const DRAG_OFFSET_THRESHOLD = 60;
const DRAG_VELOCITY_THRESHOLD = 500;

const FB_LOCALE_MAP = {
  en: 'en_US',
  sq: 'sq_AL',
  'sr-Latn': 'sr_RS',
};

const cinemaSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=90',
    eyebrow: 'slider.experienceEyebrow',
    title: 'slider.experienceTitle',
    description: 'slider.experienceDescription',
  },
  {
    image:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1800&q=90',
    eyebrow: 'slider.discoverEyebrow',
    title: 'slider.discoverTitle',
    description: 'slider.discoverDescription',
  },
  {
    image:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1800&q=90',
    eyebrow: 'slider.movieNightEyebrow',
    title: 'slider.movieNightTitle',
    description: 'slider.movieNightDescription',
  },
];

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springTransition, staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: springTransition },
};

const imageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.06,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 1.04,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideTextContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const slideTextItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

export default function Register() {
  const { t, i18n } = useTranslation('auth');

  const {
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginWithGithub,
    refreshUser,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const googleBtnRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [mfaState, setMfaState] = useState(null);
  const [touched, setTouched] = useState({});

  const [[activeSlide, direction], setSlide] = useState([0, 0]);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

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

  const goToSlide = (nextIndex, dir) => {
    const total = cinemaSlides.length;
    const normalized = ((nextIndex % total) + total) % total;
    setSlide([normalized, dir]);
  };

  const changeSlide = (directionStep) => {
    goToSlide(activeSlide + directionStep, directionStep);
  };

  const handleDragEnd = (_, info) => {
    setIsDragging(false);
    const { offset, velocity } = info;
    const swipedLeft =
      offset.x < -DRAG_OFFSET_THRESHOLD ||
      velocity.x < -DRAG_VELOCITY_THRESHOLD;
    const swipedRight =
      offset.x > DRAG_OFFSET_THRESHOLD ||
      velocity.x > DRAG_VELOCITY_THRESHOLD;
    if (swipedLeft) changeSlide(1);
    else if (swipedRight) changeSlide(-1);
  };

  useEffect(() => {
    if (shouldReduceMotion || isSliderHovered || isDragging) return undefined;
    const interval = window.setInterval(() => {
      setSlide(([current]) => [(current + 1) % cinemaSlides.length, 1]);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [shouldReduceMotion, isSliderHovered, isDragging, activeSlide]);

  useEffect(() => {
    if (!googleClientId) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          try {
            setSubmitting(true);
            await loginWithGoogle(credential);
            navigate(from, { replace: true });
            toast.success(t('toast.registerSuccess'));
          } catch (err) {
            setError(
              err.response?.data?.error ||
              err.message ||
              t('toast.googleFailed'),
            );
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
      }
    };

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      if (window.google?.accounts?.id) initializeGoogle();
      else
        existingScript.addEventListener('load', initializeGoogle, {
          once: true,
        });
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, [googleClientId, from, navigate, loginWithGoogle, t]);

  // --- Facebook SDK ---
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
      }
    };
    if (window.FB) {
      initFacebook();
      return;
    }
    window.fbAsyncInit = initFacebook;
    if (!document.getElementById('facebook-jssdk')) {
      const fbLocale = FB_LOCALE_MAP[i18n.language] || 'en_US';
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = `https://connect.facebook.net/${fbLocale}/sdk.js`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [facebookAppId, i18n.language]);

  async function handlePasskeyLogin() {
    setError('');
    setSubmitting(true);
    try {
      const optionsJSON = await getPasskeyLoginOptions();
      const authResponse = await startAuthentication({ optionsJSON });
      const verifyRes = await verifyPasskeyLogin(false, authResponse);

      if (verifyRes?.mfaRequired) {
        setMfaState({
          mfaToken: verifyRes.data.mfaToken,
          methods: verifyRes.data.methods || [],
          rememberMe: false,
        });
        return;
      }

      const profile = await refreshUser();
      toast.success(t('toast.passkeySuccess'));
      navigate(profile?.roleSelectionRequired ? '/select-role' : from, {
        replace: true,
      });
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        toast.info(t('toast.passkeyCancelled'));
      } else {
        toast.error(t('toast.passkeyFailed'));
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          t('toast.passkeyFailed'),
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFacebookLogin() {
    if (!facebookAppId) {
      setError(t('errors.facebookMissingAppId'));
      return;
    }
    if (!window.FB) {
      setError(t('errors.facebookSdkLoading'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await new Promise((resolve) => {
        window.FB.login((fbResponse) => resolve(fbResponse), {
          scope: 'public_profile,email',
        });
      });
      if (!response?.authResponse?.accessToken) {
        throw new Error(t('errors.facebookCancelled'));
      }
      await loginWithFacebook(response.authResponse.accessToken);
      navigate(from, { replace: true });
      toast.success(t('toast.registerSuccess'));
    } catch (err) {
      toast.error(t('toast.facebookFailed'));
      setError(
        err.response?.data?.error ||
        err.message ||
        t('toast.facebookFailed'),
      );
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
      toast.success(t('toast.registerSuccess'));
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(t('toast.registerFailed'));
      setError(err.message || t('toast.registerFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function validateField(field, value) {
    try {
      await registerSchema.validateAt(field, { [field]: value });
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, [field]: err.message }));
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const motionProps = (variants = itemVariants) => ({
    variants: shouldReduceMotion ? undefined : variants,
    initial: shouldReduceMotion ? false : 'hidden',
    animate: 'visible',
  });

  const activeSlideData = cinemaSlides[activeSlide];

  return (
    <div className="flex min-h-screen items-start justify-center bg-marquee-bg px-3 pb-6 pt-10 sm:px-5 sm:pt-14 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:pt-16">
      <motion.main
        initial={shouldReduceMotion ? false : 'hidden'}
        animate="visible"
        variants={shouldReduceMotion ? undefined : pageVariants}
        className="grid w-full max-w-[1120px] grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-marquee-line bg-marquee-panel2 shadow-2xl lg:h-[min(760px,calc(100vh-128px))] lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr]"
      >
        <section
          className="relative hidden min-h-0 overflow-hidden lg:block"
          onMouseEnter={() => setIsSliderHovered(true)}
          onMouseLeave={() => setIsSliderHovered(false)}
        >
          <motion.div
            className={`absolute inset-0 z-10 ${shouldReduceMotion
              ? ''
              : 'cursor-grab touch-pan-y active:cursor-grabbing'
              }`}
            drag={shouldReduceMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={activeSlide}
                src={activeSlideData.image}
                alt={t(activeSlideData.title)}
                custom={direction}
                variants={shouldReduceMotion ? undefined : imageVariants}
                initial={shouldReduceMotion ? false : 'enter'}
                animate={shouldReduceMotion ? { opacity: 1 } : 'center'}
                exit={shouldReduceMotion ? undefined : 'exit'}
                draggable={false}
                className="absolute inset-0 h-full w-full select-none object-cover"
              />
            </AnimatePresence>
          </motion.div>

          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-marquee-bg via-marquee-bg/75 to-marquee-bg/10" />
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-marquee-bg/25 via-transparent to-transparent" />

          <div className="pointer-events-none absolute bottom-14 left-10 right-10 z-30">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSlide}
                variants={shouldReduceMotion ? undefined : slideTextContainer}
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="visible"
                exit={shouldReduceMotion ? undefined : 'exit'}
              >
                <motion.div
                  variants={shouldReduceMotion ? undefined : slideTextItem}
                  className="mb-5 flex items-center gap-3"
                >
                  <span className="h-px w-10 bg-marquee-gold" />
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-marquee-goldBright">
                    {t(activeSlideData.eyebrow)}
                  </span>
                </motion.div>

                <motion.h2
                  variants={shouldReduceMotion ? undefined : slideTextItem}
                  className="max-w-lg font-serif text-5xl font-bold leading-tight text-marquee-cream xl:text-6xl"
                >
                  {t(activeSlideData.title)}
                </motion.h2>

                <motion.p
                  variants={shouldReduceMotion ? undefined : slideTextItem}
                  className="mt-5 max-w-md text-sm leading-relaxed text-marquee-cream/75 xl:text-base"
                >
                  {t(activeSlideData.description)}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            <div className="pointer-events-auto mt-9 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {cinemaSlides.map((slide, index) => {
                  const isActive = activeSlide === index;
                  return (
                    <button
                      key={slide.image}
                      type="button"
                      aria-label={t('slider.goToSlide', {
                        number: index + 1,
                      })}
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() =>
                        goToSlide(index, index > activeSlide ? 1 : -1)
                      }
                      className="group relative h-1.5 overflow-hidden rounded-full"
                    >
                      <motion.span
                        className="block h-full rounded-full"
                        animate={{
                          width: isActive ? 36 : 12,
                          backgroundColor: isActive
                            ? 'rgb(var(--color-gold))'
                            : 'rgb(var(--color-gold) / 0.35)',
                        }}
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : {
                              type: 'spring',
                              stiffness: 320,
                              damping: 30,
                            }
                        }
                      />
                      {isActive &&
                        !shouldReduceMotion &&
                        !isSliderHovered &&
                        !isDragging && (
                          <motion.span
                            key={`progress-${activeSlide}`}
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              backgroundColor:
                                'rgb(var(--color-goldBright))',
                            }}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                          />
                        )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  aria-label={t('slider.previous')}
                  onClick={() => changeSlide(-1)}
                  whileHover={
                    shouldReduceMotion ? undefined : { scale: 1.08, y: -1 }
                  }
                  whileTap={
                    shouldReduceMotion ? undefined : { scale: 0.94 }
                  }
                  transition={springTransition}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-marquee-gold/40 bg-marquee-bg/30 text-marquee-cream backdrop-blur-sm transition-colors hover:border-marquee-gold hover:bg-marquee-gold hover:text-marquee-bg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>

                <motion.button
                  type="button"
                  aria-label={t('slider.next')}
                  onClick={() => changeSlide(1)}
                  whileHover={
                    shouldReduceMotion ? undefined : { scale: 1.08, y: -1 }
                  }
                  whileTap={
                    shouldReduceMotion ? undefined : { scale: 0.94 }
                  }
                  transition={springTransition}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-marquee-gold/40 bg-marquee-bg/30 text-marquee-cream backdrop-blur-sm transition-colors hover:border-marquee-gold hover:bg-marquee-gold hover:text-marquee-bg"
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-w-0 flex-col justify-center py-7 px-5 sm:px-8 lg:px-9 lg:py-6">
          <div className="mx-auto w-full max-w-[360px]">
            <AnimatePresence mode="wait">
              {mfaState ? (
                <motion.div
                  key="mfa"
                  initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
                  transition={
                    shouldReduceMotion ? { duration: 0 } : springTransition
                  }
                >
                  {/* <MfaVerifyStep ... /> */}
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={shouldReduceMotion ? false : { opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, x: -15 }}
                  transition={
                    shouldReduceMotion ? { duration: 0 } : springTransition
                  }
                >
                  <motion.div
                    {...motionProps()}
                    className="mb-6 text-center lg:mb-5 lg:text-left"
                  >
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-marquee-goldBright">
                      {t('joinUs')}
                    </p>

                    <h1 className="font-serif text-3xl font-bold text-marquee-cream">
                      {t('createAccountTitle')}
                    </h1>

                    <p className="mt-2 text-sm text-marquee-muted">
                      {t('createAccountDescription')}
                    </p>
                  </motion.div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <motion.div {...motionProps()}>
                      <Field
                        label={t('name')}
                        type="text"
                        value={name}
                        onChange={(value) => {
                          setName(value);
                          validateField('name', value);
                        }}
                        onBlur={() => handleBlur('name')}
                        touched={touched.name}
                        required
                        error={fieldErrors.name}
                      />
                    </motion.div>

                    <motion.div {...motionProps()}>
                      <Field
                        label={t('email')}
                        type="email"
                        value={email}
                        onChange={(value) => {
                          setEmail(value);
                          validateField('email', value);
                        }}
                        onBlur={() => handleBlur('email')}
                        required
                        error={fieldErrors.email}
                      />
                    </motion.div>

                    <motion.div {...motionProps()}>
                      <PasswordField
                        label={t('password')}
                        value={password}
                        onChange={(value) => {
                          setPassword(value);
                          validateField('password', value);
                        }}
                        error={fieldErrors.password}
                      />
                    </motion.div>

                    {password.length > 0 && (
                      <motion.div {...motionProps()}>
                        <PasswordStrength password={password} />
                      </motion.div>
                    )}

                    <motion.div {...motionProps()}>
                      <PasswordField
                        label={t('confirmPassword')}
                        value={confirmPassword}
                        onChange={(value) => {
                          setConfirmPassword(value);
                          validateField('confirmPassword', value);
                        }}
                        error={fieldErrors.confirmPassword}
                      />
                    </motion.div>

                    {confirmPassword.length > 0 && (
                      <motion.div
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, y: -4 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-md border px-3 py-2 text-xs ${passwordsMatch
                          ? 'border-green-500/30 bg-green-500/10 text-green-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                          }`}
                      >
                        {passwordsMatch
                          ? `✓ ${t('passwordsMatch')}`
                          : `✕ ${t('passwordsNoMatch')}`}
                      </motion.div>
                    )}

                    {error && (
                      <motion.p
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, y: -5 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        role="alert"
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.div {...motionProps()} className="space-y-2.5">
                      <button
                        type="submit"
                        disabled={submitting || !isFormValid}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-marquee-gold px-5 py-3 font-semibold text-marquee-bg shadow-lg shadow-marquee-gold/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{t('creatingAccount')}</span>
                          </>
                        ) : (
                          t('createAccount')
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handlePasskeyLogin}
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-marquee-line bg-marquee-panel px-5 py-3 font-semibold text-marquee-cream transition-all duration-300 hover:border-marquee-gold hover:bg-marquee-panel2 disabled:opacity-40"
                      >
                        <KeyRound className="h-5 w-5 text-marquee-gold" />
                        {t('continueWithPasskey')}
                      </button>
                    </motion.div>

                    <motion.div
                      {...motionProps()}
                      className="flex items-center gap-3 py-1"
                    >
                      <div className="h-px flex-1 bg-marquee-line" />
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-marquee-muted">
                        {t('orContinueWith')}
                      </span>
                      <div className="h-px flex-1 bg-marquee-line" />
                    </motion.div>

                    <motion.div {...motionProps()}>
                      <SocialLoginButtons
                        submitting={submitting}
                        googleBtnRef={googleBtnRef}
                        onFacebook={handleFacebookLogin}
                        handleGithub={loginWithGithub}
                        disabled={submitting}
                        labels={{
                          google: t('social.google'),
                          facebook: t('social.facebook'),
                          github: t('social.github'),
                        }}
                      />
                    </motion.div>
                  </form>

                  <motion.p
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { delay: 0.25, ...springTransition }
                    }
                    className="mt-5 border-t border-marquee-line pt-4 text-center text-sm text-marquee-muted"
                  >
                    {t('alreadyHaveAccount')}{' '}
                    <Link to="/login" className="font-semibold text-marquee-gold transition-colors hover:text-marquee-goldBright">
                      {t('signIn')}
                    </Link>
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </motion.main>
    </div>
  );
}