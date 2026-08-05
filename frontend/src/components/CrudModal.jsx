import React, { useState, useEffect, useRef } from 'react';

export default function CrudModal({ isOpen, onClose, onSubmit, initialData, fields, title }) {
    const [formData, setFormData] = useState({});
    const modalRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            const defaultData = {};
            fields.forEach((field) => {
                defaultData[field.name] = field.defaultValue || (field.options ? field.options[0] : '');
            });
            setFormData(defaultData);
        }
    }, [initialData, fields, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) modalRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({});
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div onClick={onClose} ref={modalRef} tabIndex="-1" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-xl border border-marquee-line bg-zinc-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-marquee-line/50">
                    <h2 className="font-display text-2xl text-marquee-goldBright">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {fields.map((field) => (
                        <div key={field.name} className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                {field.label}
                            </label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold"
                                />
                            ) : (
                                <input
                                    type={field.type || 'text'}
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold"
                                />
                            )}
                        </div>
                    ))}

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-marquee-line">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#fff', padding: '24px', borderRadius: '8px', width: '450px', maxHeight: '80vh', overflowY: 'auto' },
    input: { width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' },
    saveBtn: { background: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
    cancelBtn: { background: '#6c757d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }
};