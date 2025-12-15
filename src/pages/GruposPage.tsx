import { useState, useEffect } from 'react';
import { gruposApi, accionesApi } from '../services/api';
import type { Grupo, CreateGrupoDto, UpdateGrupoDto, Accion } from '../types';
import Modal from '../components/Modal';

const GruposPage = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [deletingGrupo, setDeletingGrupo] = useState<Grupo | null>(null);
  const [formData, setFormData] = useState<CreateGrupoDto>({
    nombre: '',
    Estado: true,
    acciones_ids: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gruposData, accionesData] = await Promise.all([
        gruposApi.getAll(),
        accionesApi.getAll(),
      ]);
      setGrupos(gruposData);
      setAcciones(accionesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGrupo(null);
    setFormData({ nombre: '', Estado: true, acciones_ids: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (grupo: Grupo) => {
    setEditingGrupo(grupo);
    setFormData({
      nombre: grupo.nombre,
      Estado: grupo.Estado,
      acciones_ids: grupo.acciones?.map((a) => a.id) || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGrupo) {
        await gruposApi.update(editingGrupo.id, formData as UpdateGrupoDto);
      } else {
        await gruposApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving grupo:', error);
    }
  };

  const handleDeleteClick = (grupo: Grupo) => {
    setDeletingGrupo(grupo);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGrupo) return;
    try {
      await gruposApi.delete(deletingGrupo.id);
      setIsDeleteModalOpen(false);
      setDeletingGrupo(null);
      loadData();
    } catch (error) {
      console.error('Error deleting grupo:', error);
    }
  };

  const toggleAccion = (accionId: number) => {
    const currentIds = formData.acciones_ids || [];
    if (currentIds.includes(accionId)) {
      setFormData({
        ...formData,
        acciones_ids: currentIds.filter((id) => id !== accionId),
      });
    } else {
      setFormData({
        ...formData,
        acciones_ids: [...currentIds, accionId],
      });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grupos</h1>
          <p className="mt-2 text-sm text-gray-600">Gestionar grupos de usuarios</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
        >
          Nuevo Grupo
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {grupos.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">No hay grupos</li>
          ) : (
            grupos.map((grupo) => (
              <li key={grupo.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">{grupo.nombre}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          grupo.Estado
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {grupo.Estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    {grupo.acciones && (
                      <p className="text-sm text-gray-500 mt-1">
                        {grupo.acciones.length} acción(es)
                      </p>
                    )}
                    {grupo.usuarios && (
                      <p className="text-sm text-gray-500">
                        {grupo.usuarios.length} usuario(s)
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(grupo)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(grupo)}
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
        title={editingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.Estado}
                onChange={(e) => setFormData({ ...formData, Estado: e.target.checked })}
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <span className="ml-2 text-sm text-gray-700">Activo</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acciones
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
              {acciones.length === 0 ? (
                <p className="text-sm text-gray-500">No hay acciones disponibles</p>
              ) : (
                acciones.map((accion) => (
                  <label key={accion.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={formData.acciones_ids?.includes(accion.id) || false}
                      onChange={() => toggleAccion(accion.id)}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {accion.nombre} ({accion.formulario?.nombre || 'N/A'})
                    </span>
                  </label>
                ))
              )}
            </div>
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
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              {editingGrupo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingGrupo(null);
        }}
        title="Eliminar Grupo"
      >
        {deletingGrupo && (
          <div>
            <p className="mb-4 text-gray-700">
              ¿Está seguro de eliminar el grupo <strong>{deletingGrupo.nombre}</strong>?
            </p>
            {(deletingGrupo.acciones && deletingGrupo.acciones.length > 0) ||
            (deletingGrupo.usuarios && deletingGrupo.usuarios.length > 0) ? (
              <p className="mb-4 text-sm text-red-600">
                Advertencia: Este grupo tiene{' '}
                {deletingGrupo.acciones?.length || 0} acción(es) y{' '}
                {deletingGrupo.usuarios?.length || 0} usuario(s) asociado(s).
              </p>
            ) : null}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingGrupo(null);
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

export default GruposPage;

