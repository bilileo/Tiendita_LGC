'use server'

import { supabase } from '../lib/supabase';
import { Deuda, NuevaDeuda } from '../types';
import { revalidatePath } from 'next/cache';

// GET: Obtener todas las deudas
export async function obtenerDeudas(): Promise<Deuda[]> {
  const { data, error } = await supabase
    .from('TB_DEUDAS')
    .select('*')
    .order('ID', { ascending: true });

  if (error) {
    console.error('Error al obtener deudas:', error.message);
    return [];
  }
  return data || [];
}

// POST: Crear una nueva deuda
export async function crearDeuda(nuevaDeuda: NuevaDeuda) {
  const { data, error } = await supabase
    .from('TB_DEUDAS')
    .insert([nuevaDeuda])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/'); // Refresca la interfaz automáticamente
  return data;
}

// DELETE: Eliminar una deuda por ID
export async function eliminarDeuda(id: number) {
  const { error } = await supabase
    .from('TB_DEUDAS')
    .delete()
    .eq('ID', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}

// PATCH: Editar una deuda completa
export async function actualizarDeuda(id: number, campos: Partial<Deuda>) {
  const { error } = await supabase.from('TB_DEUDAS').update(campos).eq('ID', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}

// PATCH: Saldar deuda a cero
export async function saldarCompleto(id: number) {
  const { error } = await supabase.from('TB_DEUDAS').update({ PRECIO: 0 }).eq('ID', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}

// PATCH: Saldar parcial o Aumentar
export async function modificarSaldo(id: number, precioActual: number, cantidad: number, operacion: 'restar' | 'sumar') {
  if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");
  if (operacion === 'restar' && cantidad > precioActual) throw new Error("No puedes pagar más de lo que se debe");

  const nuevoPrecio = operacion === 'sumar' ? precioActual + cantidad : precioActual - cantidad;

  const { error } = await supabase.from('TB_DEUDAS').update({ PRECIO: nuevoPrecio }).eq('ID', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}