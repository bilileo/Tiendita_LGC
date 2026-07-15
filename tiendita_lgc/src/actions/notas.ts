'use server'

import { supabase } from '../lib/supabase';
import { Nota, NuevaNota } from '../types';
import { revalidatePath } from 'next/cache';

export async function obtenerNotas(): Promise<Nota[]> {
  const { data, error } = await supabase
    .from('TB_NOTAS')
    .select('*')
    .order('ID', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function crearNota(nuevaNota: NuevaNota) {
  const { data, error } = await supabase
    .from('TB_NOTAS')
    .insert([nuevaNota])
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

// PATCH: Cambiar estado de COMPLETADO (o editar texto)
export async function actualizarNota(id: number, campos: Partial<Nota>) {
  const { error } = await supabase
    .from('TB_NOTAS')
    .update(campos)
    .eq('ID', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}

export async function eliminarNota(id: number) {
  const { error } = await supabase
    .from('TB_NOTAS')
    .delete()
    .eq('ID', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}