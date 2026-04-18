export interface Proyecto {
  id: number;
  codigo: string;
  descripcion: string;
  clienteId: number;
  clienteNombre: string;
}

export interface ProyectoInput {
  descripcion: string;
  clienteId: number;
}
