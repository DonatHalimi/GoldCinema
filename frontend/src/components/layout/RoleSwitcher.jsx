import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    Check,
    ChevronDown,
    Crown,
    Film,
    Loader2,
    Shield,
    ShieldCheck,
    UserCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_META = {
    customer: {
        labelKey: 'roles.customer.label',
        descriptionKey: 'roles.customer.description',
        icon: Film,
    },
    staff: {
        labelKey: 'roles.staff.label',
        descriptionKey: 'roles.staff.description',
        icon: UserCheck,
    },
    cinema_manager: {
        labelKey: 'roles.cinema_manager.label',
        descriptionKey: 'roles.cinema_manager.description',
        icon: Shield,
    },
    admin: {
        labelKey: 'roles.admin.label',
        descriptionKey: 'roles.admin.description',
        icon: Shield,
    },
    super_admin: {
        labelKey: 'roles.super_admin.label',
        descriptionKey: 'roles.super_admin.description',
        icon: Crown,
    },
};

function normalizeRole(role) {
    return typeof role === 'string'
        ? { id: role, name: role }
        : role;
}

export default function RoleSwitcher({ onSwitchComplete }) {
    const { t } = useTranslation('roleSwitcher');
    const { user, switchRole } = useAuth();
    const navigate = useNavigate();
    const shouldReduceMotion = useReducedMotion();

    const [open, setOpen] = useState(false);
    const [switching, setSwitching] = useState(false);

    if (!user || user.roleSelectionRequired) return null;

    const roles = (user.roles || [])
        .map(normalizeRole)
        .filter((role) => role?.name);

    const active = normalizeRole(user.activeRole || user.role);
    const activeName = String(active?.name || '').toLowerCase();

    const isAdmin =
        ['admin', 'super_admin'].includes(activeName) ||
        roles.some((role) =>
            ['admin', 'super_admin'].includes(
                String(role.name).toLowerCase()
            )
        );

    if (!roles.length || (!isAdmin && roles.length <= 1)) {
        return null;
    }

    const activeMeta = ROLE_META[activeName];
    const activeLabel = activeMeta
        ? t(activeMeta.labelKey)
        : active?.name || t('trigger.fallbackLabel');
    const activeDescription = activeMeta
        ? t(activeMeta.descriptionKey)
        : t('trigger.fallbackDescription');
    const ActiveIcon = activeMeta?.icon || Shield;

    const panelVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 8,
            scale: shouldReduceMotion ? 1 : 0.98,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: shouldReduceMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 300,
                    damping: 26,
                    staggerChildren: 0.055,
                    delayChildren: 0.04,
                },
        },
        exit: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 5,
            scale: shouldReduceMotion ? 1 : 0.99,
            transition: { duration: shouldReduceMotion ? 0 : 0.15 },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 8,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: shouldReduceMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 350,
                    damping: 25,
                },
        },
    };

    const handleSwitch = async (role) => {
        if (switching || String(role.name).toLowerCase() === activeName) {
            setOpen(false);
            return;
        }

        setSwitching(true);

        try {
            await switchRole(role.id || role.name);

            setOpen(false);

            const nextName = String(role.name).toLowerCase();

            navigate(
                ['admin', 'super_admin'].includes(nextName)
                    ? '/admin/users'
                    : nextName === 'cinema_manager'
                        ? '/admin/staff'
                        : '/account'
            );

            onSwitchComplete?.();

            const nextMeta = ROLE_META[nextName];
            const nextLabel = nextMeta ? t(nextMeta.labelKey) : role.name;

            toast.success(t('toast.switched', { role: nextLabel }));
        } catch (error) {
            toast.error(error.message || t('toast.switchFailed'));
        } finally {
            setSwitching(false);
        }
    };

    return (
        <div className="relative w-full">
            {/* Current role trigger */}
            <motion.button
                type="button"
                onClick={() => setOpen((value) => !value)}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                }}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={t('trigger.ariaLabel', { role: activeLabel })}
                className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee-gold ${open
                    ? 'border-marquee-gold/50 bg-marquee-bg/50'
                    : 'border-marquee-line bg-marquee-panel2 hover:bg-marquee-bg/40'
                    }`}
            >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10 text-marquee-gold">
                        <ActiveIcon size={19} strokeWidth={1.7} />
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-marquee-muted">
                            {t('trigger.activeRole')}
                        </span>

                        <span className="block truncate text-sm font-semibold text-marquee-cream">
                            {activeLabel}
                        </span>
                    </span>
                </span>

                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={
                        shouldReduceMotion
                            ? { duration: 0 }
                            : {
                                type: 'spring',
                                stiffness: 350,
                                damping: 25,
                            }
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-marquee-muted transition-colors group-hover:text-marquee-gold"
                >
                    <ChevronDown size={17} />
                </motion.span>
            </motion.button>

            {/* Role dropdown */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Mobile backdrop */}
                        <motion.button
                            type="button"
                            aria-label={t('backdrop.close')}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                            onClick={() => !switching && setOpen(false)}
                            className="fixed inset-0 z-[69] bg-black/40 sm:hidden"
                        />

                        <motion.div
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            role="menu"
                            aria-label={t('panel.menuAriaLabel')}
                            className="
                                absolute left-0 right-0 top-full z-[70] mt-2
                                w-full overflow-hidden rounded-2xl
                                border border-marquee-line
                                bg-marquee-panel2 shadow-2xl
                                sm:left-full sm:right-auto sm:top-0
                                sm:ml-3 sm:mt-0 sm:w-[290px]
                                sm:max-w-[calc(100vw-24px)]
                            "
                        >
                            {/* Dropdown header */}
                            <div className="border-b border-marquee-line px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10 text-marquee-gold">
                                        <ShieldCheck size={19} strokeWidth={1.7} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-marquee-cream">
                                            {t('panel.title')}
                                        </p>

                                        <p className="mt-1 text-xs text-marquee-muted">
                                            {t('panel.subtitle')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Available roles */}
                            <div className="max-h-[min(60vh,360px)] space-y-1 overflow-y-auto p-2">
                                {roles.map((role) => {
                                    const name = String(role.name).toLowerCase();

                                    const meta = ROLE_META[name];
                                    const roleLabel = meta
                                        ? t(meta.labelKey)
                                        : role.name;
                                    const roleDescription = meta
                                        ? t(meta.descriptionKey)
                                        : t('roles.fallbackDescription');

                                    const Icon = meta?.icon || Shield;
                                    const selected = name === activeName;

                                    return (
                                        <motion.button
                                            key={role.id || role._id || role.name}
                                            variants={itemVariants}
                                            type="button"
                                            role="menuitem"
                                            disabled={switching}
                                            aria-current={selected ? 'true' : undefined}
                                            onClick={() => handleSwitch(role)}
                                            whileHover={
                                                shouldReduceMotion || selected
                                                    ? undefined
                                                    : { x: 2 }
                                            }
                                            whileTap={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : { scale: 0.99 }
                                            }
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 25,
                                            }}
                                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee-gold disabled:cursor-not-allowed disabled:opacity-50 ${selected
                                                ? 'bg-marquee-gold/10 text-marquee-goldBright'
                                                : 'text-marquee-muted hover:bg-marquee-bg/60 hover:text-marquee-cream'
                                                }`}
                                        >
                                            <span
                                                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${selected
                                                    ? 'bg-marquee-gold/10 text-marquee-gold'
                                                    : 'bg-marquee-bg/60 text-marquee-muted group-hover:text-marquee-gold'
                                                    }`}
                                            >
                                                <Icon size={17} strokeWidth={1.7} />
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-xs font-semibold">
                                                    {roleLabel}
                                                </span>

                                                <span className="mt-1 block truncate text-[10px] text-marquee-muted">
                                                    {roleDescription}
                                                </span>
                                            </span>

                                            <span className="grid h-5 w-5 shrink-0 place-items-center">
                                                {switching && selected ? (
                                                    <Loader2
                                                        size={15}
                                                        className="animate-spin text-marquee-gold"
                                                    />
                                                ) : selected ? (
                                                    <Check
                                                        size={15}
                                                        strokeWidth={2.5}
                                                        className="text-marquee-gold"
                                                    />
                                                ) : null}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}