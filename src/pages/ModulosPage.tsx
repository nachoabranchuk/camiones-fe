import { useState, useEffect } from "react";
import { modulosApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Modulo } from "../types";
import Modal from "../components/Modal";

const ModulosPage = () => {
  const { hasAccessToAccion } = useAuth();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingModulo, setViewingModulo] = useState<Modulo | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const modulosData = await modulosApi.getAll();
      setModulos(modulosData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (modulo: Modulo) => {
    try {
      const fullModulo = await modulosApi.getById(modulo.id);
      setViewingModulo(fullModulo);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error loading modulo details:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Módulos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Módulos predefinidos del sistema (páginas). Solo visualización.
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {modulos.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No hay módulos
            </li>
          ) : (
            modulos.map((modulo) => (
              <li key={modulo.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {modulo.nombre}
                    </h3>
                    {modulo.formularios && (
                      <p className="text-sm text-gray-500">
                        {modulo.formularios.length} formulario(s)
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleView(modulo)}
                    disabled={!hasAccessToAccion("Modulos.Ver Modulos")}
                    className={`${
                      hasAccessToAccion("Modulos.Ver Modulos")
                        ? "text-green-600 hover:text-green-800"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    title={
                      !hasAccessToAccion("Modulos.Ver Modulos")
                        ? "No tienes permisos para ver módulos"
                        : "Ver detalle"
                    }
                  >
                    Ver
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Módulo"
      >
        {viewingModulo && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <p className="text-gray-900 font-medium">
                {viewingModulo.nombre}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formularios ({viewingModulo.formularios?.length || 0})
              </label>
              {viewingModulo.formularios &&
              viewingModulo.formularios.length > 0 ? (
                <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto">
                  <ul className="space-y-2">
                    {viewingModulo.formularios.map((formulario) => (
                      <li key={formulario.id} className="text-sm text-gray-700">
                        • {formulario.nombre}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No hay formularios asociados
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ModulosPage;
