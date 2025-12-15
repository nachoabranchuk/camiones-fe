import { useState, useEffect } from 'react';
import { modulosApi } from '../services/api';
import type { Modulo, CreateModuloDto, UpdateModuloDto } from '../types';
import Modal from '../components/Modal';

const ModulosPage = () => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [viewingModulo, setViewingModulo] = useState<Modulo | null>(null);
  const [deletingModulo, setDeletingModulo] = useState<Modulo | null>(null);
  const [formData, setFormData] = useState<CreateModuloDto>({ nombre: '' });

  useEffect(() => {
    loadModulos();
  }, []);

  const loadModulos = async () => {
    try {
      setLoading(true);
      const data = await modulosApi.getAll();
      setModulos(data);
    } catch (error) {
      console.error('Error loading modulos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModulo(null);
    setFormData({ nombre: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (modulo: Modulo) => {
    setEditingModulo(modulo);
    setViewingModulo(null);
    setFormData({ nombre: modulo.nombre });
    setIsModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleView = async (modulo: Modulo) => {
    try {
      // Fetch full details with formularios
      const fullModulo = await modulosApi.getById(modulo.id);
      setViewingModulo(fullModulo);
      setEditingModulo(null);
      setIsViewModalOpen(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error loading modulo details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModulo) {
        await modulosApi.update(editingModulo.id, formData as UpdateModuloDto);
      } else {
        await modulosApi.create(formData);
      }
      setIsModalOpen(false);
      loadModulos();
    } catch (error) {
      console.error('Error saving modulo:', error);
    }
  };

  const handleDeleteClick = (modulo: Modulo) => {
    setDeletingModulo(modulo);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingModulo) return;
    try {
      await modulosApi.delete(deletingModulo.id);
      setIsDeleteModalOpen(false);
      setDeletingModulo(null);
      loadModulos();
    } catch (error) {
      console.error('Error deleting modulo:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Módulos</h1>
          <p className="mt-2 text-sm text-gray-600">Gestionar módulos del sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Nuevo Módulo
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {modulos.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">No hay módulos</li>
          ) : (
            modulos.map((modulo) => (
              <li key={modulo.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{modulo.nombre}</h3>
                    {modulo.formularios && (
                      <p className="text-sm text-gray-500">
                        {modulo.formularios.length} formulario(s)
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(modulo)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleEdit(modulo)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(modulo)}
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
        title={editingModulo ? 'Editar Módulo' : 'Nuevo Módulo'}
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingModulo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

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
              <p className="text-gray-900 font-medium">{viewingModulo.nombre}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formularios ({viewingModulo.formularios?.length || 0})
              </label>
              {viewingModulo.formularios && viewingModulo.formularios.length > 0 ? (
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
                <p className="text-sm text-gray-500 italic">No hay formularios asociados</p>
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingModulo(null);
        }}
        title="Eliminar Módulo"
      >
        {deletingModulo && (
          <div>
            <p className="mb-4 text-gray-700">
              ¿Está seguro de eliminar el módulo <strong>{deletingModulo.nombre}</strong>?
            </p>
            {deletingModulo.formularios && deletingModulo.formularios.length > 0 && (
              <p className="mb-4 text-sm text-red-600">
              Advertencia: Este módulo tiene {deletingModulo.formularios.length} formulario(s) asociado(s).
            </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingModulo(null);
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

export default ModulosPage;

