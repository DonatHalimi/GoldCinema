import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireAdmin({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-marquee-bg">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
    const isAdmin = roleName?.toLowerCase() === 'admin';

    if (!isAdmin) return <Navigate to="/" replace />;

    return children;
}