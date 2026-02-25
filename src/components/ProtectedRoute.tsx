import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** @deprecated Prefer verAccion or seccion */
  moduloNombre?: string;
  /** Acción exacta requerida (ej: "Modulos.Ver Modulos"). Si se usa seccion, no hace falta. */
  verAccion?: string;
  /** Sección (Modulos, Formularios, Acciones, Grupos, Usuarios): acceso si tiene al menos una acción de esa sección */
  seccion?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  moduloNombre,
  verAccion,
  seccion,
}) => {
  const { user, hasAccessToModulo, hasAccessToAccion, hasAccessToSeccion } =
    useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (seccion && !hasAccessToSeccion(seccion)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (verAccion && !hasAccessToAccion(verAccion)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (moduloNombre && !verAccion && !seccion && !hasAccessToModulo(moduloNombre)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
