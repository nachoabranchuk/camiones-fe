import { useState, useEffect } from 'react';
import { accionesApi, formulariosApi } from '../services/api';
import type { Accion, CreateAccionDto, UpdateAccionDto, Formulario } from '../types';
import Modal from '../components/Modal';

const AccionesPage = () => {
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAccion, setEditingAccion] = useState<Accion | null>(null);
  const [deletingAccion, setDeletingAccion] = useState<Accion | null>(null);
  const [formData, setFormData] = useState<CreateAccionDto>({ nombre: '', formulario_id: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accionesData, formulariosData] = await Promise.all([
        accionesApi.getAll(),
        formulariosApi.getAll(),
      ]);
      setAcciones(accionesData);
      setFormularios(formulariosData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAccion(null);
    setFormData({ nombre: '', formulario_id: formularios[0]?.id || 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (accion: Accion) => {
    setEditingAccion(accion);
    setFormData({
      nombre: accion.nombre,
      formulario_id: accion.formulario_id || accion.formulario?.id || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccion) {
        await accionesApi.update(editingAccion.id, formData as UpdateAccionDto);
      } else {
        await accionesApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving accion:', error);
    }
  };

  const handleDeleteClick = (accion: Accion) => {
    setDeletingAccion(accion);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAccion) return;
    try {
      await accionesApi.delete(deletingAccion.id);
      setIsDeleteModalOpen(false);
      setDeletingAccion(null);
      loadData();
    } catch (error) {
      console.error('Error deleting accion:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Acciones</h1>
          <p className="mt-2 text-sm text-gray-600">Gestionar acciones</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Nueva Acción
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {acciones.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">No hay acciones</li>
          ) : (
            acciones.map((accion) => (
              <li key={accion.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{accion.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      Formulario: {accion.formulario?.nombre || 'N/A'}
                    </p>
                    {accion.grupos && (
                      <p className="text-sm text-gray-500">
                        {accion.grupos.length} grupo(s)
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(accion)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(accion)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccion ? 'Editar Acción' : 'Nueva Acción'}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="formulario_id" className="block text-sm font-medium text-gray-700">
              Formulario
            </label>
            <select
              id="formulario_id"
              required
              value={formData.formulario_id}
              onChange={(e) => setFormData({ ...formData, formulario_id: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value={0}>Seleccione un formulario</option>
              {formularios.map((formulario) => (
                <option key={formulario.id} value={formulario.id}>
                  {formulario.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {editingAccion ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAccion(null);
        }}
        title="Eliminar Acción"
      >
        {deletingAccion && (
          <div>
            <p className="mb-4 text-gray-700">
              ¿Está seguro de eliminar la acción <strong>{deletingAccion.nombre}</strong>?
            </p>
            {deletingAccion.grupos && deletingAccion.grupos.length > 0 && (
              <p className="mb-4 text-sm text-red-600">
                Advertencia: Esta acción está asociada a {deletingAccion.grupos.length} grupo(s).
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingAccion(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AccionesPage;

