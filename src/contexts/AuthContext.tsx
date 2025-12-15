import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: { id: number; modulosAccesibles?: string[] } | null;
  setUser: (
    user: {
      id: number;
      modulosAccesibles?: string[];
    } | null
  ) => void;
  logout: () => void;
  hasAccessToModulo: (moduloNombre: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{
    id: number;
    modulosAccesibles?: string[];
  } | null>(() => {
    // Check if user is logged in from localStorage
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    return stored && token ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const hasAccessToModulo = (moduloNombre: string): boolean => {
    if (!user || !user.modulosAccesibles) return false;
    // Check if user has access to the modulo (case insensitive)
    return user.modulosAccesibles.some(
      (modulo) => modulo.toLowerCase() === moduloNombre.toLowerCase()
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        hasAccessToModulo,
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
