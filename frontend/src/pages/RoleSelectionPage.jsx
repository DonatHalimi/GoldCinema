import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Crown, Film, LoaderCircle, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_META = {
    customer: { title: 'Customer', description: 'Browse films, book tickets and manage your cinema account.', icon: Film },
    staff: { title: 'Cinema Staff', description: 'Access your staff profile and assigned shifts.', icon: UserCheck },
    cinema_manager: { title: 'Cinema Manager', description: 'Manage staff and shifts within your assigned cinema.', icon: Shield },
    admin: { title: 'Administrator', description: 'Manage cinema operations and administration.', icon: Shield },
    super_admin: { title: 'Super Administrator', description: 'Manage the platform, administrators and role assignments.', icon: Crown },
};

export default function RoleSelectionPage() {
    const { user, selectRole } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const roles = useMemo(() => user?.roles || [], [user]);
    const [selected, setSelected] = useState(() => user?.activeRole?.id || user?.activeRole?._id || roles[0]?.id || roles[0]?._id || roles[0]?.name || null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!selected && roles.length) {
            const firstRole = roles[0];
            setSelected(firstRole.id || firstRole._id || firstRole.name);
        }
    }, [roles, selected]);

    const handleContinue = async () => {
        if (!selected || submitting) return;
        setSubmitting(true);
        setError('');
        try {
            const result = await selectRole(selected);
            const activeName = String(result.user?.activeRole?.name || result.user?.role || '').toLowerCase();
            const returnPath = location.state?.from?.pathname;
            const destination = returnPath && returnPath !== '/select-role'
                ? returnPath
                : ['admin', 'super_admin'].includes(activeName)
                    ? '/admin/users'
                    : activeName === 'cinema_manager'
                        ? '/admin/staff'
                        : '/account';
            navigate(destination, { replace: true });
        } catch (err) {
            setError(err.message || 'Unable to select this role.');
            setSubmitting(false);
        }
    };

    if (!roles.length) {
        return <div className="flex min-h-screen items-center justify-center bg-marquee-bg text-marquee-muted">No roles are assigned to this account. Contact an administrator.</div>;
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-marquee-bg px-5 py-12 text-marquee-cream">
            <div className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-marquee-gold/10 blur-3xl" />
            <section className="relative z-10 w-full max-w-2xl rounded-2xl border border-marquee-line bg-marquee-panel p-6 shadow-2xl sm:p-9">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10 text-marquee-gold"><Shield size={27} /></div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-marquee-gold">GoldCinema</p>
                    <h1 className="mt-2 font-display text-3xl font-semibold text-marquee-goldBright">Choose your active role</h1>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-marquee-muted">Your account has multiple access roles. Choose the role you want to use for this session.</p>
                </div>

                {error && <div role="alert" className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

                <div className="space-y-3">
                    {roles.map((role) => {
                        const name = String(role.name || '').toLowerCase();
                        const meta = ROLE_META[name] || { title: role.name, description: role.description || 'GoldCinema assigned access role.', icon: Shield };
                        const Icon = meta.icon;
                        const roleId = role.id || role._id || role.name;
                        const active = String(selected) === String(roleId);
                        return (
                            <button
                                type="button"
                                key={roleId}
                                onClick={() => setSelected(roleId)}
                                aria-pressed={active}
                                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${active ? 'border-marquee-gold/60 bg-marquee-gold/10 shadow-[0_0_20px_-12px_rgba(230,199,115,0.45)]' : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold/30'}`}
                            >
                                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${active ? 'border-marquee-gold/30 bg-marquee-gold/10 text-marquee-gold' : 'border-marquee-line bg-marquee-panel text-marquee-muted'}`}><Icon size={21} /></span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-semibold text-marquee-cream">{meta.title}</span>
                                    <span className="mt-1 block text-xs leading-relaxed text-marquee-muted">{meta.description}</span>
                                </span>
                                {active && <Check className="shrink-0 text-marquee-gold" size={20} />}
                            </button>
                        );
                    })}
                </div>

                <button type="button" onClick={handleContinue} disabled={!selected || submitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-marquee-gold px-5 py-3.5 font-semibold text-marquee-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                    {submitting && <LoaderCircle size={18} className="animate-spin" />}
                    Continue to GoldCinema
                </button>

                <p className="mt-4 text-center text-xs text-marquee-muted">Your permissions are enforced by the server for the selected role.</p>
            </section>
        </main>
    );
}
