import { Calendar, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
    useCreateRoleMutation,
    useDeleteRoleMutation,
    useGetGroupedPermissionsQuery,
    useGetRoleQuery,
    useGetRolesQuery,
    useReplaceRolePermissionsMutation,
    useUpdateRoleMutation,
} from '../../../store/api/usersApiSlice';
import DeleteConfirmModal from '../../ui/modals/DeleteConfirmModal';
import Modal from '../../ui/modals/Modal';
import { tableDeleteButtonClass } from '../../../utils/adminTableStyles';
import { useTranslation } from 'react-i18next';

function EditRoleModal({
    roleId,
    role,
    grouped,
    roleDetails,
    isLoading,
    detailsError,
    permissionsError,
    onClose,
    onSave,
    saving,
}) {
    const { t } = useTranslation('dashboard');
    const initializedRoleId = useRef(null);
    const [name, setName] = useState(role?.name || '');
    const [description, setDescription] = useState(role?.description || '');
    const [initialName, setInitialName] = useState(role?.name || '');
    const [initialDescription, setInitialDescription] = useState(role?.description || '');
    const [search, setSearch] = useState('');
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [initialKeys, setInitialKeys] = useState([]);

    useEffect(() => {
        if (!roleId || roleDetails?.role?.id !== roleId || initializedRoleId.current === roleId) return;
        initializedRoleId.current = roleId;
        setName(roleDetails.role.name || '');
        setInitialName(roleDetails.role.name || '');
        setDescription(roleDetails.role.description || '');
        setInitialDescription(roleDetails.role.description || '');
        const keys = roleDetails.role.permissions?.map((permission) => permission.key) || [];
        setSelectedKeys(keys);
        setInitialKeys(keys);
        setSearch('');
    }, [roleId, roleDetails]);

    const dirty = useMemo(
        () => name !== initialName || description !== initialDescription ||
            selectedKeys.slice().sort().join('|') !== initialKeys.slice().sort().join('|'),
        [name, initialName, description, initialDescription, selectedKeys, initialKeys]
    );

    const filteredGroups = useMemo(() => {
        const term = search.trim().toLowerCase();
        return Object.entries(grouped || {}).reduce((result, [category, permissions]) => {
            const matches = permissions.filter((permission) =>
                !term ||
                permission.key.toLowerCase().includes(term) ||
                permission.description?.toLowerCase().includes(term)
            );
            if (matches.length) result[category] = matches;
            return result;
        }, {});
    }, [grouped, search]);

    const requestClose = () => {
        if (dirty && !window.confirm(t('rbacDiscardChanges'))) return;
        onClose();
    };

    const togglePermission = (key) => {
        if (role?.unrestricted) return;
        setSelectedKeys((current) =>
            current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
        );
    };

    const toggleGroup = (permissions) => {
        if (role?.unrestricted) return;
        const keys = permissions.map((permission) => permission.key);
        const allSelected = keys.every((key) => selectedKeys.includes(key));
        setSelectedKeys((current) =>
            allSelected
                ? current.filter((key) => !keys.includes(key))
                : [...new Set([...current, ...keys])]
        );
    };

    return (
        <Modal
            isOpen
            onClose={requestClose}
            closeDisabled={saving}
            title={`${t('rbacEditRole')}: ${role?.name || ''}`}
            width="max-w-3xl"
            className="p-0"
        >
            <div className="flex max-h-[85vh] flex-col">
                <div className="grid gap-4 border-b border-marquee-line px-6 py-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="edit-role-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{t('rbacRoleName')}</label>
                        <input
                            id="edit-role-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            disabled={role?.isProtected}
                            required
                            minLength={2}
                            maxLength={64}
                            className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 text-sm text-marquee-cream outline-none focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20 disabled:opacity-60"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-role-description" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{t('rbacDescription')}</label>
                        <input
                            id="edit-role-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            maxLength={250}
                            className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 text-sm text-marquee-cream outline-none focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20"
                        />
                    </div>
                </div>

                <div className="px-6 pb-4 pt-5">
                    {role?.unrestricted && <p className="mb-4 text-sm text-marquee-muted">{t('rbacUnrestricted')}</p>}
                    <div className="relative">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-marquee-muted" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('rbacSearchPermissions')}
                            aria-label={t('rbacSearchPermissions')}
                            className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 py-2.5 pl-10 pr-10 text-sm text-marquee-cream outline-none focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20"
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-marquee-muted hover:text-marquee-gold">
                                <X size={15} />
                            </button>
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-marquee-muted">{t('rbacSelectedCount', { count: selectedKeys.length })}</span>
                        {dirty && <span className="font-semibold text-marquee-gold">{t('rbacUnsaved')}</span>}
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto border-y border-marquee-line px-6 py-4">
                    {isLoading ? (
                        <p className="py-8 text-center text-sm text-marquee-muted">{t('rbacLoadingPermissions')}</p>
                    ) : detailsError ? (
                        <p role="alert" className="py-8 text-center text-sm text-red-300">{t('rbacRolePermissionsLoadError')}</p>
                    ) : permissionsError ? (
                        <p role="alert" className="py-8 text-center text-sm text-red-300">{t('rbacPermissionsLoadError')}</p>
                    ) : Object.keys(filteredGroups).length === 0 ? (
                        <p className="py-8 text-center text-sm text-marquee-muted">{t('rbacNoPermissionsMatch')}</p>
                    ) : (
                        <div className="space-y-5">
                            {Object.entries(filteredGroups).map(([category, permissions]) => {
                                const allSelected = permissions.every((permission) => selectedKeys.includes(permission.key));
                                return (
                                    <section key={category}>
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-marquee-gold">{category}</h3>
                                            <button type="button" disabled={role?.unrestricted} onClick={() => toggleGroup(permissions)} className="text-xs text-marquee-muted hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-40">
                                                {allSelected ? t('rbacDeselectGroup') : t('rbacSelectGroup')}
                                            </button>
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {permissions.map((permission) => {
                                                const selected = selectedKeys.includes(permission.key);
                                                return (
                                                    <label
                                                        key={permission.key}
                                                        className={`flex ${role?.unrestricted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} items-start gap-3 rounded-lg border p-3 transition ${selected ? 'border-marquee-gold/50 bg-marquee-gold/10' : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold/30'}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            disabled={role?.unrestricted}
                                                            onChange={() => togglePermission(permission.key)}
                                                            className="mt-1 h-4 w-4 accent-marquee-gold"
                                                        />
                                                        <span className="min-w-0">
                                                            <span className="block text-sm font-semibold text-marquee-cream">{permission.key}</span>
                                                            <span className="mt-0.5 block text-xs leading-5 text-marquee-muted">{permission.description}</span>
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 px-6 py-4">
                    <button type="button" onClick={requestClose} disabled={saving} className="rounded-lg border border-marquee-line px-4 py-2 text-sm text-marquee-muted hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50">{t('rbacCancel')}</button>
                    <button
                        type="button"
                        disabled={saving || !dirty || isLoading || detailsError || permissionsError || name.trim().length < 2}
                        onClick={() => onSave({
                            name: name.trim(),
                            description,
                            permissionKeys: selectedKeys,
                            permissionsChanged: selectedKeys.slice().sort().join('|') !== initialKeys.slice().sort().join('|'),
                        })}
                        className="rounded-lg border border-marquee-gold/30 bg-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-bg disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {saving ? t('rbacSaving') : t('rbacSaveChanges')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function CreateRoleModal({ grouped, isLoading, permissionsError, saving, onClose, onCreate }) {
    const { t } = useTranslation('dashboard');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [search, setSearch] = useState('');
    const [selectedKeys, setSelectedKeys] = useState([]);

    const filteredGroups = useMemo(() => {
        const term = search.trim().toLowerCase();
        return Object.entries(grouped || {}).reduce((result, [category, permissions]) => {
            const matches = permissions.filter((permission) =>
                !term ||
                permission.key.toLowerCase().includes(term) ||
                permission.description?.toLowerCase().includes(term)
            );
            if (matches.length) result[category] = matches;
            return result;
        }, {});
    }, [grouped, search]);

    const dirty = Boolean(name || description || selectedKeys.length);

    const requestClose = () => {
        if (dirty && !window.confirm(t('rbacDiscardRole'))) return;
        onClose();
    };

    const togglePermission = (key) => {
        setSelectedKeys((current) =>
            current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
        );
    };

    const toggleGroup = (permissions) => {
        const keys = permissions.map((permission) => permission.key);
        const allSelected = keys.every((key) => selectedKeys.includes(key));
        setSelectedKeys((current) =>
            allSelected
                ? current.filter((key) => !keys.includes(key))
                : [...new Set([...current, ...keys])]
        );
    };

    const submit = (event) => {
        event.preventDefault();
        onCreate({ name, description, permissionKeys: selectedKeys });
    };

    return (
        <Modal
            isOpen
            onClose={requestClose}
            closeDisabled={saving}
            title={t('rbacCreateRoleTitle')}
            width="max-w-3xl"
            className="p-0"
        >
            <form onSubmit={submit} className="flex max-h-[82vh] flex-col">
                <div className="grid gap-4 px-6 py-5 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                        <label htmlFor="create-role-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{t('rbacRoleNameRequired')}</label>
                        <input
                            id="create-role-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            minLength={2}
                            maxLength={64}
                            placeholder={t('rbacRoleNamePlaceholder')}
                            className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 text-sm text-marquee-cream outline-none focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20"
                        />
                    </div>
                    <div>
                        <label htmlFor="create-role-description" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{t('rbacDescription')}</label>
                        <input
                            id="create-role-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            maxLength={250}
                            placeholder={t('rbacRoleDescriptionPlaceholder')}
                            className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 text-sm text-marquee-cream outline-none focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20"
                        />
                    </div>
                </div>

                <div className="border-t border-marquee-line px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-semibold text-marquee-cream">{t('rbacPermissionCount')}</h3>
                            <p className="mt-0.5 text-xs text-marquee-muted">{t('rbacSelectedCount', { count: selectedKeys.length })}</p>
                        </div>
                        <div className="relative w-full max-w-xs">
                            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-marquee-muted" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t('rbacSearchPermissions')}
                                aria-label={t('rbacSearchPermissions')}
                                className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 py-2 pl-9 pr-8 text-sm text-marquee-cream outline-none focus:border-marquee-gold"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-marquee-muted hover:text-marquee-gold">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto border-y border-marquee-line px-6 py-4">
                    {isLoading ? (
                        <p className="py-8 text-center text-sm text-marquee-muted">{t('rbacLoadingPermissions')}</p>
                    ) : permissionsError ? (
                        <p role="alert" className="py-8 text-center text-sm text-red-300">{t('rbacPermissionsLoadError')}</p>
                    ) : Object.keys(filteredGroups).length === 0 ? (
                        <p className="py-8 text-center text-sm text-marquee-muted">{t('rbacNoPermissionsMatch')}</p>
                    ) : (
                        <div className="space-y-5">
                            {Object.entries(filteredGroups).map(([category, permissions]) => {
                                const allSelected = permissions.every((permission) => selectedKeys.includes(permission.key));
                                return (
                                    <section key={category}>
                                        <div className="mb-2 flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-marquee-gold">{category}</h4>
                                            <button type="button" onClick={() => toggleGroup(permissions)} className="text-xs text-marquee-muted hover:text-marquee-gold">
                                                {allSelected ? t('rbacDeselectGroup') : t('rbacSelectGroup')}
                                            </button>
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {permissions.map((permission) => {
                                                const selected = selectedKeys.includes(permission.key);
                                                return (
                                                    <label
                                                        key={permission.key}
                                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${selected ? 'border-marquee-gold/50 bg-marquee-gold/10' : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold/30'}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            onChange={() => togglePermission(permission.key)}
                                                            className="mt-1 h-4 w-4 accent-marquee-gold"
                                                        />
                                                        <span className="min-w-0">
                                                            <span className="block text-sm font-semibold text-marquee-cream">{permission.key}</span>
                                                            <span className="mt-0.5 block text-xs leading-5 text-marquee-muted">{permission.description}</span>
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 px-6 py-4">
                    <button type="button" onClick={requestClose} disabled={saving} className="rounded-lg border border-marquee-line px-4 py-2 text-sm text-marquee-muted hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50">{t('rbacCancel')}</button>
                    <button type="submit" disabled={saving || isLoading || permissionsError || name.trim().length < 2} className="rounded-lg border border-marquee-gold/30 bg-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-bg disabled:cursor-not-allowed disabled:opacity-40">
                        {saving ? t('rbacSaving') : t('rbacCreateAction')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default function RoleDashboardTable() {
    const { t } = useTranslation('dashboard');
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data, isLoading, isError } = useGetRolesQuery({ page, limit: 10, search });
    const { data: groupedData, isLoading: groupedLoading, isError: permissionsError } = useGetGroupedPermissionsQuery();
    const { data: roleDetails, isLoading: roleDetailsLoading, isError: roleDetailsError } = useGetRoleQuery(editingRole?.id, {
        skip: !editingRole?.id,
    });
    const [createRole, createState] = useCreateRoleMutation();
    const [updateRole, updateState] = useUpdateRoleMutation();
    const [replacePermissions, replaceState] = useReplaceRolePermissionsMutation();
    const [deleteRole] = useDeleteRoleMutation();

    const roles = data?.data || [];
    const totalPages = data?.pages || 1;

    const openCreate = () => {
        setEditingRole(null);
        setRoleModalOpen(true);
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setRoleModalOpen(true);
    };

    const saveRole = async (formData) => {
        try {
            if (editingRole && (formData.name !== editingRole.name || formData.description !== editingRole.description)) {
                await updateRole({ id: editingRole.id, name: formData.name, description: formData.description }).unwrap();
            }
            if (editingRole && formData.permissionsChanged && !editingRole.unrestricted) {
                await replacePermissions({ id: editingRole.id, permissionKeys: formData.permissionKeys }).unwrap();
            }
            toast.success(t('rbacRoleUpdated'));
            setRoleModalOpen(false);
            setEditingRole(null);
        } catch (error) {
            toast.error(error?.data?.error || error?.response?.data?.error || t('rbacRoleSaveError'));
        }
    };

    const createRoleWithPermissions = async (formData) => {
        try {
            await createRole(formData).unwrap();
            toast.success(t('rbacRoleCreatedWithPermissions'));
            setRoleModalOpen(false);
            setEditingRole(null);
        } catch (error) {
            toast.error(error?.data?.error || t('rbacRoleCreateError'));
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteRole(deleteTarget.id).unwrap();
            toast.success(t('rbacRoleDeleted'));
            setDeleteTarget(null);
        } catch (error) {
            toast.error(error?.data?.error || t('rbacRoleDeleteError'));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-marquee-bg px-4 pb-12 pt-6 text-marquee-cream sm:px-6 lg:px-10">
            <div className="mb-6 rounded-2xl border border-marquee-line bg-marquee-panel/95 p-5 shadow-xl sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">{t('rbacRolesTitle')}</h2>
                        <p className="mt-1 text-xs text-marquee-muted">{t('rbacRolesDescription')}</p>
                    </div>
                    <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg border border-marquee-gold bg-marquee-panel2 px-5 py-3 text-sm font-semibold text-marquee-gold hover:bg-marquee-gold/10">
                        <Plus size={16} /> {t('rbacCreateRole')}
                    </button>
                </div>
                <div className="relative mt-5 max-w-xl">
                    <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-marquee-muted" />
                    <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={t('rbacSearchRoles')} className="w-full rounded-xl border border-marquee-line bg-marquee-panel2 py-2.5 pl-10 pr-10 text-sm text-marquee-cream outline-none focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20" />
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 text-center text-sm text-marquee-muted">{t('rbacLoadingRoles')}</div>
            ) : isError ? (
                <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">{t('rbacRolesLoadError')}</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-marquee-cream">
                            <thead className="border-b border-marquee-line bg-marquee-panel2 text-[11px] font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">{t('rbacRoleName')}</th>
                                    <th className="px-4 py-4">{t('rbacPermissionCount')}</th>
                                    <th className="px-4 py-4">{t('rbacUsersCount')}</th>
                                    <th className="px-4 py-4">{t('rbacCreated')}</th>
                                    <th className="px-6 py-4 text-right">{t('rbacActions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-marquee-line">
                                {roles.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-marquee-muted">{t('rbacNoRoles')}</td></tr>
                                ) : roles.map((role) => (
                                    <tr key={role.id} className="transition-colors hover:bg-marquee-panel2">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-marquee-goldBright">{role.name.replaceAll('_', ' ')}</span>
                                                {role.isSystem && <span className="inline-flex items-center gap-1 rounded-full border border-marquee-gold/30 bg-marquee-gold/10 px-2 py-0.5 text-[10px] uppercase text-marquee-gold"><ShieldCheck size={10} /> {t(role.isProtected ? 'rbacProtected' : 'rbacSystem')}</span>}
                                            </div>
                                            <div className="mt-1 max-w-md text-xs text-marquee-muted">{role.description || '-'}</div>
                                        </td>
                                        <td className="px-4 py-4">{role.permissionCount ?? 0}</td>
                                        <td className="px-4 py-4">{role.assignedUserCount ?? 0}</td>
                                        <td className="px-4 py-4 text-xs text-marquee-muted"><span className="inline-flex items-center gap-1"><Calendar size={13} />{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '-'}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button type="button" disabled={role.isProtected} onClick={() => openEdit(role)} title={t('rbacEdit')} aria-label={t('rbacEdit')} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-marquee-gold/40 text-marquee-gold hover:bg-marquee-gold/10 disabled:cursor-not-allowed disabled:opacity-40"><Pencil size={15} /></button>
                                                <button type="button" disabled={role.isProtected} onClick={() => setDeleteTarget(role)} title={t('rbacDeleteRole')} aria-label={t('rbacDeleteRole')} className={tableDeleteButtonClass}><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t border-marquee-line px-6 py-4">
                        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-marquee-line px-3 py-1.5 text-xs disabled:opacity-40">{t('rbacPrevious')}</button>
                        <span className="text-xs text-marquee-muted">{t('rbacPageOf', { page, pages: totalPages })}</span>
                        <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-marquee-line px-3 py-1.5 text-xs disabled:opacity-40">{t('rbacNext')}</button>
                    </div>
                </div>
            )}

            {editingRole ? (
                <EditRoleModal
                    key={editingRole.id}
                    roleId={editingRole.id}
                    role={editingRole}
                    grouped={groupedData?.grouped}
                    roleDetails={roleDetails}
                    isLoading={roleDetailsLoading || groupedLoading}
                    detailsError={roleDetailsError}
                    permissionsError={permissionsError}
                    onClose={() => { setRoleModalOpen(false); setEditingRole(null); }}
                    onSave={saveRole}
                    saving={updateState.isLoading || replaceState.isLoading}
                />
            ) : roleModalOpen ? (
                <CreateRoleModal
                    grouped={groupedData?.grouped}
                    isLoading={!groupedData && !permissionsError}
                    permissionsError={permissionsError}
                    saving={createState.isLoading}
                    onClose={() => { setRoleModalOpen(false); setEditingRole(null); }}
                    onCreate={createRoleWithPermissions}
                />
            ) : null}

            <DeleteConfirmModal
                deleteTarget={deleteTarget ? deleteTarget.name : null}
                label="roles"
                deleting={deleting}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
