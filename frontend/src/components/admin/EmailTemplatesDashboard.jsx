import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Code2, Eye, Pencil, Plus, RotateCcw, Save, Search, Send, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { hasPermission } from '../../utils/permissions';
import {
    useCreateEmailTemplateMutation,
    useDeleteEmailTemplateMutation,
    useGetEmailTemplateQuery,
    useGetEmailTemplatesQuery,
    usePreviewEmailTemplateMutation,
    useResetEmailTemplateMutation,
    useSendEmailTemplateTestMutation,
    useUpdateEmailTemplateMutation,
} from '../../store/api/emailTemplatesApiSlice';
import Modal from '../ui/modals/Modal';
import ConfirmActionModal from '../ui/modals/ConfirmActionModal';
import { tableDeleteButtonClass } from '../../utils/adminTableStyles';

const blankTemplate = () => ({
    slug: '',
    name: '',
    description: '',
    subject: '',
    htmlBody: '<html><body>\n  \n</body></html>',
    textBody: '',
    variables: [],
    isActive: true,
});

const sampleVariables = (variables = []) => Object.fromEntries(
    variables.filter((variable) => variable.sampleValue !== undefined && variable.sampleValue !== '')
        .map((variable) => [variable.key, variable.sampleValue])
);

function getErrorMessage(error, fallback) {
    return error?.data?.error || error?.data?.message || fallback;
}

function templateIssues(template, t) {
    const source = `${template.subject || ''}\n${template.htmlBody || ''}\n${template.textBody || ''}`;
    const variableKeys = new Set((template.variables || []).map(({ key }) => key));
    const unsupported = [];
    for (const [, token] of source.matchAll(/\{\{([\s\S]*?)\}\}/g)) {
        const key = token.trim().replace(/^#if\s+/, '');
        if (key === '/if') continue;
        if (!variableKeys.has(key)) unsupported.push(key);
    }
    const errors = [...new Set(unsupported)].map((key) => t('emailTemplateUnsupportedPlaceholder', { key }));
    if (!template.isSystem) {
        (template.variables || []).forEach((variable) => {
            if (variable.required && !String(variable.sampleValue || '').trim()) {
                errors.push(t('emailTemplateMissingSample', { key: variable.key || t('emailTemplateVariableKey') }));
            }
        });
    }
    return errors;
}

export default function EmailTemplatesDashboard() {
    const { t } = useTranslation('dashboard');
    const { user } = useAuth();
    const { permissions } = usePermissions();
    const canCreate = hasPermission(permissions, 'email-templates:create');
    const canUpdate = hasPermission(permissions, 'email-templates:update');
    const canDelete = hasPermission(permissions, 'email-templates:delete') ||
        ['admin', 'super_admin'].includes(permissions?.activeRole?.name);
    const canPreview = hasPermission(permissions, 'email-templates:preview');
    const canReset = hasPermission(permissions, 'email-templates:reset');
    const canTest = hasPermission(permissions, 'email-templates:test');
    const { data, isLoading, isError, refetch } = useGetEmailTemplatesQuery();
    const [createTemplate, createState] = useCreateEmailTemplateMutation();
    const [updateTemplate, updateState] = useUpdateEmailTemplateMutation();
    const [deleteTemplate, deleteState] = useDeleteEmailTemplateMutation();
    const [previewTemplate, previewState] = usePreviewEmailTemplateMutation();
    const [resetTemplate, resetState] = useResetEmailTemplateMutation();
    const [sendTest, testState] = useSendEmailTemplateTestMutation();
    const [selectedIdentifier, setSelectedIdentifier] = useState('');
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [showRemoved, setShowRemoved] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState('edit');
    const [draft, setDraft] = useState(blankTemplate);
    const [savedDraft, setSavedDraft] = useState(null);
    const [preview, setPreview] = useState(null);
    const [testRecipient, setTestRecipient] = useState(user?.email || '');
    const [confirmation, setConfirmation] = useState(null);
    const htmlRef = useRef(null);
    const templates = useMemo(() => data?.data || [], [data]);
    const hasRemovedTemplates = templates.some((template) => template.isDeleted);
    const filteredTemplates = useMemo(() => {
        const term = search.trim().toLowerCase();
        return templates.filter((template) => {
            if (template.isDeleted && !showRemoved) return false;
            return !term ||
                [template.name, template.slug, template.description, template.isDeleted ? t('emailTemplateRemoved') : template.isActive ? t('emailTemplateEnabled') : t('emailTemplateDisabled')]
                    .some((value) => String(value || '').toLowerCase().includes(term));
        });
    }, [search, showRemoved, t, templates]);
    const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / 10));
    const currentPage = Math.min(page, totalPages);
    const pageTemplates = filteredTemplates.slice((currentPage - 1) * 10, currentPage * 10);
    const {
        currentData: selectedResponse,
        isFetching: isTemplateLoading,
        isError: isTemplateError,
        refetch: refetchTemplate,
    } = useGetEmailTemplateQuery(
        selectedIdentifier,
        { skip: !selectedIdentifier }
    );
    const selectedTemplate = selectedResponse?.data;
    const dirty = useMemo(
        () => savedDraft !== null && JSON.stringify(draft) !== JSON.stringify(savedDraft),
        [draft, savedDraft]
    );
    const issues = useMemo(() => templateIssues(draft, t), [draft, t]);
    const isSaving = createState.isLoading || updateState.isLoading;
    const isBusy = isSaving || previewState.isLoading || resetState.isLoading || testState.isLoading || deleteState.isLoading;
    const readOnly = editorMode === 'edit' && !canUpdate;

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    useEffect(() => {
        if (!editorOpen || editorMode !== 'edit' || !selectedTemplate) return;
        setDraft(selectedTemplate);
        setSavedDraft(selectedTemplate);
        setPreview(null);
    }, [editorOpen, editorMode, selectedTemplate]);

    useEffect(() => {
        const firstAvailableTemplate = templates.find((template) => !template.isDeleted);
        if (!editorOpen && editorMode !== 'create' && !selectedIdentifier && firstAvailableTemplate) {
            setSelectedIdentifier(firstAvailableTemplate.slug);
        }
    }, [editorMode, editorOpen, selectedIdentifier, templates]);

    useEffect(() => {
        if (user?.email && !testRecipient) setTestRecipient(user.email);
    }, [user?.email, testRecipient]);

    const dismissEditor = () => {
        setEditorOpen(false);
        setPreview(null);
    };

    const closeEditor = () => {
        if (dirty) {
            setConfirmation({ type: 'discard' });
            return;
        }
        dismissEditor();
    };

    const openCreate = () => {
        const empty = blankTemplate();
        setSelectedIdentifier('');
        setEditorMode('create');
        setDraft(empty);
        setSavedDraft(empty);
        setPreview(null);
        setEditorOpen(true);
    };

    const openEdit = (template) => {
        setSelectedIdentifier(template.slug);
        setEditorMode('edit');
        setSavedDraft(null);
        setEditorOpen(true);
        setPreview(null);
    };

    const changeDraft = (field, value) => {
        setDraft((current) => ({ ...current, [field]: value }));
        setPreview(null);
    };

    const insertPlaceholder = (key) => {
        const input = htmlRef.current;
        if (!input) return;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const insertion = `{{${key}}}`;
        const next = `${draft.htmlBody.slice(0, start)}${insertion}${draft.htmlBody.slice(end)}`;
        changeDraft('htmlBody', next);
        requestAnimationFrame(() => {
            input.focus();
            input.setSelectionRange(start + insertion.length, start + insertion.length);
        });
    };

    const addVariable = () => changeDraft('variables', [
        ...draft.variables,
        { key: '', description: '', required: false, sampleValue: '', type: 'text' },
    ]);

    const changeVariable = (index, field, value) => changeDraft('variables', draft.variables.map((variable, currentIndex) =>
        currentIndex === index ? { ...variable, [field]: value } : variable
    ));

    const removeVariable = (index) => changeDraft('variables', draft.variables.filter((_, currentIndex) => currentIndex !== index));

    const saveDraft = async (event) => {
        event.preventDefault();
        if (issues.length || (editorMode === 'create' ? !canCreate : !canUpdate || !selectedTemplate)) return;
        try {
            if (editorMode === 'create') {
                const result = await createTemplate(draft).unwrap();
                const template = result.data;
                setSelectedIdentifier(template.slug);
                setEditorMode('edit');
                setDraft(template);
                setSavedDraft(template);
                toast.success(t('emailTemplateCreated'));
            } else {
                const body = {
                    name: draft.name,
                    description: draft.description,
                    subject: draft.subject,
                    htmlBody: draft.htmlBody,
                    textBody: draft.textBody,
                    isActive: draft.isActive,
                };
                const result = await updateTemplate({ identifier: selectedIdentifier, ...body }).unwrap();
                setDraft(result.data);
                setSavedDraft(result.data);
                toast.success(t('emailTemplateSaved'));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t('emailTemplateSaveError')));
        }
    };

    const renderPreview = async () => {
        if (!selectedIdentifier || !selectedTemplate || issues.length) return;
        try {
            const result = await previewTemplate({
                identifier: selectedIdentifier,
                draft: {
                    subject: draft.subject,
                    htmlBody: draft.htmlBody,
                    textBody: draft.textBody,
                },
                variables: sampleVariables(draft.variables),
            }).unwrap();
            setPreview(result.data);
        } catch (error) {
            toast.error(getErrorMessage(error, t('emailTemplatePreviewError')));
        }
    };

    const resetToDefault = () => {
        if (selectedTemplate?.isSystem) setConfirmation({ type: 'reset' });
    };

    const requestDeleteTemplate = (template) => setConfirmation({ type: 'delete', template });

    const confirmAction = async () => {
        if (confirmation?.type === 'discard') {
            setConfirmation(null);
            dismissEditor();
            return;
        }
        if (confirmation?.type === 'reset' || confirmation?.type === 'restore') {
            const identifier = confirmation.template?.slug || selectedIdentifier;
            try {
                const result = await resetTemplate(identifier).unwrap();
                if (editorOpen && selectedIdentifier === identifier) {
                    setDraft(result.data);
                    setSavedDraft(result.data);
                    setPreview(null);
                }
                setConfirmation(null);
                toast.success(t(confirmation.type === 'restore' ? 'emailTemplateRestored' : 'emailTemplateReset'));
            } catch (error) {
                toast.error(getErrorMessage(error, t('emailTemplateResetError')));
            }
            return;
        }
        if (confirmation?.type === 'delete') {
            const { slug, isSystem } = confirmation.template;
            try {
                await deleteTemplate(slug).unwrap();
                if (selectedIdentifier === slug) setSelectedIdentifier('');
                setConfirmation(null);
                toast.success(t(isSystem ? 'emailTemplateRemovedSuccess' : 'emailTemplateDeleted'));
            } catch (error) {
                toast.error(getErrorMessage(error, t('emailTemplateDeleteError')));
            }
        }
    };

    const confirmationDetails = (() => {
        if (confirmation?.type === 'discard') {
            return {
            title: t('emailTemplateDiscardTitle'),
            message: t('emailTemplateDiscardConfirm'),
            confirmLabel: t('emailTemplateDiscardAction'),
            icon: AlertTriangle,
            };
        }
        if (confirmation?.type === 'reset') {
            return {
                title: t('emailTemplateResetTitle'),
                message: t('emailTemplateResetConfirm'),
                confirmLabel: t('emailTemplateResetToDefault'),
                icon: RotateCcw,
            };
        }
        if (confirmation?.type === 'delete') {
            return {
                title: t(confirmation.template.isSystem ? 'emailTemplateDeleteSystemTitle' : 'emailTemplateDeleteTitle'),
                message: t(
                    confirmation.template.isSystem ? 'emailTemplateDeleteSystemConfirm' : 'emailTemplateDeleteConfirm',
                    { name: confirmation.template.name }
                ),
                confirmLabel: t('emailTemplateDelete'),
                icon: Trash2,
            };
        }
        if (confirmation?.type === 'restore') {
            return {
                title: t('emailTemplateRestoreTitle'),
                message: t('emailTemplateRestoreConfirm', { name: confirmation.template.name }),
                confirmLabel: t('emailTemplateRestore'),
                icon: RotateCcw,
            };
        }
        return null;
    })();

    const sendTestEmail = async () => {
        if (!selectedIdentifier || !selectedTemplate || dirty || !testRecipient) return;
        try {
            await sendTest({
                identifier: selectedIdentifier,
                to: testRecipient,
                variables: sampleVariables(draft.variables),
            }).unwrap();
            toast.success(t('emailTemplateTestSent'));
        } catch (error) {
            toast.error(getErrorMessage(error, t('emailTemplateTestError')));
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-marquee-bg px-4 pb-12 pt-6 text-marquee-cream sm:px-6 lg:px-10">
            <div className="mb-6 rounded-2xl border border-marquee-line bg-marquee-panel/95 p-5 shadow-xl sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">{t('emailTemplatesTitle')}</h2>
                        <p className="mt-1 text-xs text-marquee-muted">{t('emailTemplatesDescription')}</p>
                    </div>
                    {canCreate && (
                        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg border border-marquee-gold bg-marquee-panel2 px-5 py-3 text-sm font-semibold text-marquee-gold hover:bg-marquee-gold/10">
                            <Plus size={16} /> {t('emailTemplateCreate')}
                        </button>
                    )}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="relative w-full max-w-xl flex-1">
                        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-marquee-muted" />
                        <input
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder={t('emailTemplatesSearch')}
                            aria-label={t('emailTemplatesSearch')}
                            className="w-full rounded-xl border border-marquee-line bg-marquee-panel2 py-2.5 pl-10 pr-4 text-sm text-marquee-cream outline-none focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20"
                        />
                    </div>
                    {hasRemovedTemplates && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowRemoved((current) => !current);
                                setPage(1);
                            }}
                            className="rounded-lg border border-marquee-line px-3 py-2.5 text-xs text-marquee-cream transition hover:border-marquee-gold"
                        >
                            {t(showRemoved ? 'emailTemplatesHideRemoved' : 'emailTemplatesShowRemoved')}
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 text-center text-sm text-marquee-muted">{t('emailTemplatesLoading')}</div>
            ) : isError ? (
                <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                    <span>{t('emailTemplatesLoadError')}</span>
                    <button type="button" onClick={refetch} className="ml-3 underline">{t('emailTemplateRetry')}</button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-marquee-cream">
                            <thead className="border-b border-marquee-line bg-marquee-panel2 text-[11px] font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">{t('emailTemplateName')}</th>
                                    <th className="px-4 py-4">{t('emailTemplateKey')}</th>
                                    <th className="px-4 py-4">{t('emailTemplateStatus')}</th>
                                    <th className="px-4 py-4">{t('emailTemplateUpdated')}</th>
                                    <th className="px-6 py-4 text-right">{t('emailTemplateActions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-marquee-line">
                                {pageTemplates.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-marquee-muted">
                                            {search ? t('emailTemplatesNoSearchResults') : t('emailTemplatesEmpty')}
                                        </td>
                                    </tr>
                                ) : pageTemplates.map((template) => (
                                    <tr key={template.slug} className="transition-colors hover:bg-marquee-panel2">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-marquee-goldBright">{template.name}</div>
                                            <div className="mt-1 max-w-md text-xs text-marquee-muted">{template.description || '—'}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-marquee-muted">{template.slug}</td>
                                        <td className="px-4 py-4">
                                            <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide ${template.isDeleted ? 'border-red-500/30 bg-red-500/10 text-red-300' : template.isActive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-marquee-line bg-marquee-panel2 text-marquee-muted'}`}>
                                                {template.isDeleted ? t('emailTemplateRemoved') : template.isActive ? t('emailTemplateEnabled') : t('emailTemplateDisabled')}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-xs text-marquee-muted">{template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : '—'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                            {!template.isDeleted ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(template)}
                                                        title={canUpdate ? t('emailTemplateEdit') : t('emailTemplateView')}
                                                        aria-label={canUpdate ? t('emailTemplateEdit') : t('emailTemplateView')}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-marquee-gold/40 text-marquee-gold hover:bg-marquee-gold/10"
                                                    >
                                                        {canUpdate ? <Pencil size={15} /> : <Eye size={15} />}
                                                    </button>
                                                    {canDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => requestDeleteTemplate(template)}
                                                    title={t('emailTemplateDelete')}
                                                    aria-label={t('emailTemplateDelete')}
                                                    disabled={deleteState.isLoading}
                                                    className={tableDeleteButtonClass}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                                    )}
                                                </>
                                            ) : canReset && (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmation({ type: 'restore', template })}
                                                    title={t('emailTemplateRestore')}
                                                    aria-label={t('emailTemplateRestore')}
                                                    disabled={resetState.isLoading}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-marquee-gold/40 text-marquee-gold hover:bg-marquee-gold/10 disabled:opacity-50"
                                                >
                                                    <RotateCcw size={15} />
                                                </button>
                                            )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t border-marquee-line px-6 py-4">
                        <button type="button" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-marquee-line px-3 py-1.5 text-xs disabled:opacity-40">{t('emailTemplatePrevious')}</button>
                        <span className="text-xs text-marquee-muted">{t('emailTemplatePageOf', { page: currentPage, pages: totalPages })}</span>
                        <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-lg border border-marquee-line px-3 py-1.5 text-xs disabled:opacity-40">{t('emailTemplateNext')}</button>
                    </div>
                </div>
            )}

            <Modal
                isOpen={editorOpen}
                onClose={closeEditor}
                closeDisabled={isBusy}
                title={editorMode === 'create' ? t('emailTemplateCreate') : t('emailTemplateEdit')}
                width="max-w-6xl"
                className="p-0"
            >
                <form onSubmit={saveDraft} className="flex max-h-[85vh] flex-col">
                    <div className="space-y-5 overflow-y-auto px-6 py-5">
                        {editorMode === 'edit' && (isTemplateLoading || !selectedTemplate) ? (
                            isTemplateError ? (
                                <div className="flex flex-wrap items-center justify-center gap-3 py-12 text-sm text-red-400">
                                    <span>{t('emailTemplateDetailError')}</span>
                                    <button type="button" onClick={refetchTemplate} className="underline">{t('emailTemplateRetry')}</button>
                                </div>
                            ) : <div className="py-12 text-center text-sm text-marquee-muted">{t('emailTemplatesLoading')}</div>
                        ) : (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {editorMode === 'create' && (
                                        <label className="block text-xs font-semibold text-marquee-muted">
                                            {t('emailTemplateKey')}
                                            <input required pattern="[a-z][a-z0-9_-]{1,63}" maxLength={64} value={draft.slug} onChange={(event) => changeDraft('slug', event.target.value.toLowerCase())} placeholder={t('emailTemplateKeyPlaceholder')} className="mt-1.5 w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 font-mono text-sm text-marquee-cream outline-none focus:border-marquee-gold" />
                                        </label>
                                    )}
                                    <label className="block text-xs font-semibold text-marquee-muted">
                                        {t('emailTemplateName')}
                                        <input required maxLength={120} disabled={readOnly} value={draft.name} onChange={(event) => changeDraft('name', event.target.value)} placeholder={t('emailTemplateNamePlaceholder')} className="mt-1.5 w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 text-sm text-marquee-cream outline-none focus:border-marquee-gold disabled:opacity-60" />
                                    </label>
                                    <label className="block text-xs font-semibold text-marquee-muted md:col-span-2">
                                        {t('emailTemplateDescription')}
                                        <input maxLength={500} disabled={readOnly} value={draft.description || ''} onChange={(event) => changeDraft('description', event.target.value)} placeholder={t('emailTemplateDescriptionPlaceholder')} className="mt-1.5 w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 text-sm text-marquee-cream outline-none focus:border-marquee-gold disabled:opacity-60" />
                                    </label>
                                    <label className="block text-xs font-semibold text-marquee-muted md:col-span-2">
                                        {t('emailTemplateSubject')}
                                        <input required maxLength={250} disabled={readOnly} value={draft.subject} onChange={(event) => changeDraft('subject', event.target.value)} placeholder={t('emailTemplateSubjectPlaceholder')} className="mt-1.5 w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 text-sm text-marquee-cream outline-none focus:border-marquee-gold disabled:opacity-60" />
                                    </label>
                                </div>

                                <div className="rounded-lg border border-marquee-line bg-marquee-panel2/60 p-4">
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <h3 className="text-sm font-semibold text-marquee-cream">{t('emailTemplateVariables')}</h3>
                                            <p className="mt-1 text-xs text-marquee-muted">{t('emailTemplateVariablesHelp')}</p>
                                        </div>
                                        {editorMode === 'create' && (
                                            <button type="button" onClick={addVariable} className="inline-flex items-center gap-1.5 rounded-md border border-marquee-line px-2.5 py-1.5 text-xs text-marquee-cream hover:border-marquee-gold">
                                                <Plus size={14} /> {t('emailTemplateAddVariable')}
                                            </button>
                                        )}
                                    </div>
                                    {draft.variables.length === 0 ? (
                                        <p className="text-xs text-marquee-muted">{t('emailTemplateNoVariables')}</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {draft.variables.map((variable, index) => (
                                                <div key={`${variable.key}-${index}`} className="grid gap-2 rounded-md border border-marquee-line/70 p-3 sm:grid-cols-[1fr_1.5fr_1.3fr_0.8fr_auto]">
                                                    {editorMode === 'create' ? (
                                                        <>
                                                            <input required aria-label={t('emailTemplateVariableKey')} placeholder={t('emailTemplateVariableKeyPlaceholder')} pattern="[a-z][A-Za-z0-9_]*" value={variable.key} onChange={(event) => changeVariable(index, 'key', event.target.value)} className="rounded-md border border-marquee-line bg-marquee-panel px-2.5 py-2 font-mono text-xs text-marquee-cream outline-none focus:border-marquee-gold" />
                                                            <input required aria-label={t('emailTemplateVariableDescription')} placeholder={t('emailTemplateVariableDescription')} value={variable.description} onChange={(event) => changeVariable(index, 'description', event.target.value)} className="rounded-md border border-marquee-line bg-marquee-panel px-2.5 py-2 text-xs text-marquee-cream outline-none focus:border-marquee-gold" />
                                                            <div className="flex items-center gap-2">
                                                                <input aria-label={t('emailTemplateSampleValue')} placeholder={t('emailTemplateSampleValue')} value={variable.sampleValue || ''} onChange={(event) => changeVariable(index, 'sampleValue', event.target.value)} className="min-w-0 flex-1 rounded-md border border-marquee-line bg-marquee-panel px-2.5 py-2 text-xs text-marquee-cream outline-none focus:border-marquee-gold" />
                                                                <label className="flex shrink-0 items-center gap-1 text-[11px] text-marquee-muted">
                                                                    <input type="checkbox" checked={Boolean(variable.required)} onChange={(event) => changeVariable(index, 'required', event.target.checked)} /> {t('emailTemplateRequired')}
                                                                </label>
                                                            </div>
                                                            <select aria-label={t('emailTemplateVariableType')} value={variable.type} onChange={(event) => changeVariable(index, 'type', event.target.value)} className="rounded-md border border-marquee-line bg-marquee-panel px-2 py-2 text-xs text-marquee-cream outline-none focus:border-marquee-gold">
                                                                {['text', 'url', 'html', 'number', 'boolean'].map((type) => <option key={type} value={type}>{type}</option>)}
                                                            </select>
                                                            <div className="flex items-center gap-1">
                                                                <button type="button" disabled={!/^[a-z][A-Za-z0-9_]*$/.test(variable.key)} onClick={() => insertPlaceholder(variable.key)} className="rounded-md px-2 py-1 text-xs text-marquee-cream hover:bg-marquee-panel2 disabled:opacity-40">{t('emailTemplateInsertPlaceholder')}</button>
                                                                <button type="button" onClick={() => removeVariable(index)} className="rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-500/10">{t('emailTemplateRemove')}</button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="sm:col-span-4">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <code className="rounded bg-marquee-bg px-2 py-1 text-xs text-marquee-goldBright">{`{{${variable.key}}}`}</code>
                                                                {variable.required && <span className="text-[10px] uppercase tracking-wide text-amber-400">{t('emailTemplateRequired')}</span>}
                                                                <span className="text-xs text-marquee-muted">{variable.description}</span>
                                                            </div>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                {variable.sampleValue && <span className="text-[11px] text-marquee-muted">{t('emailTemplateSampleValue')}: {variable.sampleValue}</span>}
                                                                <button type="button" onClick={() => insertPlaceholder(variable.key)} className="rounded-md border border-marquee-line px-2.5 py-1.5 text-xs text-marquee-cream hover:border-marquee-gold">
                                                                    {t('emailTemplateInsertPlaceholder')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <label className="block text-xs font-semibold text-marquee-muted">
                                    <span className="mb-1.5 flex items-center gap-2"><Code2 size={14} /> {t('emailTemplateHtml')}</span>
                                    <textarea ref={htmlRef} required rows={16} maxLength={100000} disabled={readOnly} value={draft.htmlBody} onChange={(event) => changeDraft('htmlBody', event.target.value)} placeholder={t('emailTemplateHtmlPlaceholder')} className="w-full rounded-lg border border-marquee-line bg-[#101014] p-3 font-mono text-xs leading-5 text-marquee-cream outline-none focus:border-marquee-gold disabled:opacity-60" />
                                </label>
                                <label className="block text-xs font-semibold text-marquee-muted">
                                    {t('emailTemplatePlainText')}
                                    <textarea rows={5} maxLength={50000} disabled={readOnly} value={draft.textBody || ''} onChange={(event) => changeDraft('textBody', event.target.value)} placeholder={t('emailTemplatePlainTextPlaceholder')} className="mt-1.5 w-full rounded-lg border border-marquee-line bg-marquee-panel2 p-3 font-mono text-xs leading-5 text-marquee-cream outline-none focus:border-marquee-gold disabled:opacity-60" />
                                </label>
                                {editorMode === 'edit' && (
                                    <label className="flex items-center gap-2 text-sm text-marquee-cream">
                                        <input type="checkbox" disabled={readOnly} checked={Boolean(draft.isActive)} onChange={(event) => changeDraft('isActive', event.target.checked)} />
                                        {t('emailTemplateEnabled')}
                                    </label>
                                )}
                                {issues.length > 0 && (
                                    <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                                        <strong>{t('emailTemplateValidation')}</strong>
                                        <ul className="mt-1 list-inside list-disc">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
                                    </div>
                                )}
                                {preview && (
                                    <section className="overflow-hidden rounded-lg border border-marquee-line">
                                        <div className="border-b border-marquee-line bg-marquee-panel2 p-3">
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-marquee-goldBright"><Eye size={14} /> {t('emailTemplatePreview')}</div>
                                            <p className="mt-2 text-sm text-marquee-cream"><span className="font-semibold">{t('emailTemplateSubject')}:</span> {preview.subject}</p>
                                            <p className="mt-1 text-[11px] text-marquee-muted">{t('emailTemplatePreviewWarning')}</p>
                                        </div>
                                        <iframe title={t('emailTemplatePreview')} sandbox="" srcDoc={`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: cid:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'"><body>${preview.html}</body>`} className="h-[420px] w-full bg-white" />
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-marquee-line bg-marquee-bg px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {canPreview && <button type="button" onClick={renderPreview} disabled={editorMode !== 'edit' || !selectedTemplate || isTemplateError || issues.length > 0 || isBusy || isTemplateLoading} className="inline-flex items-center gap-2 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-cream hover:border-marquee-gold disabled:opacity-50">
                                <Eye size={14} /> {previewState.isLoading ? t('emailTemplatePreviewing') : t('emailTemplatePreview')}
                            </button>}
                            {canReset && selectedTemplate?.isSystem && (
                                <button type="button" onClick={resetToDefault} disabled={isBusy} className="inline-flex items-center gap-2 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-cream hover:border-amber-400 disabled:opacity-50">
                                    <RotateCcw size={14} /> {t('emailTemplateResetToDefault')}
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {canTest && <input aria-label={t('emailTemplateTestRecipient')} type="email" value={testRecipient} onChange={(event) => setTestRecipient(event.target.value)} disabled={isBusy || dirty || editorMode === 'create'} placeholder={t('emailTemplateTestRecipient')} className="w-56 rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2 text-xs text-marquee-cream outline-none focus:border-marquee-gold disabled:opacity-60" />}
                            {canTest && <button type="button" onClick={sendTestEmail} disabled={isBusy || dirty || editorMode === 'create' || !selectedTemplate || isTemplateError || !testRecipient} className="inline-flex items-center gap-2 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-cream hover:border-marquee-gold disabled:opacity-50">
                                <Send size={14} /> {testState.isLoading ? t('emailTemplateSending') : t('emailTemplateSendTest')}
                            </button>}
                            <button type="button" onClick={closeEditor} disabled={isBusy} className="rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-cream hover:bg-marquee-panel2 disabled:opacity-50">{t('emailTemplateCancel')}</button>
                            {(editorMode === 'create' ? canCreate : canUpdate) && <button type="submit" disabled={isBusy || issues.length > 0 || (editorMode === 'edit' && !dirty)} className="inline-flex items-center gap-2 rounded-lg bg-marquee-gold px-3 py-2 text-xs font-semibold text-black hover:bg-marquee-goldBright disabled:opacity-50">
                                <Save size={14} /> {isSaving ? t('emailTemplateSavingForm') : t('emailTemplateSave')}
                            </button>}
                        </div>
                    </footer>
                </form>
            </Modal>
            <ConfirmActionModal
                isOpen={Boolean(confirmation)}
                title={confirmationDetails?.title}
                message={confirmationDetails?.message}
                confirmLabel={confirmationDetails?.confirmLabel}
                icon={confirmationDetails?.icon}
                onClose={() => {
                    if (!resetState.isLoading && !deleteState.isLoading) setConfirmation(null);
                }}
                onConfirm={confirmAction}
                isLoading={resetState.isLoading || deleteState.isLoading}
            />
        </div>
    );
}
