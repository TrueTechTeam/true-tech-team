import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '@true-tech-team/hotmess-types';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const { effectiveRole, loading: permissionsLoading } = usePermissions();
  const location = useLocation();

  if (loading || permissionsLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
