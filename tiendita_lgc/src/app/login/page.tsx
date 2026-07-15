'use client';

import { useState } from 'react';
import { iniciarSesion } from '../../actions/auth';

export default function LoginPage() {
  const [cargando, setCargando] = useState(false);
  const [errorAcceso, setErrorAcceso] = useState('');

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setErrorAcceso('');

    const formData = new FormData(e.currentTarget);
    
    try {
      const respuesta = await iniciarSesion(formData);
      if (respuesta?.error) {
        setErrorAcceso(respuesta.error);
        setCargando(false);
      }
    } catch (err) {
      setErrorAcceso('Error al conectar con el servidor.');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tiendita LGC</h2>
          <p className="text-slate-500 text-sm mt-2">Acceso administrativo</p>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Correo</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 text-base sm:text-sm"
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 text-base sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          {errorAcceso && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
              {errorAcceso}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-70 mt-2"
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}