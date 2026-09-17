import { AnimatePresence, motion } from 'framer-motion';
import {
    Armchair,
    Building2,
    ChevronDown,
    Clock,
    Film,
    Languages,
    LayoutDashboard,
    Lock,
    Mail,
    MonitorPlay,
    Receipt,
    ShieldAlert,
    Users,
    UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import ModuleDataGrid from '../components/auth/ModuleDataGrid';
import AuditLogViewer from '../components/admin/AuditLogViewer';
import { ScrollText } from 'lucide-react';

const MODULE_SECTIONS = [
    {
        title: 'Management',
        icon: LayoutDashboard,
        items: [
            {
                key: 'users',
                label: 'Users',
                icon: Users,
                fields: [
                    { name: 'name', label: 'Name' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'role.name', label: 'Role' }
                ]
            },
            {
                key: 'roles',
                label: 'Roles',
                icon: ShieldAlert,
                fields: [
                    { name: 'name', label: 'Role Name' },
                    { name: 'description', label: 'Description', type: 'textarea' }
                ]
            },
            {
                key: 'contacts',
                label: 'Contacts',
                icon: Mail,
                fields: [
                    { name: 'name', label: 'Sender Name' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'subject', label: 'Subject' },
                    { name: 'message', label: 'Message', type: 'textarea' },
                    {
                        name: 'status',
                        label: 'Status',
                        type: 'select',
                        options: ['unread', 'read', 'resolved']
                    }
                ]
            },
            {

                key: 'auditlogs',
                label: 'Audit Logs',
                icon: ScrollText,
                fields: [
                    { name: 'user', label: 'User' },
                    { name: 'action', label: 'Action' },
                    { name: 'timestamp', label: 'Timestamp' },
                    { name: 'ip', label: 'IP Address' },
                    { name: 'userAgent', label: 'User Agent' },
                ]
            },
            {

                key: 'translations',
                label: 'Translations',
                icon: Languages,
                fields: [
                    { name: 'namespace', label: 'Namespace', span: 1 },
                    { name: 'key', label: 'Key', span: 1 },
                    { name: 'values.en', label: 'English', span: 1 },
                    { name: 'values.sq', label: 'Albanian', span: 1 },
                    { name: 'values.sr-Latn', label: 'Serbian (Latin)', span: 1 },
                    { name: 'context', label: 'Translator Notes', type: 'textarea' },
                ],
            },
        ]
    },
    {
        title: 'Catalog & Cinema',
        icon: Film,
        items: [
            {
                key: 'movies',
                label: 'Movies',
                icon: Film,
                fields: [
                    { name: 'title', label: 'Title' },
                    { name: 'genres', label: 'Genres', type: 'array' },
                    { name: 'duration', label: 'Duration (mins)', type: 'number' },
                    { name: 'rating', label: 'Rating (e.g. PG-13, R)' },
                    { name: 'price', label: 'Base Price ($)', type: 'number' },
                    {
                        name: 'releaseDate',
                        label: 'Release Date',
                        format: (value) =>
                            value
                                ? new Date(value).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })
                                : '-',
                    },
                ],

                formFields: [
                    { name: 'title', label: 'Title', type: 'text', required: true },
                    { name: 'slug', label: 'Slug', type: 'text', required: true },
                    {
                        name: 'genres',
                        label: 'Genres',
                        type: 'text',
                        placeholder: 'Action, Drama, Comedy',
                        defaultValue: '',
                        span: 1
                    },
                    {
                        name: 'duration',
                        label: 'Duration (mins)',
                        type: 'number',
                        required: true,
                        min: 1,
                        span: 1
                    },
                    {
                        name: 'description',
                        label: 'Description',
                        type: 'textarea',
                        required: true,
                    },
                    {
                        name: 'posterUrl',
                        label: 'Poster URL',
                        type: 'url',
                        required: true,
                    },
                    {
                        name: 'trailerUrl',
                        label: 'Trailer URL',
                        type: 'url',
                        defaultValue: '',
                    },
                    {
                        name: 'rating',
                        label: 'Rating',
                        type: 'select',
                        options: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
                        required: true,
                        defaultValue: 'PG-13',
                        span: 1
                    },
                    {
                        name: 'releaseDate',
                        label: 'Release Date',
                        type: 'date',
                        span: 1
                    },
                    {
                        name: 'price',
                        label: 'Base Price ($)',
                        type: 'number',
                        required: true,
                        min: 0,
                        step: 0.01,
                        span: 1
                    },
                    {
                        name: 'active',
                        label: 'Active',
                        type: 'checkbox',
                        defaultValue: true,
                        span: 1
                    },
                    {
                        name: 'averageRating',
                        label: 'Average Rating',
                        type: 'number',
                        min: 0,
                        max: 5,
                        step: 0.1,
                        defaultValue: 0,
                        span: 1
                    },
                    {
                        name: 'reviewCount',
                        label: 'Review Count',
                        type: 'number',
                        min: 0,
                        defaultValue: 0,
                        span: 1
                    },
                ],
            },
            {
                key: 'cinemas',
                label: 'Cinemas',
                icon: Building2,
                fields: [
                    { name: 'name', label: 'Cinema Name' },
                    { name: 'location.address', label: 'Address' },
                    { name: 'location.city', label: 'City' },
                    { name: 'location.country', label: 'Country' }
                ]
            },
            {
                key: 'screens',
                label: 'Screens',
                icon: MonitorPlay,
                fields: [
                    { name: 'screenNumber', label: 'Screen Number', type: 'number' },
                    { name: 'cinema.name', label: 'Cinema Name' },
                    { name: 'cinema._id', label: 'Cinema ID' }
                ]
            },
            {
                key: 'seats',
                label: 'Seats',
                icon: Armchair,
                fields: [
                    { name: 'row', label: 'Row (e.g. A)' },
                    { name: 'number', label: 'Seat Number (e.g. 1)' },
                    { name: 'column', label: 'Column Index', type: 'number' },
                    { name: 'type', label: 'Type (standard/recliner/wheelchair/love-seat)' },
                    { name: 'status', label: 'Status (active/maintenance)' }
                ]
            },
            {
                key: 'showtimes',
                label: 'Showtimes',
                icon: Clock,
                fields: [
                    { name: 'startTime', label: 'Start Time', type: 'datetime-local' },
                    { name: 'movie', label: 'Movie ID' },
                    { name: 'screen', label: 'Screen ID' },
                    { name: 'price', label: 'Ticket Price', type: 'number' }
                ]
            },
            {
                key: 'seatholds',
                label: 'Seat Holds',
                icon: Lock,
                fields: [
                    { name: 'showtime', label: 'Showtime ID' },
                    { name: 'user', label: 'User ID' },
                    { name: 'expiresAt', label: 'Expires At', type: 'datetime-local' }
                ]
            },
            {
                key: 'snacks',
                label: 'Snacks',
                icon: UtensilsCrossed,
                fields: [
                    { name: 'image', label: 'Image', type: 'image' },
                    { name: 'name', label: 'Snack Name' },
                    {
                        name: 'category',
                        label: 'Category',
                        type: 'select',
                        options: ['popcorn', 'drink', 'candy', 'combo', 'other']
                    },
                    { name: 'price', label: 'Price ($)', type: 'number' },
                    { name: 'available', label: 'Available', type: 'checkbox' }
                ]
            },
        ]
    },
    {
        title: 'Sales',
        icon: Receipt,
        items: [
            {
                key: 'orders',
                label: 'Orders',
                icon: Receipt,
                fields: [
                    {
                        name: 'user',
                        label: 'User',
                        format: (value) => value?.name || value?.fullName || '-',
                    },
                    {
                        name: 'movie',
                        label: 'Movie',
                        format: (value) => value?.title || '-',
                    },
                    {
                        name: 'showtime',
                        label: 'Showtime',
                        format: (value) =>
                            value?.startTime
                                ? new Date(value.startTime).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })
                                : '-',
                    },
                    {
                        name: 'totalAmount',
                        label: 'Total Amount ($)',
                        type: 'number',
                    },
                    {
                        name: 'paymentStatus',
                        label: 'Payment Status',
                    },
                    {
                        name: 'paymentProvider',
                        label: 'Payment Provider',
                    },
                ]
            }
        ]
    }
];

const renderAdminItems = (items, navigate, activeModule, level = 0) =>
    items.map((item) => {
        if (item.items) {
            const GroupIcon = item.icon;

            return (
                <div key={item.title} className="space-y-1">
                    <div
                        className={`flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${level === 0
                            ? 'text-marquee-muted'
                            : 'text-marquee-muted/80'
                            }`}
                    >
                        {GroupIcon && <GroupIcon size={14} />}
                        <span>{item.title}</span>
                    </div>

                    <div className="space-y-1 pl-2">
                        {renderAdminItems(
                            item.items,
                            navigate,
                            activeModule,
                            level + 1
                        )}
                    </div>
                </div>
            );
        }

        const isActive = activeModule.key === item.key;
        const IconComponent = item.icon;

        return (
            <button
                key={item.key}
                type="button"
                onClick={() => navigate(`/admin/${item.key}`)}
                className={`
                    relative group flex w-full items-center gap-3
                    rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-colors duration-200 z-10
                    ${level > 0 ? 'pl-5' : ''}
                    ${isActive
                        ? 'text-marquee-bg'
                        : 'text-marquee-muted hover:bg-marquee-panel2 hover:text-marquee-gold'
                    }
                `}
            >
                {isActive && (
                    <motion.div
                        layoutId="activeAdminNav"
                        transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                        }}
                        className="absolute inset-0 rounded-lg bg-marquee-gold shadow-glow -z-10"
                    />
                )}

                {IconComponent && (
                    <IconComponent
                        size={16}
                        className={
                            isActive
                                ? 'text-marquee-bg'
                                : 'text-marquee-muted group-hover:text-marquee-gold'
                        }
                    />
                )}

                <span>{item.label}</span>
            </button>
        );
    });

const flattenModules = (items) =>
    items.flatMap((item) =>
        item.key
            ? [item]
            : item.items
                ? flattenModules(item.items)
                : []
    );

const ALL_MODULES = MODULE_SECTIONS.flatMap(section => flattenModules(section.items));

export default function AdminDashboard() {
    const { moduleName } = useParams();
    const navigate = useNavigate();

    if (!moduleName) return <Navigate to="/admin/users" replace />;

    const activeModule = ALL_MODULES.find((mod) => mod.key === moduleName) || ALL_MODULES[0];

    const [openSections, setOpenSections] = useState(() => {
        const initialOpen = {};
        MODULE_SECTIONS.forEach(section => {
            initialOpen[section.title] = true;
        });
        return initialOpen;
    });

    const toggleSection = (title) => {
        setOpenSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    return (
        <div className="flex min-h-screen bg-marquee-bg border-t border-marquee-line">
            <aside className="sticky top-6 m-6 flex h-[calc(100vh-3rem)] w-64 shrink-0 flex-col justify-between rounded-xl border border-marquee-line bg-marquee-panel p-4">
                <div>
                    <div className="mb-6 px-3">
                        <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">
                            Admin Dashboard
                        </h2>
                    </div>

                    <nav className="relative space-y-4">
                        {MODULE_SECTIONS.map((section) => {
                            const SectionIcon = section.icon;
                            const isOpen = openSections[section.title];

                            return (
                                <div key={section.title} className="space-y-1">
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-marquee-muted hover:text-marquee-gold transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            {SectionIcon && <SectionIcon size={14} />}
                                            <span>{section.title}</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown size={14} />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                className="space-y-1 overflow-hidden pl-2"
                                            >
                                                {renderAdminItems(
                                                    section.items,
                                                    navigate,
                                                    activeModule
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {activeModule.key === 'auditlogs' ? (
                <AuditLogViewer />
            ) : (
                <ModuleDataGrid moduleConfig={activeModule} />
            )}
        </div>
    );
}