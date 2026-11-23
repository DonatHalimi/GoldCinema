import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../ui/modals/Modal';

const INITIAL_FORM = {
    resource: '',
    action: '',
    description: '',
    category: '',
};

export default function PermissionFormModal({ isOpen, isSaving, onClose, onSubmit, initialPermission }) {
    const { t } = useTranslation('dashboard');
    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState('');
    const isEditing = Boolean(initialPermission);
    const key = `${form.resource.trim().toLowerCase() || 'resource'}:${form.action.trim().toLowerCase() || 'action'}`;

    useEffect(() => {
        if (!isOpen) return;
        setForm(initialPermission ? {
            resource: initialPermission.resource,
            action: initialPermission.action,
            description: initialPermission.description,
            category: initialPermission.category,
        } : INITIAL_FORM);
        setError('');
    }, [initialPermission, isOpen]);

    if (!isOpen) return null;

    const close = () => {
        if (isSaving) return;
        setError('');
        setForm(INITIAL_FORM);
        onClose();
    };

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await onSubmit({
                key,
                resource: form.resource.trim().toLowerCase(),
                action: form.action.trim().toLowerCase(),
                description: form.description.trim(),
                category: form.category.trim(),
            });
            setForm(INITIAL_FORM);
        } catch (submitError) {
            setError(submitError?.data?.error || submitError?.message || t('rbacPermissionCreateError'));
        }
    };

    const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));
    const inputClass = 'w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 text-sm text-marquee-cream outline-none transition focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20';

    return (
        <Modal isOpen onClose={close} closeDisabled={isSaving} title={t(isEditing ? 'rbacEditPermissionTitle' : 'rbacCreatePermissionTitle')} width="max-w-xl" className="max-h-[90vh] overflow-y-auto">
            <form onSubmit={submit} className="mt-5 space-y-5">
                <p className="text-sm leading-6 text-marquee-muted">
                    {t(isEditing ? (initialPermission.isSystem ? 'rbacEditSystemPermissionHelp' : 'rbacEditPermissionHelp') : 'rbacCustomPermissionHelp')}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="permission-resource" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{t('rbacResource')}</label>
                        <input
                            id="permission-resource"
                            value={form.resource}
                            onChange={(event) => update('resource', event.target.value)}
                            disabled={initialPermission?.isSystem}
                            required
                            maxLength={64}
                            pattern="[A-Za-z][A-Za-z0-9_-]*"
                            placeholder={t('rbacPermissionResourcePlaceholder')}
                            className={`${inputClass} ${initialPermission?.isSystem ? 'cursor-not-allowed opacity-60' : ''}`}
                        />
                    </div>
                    <div>
                        <label htmlFor="permission-action" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{t('rbacAction')}</label>
                        <input
                            id="permission-action"
                            value={form.action}
                            onChange={(event) => update('action', event.target.value)}
                            disabled={initialPermission?.isSystem}
                            required
                            maxLength={64}
                            pattern="[A-Za-z][A-Za-z0-9_-]*"
                            placeholder={t('rbacPermissionActionPlaceholder')}
                            className={`${inputClass} ${initialPermission?.isSystem ? 'cursor-not-allowed opacity-60' : ''}`}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="permission-key" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{t('rbacPermissionKey')}</label>
                        <input id="permission-key" value={key} readOnly aria-readonly="true" className={`${inputClass} font-mono`} />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="permission-category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{t('rbacCategory')}</label>
                        <input
                            id="permission-category"
                            value={form.category}
                            onChange={(event) => update('category', event.target.value)}
                            required
                            maxLength={80}
                            placeholder={t('rbacPermissionCategoryPlaceholder')}
                            className={inputClass}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="permission-description" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-marquee-muted">{t('rbacPermissionDescription')}</label>
                        <textarea
                            id="permission-description"
                            value={form.description}
                            onChange={(event) => update('description', event.target.value)}
                            required
                            maxLength={500}
                            rows={3}
                            placeholder={t('rbacPermissionDescriptionPlaceholder')}
                            className={`${inputClass} resize-y`}
                        />
                    </div>
                </div>
                {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
                <div className="flex justify-end gap-3 border-t border-marquee-line pt-4">
                    <button type="button" onClick={close} disabled={isSaving} className="rounded-lg border border-marquee-line px-4 py-2 text-sm text-marquee-muted hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50">{t('rbacCancel')}</button>
                    <button type="submit" disabled={isSaving} className="rounded-lg bg-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-bg disabled:opacity-50">{isSaving ? t('rbacSaving') : t(isEditing ? 'rbacUpdatePermissionAction' : 'rbacCreatePermissionAction')}</button>
                </div>
            </form>
        </Modal>
    );
}
