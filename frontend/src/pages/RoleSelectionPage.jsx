import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Check,
    Crown,
    Film,
    Loader2,
    Shield,
    UserCheck,
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const ROLE_META = {
    customer: {
        titleKey: 'roles.customer.title',
        descriptionKey: 'roles.customer.description',
        icon: Film,
    },
    staff: {
        titleKey: 'roles.staff.title',
        descriptionKey: 'roles.staff.description',
        icon: UserCheck,
    },
    cinema_manager: {
        titleKey: 'roles.cinema_manager.title',
        descriptionKey: 'roles.cinema_manager.description',
        icon: Shield,
    },
    admin: {
        titleKey: 'roles.admin.title',
        descriptionKey: 'roles.admin.description',
        icon: Shield,
    },
    super_admin: {
        titleKey: 'roles.super_admin.title',
        descriptionKey: 'roles.super_admin.description',
        icon: Crown,
    },
};

const springTransition = {
    type: 'spring',
    stiffness: 260,
    damping: 24,
};

const MAIN_CENTER_CLASSES = 'flex min-h-[calc(100dvh-2rem)] items-center justify-center px-4 py-12 sm:px-6 sm:py-16';

export default function RoleSelectionPage() {
    const { t } = useTranslation('roleSelection');
    const { user, selectRole } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const shouldReduceMotion = useReducedMotion();

    const roles = useMemo(() => user?.roles || [], [user]);

    const [selected, setSelected] = useState(
        () =>
            user?.activeRole?.id ||
            user?.activeRole?._id ||
            roles[0]?.id ||
            roles[0]?._id ||
            roles[0]?.name ||
            null
    );

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!selected && roles.length) {
            const firstRole = roles[0];
            setSelected(firstRole.id || firstRole._id || firstRole.name);
        }
    }, [roles, selected]);

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

    const staggerContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.075,
                delayChildren: 0.1,
            },
        },
    };

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
    };

    const buttonClasses =
        'inline-flex items-center justify-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-sm font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-50';

    const handleContinue = async () => {
        if (!selected || submitting) return;

        setSubmitting(true);
        setError('');

        try {
            const result = await selectRole(selected);

            const activeName = String(
                result.user?.activeRole?.name ||
                result.user?.role ||
                ''
            ).toLowerCase();

            const returnPath = location.state?.from?.pathname;

            const destination =
                returnPath && returnPath !== '/select-role'
                    ? returnPath
                    : ['admin', 'super_admin'].includes(activeName)
                        ? '/admin/users'
                        : activeName === 'cinema_manager'
                            ? '/admin/staff'
                            : '/account';

            navigate(destination, { replace: true });
        } catch (err) {
            setError(err.message || t('errorFallback'));
            setSubmitting(false);
        }
    };

    if (!roles.length) {
        return (
            <main className={MAIN_CENTER_CLASSES}>
                <motion.section
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="my-auto w-full max-w-md rounded-2xl border border-marquee-line bg-marquee-panel2 p-6 text-center shadow-2xl sm:p-8"
                >
                    <div className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10 text-marquee-gold">
                        <ShieldCheck className="h-5 w-5" />
                    </div>

                    <h1 className="font-serif text-2xl font-bold text-marquee-cream">
                        {t('noRoles.title')}
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-marquee-muted">
                        {t('noRoles.description')}
                    </p>
                </motion.section>
            </main>
        );
    }

    const roleCountKey =
        roles.length === 1 ? 'roleCount' : 'roleCount_plural';

    return (
        <main className={MAIN_CENTER_CLASSES}>
            <motion.section
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-marquee-line bg-marquee-panel2 p-6 shadow-2xl sm:p-8"
            >
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={fadeInUp} className="mb-4 flex items-center gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10 text-marquee-gold">
                            <ShieldCheck className="h-6 w-6" />
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-marquee-gold">
                                {t('eyebrow')}
                            </p>

                            <h1 className="mt-1 font-serif text-2xl font-bold text-marquee-cream sm:text-3xl">
                                {t('title')}
                            </h1>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        className="mb-7 rounded-xl border border-marquee-line bg-marquee-bg/40 px-4 py-4"
                    >
                        <p className="text-sm leading-relaxed text-marquee-muted">
                            {t('intro')}
                        </p>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-marquee-muted">
                                {t('availableRoles')}
                            </span>

                            <span className="rounded-full border border-marquee-line bg-marquee-bg/40 px-3 py-1 text-[11px] font-medium text-marquee-muted">
                                {t(roleCountKey, { count: roles.length })}
                            </span>
                        </div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="space-y-3"
                        >
                            {roles.map((role) => {
                                const name = String(role.name || '').toLowerCase();

                                const meta = ROLE_META[name];
                                const title = meta
                                    ? t(meta.titleKey)
                                    : role.name;
                                const description = meta
                                    ? t(meta.descriptionKey)
                                    : role.description || t('roles.fallbackDescription');
                                const Icon = meta?.icon || Shield;

                                const roleId = role.id || role._id || role.name;
                                const active = String(selected) === String(roleId);

                                return (
                                    <motion.button
                                        key={roleId}
                                        type="button"
                                        onClick={() => setSelected(roleId)}
                                        aria-pressed={active}
                                        variants={fadeInUp}
                                        whileHover={
                                            shouldReduceMotion
                                                ? undefined
                                                : { y: -2 }
                                        }
                                        whileTap={
                                            shouldReduceMotion
                                                ? undefined
                                                : { scale: 0.99 }
                                        }
                                        transition={springTransition}
                                        className={`group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee-gold sm:p-5 ${active
                                            ? 'border-marquee-gold/50 bg-marquee-gold/10'
                                            : 'border-marquee-line bg-marquee-bg/30 hover:border-marquee-gold/30 hover:bg-marquee-bg/50'
                                            }`}
                                    >
                                        <div
                                            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${active
                                                ? 'bg-marquee-gold/10 text-marquee-gold'
                                                : 'bg-marquee-panel2 text-marquee-muted group-hover:text-marquee-gold'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" strokeWidth={1.7} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <span
                                                className={`block text-sm font-semibold ${active
                                                    ? 'text-marquee-goldBright'
                                                    : 'text-marquee-cream'
                                                    }`}
                                            >
                                                {title}
                                            </span>

                                            <p className="mt-1 text-xs leading-relaxed text-marquee-muted">
                                                {description}
                                            </p>
                                        </div>

                                        <div
                                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors ${active
                                                ? 'bg-marquee-gold text-marquee-bg'
                                                : 'border border-marquee-line text-transparent'
                                                }`}
                                        >
                                            {active && (
                                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.p
                                key="error"
                                initial={{
                                    opacity: 0,
                                    y: shouldReduceMotion ? 0 : 10,
                                }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
                                role="alert"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <motion.div variants={fadeInUp}>
                        <motion.button
                            type="button"
                            onClick={handleContinue}
                            disabled={!selected || submitting}
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
                            className={`${buttonClasses} mt-7 w-full`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('submitting')}
                                </>
                            ) : (
                                <>
                                    {t('continue')}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </motion.button>
                    </motion.div>

                    <motion.p
                        variants={fadeInUp}
                        className="mt-8 border-t border-marquee-line pt-6 text-center text-xs leading-relaxed text-marquee-muted"
                    >
                        {t('footerNote')}
                    </motion.p>
                </motion.div>
            </motion.section>
        </main>
    );
}
