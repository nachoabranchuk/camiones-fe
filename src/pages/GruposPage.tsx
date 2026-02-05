import { useState, useEffect } from "react";
import { gruposApi, formulariosApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type {
  Grupo,
  CreateGrupoDto,
  UpdateGrupoDto,
  Formulario,
} from "../types";
import Modal from "../components/Modal";

/** Formularios del módulo Seguridad: no se permite desmarcarlos en el grupo Admin */
const FORMULARIOS_SEGURIDAD = [
  "Gestionar Modulos",
  "Gestionar Grupos",
  "Gestionar Formularios",
  "Ver Acciones",
  "Gestionar Usuarios",
];

const isFormularioSeguridad = (formulario: Formulario) =>
  FORMULARIOS_SEGURIDAD.includes(formulario.nombre);

const NOMBRE_GRUPO_ADMIN = "admin";

const GruposPage = () => {
  const {
    user: currentUser,
    refreshPermissions,
    hasAccessToAccion,
    isCurrentUserAdmin,
  } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [deletingGrupo, setDeletingGrupo] = useState<Grupo | null>(null);
  const [formData, setFormData] = useState<CreateGrupoDto>({
    nombre: "",
    estaActivo: true,
    formulariosIds: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gruposData, formulariosData] = await Promise.all([
        gruposApi.getAll(),
        formulariosApi.getAll(),
      ]);
      setGrupos(gruposData || []);
      setFormularios(formulariosData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Grupos visibles: los no-Admin no ven el grupo Admin (el backend también lo filtra) */
  const gruposVisibles = grupos.filter(
    (g) =>
      isCurrentUserAdmin() ||
      g.nombre?.trim().toLowerCase() !== NOMBRE_GRUPO_ADMIN,
  );

  /** Si estamos editando el grupo Admin y el usuario actual es Admin → solo lectura */
  const isEditingAdminReadOnly =
    !!editingGrupo &&
    editingGrupo.nombre?.trim().toLowerCase() === NOMBRE_GRUPO_ADMIN &&
    isCurrentUserAdmin();

  const handleCreate = () => {
    setEditingGrupo(null);
    setFormData({ nombre: "", estaActivo: true, formulariosIds: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (grupo: Grupo) => {
    setEditingGrupo(grupo);
    setFormData({
      nombre: grupo.nombre,
      estaActivo: grupo.estaActivo,
      formulariosIds: grupo.formularios?.map((f) => f.id) || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingAdminReadOnly) return; // No enviar si es solo lectura (Admin)
    try {
      if (editingGrupo) {
        await gruposApi.update(editingGrupo.id, formData as UpdateGrupoDto);

        // Refresh permissions when grupo is updated, as it may affect current user's permissions
        if (currentUser) {
          await refreshPermissions();
        }
      } else {
        await gruposApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving grupo:", error);
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
      console.error("Error deleting grupo:", error);
    }
  };

  const toggleFormulario = (formulario: Formulario) => {
    if (isEditingAdminReadOnly) return;
    const isAdminGroup =
      editingGrupo?.nombre?.trim().toLowerCase() === NOMBRE_GRUPO_ADMIN;
    if (isAdminGroup && isFormularioSeguridad(formulario)) return;
    const formularioId = formulario.id;
    const currentIds = formData.formulariosIds || [];
    if (currentIds.includes(formularioId)) {
      setFormData({
        ...formData,
        formulariosIds: currentIds.filter((id) => id !== formularioId),
      });
    } else {
      setFormData({
        ...formData,
        formulariosIds: [...currentIds, formularioId],
      });
    }
  };

  const isCheckboxDisabledForFormulario = (formulario: Formulario) => {
    if (isEditingAdminReadOnly) return true;
    if (editingGrupo?.nombre?.trim().toLowerCase() !== NOMBRE_GRUPO_ADMIN)
      return false;
    return isFormularioSeguridad(formulario);
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grupos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestionar grupos de usuarios
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={!hasAccessToAccion("Grupos.Crear Grupo")}
          className={`px-4 py-2 rounded-md ${
            hasAccessToAccion("Grupos.Crear Grupo")
              ? "bg-yellow-600 text-white hover:bg-yellow-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          title={
            !hasAccessToAccion("Grupos.Crear Grupo")
              ? "No tienes permisos para crear grupos"
              : "Crear nuevo grupo"
          }
        >
          Nuevo Grupo
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {gruposVisibles.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No hay grupos
            </li>
          ) : (
            gruposVisibles.map((grupo) => {
              const isAdminGroup =
                grupo.nombre?.trim().toLowerCase() === NOMBRE_GRUPO_ADMIN;
              const canEdit = hasAccessToAccion("Grupos.Editar Grupo");
              const canDelete =
                hasAccessToAccion("Grupos.Eliminar Grupo") && !isAdminGroup;
              return (
                <li key={grupo.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {grupo.nombre}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            grupo.estaActivo
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {grupo.estaActivo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      {grupo.formularios && (
                        <p className="text-sm text-gray-500 mt-1">
                          {grupo.formularios.length} formulario(s)
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
                        disabled={!canEdit}
                        className={`${
                          canEdit
                            ? "text-blue-600 hover:text-blue-800"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                        title={
                          !canEdit
                            ? "No tienes permisos para editar grupos"
                            : isAdminGroup && isCurrentUserAdmin()
                            ? "Ver grupo Admin (solo lectura)"
                            : "Editar"
                        }
                      >
                        {isAdminGroup && isCurrentUserAdmin()
                          ? "Ver"
                          : "Editar"}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(grupo)}
                        disabled={!canDelete}
                        className={`${
                          canDelete
                            ? "text-red-600 hover:text-red-800"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                        title={
                          isAdminGroup
                            ? "No se puede eliminar el grupo Admin"
                            : !hasAccessToAccion("Grupos.Eliminar Grupo")
                            ? "No tienes permisos para eliminar grupos"
                            : "Eliminar"
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isEditingAdminReadOnly
            ? "Ver Grupo Admin (solo lectura)"
            : editingGrupo
            ? "Editar Grupo"
            : "Nuevo Grupo"
        }
      >
        <form onSubmit={handleSubmit}>
          {isEditingAdminReadOnly && (
            <p className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
              Perteneces al grupo Admin. Solo puedes visualizar sus formularios;
              no está permitido modificar ni eliminar este grupo.
            </p>
          )}
          <div className="mb-4">
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              required
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              disabled={isEditingAdminReadOnly}
              readOnly={isEditingAdminReadOnly}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.estaActivo}
                onChange={(e) =>
                  setFormData({ ...formData, estaActivo: e.target.checked })
                }
                disabled={isEditingAdminReadOnly}
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 disabled:opacity-60"
              />
              <span className="ml-2 text-sm text-gray-700">Activo</span>
            </label>
          </div>
          {editingGrupo?.nombre?.trim().toLowerCase() === NOMBRE_GRUPO_ADMIN &&
            !isEditingAdminReadOnly && (
              <p className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Los formularios del módulo Seguridad (Módulos, Grupos,
                Formularios, Acciones, Usuarios) no se pueden desmarcar en el
                grupo Admin para evitar perder acceso.
              </p>
            )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formularios
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
              {formularios.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay formularios disponibles
                </p>
              ) : (
                formularios.map((formulario) => {
                  const disabled = isCheckboxDisabledForFormulario(formulario);
                  return (
                    <label
                      key={formulario.id}
                      className={`flex items-center py-1 ${
                        disabled ? "text-gray-500" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.formulariosIds?.includes(formulario.id) ||
                          false
                        }
                        onChange={() => toggleFormulario(formulario)}
                        disabled={disabled}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {formulario.nombre}
                        {formulario.modulo && (
                          <span className="text-gray-500">
                            {" "}
                            ({formulario.modulo.nombre})
                          </span>
                        )}
                        {disabled && isEditingAdminReadOnly
                          ? ""
                          : disabled
                          ? " (obligatorio en Admin)"
                          : ""}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {isEditingAdminReadOnly ? "Cerrar" : "Cancelar"}
            </button>
            {!isEditingAdminReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                {editingGrupo ? "Actualizar" : "Crear"}
              </button>
            )}
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
              ¿Está seguro de eliminar el grupo{" "}
              <strong>{deletingGrupo.nombre}</strong>?
            </p>
            {(deletingGrupo.formularios &&
              deletingGrupo.formularios.length > 0) ||
            (deletingGrupo.usuarios && deletingGrupo.usuarios.length > 0) ? (
              <p className="mb-4 text-sm text-red-600">
                Advertencia: Este grupo tiene{" "}
                {deletingGrupo.formularios?.length || 0} formulario(s) y{" "}
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
