/**
 * @deprecated This file is deprecated. Actions are now managed via seed.sql file.
 * All actions should be loaded from the database via the API, not from constants.
 *
 * This file is kept for reference only and should not be imported or used.
 *
 * To get actions, use: accionesApi.getPredefinedActions() or accionesApi.getAll()
 */

/**
 * Predefined actions available in the system
 * This must match the backend constants exactly
 * Format: { key: "Formulario.Acción", label: "Display Name" }
 *
 * @deprecated Use database actions via API instead
 */
export const PREDEFINED_ACTIONS = {
  // Usuarios actions
  "Usuarios.Crear Usuario": "Crear Usuario",
  "Usuarios.Editar Usuario": "Editar Usuario",
  "Usuarios.Eliminar Usuario": "Eliminar Usuario",
  "Usuarios.Ver Usuarios": "Ver Usuarios",

  // Grupos actions
  "Grupos.Crear Grupo": "Crear Grupo",
  "Grupos.Editar Grupo": "Editar Grupo",
  "Grupos.Eliminar Grupo": "Eliminar Grupo",
  "Grupos.Ver Grupos": "Ver Grupos",

  // Modulos actions
  "Modulos.Crear Modulo": "Crear Modulo",
  "Modulos.Editar Modulo": "Editar Modulo",
  "Modulos.Eliminar Modulo": "Eliminar Modulo",
  "Modulos.Ver Modulos": "Ver Modulos",

  // Formularios actions
  "Formularios.Crear Formulario": "Crear Formulario",
  "Formularios.Editar Formulario": "Editar Formulario",
  "Formularios.Eliminar Formulario": "Eliminar Formulario",
  "Formularios.Ver Formularios": "Ver Formularios",

  // Acciones actions
  "Acciones.Ver Acciones": "Ver Acciones",
} as const;

export type PredefinedActionKey = keyof typeof PREDEFINED_ACTIONS;

/**
 * Get all available actions for a specific formulario
 * @deprecated Use accionesApi.getPredefinedActions() instead
 */
export function getActionsForFormulario(
  formularioNombre: string
): Array<{ key: string; label: string }> {
  return Object.entries(PREDEFINED_ACTIONS)
    .filter(([key]) => key.startsWith(`${formularioNombre}.`))
    .map(([key, label]) => ({ key, label }));
}

/**
 * Get all available actions
 * @deprecated Use accionesApi.getPredefinedActions() instead
 */
export function getAllActions(): Array<{ key: string; label: string }> {
  return Object.entries(PREDEFINED_ACTIONS).map(([key, label]) => ({
    key,
    label,
  }));
}
