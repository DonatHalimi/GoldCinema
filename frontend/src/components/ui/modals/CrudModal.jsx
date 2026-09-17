import { useEffect, useState } from 'react';
import Modal from './Modal';

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
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setFormData({
                ...initialData,
                releaseDate: initialData.releaseDate
                    ? new Date(initialData.releaseDate)
                        .toISOString()
                        .split('T')[0]
                    : '',
                genres: Array.isArray(initialData.genres)
                    ? initialData.genres.join(', ')
                    : initialData.genres || '',
            });

            return;
        }

        fields.forEach((field) => {
            let defaultValue = field.defaultValue;

            if (defaultValue === undefined) {
                if (field.type === 'checkbox') {
                    defaultValue = false;
                } else if (field.type === 'select') {
                    defaultValue = field.options?.[0] ?? '';
                } else {
                    defaultValue = '';
                }
            }

            setFormData((previous) =>
                field.name.includes('.')
                    ? setNestedValue(previous, field.name, defaultValue)
                    : {
                        ...previous,
                        [field.name]: defaultValue,
                    }
            );
        });
    }, [initialData, fields, isOpen]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        const finalValue = type === 'checkbox' ? checked : value;

        setFormData((previous) =>
            name.includes('.')
                ? setNestedValue(previous, name, finalValue)
                : {
                    ...previous,
                    [name]: finalValue,
                }
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();

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

        onSubmit(data);
    };

    const renderField = (field) => {
        const commonClassName =
            'w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold';

        const fieldValue = getNestedValue(formData, field.name);

        if (field.type === 'textarea') {
            return (
                <textarea
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
                    name={field.name}
                    value={fieldValue ?? ''}
                    onChange={handleChange}
                    required={field.required}
                    className={commonClassName}
                >
                    {field.options?.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            );
        }

        if (field.type === 'checkbox') {
            return (
                <label className="flex h-[42px] cursor-pointer items-center gap-3 rounded-md border border-marquee-line bg-marquee-panel2 px-4">
                    <input
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
                type={field.type || 'text'}
                name={field.name}
                value={fieldValue ?? ''}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step}
                className={commonClassName}
            />
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            width={width}
        >
            <form
                onSubmit={handleSubmit}
                className="mt-5 max-h-[75vh] overflow-y-auto pr-2"
            >
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {fields.map((field) => {
                        const span =
                            field.span === 1
                                ? 'col-span-1'
                                : 'col-span-2';

                        return (
                            <div
                                key={field.name}
                                className={span}
                            >
                                <div className="mb-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                        {field.label}

                                        {field.required && (
                                            <span className="ml-1 text-marquee-gold">
                                                *
                                            </span>
                                        )}
                                    </label>
                                </div>

                                {renderField(field)}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-marquee-line pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition hover:border-marquee-gold"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="rounded-md bg-marquee-gold px-5 py-2 text-sm font-semibold text-zinc-950 shadow-md shadow-marquee-gold/50 transition-all hover:bg-marquee-goldBright"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
}