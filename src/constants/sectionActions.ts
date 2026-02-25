/**
 * Nombres de acción (parte después del punto en "Formulario.NombreAccion")
 * que otorgan acceso a cada sección del módulo Seguridad.
 * Si el usuario tiene al menos una de estas acciones, puede ver la pestaña y entrar a la ruta.
 */
export const SECTION_ACTIONS: Record<string, string[]> = {
  Modulos: ["Ver Modulos", "Crear Modulo", "Editar Modulo", "Eliminar Modulo"],
  Formularios: [
    "Ver Formularios",
    "Crear Formulario",
    "Editar Formulario",
    "Eliminar Formulario",
  ],
  Acciones: ["Ver Acciones"],
  Grupos: ["Ver Grupos", "Crear Grupo", "Editar Grupo", "Eliminar Grupo"],
  Usuarios: [
    "Ver Usuarios",
    "Crear Usuario",
    "Editar Usuario",
    "Eliminar Usuario",
  ],
};

/** Extrae el nombre de la acción (parte después del último punto) */
export function getActionName(accionCompleta: string): string {
  const idx = accionCompleta.lastIndexOf(".");
  return idx >= 0 ? accionCompleta.slice(idx + 1).trim() : accionCompleta.trim();
}
