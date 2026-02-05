import { useState, useEffect } from "react";
import { accionesApi } from "../services/api";
import { useNavigate } from "react-router-dom";

interface PredefinedActionRow {
  key: string;
  label: string;
  formulario: string;
  accionNombre: string;
  accionId: number;
  formularios: Array<{ id: number; nombre: string }>;
  grupos: Array<{ id: number; nombre: string }>;
  existsInDb: boolean;
  dbId?: number;
}

const AccionesPage = () => {
  const navigate = useNavigate();
  const [actions, setActions] = useState<PredefinedActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedActions, setGroupedActions] = useState<
    Record<string, PredefinedActionRow[]>
  >({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await accionesApi.getPredefinedActionsWithGrupos();
      setActions(data);

      const grouped: Record<string, PredefinedActionRow[]> = {};
      data.forEach((action) => {
        if (!grouped[action.formulario]) {
          grouped[action.formulario] = [];
        }
        grouped[action.formulario].push(action);
      });
      setGroupedActions(grouped);
      setOpenSections(
        Object.keys(grouped).reduce<Record<string, boolean>>((acc, key) => {
          acc[key] = true;
          return acc;
        }, {}),
      );
    } catch (error) {
      console.error("Error loading actions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (formulario: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [formulario]: !prev[formulario],
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando acciones...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Acciones Predefinidas
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Visualiza las acciones predefinidas agrupadas por formulario. Para
          asignar acciones a un formulario, edita el formulario en la página de{" "}
          <button
            onClick={() => navigate("/formularios")}
            className="underline font-medium text-yellow-700 hover:text-yellow-800"
          >
            Formularios
          </button>
          . Para asignar formularios a grupos, edita un grupo en la página de{" "}
          <button
            onClick={() => navigate("/grupos")}
            className="underline font-medium text-yellow-700 hover:text-yellow-800"
          >
            Grupos
          </button>
          .
        </p>
      </div>

      {/* Actions grouped by Formulario (collapsible) */}
      {Object.entries(groupedActions).map(([formulario, formularioActions]) => {
        const isOpen = openSections[formulario] !== false;
        return (
          <div
            key={formulario}
            className="mb-4 bg-white shadow rounded-lg overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleSection(formulario)}
              className="w-full bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex text-gray-500 transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                  aria-hidden
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <h2 className="text-xl font-semibold text-gray-900">
                  {formulario}
                </h2>
                <span className="text-sm text-gray-500">
                  ({formularioActions.length} acción
                  {formularioActions.length !== 1 ? "es" : ""})
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {isOpen ? "Ocultar" : "Mostrar"}
              </span>
            </button>
            {isOpen && (
              <div className="divide-y divide-gray-200">
                {formularioActions.map((action) => (
                  <div
                    key={`${action.accionId}-${action.formulario}-${action.key}`}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {action.label}
                        </h3>
                        {action.existsInDb ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            En BD
                          </span>
                        ) : null}
                        {action.formularios && action.formularios.length > 1 ? (
                          <span className="text-xs text-gray-500">
                            {action.formularios.length} formularios
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Clave:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          {action.key}
                        </code>
                      </p>
                      {action.formularios && action.formularios.length > 0 ? (
                        <p className="text-sm text-gray-600 mt-1">
                          Formularios:{" "}
                          {action.formularios.map((f) => f.nombre).join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {actions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500">
            No hay acciones predefinidas disponibles
          </p>
        </div>
      )}
    </div>
  );
};

export default AccionesPage;
