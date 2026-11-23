import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { hasAnyPermission } from '../../utils/permissions';

export default function RequireAdmin({ children }) {
    const { user, loading } = useAuth();
    const { permissions, isLoading } = usePermissions();
    const location = useLocation();

    if (loading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-marquee-bg">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-marquee-gold border-t-transparent" />
            </div>
        );
    }
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (user.roleSelectionRequired) return <Navigate to="/select-role" state={{ from: location }} replace />;

    if (!hasAnyPermission(permissions, ['admin:access', 'staff:read', 'shifts:read'])) return <Navigate to="/" replace />;
    return children;
}