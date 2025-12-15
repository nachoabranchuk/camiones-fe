import { useState, useEffect } from "react";
import { usuariosApi, gruposApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { User, CreateUserDto, UpdateUserDto, Grupo } from "../types";
import Modal from "../components/Modal";

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<User | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    Nombre: "",
    Apellido: "",
    Correo: "",
    Contrasena: "",
    Telefono: "",
    EstaActivo: true,
    grupos_ids: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usuariosData, gruposData] = await Promise.all([
        usuariosApi.getAll(),
        gruposApi.getAll(),
      ]);
      setUsuarios(usuariosData || []);
      setGrupos(gruposData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUsuario(null);
    setFormData({
      Nombre: "",
      Apellido: "",
      Correo: "",
      Contrasena: "",
      Telefono: "",
      EstaActivo: true,
      grupos_ids: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (usuario: User) => {
    setEditingUsuario(usuario);
    setFormData({
      Nombre: usuario.nombre,
      Apellido: usuario.apellido,
      Correo: usuario.correo,
      Contrasena: "",
      Telefono: usuario.telefono,
      EstaActivo: usuario.estaActivo,
      grupos_ids: usuario.grupos?.map((g) => g.id) || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUsuario) {
        const updateData: UpdateUserDto = {
          Nombre: formData.Nombre,
          Apellido: formData.Apellido,
          Correo: formData.Correo,
          Telefono: formData.Telefono,
          EstaActivo: formData.EstaActivo,
          grupos_ids: formData.grupos_ids,
        };
        await usuariosApi.update(editingUsuario.id, updateData);
      } else {
        await usuariosApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving usuario:", error);
    }
  };

  const handleDeleteClick = (usuario: User) => {
    setDeletingUsuario(usuario);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUsuario) return;
    try {
      await usuariosApi.delete(deletingUsuario.id);
      setIsDeleteModalOpen(false);
      setDeletingUsuario(null);
      loadData();
    } catch (error) {
      console.error("Error deleting usuario:", error);
    }
  };

  const toggleGrupo = (grupoId: number) => {
    const currentIds = formData.grupos_ids || [];
    if (currentIds.includes(grupoId)) {
      setFormData({
        ...formData,
        grupos_ids: currentIds.filter((id) => id !== grupoId),
      });
    } else {
      setFormData({
        ...formData,
        grupos_ids: [...currentIds, grupoId],
      });
    }
  };

  const canDelete = (_usuario: User) => {
    // Permissions are now handled through modulos/acciones
    // Users with access to the Usuarios modulo can delete users
    return true;
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestionar usuarios del sistema
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {usuarios.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No hay usuarios
            </li>
          ) : (
            usuarios.map((usuario) => (
              <li key={usuario.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {usuario.nombre} {usuario.apellido}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          usuario.estaActivo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {usuario.estaActivo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{usuario.correo}</p>
                    <p className="text-sm text-gray-500">{usuario.telefono}</p>
                    {usuario.grupos && (
                      <p className="text-sm text-gray-500 mt-1">
                        {usuario.grupos.length} grupo(s)
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    {canDelete(usuario) && (
                      <button
                        onClick={() => handleDeleteClick(usuario)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    )}
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
        title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="Nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              type="text"
              id="Nombre"
              required
              value={formData.Nombre}
              onChange={(e) =>
                setFormData({ ...formData, Nombre: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="Apellido"
              className="block text-sm font-medium text-gray-700"
            >
              Apellido
            </label>
            <input
              type="text"
              id="Apellido"
              required
              value={formData.Apellido}
              onChange={(e) =>
                setFormData({ ...formData, Apellido: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="Correo"
              className="block text-sm font-medium text-gray-700"
            >
              Correo
            </label>
            <input
              type="email"
              id="Correo"
              required
              value={formData.Correo}
              onChange={(e) =>
                setFormData({ ...formData, Correo: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          {!editingUsuario && (
            <div className="mb-4">
              <label
                htmlFor="Contrasena"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="Contrasena"
                required={!editingUsuario}
                value={formData.Contrasena}
                onChange={(e) =>
                  setFormData({ ...formData, Contrasena: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="Telefono"
              className="block text-sm font-medium text-gray-700"
            >
              Teléfono
            </label>
            <input
              type="tel"
              id="Telefono"
              required
              value={formData.Telefono}
              onChange={(e) =>
                setFormData({ ...formData, Telefono: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.EstaActivo}
                onChange={(e) =>
                  setFormData({ ...formData, EstaActivo: e.target.checked })
                }
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Activo</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grupos
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
              {grupos.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay grupos disponibles
                </p>
              ) : (
                grupos.map((grupo) => (
                  <label key={grupo.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={formData.grupos_ids?.includes(grupo.id) || false}
                      onChange={() => toggleGrupo(grupo.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {grupo.nombre}
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
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              {editingUsuario ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUsuario(null);
        }}
        title="Eliminar Usuario"
      >
        {deletingUsuario && (
          <div>
            <p className="mb-4 text-gray-700">
              ¿Está seguro de eliminar al usuario{" "}
              <strong>
                {deletingUsuario.nombre} {deletingUsuario.apellido}
              </strong>
              ?
            </p>
            {deletingUsuario.grupos && deletingUsuario.grupos.length > 0 && (
              <p className="mb-4 text-sm text-red-600">
                Advertencia: Este usuario pertenece a{" "}
                {deletingUsuario.grupos.length} grupo(s).
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingUsuario(null);
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

export default UsuariosPage;
