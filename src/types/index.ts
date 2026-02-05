export interface Modulo {
  id: number;
  nombre: string;
  formularios?: Formulario[];
}

export interface Formulario {
  id: number;
  nombre: string;
  modulo?: Modulo;
  acciones?: Accion[];
}

export interface Accion {
  id: number;
  nombre: string;
  formularios?: Array<{ id: number; nombre: string }>;
}

export interface Grupo {
  id: number;
  nombre: string;
  estaActivo: boolean;
  usuarios?: User[];
  formularios?: Array<{ id: number; nombre: string }>;
  gruposPadres?: Grupo[];
  gruposHijos?: Grupo[];
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  estaActivo: boolean;
  grupos?: Array<{
    id: number;
    nombre: string;
    estaActivo: boolean;
  }>;
}

export interface CreateModuloDto {
  nombre: string;
  /** IDs de formularios a asignar a este módulo (opcional) */
  formularioIds?: number[];
}

export interface UpdateModuloDto {
  nombre: string;
  /** IDs de formularios asignados a este módulo (opcional) */
  formularioIds?: number[];
}

export interface CreateFormularioDto {
  nombre: string;
  moduloId: number;
  accionesIds?: number[];
}

export interface UpdateFormularioDto {
  nombre: string;
  moduloId: number;
  accionesIds?: number[];
}

export interface CreateAccionDto {
  nombre: string;
  formulariosIds?: number[];
}

export interface UpdateAccionDto {
  nombre?: string;
  formulariosIds?: number[];
}

export interface CreateGrupoDto {
  nombre: string;
  estaActivo?: boolean;
  formulariosIds?: number[];
}

export interface UpdateGrupoDto {
  nombre: string;
  estaActivo?: boolean;
  formulariosIds?: number[];
}

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  telefono: string;
  estaActivo?: boolean;
  gruposIds?: number[];
}

export interface UpdateUserDto {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  estaActivo?: boolean;
  gruposIds?: number[];
}
