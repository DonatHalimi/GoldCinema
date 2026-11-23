import { KeyRound, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
    useCreatePermissionMutation,
    useDeletePermissionMutation,
    useGetPermissionsQuery,
    useRestorePermissionMutation,
    useUpdatePermissionMutation,
} from '../../../store/api/usersApiSlice';
import PermissionFormModal from './PermissionFormModal';
import ConfirmActionModal from '../../ui/modals/ConfirmActionModal';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../../hooks/usePermissions';
import { hasPermission } from '../../../utils/permissions';
import { tableDeleteButtonClass } from '../../../utils/adminTableStyles';

export default function PermissionsDashboardTable() {
    const { t } = useTranslation('dashboard');
    const [search, setSearch] = useState('');
    const [showRemoved, setShowRemoved] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { permissions: activePermissions } = usePermissions();
    const canManage = hasPermission(activePermissions, 'permissions:manage');
    const { data, isLoading, isError } = useGetPermissionsQuery({ includeDeleted: true });
    const [createPermission, createState] = useCreatePermissionMutation();
    const [updatePermission, updateState] = useUpdatePermissionMutation();
    const [deletePermission, deleteState] = useDeletePermissionMutation();
    const [restorePermission, restoreState] = useRestorePermissionMutation();
    const isSaving = createState.isLoading || updateState.isLoading;
    const allPermissions = useMemo(() => data?.permissions || [], [data]);
    const hasRemovedPermissions = allPermissions.some((permission) => permission.isDeleted);
    const permissions = useMemo(() => {
        const term = search.trim().toLowerCase();
        return allPermissions.filter((permission) => {
            if (permission.isDeleted && !showRemoved) return false;
            return !term ||
                permission.key.toLowerCase().includes(term) ||
                permission.resource.toLowerCase().includes(term) ||
                permission.action.toLowerCase().includes(term) ||
                permission.category.toLowerCase().includes(term) ||
                permission.description.toLowerCase().includes(term);
        });
    }, [allPermissions, search, showRemoved]);

    const submitPermission = async (payload) => {
        try {
            if (editingPermission) {
                await updatePermission({ id: editingPermission._id, ...payload }).unwrap();
                toast.success(t('rbacPermissionUpdated'));
                setEditingPermission(null);
            } else {
                await createPermission(payload).unwrap();
                toast.success(t('rbacPermissionCreated'));
                setCreateOpen(false);
            }
        } catch (error) {
            const message = error?.data?.error || t(editingPermission ? 'rbacPermissionUpdateError' : 'rbacPermissionCreateError');
            toast.error(message);
            throw error;
        }
    };

    const confirmDeletePermission = async () => {
        if (!deleteTarget) return;
        try {
            await deletePermission(deleteTarget._id).unwrap();
            toast.success(t(deleteTarget.isSystem ? 'rbacSystemPermissionRemoved' : 'rbacPermissionDeleted'));
            setDeleteTarget(null);
        } catch (error) {
            toast.error(error?.data?.error || t('rbacPermissionDeleteError'));
        }
    };

    const restoreSystemPermission = async (permission) => {
        try {
            await restorePermission(permission._id).unwrap();
            toast.success(t('rbacSystemPermissionRestored'));
        } catch (error) {
            toast.error(error?.data?.error || t('rbacPermissionRestoreError'));
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-marquee-bg px-4 pb-12 pt-6 text-marquee-cream sm:px-6 lg:px-10">
            <div className="mb-6 rounded-2xl border border-marquee-line bg-marquee-panel/95 p-5 shadow-xl sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-marquee-gold/20 bg-marquee-gold/10 text-marquee-gold"><KeyRound size={19} /></div>
                    <div className="flex-1">
                        <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">{t('rbacPermissionsTitle')}</h2>
                        <p className="mt-1 text-xs text-marquee-muted">{t('rbacPermissionsDescription')}</p>
                    </div>
                    {canManage && (
                        <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-marquee-gold bg-marquee-panel2 px-4 py-2.5 text-sm font-semibold text-marquee-gold hover:bg-marquee-gold/10">
                            <Plus size={16} /> {t('rbacCreatePermission')}
                        </button>
                    )}
                </div>
                <div className="relative mt-5 max-w-xl">
                    <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-marquee-muted" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('rbacSearchPermissions')}
                        aria-label={t('rbacSearchPermissions')}
                        className="w-full rounded-xl border border-marquee-line bg-marquee-panel2 py-2.5 pl-10 pr-4 text-sm text-marquee-cream outline-none focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20"
                    />
                    {hasRemovedPermissions && (
                        <button
                            type="button"
                            onClick={() => setShowRemoved((current) => !current)}
                            className="mt-3 rounded-lg border border-marquee-line px-3 py-2 text-xs text-marquee-cream transition hover:border-marquee-gold"
                        >
                            {t(showRemoved ? 'rbacHideRemovedPermissions' : 'rbacShowRemovedPermissions')}
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 text-center text-sm text-marquee-muted">{t('rbacLoadingPermissions')}</div>
            ) : isError ? (
                <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">{t('rbacPermissionsLoadError')}</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-marquee-cream">
                            <thead className="border-b border-marquee-line bg-marquee-panel2 text-[11px] font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-4">{t('rbacKey')}</th>
                                    <th className="px-4 py-4">{t('rbacResource')}</th>
                                    <th className="px-4 py-4">{t('rbacAction')}</th>
                                    <th className="px-4 py-4">{t('rbacCategory')}</th>
                                    <th className="px-4 py-4">{t('rbacDescription')}</th>
                                    <th className="px-4 py-4">{t('rbacAssignedRoles')}</th>
                                    <th className="px-5 py-4">{t('rbacType')}</th>
                                    {canManage && <th className="px-5 py-4 text-right">{t('emailTemplateActions')}</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-marquee-line">
                                {permissions.length === 0 ? (
                                    <tr><td colSpan={canManage ? 8 : 7} className="px-6 py-10 text-center text-marquee-muted">{t('rbacNoPermissions')}</td></tr>
                                ) : permissions.map((permission) => (
                                    <tr key={permission._id} className="transition-colors hover:bg-marquee-panel2">
                                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-marquee-goldBright">{permission.key}</td>
                                        <td className="px-4 py-4">{permission.resource}</td>
                                        <td className="px-4 py-4">{permission.action}</td>
                                        <td className="px-4 py-4 text-xs text-marquee-muted">{permission.category}</td>
                                        <td className="max-w-sm px-4 py-4 text-xs leading-5 text-marquee-muted">{permission.description}</td>
                                        <td className="px-4 py-4">{permission.assignedRoleCount ?? 0}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide ${permission.isDeleted ? 'border-red-400/30 bg-red-400/10 text-red-400' : 'border-marquee-gold/30 bg-marquee-gold/10 text-marquee-gold'}`}>
                                                {permission.isDeleted ? t('rbacRemoved') : permission.isSystem ? t('rbacSystem') : t('rbacCustom')}
                                            </span>
                                        </td>
                                        {canManage && (
                                            <td className="px-5 py-4 text-right">
                                                {permission.isDeleted ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => restoreSystemPermission(permission)}
                                                        title={t('rbacRestorePermission')}
                                                        aria-label={t('rbacRestorePermission')}
                                                        disabled={restoreState.isLoading}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-marquee-gold/40 text-marquee-gold hover:bg-marquee-gold/10 disabled:opacity-50"
                                                    >
                                                        <RotateCcw size={15} />
                                                    </button>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingPermission(permission)}
                                                            title={t('rbacEditPermission')}
                                                            aria-label={t('rbacEditPermission')}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-marquee-gold/40 text-marquee-gold hover:bg-marquee-gold/10"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteTarget(permission)}
                                                            title={t('rbacDeletePermission')}
                                                            aria-label={t('rbacDeletePermission')}
                                                            disabled={deleteState.isLoading}
                                                            className={tableDeleteButtonClass}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-marquee-line bg-marquee-panel2 px-5 py-3 text-xs text-marquee-muted">
                        {t(permissions.length === 1 ? 'rbacPermissionCountSummary_one' : 'rbacPermissionCountSummary', { count: permissions.length })}
                    </div>
                </div>
            )}
            <PermissionFormModal
                isOpen={createOpen || Boolean(editingPermission)}
                isSaving={isSaving}
                initialPermission={editingPermission}
                onClose={() => { setCreateOpen(false); setEditingPermission(null); }}
                onSubmit={submitPermission}
            />
            <ConfirmActionModal
                isOpen={Boolean(deleteTarget)}
                title={t(deleteTarget?.isSystem ? 'rbacDeleteSystemPermissionTitle' : 'rbacDeletePermissionTitle')}
                message={t(
                    deleteTarget?.isSystem ? 'rbacDeleteSystemPermissionConfirm' : 'rbacDeletePermissionConfirm',
                    { key: deleteTarget?.key }
                )}
                confirmLabel={t('rbacDeletePermission')}
                cancelLabel={t('rbacCancel')}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDeletePermission}
                isLoading={deleteState.isLoading}
            />
        </div>
    );
}
