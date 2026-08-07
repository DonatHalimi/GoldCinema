import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ModuleDataGrid from '../components/auth/ModuleDataGrid';

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
            <aside className="m-6 flex w-64 flex-col justify-between rounded-xl border border-marquee-line bg-marquee-panel p-4">
                <div>
                    <div className="mb-6 px-3">
                        <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">
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
                                    className={`
    flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition
    ${isActive
                                            ? 'bg-marquee-gold text-marquee-bg shadow-glow'
                                            : 'text-marquee-muted hover:bg-marquee-panel2 hover:text-marquee-gold'
                                        }
`}
                                >
                                    <span>{mod.label}</span>
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