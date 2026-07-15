'use server';

import { createClient } from '../lib/supabase-server';
import { redirect } from 'next/navigation';

export async function iniciarSesion(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // ¡AQUÍ ESTÁ EL CAMBIO! Agregamos await
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
  }

  redirect('/deudas');
}

export async function cerrarSesion() {
  // ¡AQUÍ ESTÁ EL CAMBIO! Agregamos await
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}