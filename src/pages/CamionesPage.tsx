import { useState, useEffect } from "react";
import { camionesApi, marcasApi } from "../services/api";
import { Pencil, Trash2 } from "lucide-react";
import type { Camion, Marca, CreateCamionDto } from "../types";
import Modal from "../components/Modal";

const CamionesPage = () => {
  const [items, setItems] = useState<Camion[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Camion | null>(null);
  const [form, setForm] = useState<CreateCamionDto>({
    patente: "",
    anio: new Date().getFullYear(),
    modelo: "",
    marcaId: "",
    activo: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [includeInactivos, setIncludeInactivos] = useState(false);
  const [camionAEliminar, setCamionAEliminar] = useState<Camion | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      camionesApi.getAll(!includeInactivos),
      marcasApi.getAll(true),
    ])
      .then(([camiones, marcasList]) => {
        setItems(camiones);
        setMarcas(marcasList);
        if (marcasList.length > 0 && !form.marcaId) {
          setForm((f) => ({ ...f, marcaId: marcasList[0].id }));
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [includeInactivos]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      patente: "",
      anio: new Date().getFullYear(),
      modelo: "",
      marcaId: marcas[0]?.id ?? "",
      activo: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (c: Camion) => {
    setEditing(c);
    setForm({
      patente: c.patente,
      anio: c.anio,
      modelo: c.modelo,
      marcaId: c.marca?.id ?? c.marcaId ?? "",
      activo: c.activo,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await camionesApi.update(editing.id, form);
      } else {
        await camionesApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al guardar");
    }
  };

  const handleRequestDelete = (c: Camion) => {
    setCamionAEliminar(c);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!camionAEliminar) return;
    setError(null);
    try {
      await camionesApi.delete(camionAEliminar.id);
      setCamionAEliminar(null);
      load();
    } catch {
      setError("No se pudo eliminar");
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Camiones</h1>
          <p className="mt-2 text-sm text-gray-600">Gestión de camiones</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeInactivos}
              onChange={(e) => setIncludeInactivos(e.target.checked)}
            />
            Incluir inactivos
          </label>
          <button
            type="button"
            onClick={openCreate}
            className="bg-brandRed-dark text-white px-4 py-2 rounded hover:bg-brandRed"
          >
            Nuevo camión
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">No hay camiones</li>
            ) : (
              items.map((c) => (
                <li key={c.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-black">
                      {c.patente} · {c.modelo} ({c.anio})
                    </p>
                    <p className="text-sm text-gray-500">
                      {c.marca?.nombre ?? "—"} · {c.activo ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="text-brandRed hover:text-brandRed-dark text-sm"
                      aria-label="Editar camión"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestDelete(c)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      aria-label="Eliminar camión"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
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
        title={editing ? "Editar camión" : "Nuevo camión"}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patente *</label>
            <input
              type="text"
              value={form.patente}
              onChange={(e) => setForm((f) => ({ ...f, patente: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
              <input
                type="number"
                min={1900}
                max={2100}
                value={form.anio}
                onChange={(e) => setForm((f) => ({ ...f, anio: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <input
                type="text"
                value={form.modelo}
                onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
            <select
              value={form.marcaId}
              onChange={(e) => setForm((f) => ({ ...f, marcaId: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Seleccionar</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.activo ?? true}
                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              />
              Activo
            </label>
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
        isOpen={camionAEliminar != null}
        onClose={() => setCamionAEliminar(null)}
        title="Confirmar eliminación"
      >
        <p className="mb-4 text-sm text-gray-700">
          ¿Seguro que querés eliminar el camión{" "}
          {camionAEliminar ? `${camionAEliminar.patente} · ${camionAEliminar.modelo} (${camionAEliminar.anio})` : ""}?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setCamionAEliminar(null)}
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
    </div>
  );
};

export default CamionesPage;
