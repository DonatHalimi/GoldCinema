import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getRoleName(value) {
    if (!value) return '';
    return String(typeof value === 'object' ? value.name : value).toLowerCase();
}

export default function RequireAdmin({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-marquee-bg">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-marquee-gold border-t-transparent" />
            </div>
        );
    }
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (user.roleSelectionRequired) return <Navigate to="/select-role" state={{ from: location }} replace />;

    const activeName = getRoleName(user.activeRole || user.role);
    if (!['admin', 'super_admin', 'cinema_manager'].includes(activeName)) return <Navigate to="/" replace />;
    return children;
}