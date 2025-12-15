import { useState, useEffect } from 'react';
import { formulariosApi, modulosApi } from '../services/api';
import type { Formulario, CreateFormularioDto, UpdateFormularioDto, Modulo } from '../types';
import Modal from '../components/Modal';

const FormulariosPage = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingFormulario, setEditingFormulario] = useState<Formulario | null>(null);
  const [viewingFormulario, setViewingFormulario] = useState<Formulario | null>(null);
  const [deletingFormulario, setDeletingFormulario] = useState<Formulario | null>(null);
  const [formData, setFormData] = useState<CreateFormularioDto>({ nombre: '', modulo_id: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formulariosData, modulosData] = await Promise.all([
        formulariosApi.getAll(),
        modulosApi.getAll(),
      ]);
      setFormularios(formulariosData);
      setModulos(modulosData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFormulario(null);
    setFormData({ nombre: '', modulo_id: modulos[0]?.id || 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (formulario: Formulario) => {
    setEditingFormulario(formulario);
    setViewingFormulario(null);
    setFormData({
      nombre: formulario.nombre,
      modulo_id: formulario.modulo_id || formulario.modulo?.id || 0,
    });
    setIsModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleView = async (formulario: Formulario) => {
    try {
      // Fetch full details with acciones
      const fullFormulario = await formulariosApi.getById(formulario.id);
      setViewingFormulario(fullFormulario);
      setEditingFormulario(null);
      setIsViewModalOpen(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error loading formulario details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFormulario) {
        await formulariosApi.update(editingFormulario.id, formData as UpdateFormularioDto);
      } else {
        await formulariosApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving formulario:', error);
    }
  };

  const handleDeleteClick = (formulario: Formulario) => {
    setDeletingFormulario(formulario);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFormulario) return;
    try {
      await formulariosApi.delete(deletingFormulario.id);
      setIsDeleteModalOpen(false);
      setDeletingFormulario(null);
      loadData();
    } catch (error) {
      console.error('Error deleting formulario:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Formularios</h1>
          <p className="mt-2 text-sm text-gray-600">Gestionar formularios</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Nuevo Formulario
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {formularios.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">No hay formularios</li>
          ) : (
            formularios.map((formulario) => (
              <li key={formulario.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{formulario.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      Módulo: {formulario.modulo?.nombre || 'N/A'}
                    </p>
                    {formulario.acciones && (
                      <p className="text-sm text-gray-500">
                        {formulario.acciones.length} acción(es)
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(formulario)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleEdit(formulario)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(formulario)}
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
        title={editingFormulario ? 'Editar Formulario' : 'Nuevo Formulario'}
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="modulo_id" className="block text-sm font-medium text-gray-700">
              Módulo
            </label>
            <select
              id="modulo_id"
              required
              value={formData.modulo_id}
              onChange={(e) => setFormData({ ...formData, modulo_id: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value={0}>Seleccione un módulo</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.nombre}
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {editingFormulario ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Formulario"
      >
        {viewingFormulario && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <p className="text-gray-900 font-medium">{viewingFormulario.nombre}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Módulo
              </label>
              <p className="text-gray-900">{viewingFormulario.modulo?.nombre || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acciones ({viewingFormulario.acciones?.length || 0})
              </label>
              {viewingFormulario.acciones && viewingFormulario.acciones.length > 0 ? (
                <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto">
                  <ul className="space-y-2">
                    {viewingFormulario.acciones.map((accion) => (
                      <li key={accion.id} className="text-sm text-gray-700">
                        • {accion.nombre}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay acciones asociadas</p>
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
          setDeletingFormulario(null);
        }}
        title="Eliminar Formulario"
      >
        {deletingFormulario && (
          <div>
            <p className="mb-4 text-gray-700">
              ¿Está seguro de eliminar el formulario <strong>{deletingFormulario.nombre}</strong>?
            </p>
            {deletingFormulario.acciones && deletingFormulario.acciones.length > 0 && (
              <p className="mb-4 text-sm text-red-600">
                Advertencia: Este formulario tiene {deletingFormulario.acciones.length} acción(es) asociada(s).
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingFormulario(null);
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

export default FormulariosPage;

