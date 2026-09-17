import {
    Check,
    ChevronDown,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getAuditLogs } from '../../api/auditLogs';
import { CATEGORIES, getCategoryLabel, getCategoryStyle, getMethodStyle, getSeverityStyle, getStatusLabel, getStatusStyle, METHODS, SEVERITIES, SEVERITY_LABELS, STATUS_RANGES } from '../../constants/audit';
import useEscapeKey from '../../hooks/useEscKey';

export default function AuditLogViewer() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const [category, setCategory] = useState('');
    const [severity, setSeverity] = useState('');
    const [method, setMethod] = useState('');
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const [expandedId, setExpandedId] = useState(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isSeverityOpen, setIsSeverityOpen] = useState(false);
    const [isMethodOpen, setIsMethodOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const categoryDropdownRef = useRef(null);
    const severityDropdownRef = useRef(null);
    const methodDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);
    const filtersRef = useRef(null);

    useEscapeKey(
        () => {
            setIsOpen(false);
            setIsSeverityOpen(false);
            setIsFiltersOpen(false);
            setIsMethodOpen(false);
            setIsStatusOpen(false);
        },
        isOpen ||
        isSeverityOpen ||
        isFiltersOpen ||
        isMethodOpen ||
        isStatusOpen
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (severityDropdownRef.current && !severityDropdownRef.current.contains(event.target)) setIsSeverityOpen(false);
            if (filtersRef.current && !filtersRef.current.contains(event.target)) setIsFiltersOpen(false);
            if (methodDropdownRef.current && !methodDropdownRef.current.contains(event.target)) setIsMethodOpen(false);
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) setIsStatusOpen(false);
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
            setExpandedId(null);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchLogs();
    }, [page, category, severity, method, status, search]);

    async function fetchLogs() {
        setLoading(true);

        try {
            const res = await getAuditLogs({
                page,
                limit: 25,
                category: category || undefined,
                severity: severity || undefined,
                method: method || undefined,
                status: status || undefined,
                search: search || undefined,
            });

            setLogs(res.data || []);
            setPages(res.pages || 1);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to load audit logs.');
        } finally {
            setLoading(false);
        }
    }


    const activeFilterCount = [
        category,
        severity,
        method,
        status,
    ].filter(Boolean).length;

    const clearFilters = () => {
        setCategory('');
        setSeverity('');
        setMethod('');
        setStatus('');
        setPage(1);
        setExpandedId(null);
        setIsOpen(false);
        setIsSeverityOpen(false);
        setIsMethodOpen(false);
        setIsStatusOpen(false);
    };

    const resetAllFilters = () => {
        setCategory('');
        setSeverity('');
        setMethod('');
        setStatus('');
        setSearchInput('');
        setSearch('');
        setPage(1);
        setExpandedId(null);
        setIsOpen(false);
        setIsSeverityOpen(false);
        setIsFiltersOpen(false);
        setIsMethodOpen(false);
        setIsStatusOpen(false);
    };

    return (
        <div className="flex-1 min-h-screen bg-marquee-bg px-10 pt-6 text-marquee-cream">
            <div className="sticky top-20 z-20 mb-4 rounded-2xl border border-marquee-line bg-marquee-panel p-6 shadow-lg backdrop-blur-md">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-marquee-gold/50 to-transparent" />

                <div className="flex flex-col gap-5">
                    <div>
                        <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">
                            Audit Logs
                        </h2>

                        <p className="mt-1 text-xs text-marquee-muted">
                            Read-only. Entries expire automatically per their
                            retention category.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[260px] flex-1">
                            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-marquee-muted" />

                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search action, path, actor..."
                                className="w-full rounded-xl border border-marquee-line bg-marquee-panel2 py-2.5 pl-10 pr-10 text-sm text-marquee-cream outline-none transition-all placeholder:text-marquee-muted/70 hover:border-marquee-gold/50 focus:border-marquee-gold focus:ring-2 focus:ring-marquee-gold/20"
                            />

                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput('');
                                        setSearch('');
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-marquee-muted transition-colors hover:text-marquee-gold"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <div ref={filtersRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFiltersOpen(!isFiltersOpen);
                                    setIsOpen(false);
                                    setIsSeverityOpen(false);
                                }}
                                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-marquee-gold/20 ${activeFilterCount > 0
                                    ? 'border-marquee-gold/40 bg-marquee-gold/10 text-marquee-gold'
                                    : 'border-marquee-line bg-marquee-panel2 text-marquee-cream hover:border-marquee-gold/50'
                                    }`}
                            >
                                <SlidersHorizontal size={15} />

                                <span>Filters</span>

                                {activeFilterCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-marquee-gold px-1.5 text-[10px] font-bold text-marquee-bg">
                                        {activeFilterCount}
                                    </span>
                                )}

                                <ChevronDown size={15} className={`text-marquee-muted transition-transform duration-300 ${isFiltersOpen ? 'rotate-180 text-marquee-gold' : ''}`} />
                            </button>

                            {isFiltersOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-[420px]">
                                    <div className="absolute right-6 -top-[7px] z-20 h-0 w-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-marquee-line" />

                                    <div className="absolute right-[22px] -top-[5px] z-30 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-marquee-panel" />

                                    <div className="relative rounded-xl border border-marquee-line bg-marquee-panel p-4 shadow-2xl backdrop-blur-md">
                                        {/* header */}
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-marquee-cream">
                                                    More Filters
                                                </div>
                                                <div className="mt-0.5 text-[11px] text-marquee-muted">
                                                    Narrow down requests by method, status, and severity.
                                                </div>
                                            </div>

                                            {activeFilterCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={clearFilters}
                                                    className="text-xs text-marquee-muted transition-colors hover:text-marquee-gold"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {/* ---------- Category ---------- */}
                                            <div className="relative" ref={categoryDropdownRef}>
                                                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-marquee-muted">
                                                    Category
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCategoryOpen((prev) => !prev);
                                                        setIsSeverityOpen(false);
                                                        setIsMethodOpen(false);
                                                        setIsStatusOpen(false);
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-xl border border-marquee-line bg-marquee-panel2 px-3.5 py-2.5 text-sm text-marquee-cream transition-all hover:border-marquee-gold/50 focus:border-marquee-gold focus:outline-none focus:ring-2 focus:ring-marquee-gold/20"
                                                >
                                                    <span className="truncate">
                                                        {category ? getCategoryLabel(category) : 'All Categories'}
                                                    </span>
                                                    <ChevronDown
                                                        size={15}
                                                        className={`ml-2 shrink-0 text-marquee-muted transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-marquee-gold' : ''}`}
                                                    />
                                                </button>

                                                {isCategoryOpen && (
                                                    <div className="absolute left-0 right-0 top-full z-[60] mt-2">
                                                        <div className="absolute left-5 -top-[7px] z-20 h-0 w-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-marquee-line" />
                                                        <div className="absolute left-[21px] -top-[5px] z-30 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-marquee-panel" />

                                                        <div className="relative overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-2xl backdrop-blur-md">
                                                            <div className="pt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setCategory('');
                                                                        setPage(1);
                                                                        setExpandedId(null);
                                                                        setIsCategoryOpen(false);
                                                                    }}
                                                                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${category === ''
                                                                        ? 'bg-marquee-gold/15 font-medium text-marquee-gold'
                                                                        : 'text-marquee-cream hover:bg-marquee-panel2 hover:text-marquee-gold'
                                                                        }`}
                                                                >
                                                                    <span>All Categories</span>
                                                                    {category === '' && <Check size={14} className="text-marquee-gold" />}
                                                                </button>
                                                            </div>

                                                            {CATEGORIES.map((item) => {
                                                                const isSelected = category === item;
                                                                return (
                                                                    <button
                                                                        key={item}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setCategory(item);
                                                                            setPage(1);
                                                                            setExpandedId(null);
                                                                            setIsCategoryOpen(false);
                                                                        }}
                                                                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${isSelected
                                                                            ? 'bg-marquee-gold/15 font-medium text-marquee-gold'
                                                                            : 'text-marquee-cream hover:bg-marquee-panel2 hover:text-marquee-gold'
                                                                            }`}
                                                                    >
                                                                        <span className="truncate">{getCategoryLabel(item)}</span>
                                                                        {isSelected && <Check size={14} className="text-marquee-gold" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ---------- Method ---------- */}
                                            <div className="relative" ref={methodDropdownRef}>
                                                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-marquee-muted">
                                                    Method
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsMethodOpen((prev) => !prev);
                                                        setIsCategoryOpen(false);
                                                        setIsSeverityOpen(false);
                                                        setIsStatusOpen(false);
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-xl border border-marquee-line bg-marquee-panel2 px-3.5 py-2.5 text-sm text-marquee-cream transition-all hover:border-marquee-gold/50 focus:border-marquee-gold focus:outline-none focus:ring-2 focus:ring-marquee-gold/20"
                                                >
                                                    <span className="truncate">{method || 'All Methods'}</span>
                                                    <ChevronDown
                                                        size={15}
                                                        className={`ml-2 shrink-0 text-marquee-muted transition-transform duration-300 ${isMethodOpen ? 'rotate-180 text-marquee-gold' : ''}`}
                                                    />
                                                </button>

                                                {isMethodOpen && (
                                                    <div className="absolute left-0 right-0 top-full z-[60] mt-2">
                                                        <div className="absolute left-5 -top-[7px] z-20 h-0 w-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-marquee-line" />
                                                        <div className="absolute left-[21px] -top-[5px] z-30 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-marquee-panel" />

                                                        <div className="relative overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-2xl backdrop-blur-md">
                                                            <div className="pt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setMethod('');
                                                                        setPage(1);
                                                                        setIsMethodOpen(false);
                                                                    }}
                                                                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${method === ''
                                                                        ? 'bg-marquee-gold/15 font-medium text-marquee-gold'
                                                                        : 'text-marquee-cream hover:bg-marquee-panel2 hover:text-marquee-gold'
                                                                        }`}
                                                                >
                                                                    <span>All Methods</span>
                                                                    {method === '' && <Check size={14} className="text-marquee-gold" />}
                                                                </button>
                                                            </div>

                                                            {METHODS.map((item) => {
                                                                const isSelected = method === item;
                                                                return (
                                                                    <button
                                                                        key={item}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setMethod(item);
                                                                            setPage(1);
                                                                            setIsMethodOpen(false);
                                                                        }}
                                                                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${isSelected
                                                                            ? 'bg-marquee-gold/15 font-medium text-marquee-gold'
                                                                            : 'text-marquee-cream hover:bg-marquee-panel2 hover:text-marquee-gold'
                                                                            }`}
                                                                    >
                                                                        <span className="truncate">{item}</span>
                                                                        {isSelected && <Check size={14} className="text-marquee-gold" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ---------- Status ---------- */}
                                            <div className="relative" ref={statusDropdownRef}>
                                                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-marquee-muted">
                                                    Status
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsStatusOpen((prev) => !prev);
                                                        setIsCategoryOpen(false);
                                                        setIsSeverityOpen(false);
                                                        setIsMethodOpen(false);
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-xl border border-marquee-line bg-marquee-panel2 px-3.5 py-2.5 text-sm text-marquee-cream transition-all hover:border-marquee-gold/50 focus:border-marquee-gold focus:outline-none focus:ring-2 focus:ring-marquee-gold/20"
                                                >
                                                    <span className="truncate">
                                                        {status ? getStatusLabel(status) : 'All Statuses'}
                                                    </span>
                                                    <ChevronDown
                                                        size={15}
                                                        className={`ml-2 shrink-0 text-marquee-muted transition-transform duration-300 ${isStatusOpen ? 'rotate-180 text-marquee-gold' : ''}`}
                                                    />
                                                </button>

                                                {isStatusOpen && (
                                                    <div className="absolute left-0 right-0 top-full z-[60] mt-2">
                                                        <div className="absolute left-5 -top-[7px] z-20 h-0 w-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-marquee-line" />
                                                        <div className="absolute left-[21px] -top-[5px] z-30 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-marquee-panel" />

                                                        <div className="relative overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-2xl backdrop-blur-md">
                                                            <div className="pt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setStatus('');
                                                                        setPage(1);
                                                                        setIsStatusOpen(false);
                                                                    }}
                                                                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${status === ''
                                                                        ? 'bg-marquee-gold/15 font-medium text-marquee-gold'
                                                                        : 'text-marquee-cream hover:bg-marquee-panel2 hover:text-marquee-gold'
                                                                        }`}
                                                                >
                                                                    <span>All Statuses</span>
                                                                    {status === '' && <Check size={14} className="text-marquee-gold" />}
                                                                </button>
                                                            </div>

                                                            {STATUS_RANGES.map((item) => {
                                                                const isSelected = status === item.value;
                                                                return (
                                                                    <button
                                                                        key={item.value}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setStatus(item.value);
                                                                            setPage(1);
                                                                            setIsStatusOpen(false);
                                                                        }}
                                                                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${isSelected
                                                                            ? 'bg-marquee-gold/15 font-medium text-marquee-gold'
                                                                            : 'text-marquee-cream hover:bg-marquee-panel2 hover:text-marquee-gold'
                                                                            }`}
                                                                    >
                                                                        <span className="truncate">{item.label}</span>
                                                                        {isSelected && <Check size={14} className="text-marquee-gold" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ---------- Severity ---------- */}
                                            <div className="relative" ref={severityDropdownRef}>
                                                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-marquee-muted">
                                                    Severity
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsSeverityOpen((prev) => !prev);
                                                        setIsCategoryOpen(false);
                                                        setIsMethodOpen(false);
                                                        setIsStatusOpen(false);
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-xl border border-marquee-line bg-marquee-panel2 px-3.5 py-2.5 text-sm text-marquee-cream transition-all hover:border-marquee-gold/50 focus:border-marquee-gold focus:outline-none focus:ring-2 focus:ring-marquee-gold/20"
                                                >
                                                    <span className="truncate">
                                                        {severity ? SEVERITY_LABELS[severity] : 'All Severities'}
                                                    </span>
                                                    <ChevronDown
                                                        size={15}
                                                        className={`ml-2 shrink-0 text-marquee-muted transition-transform duration-300 ${isSeverityOpen ? 'rotate-180 text-marquee-gold' : ''}`}
                                                    />
                                                </button>

                                                {isSeverityOpen && (
                                                    <div className="absolute left-0 right-0 top-full z-[60] mt-2">
                                                        <div className="absolute left-5 -top-[7px] z-20 h-0 w-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-marquee-line" />
                                                        <div className="absolute left-[21px] -top-[5px] z-30 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-marquee-panel" />

                                                        <div className="relative overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-2xl backdrop-blur-md">
                                                            <div className="pt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSeverity('');
                                                                        setPage(1);
                                                                        setExpandedId(null);
                                                                        setIsSeverityOpen(false);
                                                                    }}
                                                                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${severity === ''
                                                                        ? 'bg-marquee-gold/15 font-medium text-marquee-gold'
                                                                        : 'text-marquee-cream hover:bg-marquee-panel2 hover:text-marquee-gold'
                                                                        }`}
                                                                >
                                                                    <span>All Severities</span>
                                                                    {severity === '' && <Check size={14} className="text-marquee-gold" />}
                                                                </button>
                                                            </div>

                                                            {SEVERITIES.map((s) => {
                                                                const isSelected = severity === s;
                                                                return (
                                                                    <button
                                                                        key={s}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSeverity(s);
                                                                            setPage(1);
                                                                            setExpandedId(null);
                                                                            setIsSeverityOpen(false);
                                                                        }}
                                                                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${isSelected
                                                                            ? 'bg-marquee-gold/15 font-medium text-marquee-gold'
                                                                            : 'text-marquee-cream hover:bg-marquee-panel2 hover:text-marquee-gold'
                                                                            }`}
                                                                    >
                                                                        <span className="truncate">{SEVERITY_LABELS[s]}</span>
                                                                        {isSelected && <Check size={14} className="text-marquee-gold" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {(category || severity || method || status || search) && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-marquee-line pt-4">
                            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-marquee-muted">
                                Active:
                            </span>

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput('');
                                        setSearch('');
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-marquee-line bg-marquee-panel2 px-2.5 py-1 text-[10px] font-medium text-marquee-cream transition-colors hover:border-marquee-gold/50 hover:text-marquee-gold"
                                >
                                    Search: {search}
                                    <X size={11} />
                                </button>
                            )}

                            {category && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCategory('');
                                        setPage(1);
                                        setExpandedId(null);
                                    }}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors hover:brightness-110 ${getCategoryStyle(category)}`}
                                >
                                    Category: {getCategoryLabel(category)}
                                    <X size={11} />
                                </button>
                            )}

                            {severity && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSeverity('');
                                        setPage(1);
                                        setExpandedId(null);
                                    }}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors hover:brightness-110 ${getSeverityStyle(severity)}`}
                                >
                                    Severity: {SEVERITY_LABELS[severity] || severity}
                                    <X size={11} />
                                </button>
                            )}

                            {method && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMethod('');
                                        setPage(1);
                                    }}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors hover:brightness-110 ${getMethodStyle(method)}`}
                                >
                                    Method: {method}
                                    <X size={11} />
                                </button>
                            )}

                            {status && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatus('');
                                        setPage(1);
                                    }}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors hover:brightness-110 ${getStatusStyle(status)}`}
                                >
                                    Status: {getStatusLabel(status)}
                                    <X size={11} />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={resetAllFilters}
                                className="ml-1 text-[10px] font-medium text-marquee-muted transition-colors hover:text-marquee-gold"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <p className="py-20 text-center text-marquee-muted animate-pulse">
                    Loading audit logs...
                </p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-[0_0_20px_-10px_rgba(230,199,115,0.175)]">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-left text-sm">
                            <thead className="border-b border-marquee-line bg-marquee-panel2 text-[11px] font-semibold uppercase tracking-wider text-marquee-muted">
                                <tr>
                                    <th className="w-[120px] px-4 py-4">Time</th>
                                    <th className="w-[140px] px-4 py-4">Category</th>
                                    <th className="w-[90px] px-4 py-4">Method</th>
                                    <th className="px-4 py-4">Action / Path</th>
                                    <th className="w-[180px] px-4 py-4">Actor</th>
                                    <th className="w-[90px] px-4 py-4">Status</th>
                                    <th className="w-[110px] px-4 py-4">Severity</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-marquee-line">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-marquee-muted">
                                            No audit log entries found.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <>
                                            <tr
                                                key={log._id}
                                                onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
                                                className="cursor-pointer transition-colors hover:bg-marquee-panel2"
                                            >
                                                <td className="whitespace-nowrap px-4 py-4 text-xs text-marquee-muted">
                                                    {new Date(log.createdAt).toLocaleString('en-GB', {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short',
                                                    })}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getCategoryStyle(log.category)}`}>
                                                        {getCategoryLabel(log.category)}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    {log.method ? (
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getMethodStyle(log.method)}`}
                                                        >
                                                            {log.method}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-marquee-muted">—</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 font-mono text-xs text-marquee-cream">
                                                    <div
                                                        className="truncate"
                                                        title={log.action || log.path || '—'}
                                                    >
                                                        {log.action || log.path || '—'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-xs text-marquee-muted">
                                                    <div className="truncate" title={log.actor?.email || log.actor?.userId || 'Anonymous'}>
                                                        {log.actor?.email || log.actor?.userId || 'Anonymous'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold ${getStatusStyle(
                                                            log.statusCode >= 500
                                                                ? '5xx'
                                                                : log.statusCode >= 400
                                                                    ? '4xx'
                                                                    : log.statusCode >= 300
                                                                        ? '3xx'
                                                                        : log.statusCode >= 200
                                                                            ? '2xx'
                                                                            : ''
                                                        )}`}
                                                    >
                                                        {log.statusCode ?? '—'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getSeverityStyle(log.severity)}`}>
                                                        {log.severity || 'info'}
                                                    </span>
                                                </td>
                                            </tr>

                                            {expandedId === log._id && (
                                                <tr key={`${log._id}-details`}>
                                                    <td colSpan={7} className="bg-marquee-bg px-6 py-5">
                                                        <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-marquee-line bg-marquee-panel p-4">
                                                            <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-marquee-gold">
                                                                Event Details
                                                            </div>

                                                            <pre className="max-h-64 max-w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words text-xs leading-relaxed text-marquee-muted [overflow-wrap:anywhere]">
                                                                {JSON.stringify(
                                                                    {
                                                                        resource:
                                                                            log.resource,
                                                                        changes:
                                                                            log.changes,
                                                                        metadata:
                                                                            log.metadata,
                                                                    },
                                                                    null,
                                                                    2
                                                                )}
                                                            </pre>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-marquee-line bg-marquee-panel2 px-6 py-4 text-xs text-marquee-muted">
                        <span>
                            Page{' '}
                            <strong className="text-marquee-gold">
                                {page}
                            </strong>{' '}
                            of{' '}
                            <strong className="text-marquee-gold">
                                {pages}
                            </strong>
                        </span>

                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded-lg border border-marquee-line bg-marquee-panel px-3 py-1.5 text-marquee-cream transition-colors hover:border-marquee-gold hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <button
                                disabled={page === pages || pages === 0}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg border border-marquee-line bg-marquee-panel px-3 py-1.5 text-marquee-cream transition-colors hover:border-marquee-gold hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
