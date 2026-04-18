export interface ReporteHorasItem {
  registroId: number;
  proyectoId: number;
  proyectoCodigo: string;
  proyectoDescripcion: string;
  clienteId: number;
  clienteNombre: string;
  fecha: string;
  horas: number;
  descripcion: string | null;
}

export interface ReporteHorasProyectoResumen {
  proyectoId: number;
  proyectoCodigo: string;
  proyectoDescripcion: string;
  clienteNombre: string;
  cantidadRegistros: number;
  totalHoras: number;
}

export interface ReporteHorasResponse {
  desde: string;
  hasta: string;
  clienteId: number | null;
  proyectoId: number | null;
  items: ReporteHorasItem[];
  resumenPorProyecto: ReporteHorasProyectoResumen[];
  totalHoras: number;
}

export interface ReporteHorasFiltro {
  desde: string;
  hasta: string;
  clienteId?: number | null;
  proyectoId?: number | null;
}
