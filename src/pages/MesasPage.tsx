import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { mesasApi, pedidosApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Mesa } from "../types";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmVariant?: "danger" | "success";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  confirmVariant = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md ${
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const MesasPage = () => {
  const navigate = useNavigate();
  const { hasAccessToAccion } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newMesaNumero, setNewMesaNumero] = useState("");
  const [copiedMesaId, setCopiedMesaId] = useState<number | null>(null);
  const [pendingByMesa, setPendingByMesa] = useState<Record<number, number>>(
    {},
  );
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    confirmVariant: "danger" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "",
    confirmVariant: "danger",
  });

  useEffect(() => {
    loadMesas();
  }, []);

  const loadPendientesPorMesa = useCallback(async () => {
    try {
      const data = await pedidosApi.getPendientesPorMesa();
      const map: Record<number, number> = {};
      data.forEach(({ mesaId, count }) => {
        map[mesaId] = count;
      });
      setPendingByMesa(map);
    } catch {
      // Silently ignore polling errors
    }
  }, []);

  useEffect(() => {
    loadPendientesPorMesa();
    const interval = setInterval(loadPendientesPorMesa, 5 * 60 * 1000); // cada 5 minutos
    return () => clearInterval(interval);
  }, [loadPendientesPorMesa]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") loadPendientesPorMesa();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [loadPendientesPorMesa]);

  const loadMesas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await mesasApi.getAll();
      // Sort by numero
      setMesas(data.sort((a, b) => a.numero - b.numero));
    } catch (err: any) {
      console.error("Error loading mesas:", err);
      setError("Error al cargar las mesas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMesa = async () => {
    const numero = parseInt(newMesaNumero);
    if (isNaN(numero) || numero <= 0) {
      setError("Por favor ingresa un número de mesa válido");
      return;
    }

    try {
      await mesasApi.create(numero);
      setNewMesaNumero("");
      setIsCreating(false);
      await loadMesas();
    } catch (err: any) {
      console.error("Error creating mesa:", err);
      setError(err.response?.data?.message || "Error al crear la mesa");
    }
  };

  const handleToggleStatus = (mesa: Mesa) => {
    const newStatus = !mesa.estaAbierta;
    const action = newStatus ? "abrir" : "cerrar";

    setConfirmModal({
      isOpen: true,
      title: newStatus ? "Abrir Mesa" : "Cerrar Mesa",
      message: newStatus
        ? `¿Deseas abrir la Mesa ${mesa.numero}? Se generará un nuevo código de verificación.`
        : `¿Deseas cerrar la Mesa ${mesa.numero}? Los clientes no podrán realizar pedidos.`,
      confirmText: newStatus ? "Abrir Mesa" : "Cerrar Mesa",
      confirmVariant: newStatus ? "success" : "danger",
      onConfirm: async () => {
        try {
          await mesasApi.updateStatus(mesa.idmesa, newStatus);
          await loadMesas();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error(`Error al ${action} mesa:`, err);
          const msg =
            err.response?.data?.message || `Error al ${action} la mesa`;
          setError(msg);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          // If closing failed due to pending pedidos, the error div will show the cartel
        }
      },
    });
  };

  const handleDeleteMesa = (mesa: Mesa) => {
    // Prevent deleting if mesa is open
    if (mesa.estaAbierta) {
      setError(
        "No se puede eliminar una mesa que está abierta. Por favor, ciérrala primero.",
      );
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Eliminar Mesa",
      message: `¿Estás seguro de que deseas eliminar la Mesa ${mesa.numero}? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await mesasApi.delete(mesa.idmesa);
          await loadMesas();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error("Error deleting mesa:", err);
          setError(err.response?.data?.message || "Error al eliminar la mesa");
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleCopyCode = async (codigo: string, mesaId: number) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiedMesaId(mesaId);
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedMesaId(null);
      }, 2000);
    } catch (err) {
      console.error("Error copying code:", err);
      setError("Error al copiar el código");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
          <p className="text-gray-600 mt-1">
            Administra las mesas del establecimiento
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva Mesa
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-600 underline text-sm mt-1"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Create Mesa Form */}
      {isCreating && (
        <div className="mb-6 bg-white rounded-lg shadow p-4 border">
          <h3 className="font-semibold text-gray-900 mb-3">Crear Nueva Mesa</h3>
          <div className="flex gap-3">
            <input
              type="number"
              value={newMesaNumero}
              onChange={(e) => setNewMesaNumero(e.target.value)}
              placeholder="Número de mesa"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
            <button
              onClick={handleCreateMesa}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Crear
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewMesaNumero("");
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Notificación: hay pedidos pendientes */}
      {Object.values(pendingByMesa).some((c) => c > 0) && (
        <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
          <svg
            className="w-5 h-5 shrink-0 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="font-medium">
            Hay {Object.values(pendingByMesa).reduce((a, b) => a + b, 0)} pedido
            {Object.values(pendingByMesa).reduce((a, b) => a + b, 0) !== 1
              ? "s"
              : ""}{" "}
            pendiente
            {Object.values(pendingByMesa).reduce((a, b) => a + b, 0) !== 1
              ? "s"
              : ""}{" "}
            en las mesas. Revisa y confirma o rechaza desde "Ver Pedidos".
          </span>
        </div>
      )}

      {/* Mesas Grid */}
      {mesas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay mesas registradas</p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            Crear primera mesa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mesas.map((mesa) => (
            <div
              key={mesa.idmesa}
              className={`bg-white rounded-lg shadow border-2 p-4 ${
                mesa.estaAbierta ? "border-green-400" : "border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Mesa {mesa.numero}
                  </h2>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      mesa.estaAbierta
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {mesa.estaAbierta ? "Abierta" : "Cerrada"}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteMesa(mesa)}
                  disabled={
                    mesa.estaAbierta ||
                    !hasAccessToAccion("Mesas.Eliminar Mesa")
                  }
                  className={`p-1 relative group ${
                    mesa.estaAbierta ||
                    !hasAccessToAccion("Mesas.Eliminar Mesa")
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-400 hover:text-red-600"
                  }`}
                  title={
                    mesa.estaAbierta
                      ? "No se puede eliminar una mesa abierta. Por favor, ciérrala primero."
                      : !hasAccessToAccion("Mesas.Eliminar Mesa")
                      ? "No tienes permisos para eliminar mesas"
                      : "Eliminar mesa"
                  }
                >
                  {mesa.estaAbierta && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                        No se puede eliminar una mesa abierta. Por favor,
                        ciérrala primero.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Verification Code - Only show when open */}
              {mesa.estaAbierta && mesa.codigoVerificacion && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-blue-600 font-medium">
                      Código de verificación
                    </p>
                    <button
                      onClick={() =>
                        handleCopyCode(mesa.codigoVerificacion!, mesa.idmesa)
                      }
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Copiar código"
                    >
                      {copiedMesaId === mesa.idmesa ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-2xl font-mono font-bold text-blue-800 tracking-wider">
                    {mesa.codigoVerificacion}
                  </p>
                  {copiedMesaId === mesa.idmesa && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      ✓ Código copiado
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Historial (tickets) - requiere Mesas.Ver Historial de Pedidos */}
                <button
                  onClick={() => navigate(`/mesas/${mesa.numero}/historial`)}
                  disabled={
                    !hasAccessToAccion("Mesas.Ver Historial de Pedidos")
                  }
                  className={`w-full py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                    hasAccessToAccion("Mesas.Ver Historial de Pedidos")
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  title={
                    hasAccessToAccion("Mesas.Ver Historial de Pedidos")
                      ? "Historial de tickets"
                      : "No tienes permisos para ver el historial"
                  }
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Historial tickets
                </button>
                {/* Ver Pedidos Button */}
                <div className="relative group">
                  <button
                    onClick={() => navigate(`/mesas/${mesa.numero}/pedidos`)}
                    disabled={
                      !mesa.estaAbierta ||
                      !hasAccessToAccion("Mesas.Ver Pedidos")
                    }
                    className={`w-full py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 relative ${
                      mesa.estaAbierta && hasAccessToAccion("Mesas.Ver Pedidos")
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {pendingByMesa[mesa.idmesa] > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white shadow"
                        aria-label={`${
                          pendingByMesa[mesa.idmesa]
                        } pedidos pendientes`}
                      >
                        {pendingByMesa[mesa.idmesa] > 99
                          ? "99+"
                          : pendingByMesa[mesa.idmesa]}
                      </span>
                    )}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Ver Pedidos
                  </button>
                  {(!mesa.estaAbierta ||
                    !hasAccessToAccion("Mesas.Ver Pedidos")) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                        {!mesa.estaAbierta
                          ? "La mesa debe estar abierta para ver pedidos"
                          : "No tienes permisos para ver pedidos"}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => handleToggleStatus(mesa)}
                  disabled={
                    mesa.estaAbierta
                      ? !hasAccessToAccion("Mesas.Cerrar Mesa")
                      : !hasAccessToAccion("Mesas.Abrir Mesa")
                  }
                  className={`w-full py-2 rounded-md font-medium transition-colors ${
                    mesa.estaAbierta
                      ? hasAccessToAccion("Mesas.Cerrar Mesa")
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : hasAccessToAccion("Mesas.Abrir Mesa")
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  title={
                    mesa.estaAbierta
                      ? !hasAccessToAccion("Mesas.Cerrar Mesa")
                        ? "No tienes permisos para cerrar mesas"
                        : "Cerrar mesa"
                      : !hasAccessToAccion("Mesas.Abrir Mesa")
                      ? "No tienes permisos para abrir mesas"
                      : "Abrir mesa"
                  }
                >
                  {mesa.estaAbierta ? "Cerrar Mesa" : "Abrir Mesa"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default MesasPage;
