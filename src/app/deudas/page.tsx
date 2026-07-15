'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Deuda } from '../../types';
import { 
  obtenerDeudas, 
  crearDeuda, 
  actualizarDeuda, 
  eliminarDeuda, 
  saldarCompleto, 
  modificarSaldo 
} from '../../actions/deudas';

type TipoModal = 'crear' | 'editar' | 'saldar' | 'parcial' | 'aumentar' | 'eliminar' | null;

export default function ListaDeudasPage() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const [modal, setModal] = useState<{
    abierto: boolean;
    tipo: TipoModal;
    deuda: Deuda | null;
  }>({ abierto: false, tipo: null, deuda: null });

  const [cantidad, setCantidad] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formPrecio, setFormPrecio] = useState('');

  const [procesando, setProcesando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const recargarDeudas = () => {
    obtenerDeudas().then(setDeudas);
  };

useEffect(() => {
    recargarDeudas();

    const intervalo = setInterval(() => {
      recargarDeudas();
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const deudasFiltradas = deudas.filter(d => 
    d.NOMBRE_COMPLETO.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatearDinero = (monto: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);

  const abrirModal = (tipo: TipoModal, deuda: Deuda | null = null) => {
    setModal({ abierto: true, tipo, deuda });
    setErrorModal('');
    setCantidad('');

    if (tipo === 'editar' && deuda) {
      setFormNombre(deuda.NOMBRE_COMPLETO);
      setFormDescripcion(deuda.DESCRIPCION);
      setFormPrecio(deuda.PRECIO.toString());
    } else if (tipo === 'crear') {
      setFormNombre('');
      setFormDescripcion('');
      setFormPrecio('');
    }
  };

  const cerrarModal = () => {
    if (procesando) return;
    setModal({ abierto: false, tipo: null, deuda: null });
    setErrorModal('');
  };

  const confirmarAccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.tipo) return;

    setProcesando(true);
    setErrorModal('');

    try {
      if (modal.tipo === 'crear') {
        const precioNum = Number(formPrecio);
        if (precioNum <= 0 || isNaN(precioNum)) throw new Error('El precio debe ser mayor a 0.');
        if (!formNombre.trim()) throw new Error('El nombre es obligatorio.');

        await crearDeuda({
          NOMBRE_COMPLETO: formNombre.trim(),
          DESCRIPCION: formDescripcion.trim(),
          PRECIO: precioNum
        } as any);
      }
      else if (modal.tipo === 'editar' && modal.deuda) {
        const precioNum = Number(formPrecio);
        if (precioNum < 0 || isNaN(precioNum)) throw new Error('El precio no puede ser negativo.');
        if (!formNombre.trim()) throw new Error('El nombre es obligatorio.');

        await actualizarDeuda(modal.deuda.ID, {
          NOMBRE_COMPLETO: formNombre.trim(),
          DESCRIPCION: formDescripcion.trim(),
          PRECIO: precioNum
        } as any);
      }
      else if (modal.tipo === 'saldar' && modal.deuda) {
        await saldarCompleto(modal.deuda.ID);
      } 
      else if (modal.tipo === 'eliminar' && modal.deuda) {
        await eliminarDeuda(modal.deuda.ID);
      } 
      else if ((modal.tipo === 'parcial' || modal.tipo === 'aumentar') && modal.deuda) {
        const monto = Number(cantidad);
        if (isNaN(monto) || monto <= 0) throw new Error('Ingresa una cantidad válida.');
        
        const operacion = modal.tipo === 'parcial' ? 'restar' : 'sumar';
        await modificarSaldo(modal.deuda.ID, modal.deuda.PRECIO, monto, operacion);
      }

      recargarDeudas();
      cerrarModal();
    } catch (err: any) {
      setErrorModal(err.message || 'Ocurrió un error al procesar la acción.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 px-4 max-w-6xl relative font-sans">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Deudores</h1>
        <p className="text-slate-500 mt-2 text-sm">Aquí puedes gestionar las deudas de la Tiendita LGC.</p>
      </div>

      {/* Controles: Buscador y Agregar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full sm:w-96">
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          {/* Ajuste text-base sm:text-sm y py-3 para móviles */}
          <input 
            type="text" 
            placeholder="Buscar al Padrino..." 
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-base sm:text-sm text-slate-900 transition-shadow"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button 
          onClick={() => abrirModal('crear')}
          className="bg-slate-900 hover:bg-slate-800 text-white text-base sm:text-sm font-medium py-3 px-5 rounded-lg w-full sm:w-auto transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nuevo Registro
        </button>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {deudasFiltradas.map((item) => (
          <div key={item.ID} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-full hover:shadow-lg hover:border-slate-300 transition-all duration-200">
            
            <div className="flex justify-between items-start mb-1">
              <h5 className="text-lg font-semibold text-slate-900 leading-tight">{item.NOMBRE_COMPLETO}</h5>
              <button onClick={() => abrirModal('editar', item)} className="text-slate-400 hover:text-slate-900 transition-colors p-2" title="Editar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            </div>
            
            <p className="text-slate-500 text-sm mb-5 flex-grow line-clamp-2">{item.DESCRIPCION}</p>
            
            <div className="mb-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Saldo Pendiente</span>
              <h4 className="text-3xl text-slate-900 font-bold tracking-tight">{formatearDinero(item.PRECIO)}</h4>
            </div>

            {/* Ajuste de Botones: text-sm, py-3 y SVG w-4 h-4 */}
            <div className="mt-auto space-y-2 border-t border-slate-100 pt-5">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => abrirModal('parcial', item)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-3 px-3 rounded-lg transition-colors flex justify-center items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Abonar
                </button>

                <button 
                  onClick={() => abrirModal('saldar', item)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-3 px-3 rounded-lg transition-colors flex justify-center items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Saldar Todo
                </button>
              </div>

              <button 
                onClick={() => abrirModal('aumentar', item)}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-3 px-3 rounded-lg transition-colors flex justify-center items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Agregar Cargo
              </button>

              <button 
                onClick={() => abrirModal('eliminar', item)}
                className="w-full text-slate-400 hover:text-red-600 text-sm font-medium py-3 mt-1 transition-colors flex justify-center items-center gap-1"
              >
                Eliminar Registro
              </button>
            </div>
          </div>
        ))}
      </div>

      {deudasFiltradas.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed mt-4">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          <p className="text-slate-500 text-sm font-medium">No se encontraron resultados.</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL GLOBAL CORPORATIVO                                                  */}
      {/* ========================================================================= */}
      {modal.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          
          {/* Ajuste: max-h-[90vh] overflow-y-auto para evitar problemas con el teclado del celular */}
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 transform transition-all">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-slate-900">
                {modal.tipo === 'crear' && 'Nuevo Registro'}
                {modal.tipo === 'editar' && 'Editar Registro'}
                {modal.tipo === 'saldar' && 'Confirmar Liquidación'}
                {modal.tipo === 'parcial' && 'Registrar Abono'}
                {modal.tipo === 'aumentar' && 'Agregar Cargo'}
                {modal.tipo === 'eliminar' && 'Eliminar Cuenta'}
              </h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600 p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={confirmarAccion} className="p-6 space-y-5">
              
              {(modal.tipo === 'crear' || modal.tipo === 'editar') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      autoFocus
                      className="w-full border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-base sm:text-sm text-slate-900"
                      placeholder="Ej. Luis Espinoza"
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Concepto / Descripción</label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      className="w-full border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-base sm:text-sm text-slate-900"
                      placeholder="Motivo de la deuda"
                      value={formDescripcion}
                      onChange={(e) => setFormDescripcion(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Monto Inicial</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-slate-500 font-medium">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="999999"
                        required
                        className="w-full pl-7 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-base sm:text-sm text-slate-900"
                        placeholder="0.00"
                        value={formPrecio}
                        onChange={(e) => setFormPrecio(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {modal.deuda && modal.tipo !== 'editar' && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Cuenta actual</div>
                  <div className="font-semibold text-slate-900">{modal.deuda.NOMBRE_COMPLETO}</div>
                  <div className="font-bold text-slate-900 text-xl mt-1">{formatearDinero(modal.deuda.PRECIO)}</div>
                </div>
              )}

              {modal.tipo === 'saldar' && (
                <p className="text-slate-600 text-sm">
                  ¿Confirmas que esta cuenta ha sido liquidada? El saldo se establecerá en <span className="font-bold text-slate-900">$0.00</span>.
                </p>
              )}

              {modal.tipo === 'eliminar' && (
                <p className="text-red-600 text-sm font-medium">
                  Esta acción eliminará permanentemente el registro de la base de datos.
                </p>
              )}

              {(modal.tipo === 'parcial' || modal.tipo === 'aumentar') && modal.deuda && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    {modal.tipo === 'parcial' ? 'Monto a abonar' : 'Monto del cargo'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-500 font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={modal.tipo === 'parcial' ? modal.deuda.PRECIO : 999999}
                      required
                      autoFocus
                      placeholder="0.00"
                      className="w-full pl-7 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-base sm:text-sm text-slate-900"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {errorModal && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
                  {errorModal}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={procesando}
                  className="px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={procesando}
                  className={`px-6 py-3 text-sm font-medium text-white rounded-lg shadow-sm transition-all disabled:opacity-50 ${
                    modal.tipo === 'eliminar' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {procesando ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
}