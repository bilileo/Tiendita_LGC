'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Nota } from '../../types';
import { obtenerNotas, crearNota, actualizarNota, eliminarNota } from '../../actions/notas';

type TipoModal = 'eliminar' | null;

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [textoNuevaNota, setTextoNuevaNota] = useState('');
  const [cargando, setCargando] = useState(true);

  // Estado para el modal igual que en Deudas
  const [modal, setModal] = useState<{
    abierto: boolean;
    tipo: TipoModal;
    nota: Nota | null;
  }>({ abierto: false, tipo: null, nota: null });
  const [procesando, setProcesando] = useState(false);

  const cargarNotas = async () => {
    const datos = await obtenerNotas();
    setNotas(datos);
    setCargando(false);
  };

  useEffect(() => {
    cargarNotas();
  }, []);

  const handleCrearNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoNuevaNota.trim()) return;
    await crearNota({ TEXTO: textoNuevaNota.trim(), COMPLETADO: false });
    setTextoNuevaNota('');
    cargarNotas();
  };

  const handleToggle = async (id: number, actual: boolean) => {
    await actualizarNota(id, { COMPLETADO: !actual });
    cargarNotas();
  };

  // Funciones de control del modal
  const abrirModal = (tipo: TipoModal, nota: Nota) => {
    setModal({ abierto: true, tipo, nota });
  };

  const cerrarModal = () => {
    if (procesando) return;
    setModal({ abierto: false, tipo: null, nota: null });
  };

  const confirmarAccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.tipo || !modal.nota) return;

    setProcesando(true);

    try {
      if (modal.tipo === 'eliminar') {
        await eliminarNota(modal.nota.ID);
      }
      
      await cargarNotas();
      cerrarModal();
    } catch (error) {
      console.error("Error al procesar la acción:", error);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 px-4 max-w-2xl font-sans relative">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Notas / Pendientes</h2>
        <p className="text-slate-500 mt-2 text-sm">Anota aquí todo lo que haya que comprar. Si Fausto ya lo compró, márcalo como completado.</p>
      </div>

      <form onSubmit={handleCrearNota} className="flex gap-2 mb-8">
        <input
          type="text"
          className="flex-grow border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 text-sm"
          placeholder="¿Qué hace falta?"
          value={textoNuevaNota}
          onChange={(e) => setTextoNuevaNota(e.target.value)}
          required
        />
        <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
          Agregar
        </button>
      </form>

      {cargando ? (
        <p className="text-slate-400 text-center py-4 text-sm">Sincronizando notas...</p>
      ) : (
        <div className="space-y-3">
          {notas.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm border border-dashed border-slate-200 rounded-xl">No hay notas pendientes.</p>
          ) : (
            notas.map((nota) => (
              <div
                key={nota.ID}
                className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
              >
                <div 
                  className="flex items-center gap-4 flex-grow cursor-pointer"
                  onClick={() => handleToggle(nota.ID, nota.COMPLETADO)}
                >
                  <input
                    type="checkbox"
                    checked={nota.COMPLETADO}
                    readOnly
                    className="w-5 h-5 border-slate-300 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className={`text-sm transition-all ${nota.COMPLETADO ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {nota.TEXTO}
                  </span>
                </div>

                <button
                  onClick={() => abrirModal('eliminar', nota)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                  title="Eliminar nota"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL GLOBAL CORPORATIVO                                                  */}
      {/* ========================================================================= */}
      {modal.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 transform transition-all">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">
                {modal.tipo === 'eliminar' && 'Eliminar Nota'}
              </h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={confirmarAccion} className="p-6 space-y-5">
              
              {modal.tipo === 'eliminar' && modal.nota && (
                <div>
                  <p className="text-slate-600 text-sm mb-3">
                    ¿Estás seguro de que deseas eliminar permanentemente esta nota?
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className={`text-sm font-medium ${modal.nota.COMPLETADO ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      "{modal.nota.TEXTO}"
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {procesando ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
}