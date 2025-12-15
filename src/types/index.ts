export interface Modulo {
  id: number;
  nombre: string;
  formularios?: Formulario[];
}

export interface Formulario {
  id: number;
  nombre: string;
  modulo?: Modulo;
  modulo_id?: number;
  acciones?: Accion[];
}

export interface Accion {
  id: number;
  nombre: string;
  formulario?: Formulario;
  formulario_id?: number;
  grupos?: Grupo[];
}

export interface Grupo {
  id: number;
  nombre: string;
  Estado: boolean;
  usuarios?: User[];
  acciones?: Accion[];
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
    estado: boolean;
  }>;
}

export interface CreateModuloDto {
  nombre: string;
}

export interface UpdateModuloDto {
  nombre: string;
}

export interface CreateFormularioDto {
  nombre: string;
  modulo_id: number;
}

export interface UpdateFormularioDto {
  nombre: string;
  modulo_id: number;
}

export interface CreateAccionDto {
  nombre: string;
  formulario_id: number;
}

export interface UpdateAccionDto {
  nombre: string;
  formulario_id: number;
}

export interface CreateGrupoDto {
  nombre: string;
  Estado?: boolean;
  acciones_ids?: number[];
}

export interface UpdateGrupoDto {
  nombre: string;
  Estado?: boolean;
  acciones_ids?: number[];
}

export interface CreateUserDto {
  Nombre: string;
  Apellido: string;
  Correo: string;
  Contrasena: string;
  Telefono: string;
  EstaActivo?: boolean;
  grupos_ids?: number[];
}

export interface UpdateUserDto {
  Nombre: string;
  Apellido: string;
  Correo: string;
  Telefono: string;
  EstaActivo?: boolean;
  grupos_ids?: number[];
}


