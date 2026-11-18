
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    ChevronRight,
    Crown,
    Film,
    LoaderCircle,
    Shield,
    UserCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_META = {
    customer: {
        label: 'Customer',
        description: 'Movies, bookings and your account',
        icon: Film,
    },
    staff: {
        label: 'Cinema Staff',
        description: 'Your staff profile and shifts',
        icon: UserCheck,
    },
    cinema_manager: {
        label: 'Cinema Manager',
        description: 'Staff and shift operations for your cinema',
        icon: Shield,
    },
    admin: {
        label: 'Administrator',
        description: 'System-wide administration and role management',
        icon: Shield,
    },
    super_admin: {
        label: 'Super Administrator',
        description: 'System-wide administration and role management',
        icon: Crown,
    },
};

const panelVariants = {
    hidden: {
        opacity: 0,
        x: -14,
        scale: 0.96,
        filter: 'blur(6px)',
    },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 380,
            damping: 28,
            mass: 0.8,
            staggerChildren: 0.055,
            delayChildren: 0.04,
        },
    },
    exit: {
        opacity: 0,
        x: -8,
        scale: 0.97,
        filter: 'blur(4px)',
        transition: {
            duration: 0.16,
            ease: 'easeIn',
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        x: -10,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 26,
        },
    },
};

function normalizeRole(role) {
    return typeof role === 'string'
        ? { id: role, name: role }
        : role;
}

export default function RoleSwitcher({ onSwitchComplete }) {
    const { user, switchRole } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [switching, setSwitching] = useState(false);

    if (!user || user.roleSelectionRequired) return null;

    const roles = (user.roles || [])
        .map(normalizeRole)
        .filter((role) => role?.name);

    const active = normalizeRole(user.activeRole || user.role);
    const activeName = String(active?.name || '').toLowerCase();

    const isAdmin = ['admin', 'super_admin'].includes(activeName) ||
        roles.some((role) =>
            ['admin', 'super_admin'].includes(
                String(role.name).toLowerCase()
            )
        );

    if (!roles.length || (!isAdmin && roles.length <= 1)) {
        return null;
    }

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

            navigate(['admin', 'super_admin'].includes(nextName)
                ? '/admin/users'
                : nextName === 'cinema_manager'
                    ? '/admin/staff'
                    : '/account'
            );

            onSwitchComplete?.();

            toast.success(`Active role changed to ${ROLE_META[nextName]?.label || role.name}.`
            );
        } catch (error) {
            toast.error(error.message || 'Unable to switch role.');
        } finally {
            setSwitching(false);
        }
    };

    return (
        <div className="relative w-full">
            <motion.button
                type="button"
                onClick={() => setOpen((value) => !value)}
                whileHover={{ borderColor: 'rgba(198,161,91,0.5)' }}
                whileTap={{ scale: 0.98 }}
                transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 28,
                }}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label={`Switch active role. Current role: ${ROLE_META[activeName]?.label ||
                    active?.name ||
                    'Select role'
                    }`}
                className={`
                    group relative flex w-full items-center justify-between
                    gap-3 overflow-hidden rounded-xl
                    border border-marquee-line
                    bg-marquee-panel2 px-3.5 py-3
                    text-left text-sm text-marquee-cream
                    transition-colors duration-300
                    hover:bg-marquee-panel
                    ${open ? 'border-marquee-gold/50' : ''}
                `}
            >
                <span style={{ background: 'linear-gradient(110deg, rgba(198,161,91,0.07), transparent 65%)', }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <span className="relative min-w-0 flex-1">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-marquee-muted">
                        Switch role
                    </span>

                    <span className="block truncate font-semibold text-marquee-goldBright">
                        {ROLE_META[activeName]?.label || active?.name || 'Select role'}
                    </span>
                </span>

                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 22,
                    }}
                    className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-marquee-muted group-hover:text-marquee-gold"
                >
                    <ChevronRight size={16} />
                </motion.span>
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        role="menu"
                        aria-label="Available roles"
                        className="
                            absolute left-full top-0 z-[70]
                            ml-3 w-[290px] max-w-[calc(100vw-24px)]
                            overflow-hidden rounded-2xl
                            border border-marquee-gold/20
                            bg-marquee-panel
                            shadow-[0_16px_60px_rgba(0,0,0,0.45)]
                            backdrop-blur-xl
                        "
                    >
                        <div style={{ background: 'rgba(198,161,91,0.12)', }} />

                        <div className="relative border-b border-white/[0.06] px-4 py-3.5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-marquee-gold">
                                        Account access
                                    </p>

                                    <p className="mt-1 text-xs text-marquee-muted">
                                        Select your active role
                                    </p>
                                </div>

                                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/[0.08] text-marquee-gold">
                                    <Shield size={15} />
                                </div>
                            </div>
                        </div>

                        <div className="relative space-y-1 p-2">
                            {roles.map((role) => {
                                const name = String(role.name).toLowerCase();

                                const meta = ROLE_META[name] || {
                                    label: role.name,
                                    description: 'Assigned GoldCinema access',
                                    icon: Shield,
                                };

                                const Icon = meta.icon;
                                const selected = name === activeName;

                                return (
                                    <motion.button
                                        key={role.id || role.name}
                                        variants={itemVariants}
                                        type="button"
                                        role="menuitem"
                                        disabled={switching}
                                        onClick={() => handleSwitch(role)}
                                        whileHover={
                                            !selected
                                                ? { x: 3, backgroundColor: 'rgba(255,255,255,0.035)' }
                                                : {}
                                        }
                                        whileTap={{ scale: 0.98 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 450,
                                            damping: 28,
                                        }}
                                        className={`
                                            group relative flex w-full
                                            items-center gap-3
                                            overflow-hidden rounded-xl
                                            px-3 py-3 text-left
                                            transition-colors duration-200
                                            disabled:opacity-50
                                            ${selected
                                                ? 'bg-marquee-gold/[0.09] text-marquee-goldBright'
                                                : 'text-marquee-muted hover:text-marquee-cream'
                                            }
                                        `}
                                    >
                                        {selected && (
                                            <motion.span
                                                layoutId="active-role-background"
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 32,
                                                }}
                                                className="absolute inset-0 rounded-xl border border-marquee-gold/20"
                                            />
                                        )}

                                        <span
                                            className={`
                                                relative z-10 flex h-9 w-9
                                                shrink-0 items-center
                                                justify-center rounded-xl
                                                border transition-all duration-200
                                                ${selected
                                                    ? 'border-marquee-gold/25 bg-marquee-gold/10 text-marquee-gold'
                                                    : 'border-white/[0.06] bg-white/[0.025] text-marquee-muted group-hover:border-marquee-gold/20 group-hover:text-marquee-gold'
                                                }
                                            `}
                                        >
                                            <Icon size={17} />
                                        </span>

                                        <span className="relative z-10 min-w-0 flex-1">
                                            <span className="block text-xs font-semibold">
                                                {meta.label}
                                            </span>

                                            <span className="mt-1 block truncate text-[10px] text-marquee-muted">
                                                {meta.description}
                                            </span>
                                        </span>

                                        <span className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                                            {switching && selected ? (
                                                <LoaderCircle size={15} className="animate-spin text-marquee-gold" />
                                            ) : selected ? (
                                                <motion.span
                                                    initial={{
                                                        scale: 0,
                                                        rotate: -45,
                                                    }}
                                                    animate={{
                                                        scale: 1,
                                                        rotate: 0,
                                                    }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 500,
                                                        damping: 20,
                                                    }}
                                                >
                                                    <Check size={15} className="text-marquee-gold" />
                                                </motion.span>
                                            ) : null}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}