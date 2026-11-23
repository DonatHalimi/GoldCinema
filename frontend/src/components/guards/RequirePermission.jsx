import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { hasAllPermissions, hasAnyPermission } from '../../utils/permissions';

export default function RequirePermission({ permission, permissions, mode = 'any', children }) {
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const { permissions: activePermissions, isLoading } = usePermissions();

    if (authLoading || isLoading) {
        return <div className="flex min-h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-marquee-gold border-t-transparent" /></div>;
    }
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (user.roleSelectionRequired) return <Navigate to="/select-role" state={{ from: location }} replace />;

    const required = permissions || (Array.isArray(permission) ? permission : [permission]).filter(Boolean);
    const allowed = mode === 'all'
        ? hasAllPermissions(activePermissions, required)
        : hasAnyPermission(activePermissions, required);
    if (!allowed) return <Navigate to="/not-found" replace />;
    return children;
}
