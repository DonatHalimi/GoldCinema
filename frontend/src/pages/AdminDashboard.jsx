import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ModuleDataGrid from '../components/ModuleDataGrid';

const MODULE_CONFIGS = [
    {
        key: 'users',
        label: 'Users',
        fields: [
            { name: 'name', label: 'Name' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'role', label: 'Role ID' }
        ]
    },
    {
        key: 'roles',
        label: 'Roles',
        fields: [
            { name: 'name', label: 'Role Name' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ]
    },
    {
        key: 'movies',
        label: 'Movies',
        fields: [
            { name: 'title', label: 'Title' },
            { name: 'genres', label: 'Genres', type: 'array' },
            { name: 'duration', label: 'Duration (mins)', type: 'number' },
            { name: 'rating', label: 'Rating (e.g. PG-13, R)' },
            { name: 'price', label: 'Base Price ($)', type: 'number' },
            { name: 'releaseDate', label: 'Release Date', type: 'date' }
        ]
    },
    {
        key: 'cinemas',
        label: 'Cinemas',
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
        fields: [
            { name: 'screenNumber', label: 'Screen Number', type: 'number' },
            { name: 'cinema.name', label: 'Cinema Name' },
            { name: 'cinema._id', label: 'Cinema ID' }
        ]
    },
    {
        key: 'seats',
        label: 'Seats',
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
        fields: [
            { name: 'showtime', label: 'Showtime ID' },
            { name: 'user', label: 'User ID' },
            { name: 'expiresAt', label: 'Expires At', type: 'datetime-local' }
        ]
    },
    {
        key: 'snacks',
        label: 'Snacks',
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
    {
        key: 'orders',
        label: 'Orders',
        fields: [
            { name: 'user', label: 'User ID' },
            { name: 'movie', label: 'Movie ID' },
            { name: 'showtime', label: 'Showtime ID' },
            { name: 'totalAmount', label: 'Total Amount ($)', type: 'number' },
            { name: 'paymentStatus', label: 'Payment Status' },
            { name: 'paymentProvider', label: 'Payment Provider' }
        ]
    }
];

export default function AdminDashboard() {
    const { moduleName } = useParams();
    const navigate = useNavigate();

    if (!moduleName) return <Navigate to="/admin/users" replace />;

    const activeModule = MODULE_CONFIGS.find((mod) => mod.key === moduleName) || MODULE_CONFIGS[0];

    return (
        <div className="flex min-h-screen bg-marquee-bg border-t border-marquee-line">
            <aside className="w-64 border-r border-marquee-line p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-8 px-2">
                        <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse"></span>
                        <h2 className="font-display text-xl font-bold tracking-wider text-marquee-goldBright">
                            Admin Dashboard
                        </h2>
                    </div>

                    <nav className="space-y-1">
                        {MODULE_CONFIGS.map((mod) => {
                            const isActive = activeModule.key === mod.key;
                            return (
                                <button
                                    key={mod.key}
                                    onClick={() => navigate(`/admin/${mod.key}`)}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${isActive
                                        ? 'bg-amber-500/10 text-amber-border border-amber-500/30'
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                                        }`}
                                >
                                    <span>{mod.label}</span>
                                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <ModuleDataGrid moduleConfig={activeModule} />
        </div>
    );
}