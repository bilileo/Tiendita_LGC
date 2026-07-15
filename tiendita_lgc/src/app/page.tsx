'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { obtenerDeudas } from '../actions/deudas';
import { Deuda } from '../types';

export default function DashboardPage() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [cargando, setCargando] = useState(true);

  // Función para obtener los datos
  const cargarDatos = async () => {
    try {
      const datos = await obtenerDeudas();
      setDeudas(datos);
    } catch (error) {
      console.error("Error al obtener los datos del dashboard:", error);
    } finally {
      if (cargando) setCargando(false);
    }
  };

  useEffect(() => {
    // 1. Carga inicial inmediata
    cargarDatos();

    // 2. Configurar la actualización en segundo plano cada 5 segundos
    const intervalo = setInterval(() => {
      cargarDatos();
    }, 5000);

    // 3. Limpiar el intervalo si el usuario cambia de página
    return () => clearInterval(intervalo);
  }, []);

  // Cálculos matemáticos basados en el estado actual
  const totalDeudores = deudas.length;
  const totalDeuda = deudas.reduce((suma, deuda) => suma + (deuda.PRECIO || 0), 0);

  const formatearDinero = (monto: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);

  return (
    <div className="container mx-auto mt-10 px-4 max-w-4xl relative font-sans">
      
      {/* Cabecera idéntica al resto de la app */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Panel de Control
        </h1>
        <p className="text-slate-500 mt-2 text-sm flex items-center gap-2">
          Resumen general de la Tiendita LGC. 
          <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium border border-green-200 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Sincronizado en tiempo real
          </span>
        </p>
      </div>

      {cargando && deudas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-400 text-sm font-medium animate-pulse">Cargando métricas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Tarjeta: Total Deudores */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col justify-center hover:shadow-lg hover:border-slate-300 transition-all duration-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Total de Cuentas Activas
              </span>
              <h2 className="text-5xl font-bold text-slate-900 tracking-tight">
                {totalDeudores}
              </h2>
            </div>

            {/* Tarjeta: Total Adeudado */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col justify-center hover:shadow-lg hover:border-slate-300 transition-all duration-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Capital Total Pendiente
              </span>
              <h2 className="text-5xl font-bold text-slate-900 tracking-tight truncate">
                {formatearDinero(totalDeuda)}
              </h2>
            </div>

          </div>

          {/* Botones de navegación con el mismo estilo corporativo */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/deudas"
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Gestionar Deudores
            </Link>

            <Link 
              href="/notas"
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Ver Notas y Pendientes
            </Link>
          </div>
        </>
      )}

    </div>
  );
}