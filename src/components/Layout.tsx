import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/la-gringa-logo.png";

interface LayoutProps {
  children: React.ReactNode;
}

const operacionesItems = [
  { name: "Viajes", href: "/viajes" },
  { name: "Choferes", href: "/choferes" },
  { name: "Camiones", href: "/camiones" },
  { name: "Marcas", href: "/marcas" },
  { name: "Tipos de Carga", href: "/tipos-carga" },
  { name: "Reportes", href: "/reportes" },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout, hasAccessToSeccion } = useAuth();
  const [securityDropdownOpen, setSecurityDropdownOpen] = useState(false);
  const [operacionesDropdownOpen, setOperacionesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const operacionesRef = useRef<HTMLDivElement>(null);

  const securityItems = [
    { name: "Módulos", href: "/modulos", seccion: "Modulos" },
    { name: "Formularios", href: "/formularios", seccion: "Formularios" },
    { name: "Acciones", href: "/acciones", seccion: "Acciones" },
    { name: "Grupos", href: "/grupos", seccion: "Grupos" },
    { name: "Usuarios", href: "/usuarios", seccion: "Usuarios" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const visibleSecurityItems = securityItems.filter(
    (item) => !item.seccion || hasAccessToSeccion(item.seccion),
  );
  const isSecurityActive = visibleSecurityItems.some((item) =>
    isActive(item.href),
  );
  const isOperacionesActive = operacionesItems.some((item) =>
    isActive(item.href),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setSecurityDropdownOpen(false);
      }
      if (operacionesRef.current && !operacionesRef.current.contains(target)) {
        setOperacionesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-brandRed-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-stretch">
              <div className="flex-shrink-0 flex items-stretch">
                <img
                  src={logo}
                  alt="La Gringa Transportes SRL"
                  className="h-full w-auto"
                />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-0">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center h-full px-3 border-b-2 text-sm font-medium ${
                    isActive("/dashboard")
                      ? "border-white text-white"
                      : "border-transparent text-white hover:border-gray-300"
                  }`}
                >
                  Dashboard
                </Link>

                {/* Operaciones Dropdown */}
                <div className="relative flex" ref={operacionesRef}>
                  <button
                    onClick={() =>
                      setOperacionesDropdownOpen(!operacionesDropdownOpen)
                    }
                    className={`inline-flex items-center h-full px-3 border-b-2 text-sm font-medium ${
                      isOperacionesActive
                        ? "border-white text-white"
                        : "border-transparent text-white hover:border-gray-300"
                    }`}
                  >
                    Operaciones
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform ${
                        operacionesDropdownOpen ? "rotate-180" : ""
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
                  {operacionesDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        {operacionesItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setOperacionesDropdownOpen(false)}
                            className={`block px-4 py-2 text-sm ${
                              isActive(item.href)
                                ? "bg-brandRed-dark text-white font-medium"
                                : "text-black hover:bg-gray-800 hover:text-white"
                            }`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Dropdown - solo se muestra si hay al menos un ítem visible */}
                {visibleSecurityItems.length > 0 && (
                  <div className="relative flex" ref={dropdownRef}>
                    <button
                      onClick={() =>
                        setSecurityDropdownOpen(!securityDropdownOpen)
                      }
                      className={`inline-flex items-center h-full px-3 border-b-2 text-sm font-medium ${
                        isSecurityActive
                          ? "border-white text-white"
                          : "border-transparent text-white hover:border-gray-300"
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
                                  ? "bg-brandRed-dark text-white font-medium"
                                  : "text-black hover:bg-gray-800 hover:text-white"
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
                  className="text-sm text-white hover:text-white"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-sm bg-brandRed-dark text-white px-3 py-1 rounded hover:bg-brandRed"
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
