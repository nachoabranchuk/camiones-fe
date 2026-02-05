import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** @deprecated Prefer verAccion for consistency with navbar (Ver [X]) */
  moduloNombre?: string;
  /** Acción "Ver [X]" requerida para acceder (ej: "Mesas.Ver Pedidos", "Reportes.Ver Reportes") */
  verAccion?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  moduloNombre,
  verAccion,
}) => {
  const { user, hasAccessToModulo, hasAccessToAccion } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (verAccion && !hasAccessToAccion(verAccion)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (moduloNombre && !verAccion && !hasAccessToModulo(moduloNombre)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
