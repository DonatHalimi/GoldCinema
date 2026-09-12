import { Check, ChevronLeft, ChevronRight, Pencil, Plus, Trash, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { bulkDeleteItems, deleteItem, getItems } from '../../api/admin';
import useEscapeKey from '../../hooks/useEscKey';
import CrudModal from '../ui/modals/CrudModal';
import DeleteConfirmModal from '../ui/modals/DeleteConfirmModal';

const getNestedValue = (obj, path) => {
    return path.split('.').reduce((value, key) => value?.[key], obj);
};

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

    useEscapeKey(
        () => {
            if (deleteTarget && !deleting) setDeleteTarget(null);
        },
        deleteTarget && !deleting
    );

    const fetchModuleData = async () => {
        setLoading(true);
        try {
            const res = await getItems(moduleConfig.key, page, 10);
            setData(res.data || []);
            setTotalPages(res.pages || 1);
            setSelectedIds([]);
        } catch (err) {
            toast.error(`Error fetching ${moduleConfig.label}: ` + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModuleData();
    }, [moduleConfig.key, page]);

    const handleSelectAll = () => {
        setSelectedIds(isAllSelected ? [] : data.map((item) => item._id));
    };

    const handleSelectRow = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
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
            toast.error('Failed to delete item(s): ' + (err.response?.data?.message || err.message));
        } finally {
            setDeleting(false);
        }
    };

    const fields = moduleConfig?.fields || [];
    const isAllSelected = data.length > 0 && selectedIds.length === data.length;
    const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

    return (
        <div className="flex-1 p-8 bg-marquee-bg text-marquee-cream min-h-screen">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-marquee-line">
                <div>
                    <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">
                        {moduleConfig.label}
                    </h2>
                    <p className="text-xs text-marquee-muted mt-1">
                        Manage your movie platform's {moduleConfig.label.toLowerCase()} settings and records.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setDeleteTarget(selectedIds)}
                            className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-600/20 shadow-[0_0_12px_rgba(220,38,38,0.15)] transition-all"
                        >
                            <Trash className="h-4 w-4" /> Delete Selected ({selectedIds.length})
                        </button>
                    )}

                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg bg-marquee-gold hover:bg-marquee-goldBright px-4 py-2.5 text-sm font-semibold text-marquee-bg transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" /> Add {moduleConfig.label}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-marquee-muted">
                    <p className="animate-pulse text-sm">Loading {moduleConfig.label} records...</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-[0_0_20px_-10px_rgba(230,199,115,0.175)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-marquee-cream">
                            <thead className="bg-marquee-panel2 border-b border-marquee-line uppercase text-[11px] font-semibold text-marquee-cream tracking-wider">
                                <tr>
                                    <th className="px-4 py-4 w-12 text-center">
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            aria-label="Select all rows"
                                            className={`inline-flex h-4 w-4 items-center justify-center rounded border transition-all ${isAllSelected
                                                ? 'bg-marquee-gold border-marquee-gold text-marquee-bg shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                                : isSomeSelected
                                                    ? 'bg-marquee-gold/20 border-marquee-gold/60 text-marquee-gold'
                                                    : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold hover:text-marquee-gold'
                                                }`}
                                        >
                                            {isAllSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                            {isSomeSelected && <span className="h-1.5 w-1.5 rounded-sm bg-marquee-gold" />}
                                        </button>
                                    </th>

                                    {fields.map((col) => (
                                        <th key={col.name} className="px-6 py-4">
                                            {col.label}
                                        </th>
                                    ))}

                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-marquee-line">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={fields.length + 3} className="px-6 py-8 text-center text-marquee-muted">
                                            No {moduleConfig.label.toLowerCase()} found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((row) => {
                                        const isSelected = selectedIds.includes(row._id);
                                        return (
                                            <tr
                                                key={row._id}
                                                className={`transition-colors ${isSelected ? 'bg-marquee-gold/10 hover:bg-marquee-gold/20' : 'hover:bg-marquee-panel2'
                                                    }`}
                                            >
                                                <td className="px-4 py-4 w-12 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectRow(row._id)}
                                                        aria-label={`Select row ${row._id}`}
                                                        className={`inline-flex h-4 w-4 items-center justify-center rounded border transition-all ${isSelected
                                                            ? 'bg-marquee-gold border-marquee-gold text-marquee-bg shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                                            : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold'
                                                            }`}
                                                    >
                                                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                                    </button>
                                                </td>

                                                {fields.map((col) => {
                                                    const value = getNestedValue(row, col.name);
                                                    return (
                                                        <td key={col.name} className="px-6 py-4 text-marquee-cream">
                                                            {col.format ? col.format(value) : String(value ?? '-')}
                                                        </td>
                                                    );
                                                })}

                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        title="Edit"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-marquee-gold bg-marquee-gold/10 text-marquee-gold hover:bg-marquee-gold/20 transition-all"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setDeleteTarget(row._id)}
                                                        title="Delete"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-600/30 bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-all"
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

                    <div className="flex items-center justify-between border-t border-marquee-line bg-marquee-panel2 px-6 py-4 text-xs text-marquee-muted">
                        <span>
                            Page <strong className="text-marquee-gold">{page}</strong> of{' '}
                            <strong className="text-marquee-gold">{totalPages}</strong>
                        </span>

                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="flex items-center gap-1 rounded-lg border border-marquee-gold bg-marquee-panel text-marquee-cream px-3 py-1.5 hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-40 transition-all"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Previous
                            </button>

                            <button
                                disabled={page === totalPages || totalPages === 0}
                                onClick={() => setPage((p) => p + 1)}
                                className="flex items-center gap-1 rounded-lg border border-marquee-gold bg-marquee-panel text-marquee-cream px-3 py-1.5 hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-40 transition-all"
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