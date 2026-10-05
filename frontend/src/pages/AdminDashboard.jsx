import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Layout } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import ModuleDataGrid from '../components/auth/ModuleDataGrid';
import AuditLogViewer from '../components/admin/AuditLogViewer';
import { getAllModules, getModuleSections, renderAdminItems } from '../config/adminModules';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
    const { t } = useTranslation('dashboard');
    const { moduleName } = useParams();
    const navigate = useNavigate();

    const MODULE_SECTIONS = getModuleSections(t);
    const ALL_MODULES = getAllModules(t);

    if (!moduleName) return <Navigate to="/admin/users" replace />;

    const activeModule = ALL_MODULES.find((mod) => mod.key === moduleName) || ALL_MODULES[0];

    const [openSections, setOpenSections] = useState(() => {
        const initialOpen = {};

        MODULE_SECTIONS.forEach((section) => { initialOpen[section.title] = true; });
        return initialOpen;
    });

    const toggleSection = (title) => {
        setOpenSections((prev) => ({ ...prev, [title]: !prev[title], }));
    };

    return (
        <div className="border-t border-marquee-line/50 bg-marquee-bg px-5 py-6 lg:px-7">
            <div className="flex items-start gap-6">
                <aside className="sticky top-24 w-64 shrink-0 self-start rounded-2xl border border-marquee-line/80 bg-marquee-panel/95 p-4 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.7)] backdrop-blur-sm">
                    <div className="mb-8 flex shrink-0 items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10 text-marquee-gold shadow-glow">
                            <Layout size={20} />
                        </div>

                        <div>
                            <span className="font-display text-3xl tracking-wide text-marquee-goldBright">
                                GOLD
                                <span className="text-marquee-cream">
                                    CINEMA
                                </span>
                            </span>

                            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-marquee-muted/70">
                                {t('dashboardTitle')}
                            </p>
                        </div>
                    </div>

                    <nav className="space-y-6 pb-4">
                        {MODULE_SECTIONS.map((section) => {
                            const SectionIcon = section.icon;
                            const isOpen = openSections[section.title];

                            return (
                                <div
                                    key={section.title}
                                    className="space-y-2"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleSection(section.title)
                                        }
                                        className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-marquee-muted/60 transition-all duration-200 hover:text-marquee-gold"
                                    >
                                        <div className="flex items-center gap-2">
                                            {SectionIcon && (
                                                <SectionIcon
                                                    size={14}
                                                    className="opacity-70"
                                                />
                                            )}

                                            <span>{section.title}</span>
                                        </div>

                                        <motion.div
                                            animate={{
                                                rotate: isOpen ? 180 : 0,
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown size={14} />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: 'auto',
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                transition={{
                                                    duration: 0.25,
                                                    ease: 'easeInOut',
                                                }}
                                                className="space-y-1 overflow-hidden"
                                            >
                                                {renderAdminItems(
                                                    section.items,
                                                    navigate,
                                                    activeModule
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                <main className="min-w-0 flex-1">
                    {activeModule.key === 'auditlogs' ? (
                        <AuditLogViewer />
                    ) : (
                        <ModuleDataGrid moduleConfig={activeModule} />
                    )}
                </main>
            </div>
        </div>
    );
}