export interface RegistroHoras {
  id: number;
  proyectoId: number;
  fecha: string;
  horas: number;
  descripcion: string | null;
}

export interface RegistroHorasInput {
  proyectoId: number;
  fecha: string;
  horas: number;
  descripcion: string | null;
}
