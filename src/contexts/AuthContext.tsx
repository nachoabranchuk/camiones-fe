import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

export type UserGrupo = { id: number; nombre: string };

interface AuthContextType {
  user: {
    id: number;
    modulosAccesibles?: string[];
    accionesAccesibles?: string[];
    grupos?: UserGrupo[];
  } | null;
  setUser: (
    user: {
      id: number;
      modulosAccesibles?: string[];
      accionesAccesibles?: string[];
      grupos?: UserGrupo[];
    } | null,
  ) => void;
  logout: () => void;
  hasAccessToModulo: (moduloNombre: string) => boolean;
  hasAccessToAccion: (accion: string) => boolean;
  /** True si el usuario actual pertenece al grupo "Admin" */
  isCurrentUserAdmin: () => boolean;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{
    id: number;
    modulosAccesibles?: string[];
    accionesAccesibles?: string[];
    grupos?: UserGrupo[];
  } | null>(() => {
    // Check if user is logged in from localStorage
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    return stored && token ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));

      // Debug: Log user permissions when they change
      console.log("=== USER PERMISSIONS UPDATED ===");
      console.log("User ID:", user.id);
      console.log("Módulos Accesibles:", user.modulosAccesibles);
      console.log("Acciones Accesibles:", user.accionesAccesibles);
      console.log("================================");
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, [user]);

  // Si hay usuario pero no tiene grupos cargados (ej. restaurado de localStorage), cargar permisos para que isCurrentUserAdmin() funcione
  useEffect(() => {
    if (!user?.id) return;
    const hasGrupos = user.grupos && user.grupos.length > 0;
    if (!hasGrupos) {
      refreshPermissions();
    }
  }, [user?.id]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("cart");
  };

  const hasAccessToModulo = (moduloNombre: string): boolean => {
    if (!user) return false;
    // Si pertenece al grupo Admin, tiene acceso a todos los módulos
    if (isCurrentUserAdmin()) return true;
    if (!user.modulosAccesibles) return false;
    return user.modulosAccesibles.some(
      (modulo) => modulo.toLowerCase() === moduloNombre.toLowerCase(),
    );
  };

  const hasAccessToAccion = (accion: string): boolean => {
    if (!user) return false;
    // Si pertenece al grupo Admin, tiene acceso a todas las acciones (no se chequea acción por acción)
    if (isCurrentUserAdmin()) return true;
    if (!user.accionesAccesibles) {
      console.log(
        "[hasAccessToAccion] user.accionesAccesibles vacío o undefined",
        { accion, userId: user?.id },
      );
      return false;
    }
    const found = user.accionesAccesibles.some(
      (accionUsuario) => accionUsuario.toLowerCase() === accion.toLowerCase(),
    );
    if (
      !found &&
      [
        "Mesas.Ver Pedidos",
        "Productos.Ver Productos",
        "Categorias.Ver Categorias",
        "Reportes.Ver Reportes",
      ].includes(accion)
    ) {
      console.log("[hasAccessToAccion] Acción no encontrada para nav", {
        accionBuscada: accion,
        totalAcciones: user.accionesAccesibles.length,
        accionesDisponibles: user.accionesAccesibles,
      });
    }
    return found;
  };

  const isCurrentUserAdmin = (): boolean => {
    if (!user?.grupos?.length) return false;
    return user.grupos.some((g) => g.nombre?.trim().toLowerCase() === "admin");
  };

  const refreshPermissions = async (): Promise<void> => {
    if (!user) return;

    try {
      const [modulosAccesibles, accionesAccesibles, grupos, debugInfo] =
        await Promise.all([
          authApi.refreshPermissions(),
          authApi.getAccionesAccesibles(),
          authApi.getUserGrupos().catch(() => []),
          authApi.debugPermissions().catch(() => null),
        ]);

      const updatedUser = {
        ...user,
        modulosAccesibles,
        accionesAccesibles,
        grupos: Array.isArray(grupos)
          ? grupos.map((g: { id: number; nombre: string }) => ({
              id: g.id,
              nombre: g.nombre,
            }))
          : [],
      };
      setUser(updatedUser);

      // Debug: Log refreshed permissions
      console.log("=== PERMISSIONS REFRESHED ===");
      console.log("User ID:", updatedUser.id);
      console.log("Grupos:", grupos);
      console.log("Módulos Accesibles:", modulosAccesibles);
      console.log("Acciones Accesibles:", accionesAccesibles);
      if (debugInfo) {
        console.log("Debug Info (detailed):", debugInfo);
      }
      console.log("=============================");
    } catch (error) {
      console.error("Error refreshing permissions:", error);
      // If refresh fails, user might need to login again
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        hasAccessToModulo,
        hasAccessToAccion,
        isCurrentUserAdmin,
        refreshPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
