import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { Save } from 'lucide-react';
import MarqueeSelect from '../MarqueeSelect';
import { useTranslation } from 'react-i18next';

const getNestedValue = (obj, path) => {
    return path.split('.').reduce((value, key) => value?.[key], obj);
};

const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const result = { ...obj };

    let cursor = result;

    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            cursor[key] = value;
        } else {
            cursor[key] = { ...(cursor[key] || {}) };
            cursor = cursor[key];
        }
    });

    return result;
};

export default function CrudModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    fields,
    title,
    width = 'max-w-4xl',
}) {
    const { t } = useTranslation('dashboard');
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const fieldsRef = useRef(fields);
    fieldsRef.current = fields;

    useEffect(() => {
        if (!isOpen) return;
        setSubmitError(null);
        const activeFields = fieldsRef.current;

        if (initialData) {
            const initialFormData = {
                ...initialData,
                releaseDate: initialData.releaseDate
                    ? new Date(initialData.releaseDate).toISOString().split('T')[0]
                    : '',
                genres: Array.isArray(initialData.genres)
                    ? initialData.genres.join(', ')
                    : initialData.genres || '',
            };

            activeFields.filter((field) => ['multiselect', 'role-cards'].includes(field.type)).forEach((field) => {
                const initialValue = getNestedValue(initialData, field.name);

                initialFormData[field.name] = Array.isArray(initialValue)
                    ? initialValue.map((item) =>
                        typeof item === 'object' ? item.name : item
                    ).filter(Boolean)
                    : [];
            });

            activeFields
                .filter((field) =>
                    field.defaultValue !== undefined &&
                    getNestedValue(initialData, field.name) === undefined
                )
                .forEach((field) => {
                    initialFormData[field.name] = field.defaultValue;
                });

            setFormData(initialFormData);
            return;
        }

        const initialFormData = {};

        activeFields.forEach((field) => {
            let defaultValue = field.defaultValue;

            if (defaultValue === undefined) {
                if (field.type === 'checkbox') {
                    defaultValue = false;
                } else {
                    defaultValue = '';
                }
            }

            if (field.name.includes('.')) {
                Object.assign(
                    initialFormData,
                    setNestedValue(initialFormData, field.name, defaultValue)
                );
            } else {
                initialFormData[field.name] = defaultValue;
            }
        });

        setFormData(initialFormData);
    }, [initialData, isOpen]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setSubmitError(null);

        setFormData((previous) =>
            name.includes('.')
                ? setNestedValue(previous, name, finalValue)
                : {
                    ...previous,
                    [name]: finalValue,
                }
        );
    };

    const handleFieldChange = (name, value) => {
        setSubmitError(null);
        setFormData((previous) =>
            name.includes('.')
                ? setNestedValue(previous, name, value)
                : {
                    ...previous,
                    [name]: value,
                }
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        const data = {
            ...formData,
            genres:
                typeof formData.genres === 'string'
                    ? formData.genres
                        .split(',')
                        .map((genre) => genre.trim())
                        .filter(Boolean)
                    : formData.genres,
        };

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await onSubmit(data);
        } catch (error) {
            setSubmitError({
                    message: error?.response?.data?.error || error?.message || t('errors.failedSave', { label: '' }),
                    details: Array.isArray(error?.response?.data?.details) ? error.response.data.details : [],
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field) => {
        const commonClassName =
            'w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold';

        const fieldValue = getNestedValue(formData, field.name);

        if (field.type === 'textarea') {
            return (
                <textarea
                    id={`crud-${field.name}`}
                    name={field.name}
                    value={fieldValue ?? ''}
                    onChange={handleChange}
                    rows={4}
                    required={field.required}
                    placeholder={field.placeholder}
                    className={`${commonClassName} resize-y`}
                />
            );
        }

        if (field.type === 'select') {
            return (
                <select
                    id={`crud-${field.name}`}
                    name={field.name}
                    value={fieldValue ?? ''}
                    onChange={handleChange}
                    required={field.required}
                    disabled={field.disabled}
                    className={commonClassName}
                >
                    {field.options?.map((option) => {
                        const isObject = typeof option === 'object' && option !== null;
                        const value = isObject ? option.value : option;
                        const label = isObject ? option.label : option;

                        return (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        );
                    })}
                </select>
            );
        }

        if (field.type === 'marquee-select') {
            return (
                <MarqueeSelect
                    id={`crud-${field.name}`}
                    value={fieldValue ?? ''}
                    options={field.options || []}
                    onChange={(value) => handleFieldChange(field.name, value)}
                    disabled={field.disabled}
                    maxWidth="max-w-full"
                />
            );
        }

        if (field.type === 'multiselect') {
            return (
                <MarqueeSelect
                    id={`crud-${field.name}`}
                    value={Array.isArray(fieldValue) ? fieldValue : []}
                    options={field.options || []}
                    onChange={(value) => handleFieldChange(field.name, value)}
                    multiple
                    selectAll
                    disabled={field.disabled}
                    maxWidth="max-w-full"
                />
            );
        }

        if (field.type === 'role-cards') {
            const selected = Array.isArray(fieldValue) ? fieldValue : [];
            return (
                <div role="group" aria-labelledby={`crud-${field.name}-label`} className="space-y-3">
                    {field.helpText && <p className="text-xs leading-5 text-marquee-muted">{field.helpText}</p>}
                    <div className="grid gap-3 sm:grid-cols-2">
                        {(field.options || []).map((option) => {
                            const checked = selected.includes(option.value);
                            const disabled = field.disabled || option.disabled;
                            const inputId = `crud-${field.name}-${option.value}`;
                            return (
                                <label
                                    key={option.value}
                                    htmlFor={inputId}
                                    className={`flex gap-3 rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-marquee-gold/30 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${checked ? 'border-marquee-gold/60 bg-marquee-gold/10' : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold/40'}`}
                                >
                                    <input
                                        id={inputId}
                                        type="checkbox"
                                        checked={checked}
                                        disabled={disabled}
                                        onChange={() => handleFieldChange(
                                            field.name,
                                            checked
                                                ? selected.filter((value) => value !== option.value)
                                                : [...selected, option.value]
                                        )}
                                        className="mt-1 h-4 w-4 shrink-0 accent-marquee-gold"
                                    />
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-2 text-sm font-semibold text-marquee-cream">
                                            {option.label}
                                            {option.isProtected && <span className="rounded-full border border-marquee-gold/30 px-2 py-0.5 text-[9px] uppercase tracking-wide text-marquee-gold">{t('rbacProtected')}</span>}
                                        </span>
                                        <span className="mt-1 block text-xs leading-5 text-marquee-muted">{option.description || t('roleDescriptionUnavailable')}</span>
                                        {disabled && option.disabledReason && <span className="mt-1 block text-xs text-amber-400">{option.disabledReason}</span>}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (field.type === 'checkbox') {
            return (
                <label className="flex h-[42px] cursor-pointer items-center gap-3 rounded-md border border-marquee-line bg-marquee-panel2 px-4">
                    <input
                        id={`crud-${field.name}`}
                        type="checkbox"
                        name={field.name}
                        checked={Boolean(fieldValue)}
                        onChange={handleChange}
                        className="h-4 w-4 accent-marquee-gold"
                    />

                    <span className="text-sm text-marquee-cream">
                        {field.checkboxLabel || field.label}
                    </span>
                </label>
            );
        }

        return (
            <input
                id={`crud-${field.name}`}
                type={field.type || 'text'}
                name={field.name}
                value={fieldValue ?? ''}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                minLength={field.minLength}
                maxLength={field.maxLength}
                step={field.step}
                disabled={field.disabled}
                className={commonClassName}
            />
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            closeDisabled={isSubmitting}
            title={title}
            width={width}
            className="max-h-[90vh] overflow-y-auto"
        >
            <form onSubmit={handleSubmit} className="mt-5 pr-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {fields.filter((field) => !field.visibleWhen || field.visibleWhen(formData)).map((field) => {
                        const span = field.span === 1 ? 'col-span-1' : 'col-span-2';

                        return (
                            <div key={field.name} className={span}>
                                <div className="mb-1.5">
                                    {['role-cards', 'checkbox'].includes(field.type) ? (
                                        <span id={`crud-${field.name}-label`} className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                            {field.label}
                                            {field.required && <span className="ml-1 text-marquee-gold">*</span>}
                                        </span>
                                    ) : (
                                        <label htmlFor={`crud-${field.name}`} className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                            {field.label}

                                            {field.required && (
                                                <span className="ml-1 text-marquee-gold">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                    )}
                                </div>

                                {renderField(field)}
                            </div>
                        );
                    })}
                </div>

                {submitError && (
                    <div role="alert" className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <p>{submitError.message}</p>
                        {submitError.details.length > 0 && (
                            <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                                {submitError.details.map((detail, index) => <li key={`${detail.path || 'error'}-${index}`}>{detail.path ? `${detail.path}: ` : ''}{detail.message}</li>)}
                            </ul>
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3 border-t border-marquee-line pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {t('rbacCancel')}
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex min-w-[118px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-marquee-gold/30 bg-marquee-panel2 px-5 py-2 text-xs font-semibold text-marquee-gold transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Save size={16} />
                        {isSubmitting ? t('savingForm') : t('rbacSaveChanges')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}