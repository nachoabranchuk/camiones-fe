import { useState, useEffect } from "react";
import { tiposCargaApi } from "../services/api";
import { Pencil, Trash2 } from "lucide-react";
import type { TipoCarga, CreateTipoCargaDto, UnidadMedida } from "../types";
import Modal from "../components/Modal";

const UNIDADES: UnidadMedida[] = [
  "KG",
  "TONELADAS",
  "LITROS",
  "METROS_CUBICOS",
  "METROS_CUADRADOS",
  "UNIDADES",
  "CONTENEDOR",
  "OTRO",
];

const TiposCargaPage = () => {
  const [items, setItems] = useState<TipoCarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TipoCarga | null>(null);
  const [form, setForm] = useState<CreateTipoCargaDto>({
    nombre: "",
    unidadMedida: "METROS_CUBICOS",
    activo: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [includeInactivos, setIncludeInactivos] = useState(false);
  const [tipoCargaAEliminar, setTipoCargaAEliminar] = useState<TipoCarga | null>(null);

  const load = () => {
    setLoading(true);
    tiposCargaApi
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
    setForm({ nombre: "", unidadMedida: "METROS_CUBICOS", activo: true });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (t: TipoCarga) => {
    setEditing(t);
    setForm({
      nombre: t.nombre,
      unidadMedida: t.unidadMedida,
      activo: t.activo,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await tiposCargaApi.update(editing.id, form);
      } else {
        await tiposCargaApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al guardar");
    }
  };

  const handleRequestDelete = (t: TipoCarga) => {
    setTipoCargaAEliminar(t);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!tipoCargaAEliminar) return;
    setError(null);
    try {
      await tiposCargaApi.delete(tipoCargaAEliminar.id);
      setTipoCargaAEliminar(null);
      load();
    } catch {
      setError("No se pudo eliminar");
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Tipos de Carga</h1>
          <p className="mt-2 text-sm text-gray-600">Gestión de tipos de carga</p>
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
            Nuevo tipo
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">No hay tipos de carga</li>
            ) : (
              items.map((t) => (
                <li key={t.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-black">{t.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {t.unidadMedida} · {t.activo ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      className="text-brandRed hover:text-brandRed-dark text-sm"
                      aria-label="Editar tipo de carga"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestDelete(t)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      aria-label="Eliminar tipo de carga"
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
        title={editing ? "Editar tipo de carga" : "Nuevo tipo de carga"}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de medida *</label>
            <select
              value={form.unidadMedida}
              onChange={(e) => setForm((f) => ({ ...f, unidadMedida: e.target.value as UnidadMedida }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>{u}</option>
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
        isOpen={tipoCargaAEliminar != null}
        onClose={() => setTipoCargaAEliminar(null)}
        title="Confirmar eliminación"
      >
        <p className="mb-4 text-sm text-gray-700">
          ¿Seguro que querés eliminar el tipo de carga{" "}
          {tipoCargaAEliminar ? tipoCargaAEliminar.nombre : ""}?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setTipoCargaAEliminar(null)}
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

export default TiposCargaPage;
