import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Plus, ChevronLeft, ChevronRight, Trash, Check } from 'lucide-react';
import { getItems, createItem, updateItem, deleteItem, bulkDeleteItems } from '../../api/client';
import CrudModal from '../ui/CrudModal';
import DeleteConfirmModal from '../ui/DeleteConfirmModal';

export default function ModuleDataGrid({ moduleConfig }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [selectedIds, setSelectedIds] = useState([]);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && deleteTarget && !deleting) {
                setDeleteTarget(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteTarget, deleting]);

    const fetchModuleData = async () => {
        setLoading(true);
        try {
            const res = await getItems(moduleConfig.key, page, 10);
            setData(res.data || []);
            setTotalPages(res.pages || 1);
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
            alert(`Error fetching ${moduleConfig.label}: ` + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModuleData();
    }, [moduleConfig.key, page]);

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map((item) => item._id));
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);

        try {
            if (Array.isArray(deleteTarget)) {
                await bulkDeleteItems(moduleConfig.key, deleteTarget);
            } else {
                await deleteItem(moduleConfig.key, deleteTarget);
            }
            setDeleteTarget(null);
            setSelectedIds([]);
            fetchModuleData();
        } catch (err) {
            alert('Failed to delete item(s): ' + (err.response?.data?.message || err.message));
        } finally {
            setDeleting(false);
        }
    };

    const fields = moduleConfig?.fields || [];
    const isAllSelected = data.length > 0 && selectedIds.length === data.length;
    const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

    return (
        <div className="flex-1 p-8 bg-marquee-bg text-zinc-100 min-h-screen">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
                <div>
                    <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">
                        {moduleConfig.label}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                        Manage your movie platform's {moduleConfig.label.toLowerCase()} settings and records.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setDeleteTarget(selectedIds)}
                            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)] transition-all"
                        >
                            <Trash className="h-4 w-4" /> Delete Selected ({selectedIds.length})
                        </button>
                    )}

                    <button onClick={handleCreate} className="flex items-center gap-2 rounded-lg bg-marquee-gold hover:bg-marquee-goldBright px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" /> Add {moduleConfig.label}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-zinc-500">
                    <p className="animate-pulse text-sm">Loading {moduleConfig.label} records...</p>
                </div>
            ) : (
                <div className="rounded-xl border border-zinc-800 bg-[#0b0b0b]/95 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-200">
                            <thead className="bg-black/60 border-b border-zinc-800 uppercase text-[11px] font-semibold text-marquee-cream tracking-wider">
                                <tr>
                                    <th className="px-4 py-4 w-12 text-center">
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            aria-label="Select all rows"
                                            className={`inline-flex h-4 w-4 items-center justify-center rounded border transition-all ${isAllSelected
                                                ? 'bg-marquee-gold border-marquee-gold text-zinc-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                                : isSomeSelected
                                                    ? 'bg-amber-500/20 border-marquee-goldBright text-marquee-gold'
                                                    : 'border-amber-500/30 bg-black/30 hover:border-amber-400'
                                                }`}
                                        >
                                            {isAllSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                            {isSomeSelected && (
                                                <span className="h-1.5 w-1.5 rounded-sm bg-marquee-gold"></span>
                                            )}
                                        </button>
                                    </th>

                                    <th className="px-6 py-4">ID</th>

                                    {fields.map((col) => (
                                        <th key={col.name} className="px-6 py-4">
                                            {col.label}
                                        </th>
                                    ))}

                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-800">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={fields.length + 3} className="px-6 py-8 text-center text-zinc-500"
                                        >
                                            No {moduleConfig.label.toLowerCase()} found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((row) => {
                                        const isSelected = selectedIds.includes(row._id);

                                        return (
                                            <tr
                                                key={row._id}
                                                className={`transition-colors ${isSelected
                                                    ? 'bg-amber-500/10 hover:bg-amber-500/15'
                                                    : 'hover:bg-zinc-800/50'
                                                    }`}
                                            >
                                                <td className="px-4 py-4 w-12 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectRow(row._id)}
                                                        aria-label={`Select row ${row._id}`}
                                                        className={`inline-flex h-4 w-4 items-center justify-center rounded border transition-all ${isSelected
                                                            ? 'bg-marquee-gold border-marquee-gold text-zinc-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                                            : 'border-marquee-goldBright bg-black/30 hover:border-marquee-gold'
                                                            }`}
                                                    >
                                                        {isSelected && (
                                                            <Check className="h-3 w-3 stroke-[3]" />
                                                        )}
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4 font-mono text-xs text-marquee-muted">
                                                    {row._id}
                                                </td>

                                                {fields.map((col) => (
                                                    <td key={col.name} className="px-6 py-4 text-zinc-100">
                                                        {col.format
                                                            ? col.format(row[col.name])
                                                            : String(row[col.name] ?? '-')}
                                                    </td>
                                                ))}

                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        title="Edit"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-marquee-gold bg-marquee-gold/10 text-marquee-gold hover:bg-marquee-gold/20 hover:border-marquee-gold transition-all"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setDeleteTarget(row._id)}
                                                        title="Delete"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-marquee-line bg-[#0d0c0a]/90 px-6 py-4 text-xs text-zinc-400">
                        <span>
                            Page <strong className="text-marquee-gold">{page}</strong> of{' '}
                            <strong className="text-marquee-gold">{totalPages}</strong>
                        </span>

                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="flex items-center gap-1 rounded-lg border border-marquee-gold bg-black/20 px-3 py-1.5 text-zinc-300 hover:bg-marquee-gold hover:border-marquee-gold disabled:opacity-40 transition-all"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Previous
                            </button>

                            <button
                                disabled={page === totalPages || totalPages === 0}
                                onClick={() => setPage((p) => p + 1)}
                                className="flex items-center gap-1 rounded-lg border border-marquee-gold bg-black/20 px-3 py-1.5 text-zinc-300 hover:bg-marquee-gold hover:border-marquee-gold disabled:opacity-40 transition-all"
                            >
                                Next
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div >
            )
            }

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={() => fetchModuleData()}
                initialData={selectedItem}
                fields={fields}
                title={`${selectedItem ? 'Edit' : 'Create'} ${moduleConfig.label}`}
            />

            <DeleteConfirmModal
                deleteTarget={deleteTarget}
                label={moduleConfig.label}
                deleting={deleting}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}