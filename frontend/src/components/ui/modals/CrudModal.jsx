import { useEffect, useState } from 'react';
import Modal from './Modal';

export default function CrudModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    fields,
    title,
}) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setFormData(initialData);
            return;
        }

        const defaultData = {};

        fields.forEach((field) => {
            defaultData[field.name] =
                field.defaultValue ??
                (field.options?.[0] ?? '');
        });

        setFormData(defaultData);
    }, [initialData, fields, isOpen]);

    const handleChange = (event) => {
        const { name, value, type, checked, } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <form onSubmit={handleSubmit} className="mt-5 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                {fields.map((field) => (
                    <div key={field.name} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            {field.label}
                        </label>

                        {field.type === 'textarea' ? (
                            <textarea
                                name={field.name}
                                value={
                                    formData[field.name] || ''
                                }
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold"
                            />
                        ) : (
                            <input
                                type={field.type || 'text'}
                                name={field.name}
                                value={
                                    formData[field.name] || ''
                                }
                                onChange={handleChange}
                                className="w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold"
                            />
                        )}
                    </div>
                ))}

                <div className="mt-6 flex justify-end gap-3 border-t border-marquee-line pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition hover:border-marquee-gold"
                    >
                        Cancel
                    </button>

                    <button type="submit" className="rounded-md bg-marquee-gold px-5 py-2 text-sm font-semibold text-zinc-950 shadow-md shadow-marquee-gold/50 transition-all hover:bg-marquee-goldBright">
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
}