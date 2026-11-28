import { useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
    motion,
    AnimatePresence,
    useReducedMotion,
} from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import MfaVerifyStep from '../components/auth/MfaVerifyStep';
import {
    completeSecurityQuestionLogin,
    initializeSecurityQuestionRecovery,
    verifySecurityQuestionRecovery,
} from '../api/securityQuestions';

const springTransition = {
    type: 'spring',
    stiffness: 260,
    damping: 24,
};

export default function AccountRecovery() {
    const { t } = useTranslation('accountRecovery');
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const shouldReduceMotion = useReducedMotion();

    const [step, setStep] = useState('lookup');
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [visibleAnswers, setVisibleAnswers] = useState({});
    const [mfaState, setMfaState] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false);

    const getErrorMessage = (requestError) =>
        requestError.response?.data?.error ||
        requestError.response?.data?.message ||
        t('genericError');

    const fadeInUp = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 18,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: shouldReduceMotion
                ? { duration: 0 }
                : springTransition,
        },
        exit: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : -10,
            transition: { duration: 0.18 },
        },
    };

    const staggerContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.075,
                delayChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 30,
            scale: shouldReduceMotion ? 1 : 0.97,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                },
        },
    };

    const inputClasses =
        'w-full rounded-xl border border-marquee-line bg-marquee-bg px-4 py-3 text-sm text-marquee-cream outline-none placeholder:text-marquee-muted/50 transition-all duration-200 focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/10';

    const buttonClasses =
        'inline-flex items-center justify-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-sm font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50';

    const backButtonClasses =
        'inline-flex items-center justify-center gap-1.5 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-3.5 py-2 text-xs font-semibold text-marquee-muted transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold';

    async function handleLookup(event) {
        event.preventDefault();
        setError('');
        setNotice('');

        if (emailOrUsername.trim().length < 3) {
            setError(t('lookup.errors.invalidIdentifier'));
            return;
        }

        setLoading(true);

        try {
            const data = await initializeSecurityQuestionRecovery(
                emailOrUsername.trim()
            );

            if (data.questions?.length !== 3) {
                setNotice(t('lookup.errors.noChallenge'));
                return;
            }

            setQuestions(data.questions);

            setAnswers(
                Object.fromEntries(
                    data.questions.map((question) => [
                        question.questionId,
                        '',
                    ])
                )
            );

            setStep('challenge');
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    async function handleVerify(event) {
        event.preventDefault();
        setError('');
        setNotice('');

        if (
            questions.some(
                (question) =>
                    String(answers[question.questionId] || '')
                        .trim()
                        .replace(/\s/g, '').length < 3
            )
        ) {
            setError(t('challenge.errors.answerRequired'));
            return;
        }

        setLoading(true);

        try {
            const verifyData = await verifySecurityQuestionRecovery(
                emailOrUsername.trim(),
                questions.map((question) => ({
                    questionId: question.questionId,
                    answer: answers[question.questionId],
                }))
            );

            const recoveryToken =
                verifyData.recoveryToken || verifyData.verificationToken;

            const loginData =
                await completeSecurityQuestionLogin(recoveryToken);

            if (loginData?.mfaRequired) {
                setMfaState({
                    mfaToken:
                        loginData.data?.mfaToken || loginData.mfaToken,
                    methods:
                        loginData.data?.methods || loginData.methods || [],
                    rememberMe: Boolean(loginData.rememberMe),
                });

                return;
            }

            const profile = await refreshUser?.();

            setQuestions([]);
            setAnswers({});

            toast.success(t('toast.signedIn'));

            navigate(
                profile?.roleSelectionRequired ? '/select-role' : '/',
                { replace: true }
            );
        } catch (requestError) {
            if (requestError.response?.status === 429) {
                const wait = requestError.response.data?.retryAfter;

                setError(
                    wait
                        ? t('challenge.errors.tooManyAttempts', {
                            minutes: Math.ceil(wait / 60),
                        })
                        : t('challenge.errors.temporarilyLocked')
                );
            } else {
                setError(getErrorMessage(requestError));
            }
        } finally {
            setLoading(false);
        }
    }

    const stepNumber = step === 'lookup' ? 1 : 2;
    const stepTotal = 2;
    const stepLabel =
        step === 'lookup' ? t('steps.lookup') : t('steps.identityVerification');

    return (
        <main className="relative flex min-h-screen items-start justify-center px-4 py-8 sm:px-6 sm:py-10">
            <AnimatePresence mode="wait">
                {mfaState ? (
                    <motion.section
                        key="mfa"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-marquee-line bg-marquee-panel2 p-6 shadow-2xl sm:p-8"
                    >
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div
                                variants={fadeInUp}
                                className="mb-6 flex items-start gap-3"
                            >
                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10 text-marquee-gold">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>

                                <div className="flex-1">
                                    <h1 className="font-serif text-2xl font-bold text-marquee-cream">
                                        {t('mfa.title')}
                                    </h1>

                                    <p className="mt-2 text-sm leading-relaxed text-marquee-muted">
                                        {t('mfa.description')}
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <MfaVerifyStep
                                    mfaState={mfaState}
                                    from="/"
                                    onBack={() => setMfaState(null)}
                                />
                            </motion.div>
                        </motion.div>
                    </motion.section>
                ) : (
                    <motion.section
                        key="recovery"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{
                            opacity: 0,
                            y: shouldReduceMotion ? 0 : 15,
                            transition: { duration: 0.2 },
                        }}
                        className="w-full max-w-xl overflow-hidden rounded-2xl border border-marquee-line bg-marquee-panel2 p-6 shadow-2xl sm:p-8"
                    >
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={fadeInUp} className="mb-7 flex items-center gap-4">
                                <motion.div
                                    whileHover={
                                        shouldReduceMotion
                                            ? undefined
                                            : { rotate: 8, scale: 1.06 }
                                    }
                                    transition={springTransition}
                                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10 text-marquee-gold shadow-lg shadow-marquee-gold/5"
                                >
                                    <ShieldCheck className="h-6 w-6" />
                                </motion.div>

                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-marquee-gold">
                                        {t('eyebrow')}
                                    </p>

                                    <h1 className="mt-1 font-serif text-2xl font-bold text-marquee-cream sm:text-3xl">
                                        {t('title')}
                                    </h1>
                                </div>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="mb-7">
                                <div
                                    aria-label={t('steps.stepLabel', {
                                        current: stepNumber,
                                        total: stepTotal,
                                    })}
                                    className="mb-3 flex items-center justify-between text-xs text-marquee-muted"
                                >
                                    <span>
                                        {t('steps.stepLabel', {
                                            current: stepNumber,
                                            total: stepTotal,
                                        })}
                                    </span>

                                    <span>{stepLabel}</span>
                                </div>

                                <div className="h-1.5 overflow-hidden rounded-full bg-marquee-line">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            width:
                                                step === 'lookup'
                                                    ? '50%'
                                                    : '100%',
                                        }}
                                        transition={
                                            shouldReduceMotion
                                                ? { duration: 0 }
                                                : {
                                                    duration: 0.5,
                                                    ease: 'easeInOut',
                                                }
                                        }
                                        className="h-full rounded-full bg-marquee-gold"
                                    />
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${step === 'lookup'
                                            ? 'bg-marquee-gold/15 text-marquee-goldBright'
                                            : 'bg-marquee-gold/10 text-marquee-gold'
                                            }`}
                                    >
                                        {t('steps.stepBadge', {
                                            number: 1,
                                            label: t('steps.lookup'),
                                        })}
                                    </span>

                                    <div className="h-px flex-1 bg-marquee-line" />

                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${step === 'challenge'
                                            ? 'bg-marquee-gold/15 text-marquee-goldBright'
                                            : 'bg-marquee-panel text-marquee-muted'
                                            }`}
                                    >
                                        {t('steps.stepBadge', {
                                            number: 2,
                                            label: t('steps.challenge'),
                                        })}
                                    </span>
                                </div>
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {step === 'lookup' ? (
                                    <motion.form
                                        key="lookup"
                                        onSubmit={handleLookup}
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="space-y-4"
                                    >
                                        <motion.div
                                            variants={fadeInUp}
                                            className="rounded-xl border border-marquee-line bg-marquee-bg/40 px-4 py-4"
                                        >
                                            <p className="text-sm leading-relaxed text-marquee-muted">
                                                {t('lookup.intro')}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            variants={fadeInUp}
                                            className="space-y-2"
                                        >
                                            <label
                                                htmlFor="recovery-identifier"
                                                className="block text-sm font-medium text-marquee-cream"
                                            >
                                                {t('lookup.label')}
                                            </label>

                                            <input
                                                id="recovery-identifier"
                                                autoComplete="username"
                                                value={emailOrUsername}
                                                onChange={(event) =>
                                                    setEmailOrUsername(
                                                        event.target.value
                                                    )
                                                }
                                                className={inputClasses}
                                                placeholder={t('lookup.placeholder')}
                                                required
                                            />
                                        </motion.div>

                                        <AnimatePresence mode="wait">
                                            {notice && (
                                                <motion.div
                                                    key="notice"
                                                    initial={{
                                                        opacity: 0,
                                                        y: shouldReduceMotion ? 0 : 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{ opacity: 0 }}
                                                    className="rounded-xl border border-marquee-line bg-marquee-bg/50 px-4 py-3 text-sm leading-relaxed text-marquee-muted"
                                                    role="status"
                                                >
                                                    {notice}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence mode="wait">
                                            {error && (
                                                <motion.p
                                                    key="error"
                                                    initial={{
                                                        opacity: 0,
                                                        x: shouldReduceMotion ? 0 : -8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    exit={{ opacity: 0 }}
                                                    className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
                                                    role="alert"
                                                >
                                                    {error}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>

                                        <motion.button
                                            type="submit"
                                            disabled={loading || !emailOrUsername.trim()}
                                            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                                            transition={springTransition}
                                            className={`${buttonClasses} w-full`}
                                        >
                                            {t('lookup.continue')}
                                            {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <ArrowRight className="h-4 w-4" />
                                            )}
                                        </motion.button>
                                    </motion.form>
                                ) : (
                                    <motion.form
                                        key="challenge"
                                        onSubmit={handleVerify}
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="space-y-4"
                                    >
                                        <motion.div
                                            variants={fadeInUp}
                                            className="rounded-xl border border-marquee-line bg-marquee-bg/40 px-4 py-4"
                                        >
                                            <p className="text-sm leading-relaxed text-marquee-muted">
                                                {t('challenge.intro')}
                                            </p>
                                        </motion.div>

                                        {questions.map((question, index) => (
                                            <motion.div
                                                key={question.questionId}
                                                variants={fadeInUp}
                                                whileHover={
                                                    shouldReduceMotion
                                                        ? undefined
                                                        : {
                                                            borderColor:
                                                                'rgba(212, 175, 55, 0.35)',
                                                        }
                                                }
                                                transition={springTransition}
                                                className="space-y-3 rounded-xl border border-marquee-line bg-marquee-bg/30 p-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-marquee-gold/10 text-xs font-bold text-marquee-gold">
                                                        {index + 1}
                                                    </span>

                                                    <label
                                                        htmlFor={`recovery-answer-${question.questionId}`}
                                                        className="pt-1 text-sm font-medium leading-relaxed text-marquee-cream"
                                                    >
                                                        {question.questionText}
                                                    </label>
                                                </div>

                                                <div className="relative">
                                                    <input
                                                        id={`recovery-answer-${question.questionId}`}
                                                        type={
                                                            visibleAnswers[
                                                                question.questionId
                                                            ]
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        autoComplete="off"
                                                        value={
                                                            answers[
                                                            question.questionId
                                                            ] || ''
                                                        }
                                                        onChange={(event) =>
                                                            setAnswers(
                                                                (previous) => ({
                                                                    ...previous,
                                                                    [question.questionId]:
                                                                        event.target.value,
                                                                })
                                                            )
                                                        }
                                                        className={`${inputClasses} pr-12`}
                                                        required
                                                    />

                                                    <button
                                                        type="button"
                                                        aria-label={
                                                            visibleAnswers[
                                                                question.questionId
                                                            ]
                                                                ? t('challenge.hideAnswer')
                                                                : t('challenge.showAnswer')
                                                        }
                                                        onClick={() =>
                                                            setVisibleAnswers(
                                                                (previous) => ({
                                                                    ...previous,
                                                                    [question.questionId]:
                                                                        !previous[
                                                                        question.questionId
                                                                        ],
                                                                })
                                                            )
                                                        }
                                                        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-marquee-muted transition-colors hover:text-marquee-gold"
                                                    >
                                                        <AnimatePresence mode="wait">
                                                            <motion.span
                                                                key={
                                                                    visibleAnswers[
                                                                        question.questionId
                                                                    ]
                                                                        ? 'visible'
                                                                        : 'hidden'
                                                                }
                                                                initial={{
                                                                    opacity: 0,
                                                                    scale: 0.7,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    scale: 1,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    scale: 0.7,
                                                                }}
                                                            >
                                                                {visibleAnswers[
                                                                    question.questionId
                                                                ] ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </motion.span>
                                                        </AnimatePresence>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}

                                        <AnimatePresence mode="wait">
                                            {error && (
                                                <motion.p
                                                    key="error"
                                                    initial={{
                                                        opacity: 0,
                                                        x: shouldReduceMotion ? 0 : -8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    exit={{ opacity: 0 }}
                                                    className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
                                                    role="alert"
                                                >
                                                    {error}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>

                                        <motion.div
                                            variants={fadeInUp}
                                            className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center"
                                        >
                                            <motion.button
                                                type="button"
                                                onClick={() => {
                                                    setStep('lookup');
                                                    setError('');
                                                    setQuestions([]);
                                                    setAnswers({});
                                                }}
                                                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                                                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                                                transition={springTransition}
                                                className={`${backButtonClasses} self-start sm:self-auto`}
                                            >
                                                <ArrowLeft className="h-3.5 w-3.5" />
                                                {t('challenge.back')}
                                            </motion.button>

                                            <motion.button
                                                type="submit"
                                                disabled={loading}
                                                whileHover={
                                                    shouldReduceMotion
                                                        ? undefined
                                                        : { y: -2 }
                                                }
                                                whileTap={
                                                    shouldReduceMotion
                                                        ? undefined
                                                        : { scale: 0.98 }
                                                }
                                                transition={springTransition}
                                                className={`${buttonClasses} flex-1`}
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ShieldCheck className="h-4 w-4" />
                                                )}
                                                {t('challenge.verifyAndSignIn')}
                                            </motion.button>
                                        </motion.div>

                                        <motion.p
                                            variants={fadeInUp}
                                            className="text-xs leading-relaxed text-marquee-muted"
                                        >
                                            {t('challenge.rateLimitNote')}
                                        </motion.p>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <motion.p variants={fadeInUp} className="mt-8 border-t border-marquee-line pt-6 text-center text-sm text-marquee-muted">
                                {t('footer.preferPassword')}{' '}
                                <Link to="/login" className="font-medium text-marquee-gold transition-colors hover:text-marquee-goldBright">
                                    {t('footer.returnToLogin')}
                                </Link>
                            </motion.p>
                        </motion.div>
                    </motion.section>
                )}
            </AnimatePresence>
        </main>
    );
}