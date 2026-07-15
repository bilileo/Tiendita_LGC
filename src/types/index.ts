export interface Deuda {
  ID: number;
  NOMBRE_COMPLETO: string;
  DESCRIPCION: string;
  PRECIO: number;
}

export type NuevaDeuda = Omit<Deuda, 'ID'>;

export interface Nota {
  ID: number;
  TEXTO: string | null;
  COMPLETADO: boolean;
}

export type NuevaNota = Omit<Nota, 'ID'>;