import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { reportesApi } from "../services/api";
import type { DashboardReportes } from "../types";

/** Módulo Seguridad (misma fuente que el dropdown del Layout) */
const SEGURIDAD_ITEMS = [
  { name: "Módulos", href: "/modulos", verAccion: "Modulos.Ver Modulos", description: "Gestionar módulos del sistema", color: "blue" as const },
  { name: "Formularios", href: "/formularios", verAccion: "Formularios.Ver Formularios", description: "Gestionar formularios", color: "green" as const },
  { name: "Acciones", href: "/acciones", verAccion: "Acciones.Ver Acciones", description: "Gestionar acciones", color: "purple" as const },
  { name: "Grupos", href: "/grupos", verAccion: "Grupos.Ver Grupos", description: "Gestionar grupos de usuarios", color: "yellow" as const },
  { name: "Usuarios", href: "/usuarios", verAccion: "Usuarios.Ver Usuarios", description: "Gestionar usuarios", color: "red" as const },
];

const OPERACIONES_ITEMS = [
  { name: "Viajes", href: "/viajes", description: "Registrar y gestionar viajes", color: "indigo" as const },
  { name: "Choferes", href: "/choferes", description: "Gestión de choferes", color: "teal" as const },
  { name: "Camiones", href: "/camiones", description: "Gestión de camiones", color: "orange" as const },
  { name: "Marcas", href: "/marcas", description: "Gestión de marcas", color: "slate" as const },
  { name: "Tipos de Carga", href: "/tipos-carga", description: "Gestión de tipos de carga", color: "amber" as const },
  { name: "Reportes", href: "/reportes", description: "Métricas y análisis de viajes", color: "indigo" as const },
];

const formatMoney = (value: number) =>
  Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BORDER_CLASSES: Record<string, string> = {
  blue: "border-brandRed/40 hover:border-brandRed bg-white",
  green: "border-green-200 hover:border-green-400 bg-white",
  purple: "border-gray-300 hover:border-gray-500 bg-white",
  yellow: "border-amber-200 hover:border-amber-400 bg-white",
  red: "border-brandRed/60 hover:border-brandRed bg-white",
  indigo: "border-brandRed/40 hover:border-brandRed bg-white",
  teal: "border-gray-300 hover:border-gray-500 bg-white",
  orange: "border-gray-300 hover:border-gray-500 bg-white",
  slate: "border-gray-300 hover:border-gray-500 bg-white",
  amber: "border-amber-200 hover:border-amber-400 bg-white",
};

const Dashboard = () => {
  const { hasAccessToAccion } = useAuth();
  const [reportes, setReportes] = useState<DashboardReportes | null>(null);
  const [loadingReportes, setLoadingReportes] = useState(true);

  useEffect(() => {
    reportesApi
      .getDashboard()
      .then(setReportes)
      .catch(() => setReportes(null))
      .finally(() => setLoadingReportes(false));
  }, []);

  const visibleSeguridad = SEGURIDAD_ITEMS.filter((item) =>
    hasAccessToAccion(item.verAccion),
  );
  const hasAnyAccess = visibleSeguridad.length > 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Resumen y acceso rápido a los módulos
        </p>
      </div>

      {/* Métricas de reportes */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumen de viajes</h2>
        {loadingReportes ? (
          <p className="text-gray-500">Cargando métricas...</p>
        ) : reportes ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Total viajes</p>
              <p className="text-2xl font-bold text-gray-900">{reportes.totalViajes}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Total facturado</p>
              <p className="text-2xl font-bold text-green-600">
                ${formatMoney(Number(reportes.totalFacturado))}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-gray-500">En curso</p>
              <p className="text-2xl font-bold text-brandRed">{reportes.viajesEnCurso}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">{reportes.viajesPendientes}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Cancelados</p>
              <p className="text-2xl font-bold text-red-600">{reportes.viajesCancelados}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No se pudieron cargar las métricas.</p>
        )}
      </div>

      {/* Operaciones */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Operaciones</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {OPERACIONES_ITEMS.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className={`block rounded-lg shadow-md border-2 p-6 text-gray-900 transition-colors ${BORDER_CLASSES[card.color]}`}
            >
              <h3 className="text-xl font-semibold mb-2">{card.name}</h3>
              <p className="text-gray-600 text-sm">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Seguridad */}
      {hasAnyAccess && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Seguridad</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleSeguridad.map((card) => (
              <Link
                key={card.href}
                to={card.href}
                className={`block rounded-lg shadow-md border-2 p-6 text-gray-900 transition-colors ${BORDER_CLASSES[card.color]}`}
              >
                <h3 className="text-xl font-semibold mb-2">{card.name}</h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!hasAnyAccess && (
        <p className="text-gray-500 py-4">
          No tienes acceso a módulos de seguridad. Usa el menú Operaciones para viajes, choferes, camiones, marcas y tipos de carga.
        </p>
      )}
    </div>
  );
};

export default Dashboard;
