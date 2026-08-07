import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    ShieldAlert,
    Film,
    Building2,
    MonitorPlay,
    Armchair,
    Clock,
    Lock,
    UtensilsCrossed,
    Receipt,
    ChevronDown,
    LayoutDashboard,
} from 'lucide-react';
import ModuleDataGrid from '../components/auth/ModuleDataGrid';

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
                    { name: 'role', label: 'Role ID' }
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
                    { name: 'user', label: 'User ID' },
                    { name: 'movie', label: 'Movie ID' },
                    { name: 'showtime', label: 'Showtime ID' },
                    { name: 'totalAmount', label: 'Total Amount ($)', type: 'number' },
                    { name: 'paymentStatus', label: 'Payment Status' },
                    { name: 'paymentProvider', label: 'Payment Provider' }
                ]
            }
        ]
    }
];

const ALL_MODULES = MODULE_SECTIONS.flatMap(section => section.items);

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
            <aside className="m-6 flex w-64 flex-col justify-between rounded-xl border border-marquee-line bg-marquee-panel p-4">
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
                                                {section.items.map((mod) => {
                                                    const isActive = activeModule.key === mod.key;
                                                    const IconComponent = mod.icon;

                                                    return (
                                                        <button
                                                            key={mod.key}
                                                            onClick={() => navigate(`/admin/${mod.key}`)}
                                                            className={`
                                                                relative group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 z-10
                                                                ${isActive
                                                                    ? 'text-marquee-bg z-10'
                                                                    : 'text-marquee-muted hover:bg-marquee-panel2 hover:text-marquee-gold z-10'
                                                                }
                                                            `}
                                                        >
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="activeAdminNav"
                                                                    className="absolute inset-0 rounded-lg bg-marquee-gold shadow-glow -z-10"
                                                                    transition={{
                                                                        type: "spring",
                                                                        stiffness: 380,
                                                                        damping: 30,
                                                                    }}
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

                                                            <span>{mod.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <ModuleDataGrid moduleConfig={activeModule} />
        </div>
    );
}