import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout, hasAccessToAccion } = useAuth();
  const [securityDropdownOpen, setSecurityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cada tab se muestra solo si el usuario tiene la acción "Ver [X]" correspondiente
  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Mesas", href: "/mesas", verAccion: "Mesas.Ver Pedidos" },
    {
      name: "Productos",
      href: "/productos",
      verAccion: "Productos.Ver Productos",
    },
    {
      name: "Categorías",
      href: "/categorias",
      verAccion: "Categorias.Ver Categorias",
    },
    { name: "Reportes", href: "/reportes", verAccion: "Reportes.Ver Reportes" },
  ];

  const securityItems = [
    { name: "Módulos", href: "/modulos", verAccion: "Modulos.Ver Modulos" },
    {
      name: "Formularios",
      href: "/formularios",
      verAccion: "Formularios.Ver Formularios",
    },
    { name: "Acciones", href: "/acciones", verAccion: "Acciones.Ver Acciones" },
    { name: "Grupos", href: "/grupos", verAccion: "Grupos.Ver Grupos" },
    { name: "Usuarios", href: "/usuarios", verAccion: "Usuarios.Ver Usuarios" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const visibleSecurityItems = securityItems.filter(
    (item) => !item.verAccion || hasAccessToAccion(item.verAccion),
  );
  const isSecurityActive = visibleSecurityItems.some((item) =>
    isActive(item.href),
  );

  // Debug: qué acciones tiene el usuario y qué tabs del nav son visibles
  const navVisibility = navigation.map((item) => ({
    name: item.name,
    verAccion: "verAccion" in item ? item.verAccion : null,
    hasAccess:
      !("verAccion" in item && item.verAccion) ||
      hasAccessToAccion(item.verAccion as string),
  }));
  console.log("[Layout] User permisos para nav", {
    userId: user?.id,
    grupos: user?.grupos,
    accionesAccesiblesCount: user?.accionesAccesibles?.length ?? 0,
    accionesAccesibles: user?.accionesAccesibles,
    navVisibility,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSecurityDropdownOpen(false);
      }
    };

    if (securityDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [securityDropdownOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Bar App</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  // Sin verAccion (ej. Dashboard) siempre se muestra; con verAccion solo si tiene permiso
                  if (
                    "verAccion" in item &&
                    item.verAccion &&
                    !hasAccessToAccion(item.verAccion)
                  ) {
                    return null;
                  }
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive(item.href)
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}

                {/* Security Dropdown - solo se muestra si hay al menos un ítem visible */}
                {visibleSecurityItems.length > 0 && (
                  <div className="relative flex" ref={dropdownRef}>
                    <button
                      onClick={() =>
                        setSecurityDropdownOpen(!securityDropdownOpen)
                      }
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isSecurityActive
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      Seguridad
                      <svg
                        className={`ml-1 h-4 w-4 transition-transform ${
                          securityDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {securityDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          {visibleSecurityItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setSecurityDropdownOpen(false)}
                              className={`block px-4 py-2 text-sm ${
                                isActive(item.href)
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default Layout;
