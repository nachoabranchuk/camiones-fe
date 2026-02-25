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

// --- Operaciones: Marcas, Tipos Carga, Choferes, Camiones, Viajes ---

export type UnidadMedida =
  | "KG"
  | "TONELADAS"
  | "LITROS"
  | "METROS_CUBICOS"
  | "METROS_CUADRADOS"
  | "UNIDADES"
  | "CONTENEDOR"
  | "OTRO";

export type EstadoViaje =
  | "PENDIENTE"
  | "EN_CURSO"
  | "FINALIZADO"
  | "CANCELADO";

export interface Marca {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface TipoCarga {
  id: string;
  nombre: string;
  unidadMedida: UnidadMedida;
  activo: boolean;
}

export interface Chofer {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string | null;
  activo: boolean;
}

export interface Camion {
  id: string;
  patente: string;
  anio: number;
  modelo: string;
  marcaId?: string;
  marca?: Marca;
  activo: boolean;
}

export interface Viaje {
  id: string;
  fecha: string;
  origen: string;
  destino: string;
  choferId?: string;
  chofer?: Chofer;
  camionId?: string;
  camion?: Camion;
  tipoCargaId?: string;
  tipoCarga?: TipoCarga;
  kilometrosEstimados: number;
  pesoEstimado: number;
  pesoFinal: number | null;
  valor: number;
  valorTotal?: number;
  estado: EstadoViaje;
}

export interface DashboardReportes {
  totalViajes: number;
  totalFacturado: number;
  viajesEnCurso: number;
  viajesPendientes: number;
  viajesCancelados: number;
}

export interface ReportesFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  choferId?: string;
  estado?: EstadoViaje | "";
  tipoCargaId?: string;
}

export interface ReportesKpis {
  totalFacturado: number;
  totalViajes: number;
  promedioPorViaje: number;
  kilometrosTotales: number;
  pesoTotal: number;
}

export interface FacturacionMensualItem {
  mes: string;
  total: number;
}

export interface ViajesPorEstadoItem {
  estado: string;
  cantidad: number;
}

export interface FacturacionPorChoferItem {
  chofer: string;
  total: number;
}

export interface ViajesPorTipoCargaItem {
  tipoCarga: string;
  cantidad: number;
}

export interface RendimientoKm {
  valorPorKm: number;
}

export interface CreateMarcaDto {
  nombre: string;
  activo?: boolean;
}
export interface UpdateMarcaDto {
  nombre?: string;
  activo?: boolean;
}

export interface CreateTipoCargaDto {
  nombre: string;
  unidadMedida: UnidadMedida;
  activo?: boolean;
}
export interface UpdateTipoCargaDto {
  nombre?: string;
  unidadMedida?: UnidadMedida;
  activo?: boolean;
}

export interface CreateChoferDto {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email?: string | null;
  activo?: boolean;
}
export interface UpdateChoferDto {
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string | null;
  activo?: boolean;
}

export interface CreateCamionDto {
  patente: string;
  anio: number;
  modelo: string;
  marcaId: string;
  activo?: boolean;
}
export interface UpdateCamionDto {
  patente?: string;
  anio?: number;
  modelo?: string;
  marcaId?: string;
  activo?: boolean;
}

export interface CreateViajeDto {
  fecha: string;
  origen: string;
  destino: string;
  choferId: string;
  camionId: string;
  tipoCargaId: string;
  kilometrosEstimados: number;
  pesoEstimado: number;
  valor: number;
}
export interface UpdateViajeDto {
  fecha?: string;
  origen?: string;
  destino?: string;
  choferId?: string;
  camionId?: string;
  tipoCargaId?: string;
  kilometrosEstimados?: number;
  pesoEstimado?: number;
  valor?: number;
  estado?: EstadoViaje;
}
export interface FinalizarViajeDto {
  pesoFinal: number;
}
