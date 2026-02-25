import { useState, useEffect } from "react";
import { choferesApi } from "../services/api";
import { Pencil, Trash2 } from "lucide-react";
import type { Chofer, CreateChoferDto } from "../types";
import Modal from "../components/Modal";

const ChoferesPage = () => {
  const [items, setItems] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Chofer | null>(null);
  const [form, setForm] = useState<CreateChoferDto>({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    activo: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [includeInactivos, setIncludeInactivos] = useState(false);
  const [choferAEliminar, setChoferAEliminar] = useState<Chofer | null>(null);

  const load = () => {
    setLoading(true);
    choferesApi
      .getAll(!includeInactivos)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [includeInactivos]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      email: "",
      activo: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (c: Chofer) => {
    setEditing(c);
    setForm({
      nombre: c.nombre,
      apellido: c.apellido,
      dni: c.dni,
      telefono: c.telefono,
      email: c.email ?? "",
      activo: c.activo,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = { ...form, email: form.email || null };
    try {
      if (editing) {
        await choferesApi.update(editing.id, payload);
      } else {
        await choferesApi.create(payload);
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al guardar");
    }
  };

  const handleRequestDelete = (c: Chofer) => {
    setChoferAEliminar(c);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!choferAEliminar) return;
    setError(null);
    try {
      await choferesApi.delete(choferAEliminar.id);
      setChoferAEliminar(null);
      load();
    } catch {
      setError("No se pudo eliminar");
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Choferes</h1>
          <p className="mt-2 text-sm text-gray-600">Gestión de choferes</p>
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
            Nuevo chofer
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">No hay choferes</li>
            ) : (
              items.map((c) => (
                <li key={c.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-black">
                      {c.apellido}, {c.nombre}
                    </p>
                    <p className="text-sm text-gray-500">
                      DNI: {c.dni} · Tel: {c.telefono}
                      {c.email ? ` · ${c.email}` : ""} · {c.activo ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="text-brandRed hover:text-brandRed-dark text-sm"
                      aria-label="Editar chofer"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestDelete(c)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      aria-label="Eliminar chofer"
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
        title={editing ? "Editar chofer" : "Nuevo chofer"}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={form.apellido}
                onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
            <input
              type="text"
              value={form.dni}
              onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="text"
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
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
        isOpen={choferAEliminar != null}
        onClose={() => setChoferAEliminar(null)}
        title="Confirmar eliminación"
      >
        <p className="mb-4 text-sm text-gray-700">
          ¿Seguro que querés eliminar al chofer{" "}
          {choferAEliminar ? `${choferAEliminar.apellido}, ${choferAEliminar.nombre}` : ""}?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setChoferAEliminar(null)}
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

export default ChoferesPage;
