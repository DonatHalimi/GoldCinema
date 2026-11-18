import { useEffect, useMemo, useState } from 'react';
import { Check, LoaderCircle, Search, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { getRoleCatalog, getUserRoleAssignments, updateUserRoleAssignments } from '../api/multiRole';

export default function RoleAssignmentsPage() {
    const [users, setUsers] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        Promise.all([
            api.get('/admin/users?page=1&limit=100'),
            getRoleCatalog(),
        ]).then(([userResponse, roles]) => {
            if (!active) return;
            setUsers(userResponse.data?.data || []);
            setCatalog(roles);
        }).catch((err) => {
            if (active) setError(err.message || 'Unable to load role administration data.');
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!selectedUserId) { setSelectedRoles([]); return; }
        let active = true;
        getUserRoleAssignments(selectedUserId)
            .then((data) => { if (active) setSelectedRoles((data.roles || []).map((role) => role.name)); })
            .catch((err) => { if (active) setError(err.message || 'Unable to load this user’s roles.'); });
        return () => { active = false; };
    }, [selectedUserId]);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;
        return users.filter((user) => `${user.name || ''} ${user.email || ''}`.toLowerCase().includes(term));
    }, [users, search]);

    const toggleRole = (name) => {
        setSelectedRoles((current) => current.includes(name) ? current.filter((role) => role !== name) : [...current, name]);
    };

    const save = async () => {
        if (!selectedUserId || !selectedRoles.length) {
            setError('Select a user and keep at least one role assigned.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await updateUserRoleAssignments(selectedUserId, selectedRoles);
            toast.success('Role assignments saved.');
        } catch (err) {
            setError(err.message || 'Unable to save role assignments.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex min-h-64 items-center justify-center text-marquee-muted"><LoaderCircle className="mr-2 animate-spin" /> Loading role assignments...</div>;

    return (
        <section className="space-y-6">
            <header>
                <div className="mb-2 flex items-center gap-2 text-marquee-gold"><ShieldCheck size={20} /><span className="text-xs font-semibold uppercase tracking-widest">Access control</span></div>
                <h1 className="font-display text-3xl font-semibold text-marquee-goldBright">User role assignments</h1>
                <p className="mt-2 text-sm text-marquee-muted">Assign multiple roles to a user. Role changes take effect immediately; sessions whose active role is revoked must select an allowed role again.</p>
            </header>

            {error && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="rounded-xl border border-marquee-line bg-marquee-panel p-4">
                    <h2 className="mb-3 flex items-center gap-2 font-semibold text-marquee-cream"><Users size={17} /> Select user</h2>
                    <label className="mb-3 flex items-center gap-2 rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2"><Search size={16} className="text-marquee-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="min-w-0 flex-1 bg-transparent text-sm text-marquee-cream outline-none placeholder:text-marquee-muted" /></label>
                    <div className="max-h-[28rem] space-y-1 overflow-y-auto">
                        {filteredUsers.map((user) => (
                            <button key={user._id} type="button" onClick={() => setSelectedUserId(user._id)} className={`w-full rounded-lg border px-3 py-3 text-left transition ${selectedUserId === user._id ? 'border-marquee-gold/50 bg-marquee-gold/10' : 'border-transparent hover:bg-marquee-panel2'}`}>
                                <span className="block text-sm font-medium text-marquee-cream">{user.name}</span>
                                <span className="block truncate text-xs text-marquee-muted">{user.email}</span>
                            </button>
                        ))}
                        {!filteredUsers.length && <p className="p-3 text-sm text-marquee-muted">No matching users.</p>}
                    </div>
                </div>

                <div className="rounded-xl border border-marquee-line bg-marquee-panel p-5">
                    <h2 className="mb-1 font-semibold text-marquee-cream">Assigned roles</h2>
                    <p className="mb-5 text-xs text-marquee-muted">Choose every role this account is permitted to activate.</p>
                    {!selectedUserId ? <p className="rounded-lg bg-marquee-panel2 p-4 text-sm text-marquee-muted">Select a user to edit their roles.</p> : (
                        <>
                            <div className="space-y-2">
                                {catalog.map((role) => {
                                    const checked = selectedRoles.includes(role.name);
                                    return (
                                        <label key={role.id || role.name} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${checked ? 'border-marquee-gold/40 bg-marquee-gold/10' : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold/20'}`}>
                                            <input type="checkbox" checked={checked} onChange={() => toggleRole(role.name)} className="h-4 w-4 accent-amber-400" />
                                            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-marquee-cream">{role.name.replaceAll('_', ' ')}</span><span className="block text-xs text-marquee-muted">{role.description}</span></span>
                                            {checked && <Check size={17} className="text-marquee-gold" />}
                                        </label>
                                    );
                                })}
                            </div>
                            <button type="button" onClick={save} disabled={saving || !selectedRoles.length} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-marquee-gold px-4 py-3 text-sm font-semibold text-marquee-bg transition hover:brightness-110 disabled:opacity-50">
                                {saving && <LoaderCircle size={17} className="animate-spin" />} Save role assignments
                            </button>
                            <p className="mt-3 text-xs text-marquee-muted">Only a selected <strong className="text-marquee-cream">super_admin</strong> can save role changes. At least one role must remain assigned.</p>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
