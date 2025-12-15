import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  moduloNombre?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  moduloNombre,
}) => {
  const { user, hasAccessToModulo } = useAuth();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If modulo is specified, check permission
  if (moduloNombre && !hasAccessToModulo(moduloNombre)) {
    // Redirect to first accessible modulo or dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

