import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Plus, ChevronLeft, ChevronRight, Trash, Check } from 'lucide-react';
import { getItems, createItem, updateItem, deleteItem, bulkDeleteItems } from '../api/client';
import CrudModal from './CrudModal';

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
                    <h1 className="font-display text-3xl font-bold text-amber-400 tracking-tight">
                        {moduleConfig.label}
                    </h1>
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

                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
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
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-300">
                            <thead className="bg-zinc-900/90 border-b border-zinc-800 uppercase text-[11px] font-semibold text-zinc-400 tracking-wider">
                                <tr>
                                    {/* Select All Custom Checkbox */}
                                    <th className="px-4 py-4 w-12 text-center">
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            aria-label="Select all rows"
                                            className={`inline-flex h-4 w-4 items-center justify-center rounded border transition-all ${isAllSelected
                                                    ? 'bg-amber-500 border-amber-500 text-zinc-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                                    : isSomeSelected
                                                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                                                        : 'border-zinc-700 bg-zinc-800/80 hover:border-zinc-500'
                                                }`}
                                        >
                                            {isAllSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                            {isSomeSelected && <span className="h-1.5 w-1.5 rounded-sm bg-amber-400"></span>}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4">ID</th>
                                    {fields.map((col) => (
                                        <th key={col.name} className="px-6 py-4">{col.label}</th>
                                    ))}
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/60">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={fields.length + 3} className="px-6 py-8 text-center text-zinc-500">
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
                                                        : 'hover:bg-zinc-800/40'
                                                    }`}
                                            >
                                                {/* Single Row Custom Checkbox */}
                                                <td className="px-4 py-4 w-12 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectRow(row._id)}
                                                        aria-label={`Select row ${row._id}`}
                                                        className={`inline-flex h-4 w-4 items-center justify-center rounded border transition-all ${isSelected
                                                                ? 'bg-amber-500 border-amber-500 text-zinc-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                                                : 'border-zinc-700 bg-zinc-800/80 hover:border-zinc-500'
                                                            }`}
                                                    >
                                                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-zinc-500">{row._id}</td>
                                                {fields.map((col) => (
                                                    <td key={col.name} className="px-6 py-4 text-zinc-200">
                                                        {String(row[col.name] ?? '-')}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        title="Edit"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
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

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/80 px-6 py-4 text-xs text-zinc-400">
                        <span>
                            Page <strong className="text-zinc-200">{page}</strong> of <strong className="text-zinc-200">{totalPages}</strong>
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 hover:border-zinc-700 transition-all"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Previous
                            </button>
                            <button
                                disabled={page === totalPages || totalPages === 0}
                                onClick={() => setPage((p) => p + 1)}
                                className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 hover:border-zinc-700 transition-all"
                            >
                                Next <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CrudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={() => fetchModuleData()}
                initialData={selectedItem}
                fields={fields}
                title={`${selectedItem ? 'Edit' : 'Create'} ${moduleConfig.label}`}
            />

            {/* Modal for Deletion */}
            {deleteTarget && (
                <div
                    onClick={() => !deleting && setDeleteTarget(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                >
                    <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                            <h2 className="font-display text-2xl text-amber-400">
                                {Array.isArray(deleteTarget)
                                    ? `Delete ${deleteTarget.length} Records`
                                    : `Delete ${moduleConfig.label.slice(0, -1)}`}
                            </h2>
                            <button
                                onClick={() => !deleting && setDeleteTarget(null)}
                                disabled={deleting}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-4 text-sm text-zinc-400">
                            {Array.isArray(deleteTarget)
                                ? `Are you sure you want to delete these ${deleteTarget.length} selected items? This action cannot be undone.`
                                : `This action cannot be undone. Are you sure you want to permanently delete this record?`}
                        </p>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors shadow-[0_0_12px_rgba(220,38,38,0.2)]"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}