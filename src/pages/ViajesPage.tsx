import { useState, useEffect } from "react";
import {
  viajesApi,
  choferesApi,
  camionesApi,
  tiposCargaApi,
} from "../services/api";
import { Pencil, Trash2 } from "lucide-react";
import type {
  Viaje,
  Chofer,
  Camion,
  TipoCarga,
  CreateViajeDto,
  EstadoViaje,
} from "../types";
import Modal from "../components/Modal";

const ESTADOS: EstadoViaje[] = ["PENDIENTE", "EN_CURSO", "FINALIZADO", "CANCELADO"];

const getToday = () => new Date().toISOString().slice(0, 10);
const formatMoney = (value: number) =>
  Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ViajesPage = () => {
  const [items, setItems] = useState<Viaje[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [tiposCarga, setTiposCarga] = useState<TipoCarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const [editing, setEditing] = useState<Viaje | null>(null);
  const [viajeAFinalizar, setViajeAFinalizar] = useState<Viaje | null>(null);
  const [pesoFinal, setPesoFinal] = useState("");
  const [viajeAEliminar, setViajeAEliminar] = useState<Viaje | null>(null);
  const [form, setForm] = useState<CreateViajeDto>({
    fecha: new Date().toISOString().slice(0, 10),
    origen: "",
    destino: "",
    choferId: "",
    camionId: "",
    tipoCargaId: "",
    kilometrosEstimados: 0,
    pesoEstimado: 0,
    valor: 0,
  });
  const [filters, setFilters] = useState<{
    fechaDesde?: string;
    fechaHasta?: string;
    choferId?: string;
    estado?: string;
    origen?: string;
    destino?: string;
  }>({ fechaDesde: getToday(), fechaHasta: getToday() });
  const [error, setError] = useState<string | null>(null);

  const loadViajes = () => {
    setLoading(true);
    viajesApi
      .getAll(filters)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadViajes();
  }, [filters.fechaDesde, filters.fechaHasta, filters.choferId, filters.estado, filters.origen, filters.destino]);

  useEffect(() => {
    choferesApi.getAll(true).then(setChoferes).catch(() => setChoferes([]));
    camionesApi.getAll(true).then(setCamiones).catch(() => setCamiones([]));
    tiposCargaApi.getAll(true).then(setTiposCarga).catch(() => setTiposCarga([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      fecha: new Date().toISOString().slice(0, 10),
      origen: "",
      destino: "",
      choferId: choferes[0]?.id ?? "",
      camionId: camiones[0]?.id ?? "",
      tipoCargaId: tiposCarga[0]?.id ?? "",
      kilometrosEstimados: 0,
      pesoEstimado: 0,
      valor: 0,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (v: Viaje) => {
    if (v.estado === "FINALIZADO") return;
    setEditing(v);
    setForm({
      fecha: v.fecha.slice(0, 10),
      origen: v.origen,
      destino: v.destino,
      choferId: v.chofer?.id ?? v.choferId ?? "",
      camionId: v.camion?.id ?? v.camionId ?? "",
      tipoCargaId: v.tipoCarga?.id ?? v.tipoCargaId ?? "",
      kilometrosEstimados: Number(v.kilometrosEstimados),
      pesoEstimado: Number(v.pesoEstimado),
      valor: Number(v.valor),
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      ...form,
      fecha: (form.fecha && String(form.fecha).trim().length === 10)
        ? String(form.fecha).trim()
        : getToday(),
    };
    try {
      if (editing) {
        await viajesApi.update(editing.id, payload);
      } else {
        await viajesApi.create(payload);
      }
      setModalOpen(false);
      loadViajes();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al guardar");
    }
  };

  const openFinalizar = (v: Viaje) => {
    setViajeAFinalizar(v);
    setPesoFinal("");
    setFinalizarModalOpen(true);
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viajeAFinalizar || !pesoFinal || Number(pesoFinal) <= 0) return;
    setError(null);
    try {
      await viajesApi.finalizar(viajeAFinalizar.id, {
        pesoFinal: Number(pesoFinal),
      });
      setFinalizarModalOpen(false);
      loadViajes();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al finalizar");
    }
  };

  const handleIniciar = async (v: Viaje) => {
    try {
      await viajesApi.update(v.id, { estado: "EN_CURSO" });
      loadViajes();
    } catch {
      setError("Error al iniciar viaje");
    }
  };

  const handleRequestDelete = (v: Viaje) => {
    setViajeAEliminar(v);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!viajeAEliminar) return;
    setError(null);
    try {
      await viajesApi.delete(viajeAEliminar.id);
      setViajeAEliminar(null);
      loadViajes();
    } catch {
      setError("No se pudo eliminar");
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Viajes</h1>
          <p className="mt-2 text-sm text-gray-600">
            Registrar y gestionar viajes. Estado: PENDIENTE → EN_CURSO → FINALIZADO (con peso final).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-brandRed-dark text-white px-4 py-2 rounded hover:bg-brandRed"
        >
          Registrar viaje
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow border border-gray-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={filters.fechaDesde ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, fechaDesde: e.target.value || undefined }))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={filters.fechaHasta ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, fechaHasta: e.target.value || undefined }))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Estado</label>
          <select
            value={filters.estado ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value || undefined }))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Todos</option>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Chofer</label>
          <select
            value={filters.choferId ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, choferId: e.target.value || undefined }))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Todos</option>
            {choferes.map((c) => (
              <option key={c.id} value={c.id}>{c.apellido}, {c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Origen</label>
          <input
            type="text"
            placeholder="Búsqueda parcial"
            value={filters.origen ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, origen: e.target.value || undefined }))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Destino</label>
          <input
            type="text"
            placeholder="Búsqueda parcial"
            value={filters.destino ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, destino: e.target.value || undefined }))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>
      )}

      {loading ? (
        <p className="text-center py-8 text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">No hay viajes</li>
            ) : (
              items.map((v) => (
                <li key={v.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-black">
                        {v.fecha} · {v.origen} → {v.destino}
                      </p>
                      <p className="text-sm text-gray-500">
                        Chofer: {v.chofer?.apellido}, {v.chofer?.nombre} · Camión: {v.camion?.patente} · Tipo: {v.tipoCarga?.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        KM: {v.kilometrosEstimados} · Peso est.: {v.pesoEstimado}
                        {v.pesoFinal != null ? ` · Peso final: ${v.pesoFinal}` : ""}
                        {" · Valor unit.: $"}
                        {formatMoney(Number(v.valor))}
                        {" · Total: $"}
                        {formatMoney(
                          v.valorTotal ??
                          Number(v.valor) *
                            Number(
                              v.pesoFinal != null ? v.pesoFinal : v.pesoEstimado,
                            ),
                        )}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                          v.estado === "FINALIZADO"
                            ? "bg-green-100 text-green-800"
                            : v.estado === "EN_CURSO"
                            ? "bg-gray-200 text-gray-800"
                            : v.estado === "CANCELADO"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {v.estado}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {v.estado === "PENDIENTE" && (
                        <button
                          type="button"
                          onClick={() => handleIniciar(v)}
                          className="text-sm text-brandRed hover:text-brandRed-dark"
                        >
                          Iniciar
                        </button>
                      )}
                      {v.estado === "EN_CURSO" && (
                        <button
                          type="button"
                          onClick={() => openFinalizar(v)}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Finalizar
                        </button>
                      )}
                      {v.estado !== "FINALIZADO" && (
                        <button
                          type="button"
                          onClick={() => openEdit(v)}
                          className="text-sm text-brandRed hover:text-brandRed-dark"
                          aria-label="Editar viaje"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRequestDelete(v)}
                        className="text-sm text-red-600 hover:text-red-800"
                        aria-label="Eliminar viaje"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar viaje" : "Registrar viaje"}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date"
              value={form.fecha && form.fecha.length === 10 ? form.fecha : getToday()}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value || getToday() }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origen *</label>
              <input
                type="text"
                value={form.origen}
                onChange={(e) => setForm((f) => ({ ...f, origen: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
              <input
                type="text"
                value={form.destino}
                onChange={(e) => setForm((f) => ({ ...f, destino: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chofer *</label>
              <select
                value={form.choferId}
                onChange={(e) => setForm((f) => ({ ...f, choferId: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Seleccionar</option>
                {choferes.map((c) => (
                  <option key={c.id} value={c.id}>{c.apellido}, {c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Camión *</label>
              <select
                value={form.camionId}
                onChange={(e) => setForm((f) => ({ ...f, camionId: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Seleccionar</option>
                {camiones.map((c) => (
                  <option key={c.id} value={c.id}>{c.patente}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo carga *</label>
              <select
                value={form.tipoCargaId}
                onChange={(e) => setForm((f) => ({ ...f, tipoCargaId: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Seleccionar</option>
                {tiposCarga.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KM estimados *</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={form.kilometrosEstimados || ""}
                onChange={(e) => setForm((f) => ({ ...f, kilometrosEstimados: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso estimado *</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={form.pesoEstimado || ""}
                onChange={(e) => setForm((f) => ({ ...f, pesoEstimado: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor por unidad de peso *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.valor || ""}
                onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-brandRed-dark text-white rounded hover:bg-brandRed">
              {editing ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={viajeAEliminar != null}
        onClose={() => setViajeAEliminar(null)}
        title="Confirmar eliminación"
      >
        <p className="mb-4 text-sm text-gray-700">
          ¿Seguro que querés eliminar este viaje{" "}
          {viajeAEliminar ? `${viajeAEliminar.origen} → ${viajeAEliminar.destino} (${viajeAEliminar.fecha})` : ""}?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setViajeAEliminar(null)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={finalizarModalOpen}
        onClose={() => setFinalizarModalOpen(false)}
        title="Finalizar viaje"
      >
        <form onSubmit={handleFinalizar}>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>
          )}
          <p className="mb-4 text-sm text-gray-600">
            Ingresá el peso final para marcar el viaje como finalizado.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso final *</label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={pesoFinal}
              onChange={(e) => setPesoFinal(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setFinalizarModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-brandRed-dark text-white rounded hover:bg-brandRed">
              Finalizar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ViajesPage;
