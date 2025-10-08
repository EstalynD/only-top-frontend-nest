/**
 * Modal para crear y editar registros de Horas Extras
 * Componente profesional con validaciones, cálculos en tiempo real y UX optimizada
 */

"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Save, X, User, Calendar, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import FormularioDetalleHora from './FormularioDetalleHora';
import ResumenCalculos from './ResumenCalculos';
import Loader from '@/components/ui/Loader';
import { 
  createHorasExtras, 
  updateHorasExtras,
  getHorasExtrasById 
} from '@/lib/service-horas-extras/api';
import { 
  getEmpleadosActivos, 
  formatEmpleadoLabel,
  type EmpleadoOption 
} from '@/lib/service-horas-extras/empleados-api';
import type { 
  CreateHorasExtrasDto, 
  CreateDetalleHoraExtraDto,
  HorasExtrasRegistro 
} from '@/lib/service-horas-extras/types';
import { 
  MESSAGES, 
  QUINCENAS,
  MESES_LABELS 
} from '@/lib/service-horas-extras/constants';
import { 
  calcularValorHoraOrdinaria,
  calcularValorHoraConRecargo,
  validarCantidadHoras 
} from '@/lib/service-horas-extras/helpers';

interface ModalCrearEditarHorasExtrasProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  addToast: (message: string, type: 'success' | 'error') => void;
  registroId?: string; // Para modo edición
}

export default function ModalCrearEditarHorasExtras({
  isOpen,
  onClose,
  onSuccess,
  token,
  addToast,
  registroId,
}: ModalCrearEditarHorasExtrasProps) {
  
  // ========== ESTADO ==========
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [loadingRegistro, setLoadingRegistro] = useState(false);
  const [empleados, setEmpleados] = useState<EmpleadoOption[]>([]);
  const [registroOriginal, setRegistroOriginal] = useState<HorasExtrasRegistro | null>(null);
  
  // Form data
  const [empleadoId, setEmpleadoId] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [quincena, setQuincena] = useState<1 | 2>(1);
  const [horasLaboralesMes, setHorasLaboralesMes] = useState(220);
  const [detalles, setDetalles] = useState<CreateDetalleHoraExtraDto[]>([]);
  
  // Validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Soporte robusto para edición: usar el ID efectivo (prop o el del registro cargado)
  const registroIdEfectivo = useMemo(() => registroId ?? registroOriginal?._id, [registroId, registroOriginal]);
  const esEdicion = !!registroIdEfectivo;
  const titulo = esEdicion ? 'Editar Registro de Horas Extras' : 'Registrar Horas Extras';

  // ========== EFECTOS ==========
  
  // Cargar empleados al abrir
  useEffect(() => {
    if (isOpen && !esEdicion) {
      cargarEmpleados();
    }
  }, [isOpen, esEdicion]);
  
  // Cargar registro en modo edición
  useEffect(() => {
    if (isOpen && esEdicion && registroIdEfectivo) {
      cargarRegistro(registroIdEfectivo);
    }
  }, [isOpen, esEdicion, registroIdEfectivo]);
  
  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      // Delay para evitar que se limpie antes de que el modal se cierre visualmente
      const timer = setTimeout(() => {
        resetForm();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ========== FUNCIONES DE CARGA ==========
  
  async function cargarEmpleados() {
    setLoadingEmpleados(true);
    try {
      const data = await getEmpleadosActivos(token);
      setEmpleados(data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      addToast('Error al cargar la lista de empleados', 'error');
    } finally {
      setLoadingEmpleados(false);
    }
  }
  
  async function cargarRegistro(id: string) {
    setLoadingRegistro(true);
    try {
      const data = await getHorasExtrasById(id, token);
      setRegistroOriginal(data);
      
      // Poblar form con datos existentes
      setEmpleadoId(typeof data.empleadoId === 'string' ? data.empleadoId : data.empleadoId._id);
      setAnio(data.anio);
      setMes(data.mes);
      setQuincena(data.quincena);
      setHorasLaboralesMes(data.horasLaboralesMes);
      
      // Convertir detalles al formato del form
      const detallesForm: CreateDetalleHoraExtraDto[] = data.detalles.map(d => ({
        tipo: d.tipo,
        cantidadHoras: d.cantidadHoras,
        fechaRegistro: d.fechaRegistro,
        observaciones: d.observaciones || undefined,
      }));
      setDetalles(detallesForm);
      
    } catch (error) {
      console.error('Error al cargar registro:', error);
      addToast('Error al cargar el registro', 'error');
      onClose();
    } finally {
      setLoadingRegistro(false);
    }
  }

  // ========== CÁLCULOS EN TIEMPO REAL ==========
  
  const empleadoSeleccionado = useMemo(() => {
    return empleados.find(e => e._id === empleadoId);
  }, [empleadoId, empleados]);
  
  const salarioBase = useMemo(() => {
    // En modo edición, usar salario del registro cargado
    if (esEdicion && registroOriginal) {
      return registroOriginal.salarioBase.monto;
    }
    // En modo creación, usar salario del empleado seleccionado
    return empleadoSeleccionado?.salario?.monto || 0;
  }, [empleadoSeleccionado, esEdicion, registroOriginal]);
  
  const monedaSalario = useMemo(() => {
    // En modo edición, usar moneda del registro cargado
    if (esEdicion && registroOriginal) {
      return registroOriginal.salarioBase.moneda;
    }
    // En modo creación, usar moneda del empleado seleccionado
    return empleadoSeleccionado?.salario?.moneda || 'USD';
  }, [empleadoSeleccionado, esEdicion, registroOriginal]);
  
  const valorHoraOrdinaria = useMemo(() => {
    // En modo edición, usar valor raw del registro si está disponible
    if (esEdicion && registroOriginal?._raw?.valorHoraOrdinaria) {
      return registroOriginal._raw.valorHoraOrdinaria;
    }
    // Calcular normalmente
    return calcularValorHoraOrdinaria(salarioBase, horasLaboralesMes, monedaSalario);
  }, [salarioBase, horasLaboralesMes, monedaSalario, esEdicion, registroOriginal]);
  
  const totalHoras = useMemo(() => {
    return detalles.reduce((sum, d) => sum + d.cantidadHoras, 0);
  }, [detalles]);
  
  // Cálculo del total de recargos en tiempo real
  const totalRecargoCOP = useMemo(() => {
    if (valorHoraOrdinaria === 0) return 0;
    
    return detalles.reduce((total, detalle) => {
      const valorConRecargo = calcularValorHoraConRecargo(valorHoraOrdinaria, detalle.tipo, monedaSalario);
      const subtotal = detalle.cantidadHoras * valorConRecargo;
      return total + subtotal;
    }, 0);
  }, [detalles, valorHoraOrdinaria, monedaSalario]);

  // ========== VALIDACIÓN ==========
  
  function validarFormulario(): boolean {
    const newErrors: Record<string, string> = {};
    
    if (!empleadoId && !esEdicion) {
      newErrors.empleadoId = 'Debe seleccionar un empleado';
    }
    
    if (anio < 2020 || anio > 2050) {
      newErrors.anio = 'Año inválido';
    }
    
    if (mes < 1 || mes > 12) {
      newErrors.mes = 'Mes inválido';
    }
    
    if (horasLaboralesMes < 1 || horasLaboralesMes > 300) {
      newErrors.horasLaboralesMes = 'Horas laborales inválidas (1-300)';
    }
    
    if (detalles.length === 0) {
      newErrors.detalles = 'Debe agregar al menos un detalle de hora extra';
    }
    
    // Validar cada detalle
    detalles.forEach((detalle, index) => {
      if (!validarCantidadHoras(detalle.cantidadHoras)) {
        newErrors[`detalle_${index}`] = `Detalle ${index + 1}: cantidad de horas inválida`;
      }
      if (!detalle.fechaRegistro) {
        newErrors[`detalle_${index}_fecha`] = `Detalle ${index + 1}: debe especificar la fecha`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ========== HANDLERS ==========
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validarFormulario()) {
      addToast(MESSAGES.error.validation, 'error');
      return;
    }
    
    setLoading(true);
    
    // DEBUG: Log para verificar el modo
    console.log('🔍 DEBUG handleSubmit:', {
      esEdicion,
      registroIdProp: registroId,
      registroIdEfectivo,
      empleadoId,
      registroOriginal: registroOriginal?._id,
    });
    
    try {
      const dto: CreateHorasExtrasDto = {
        empleadoId,
        anio,
        mes,
        quincena,
        detalles,
        horasLaboralesMes: horasLaboralesMes !== 220 ? horasLaboralesMes : undefined,
      };
      
      if (esEdicion && registroIdEfectivo) {
        // Modo edición
        console.log('✏️ Llamando a UPDATE con ID:', registroIdEfectivo);
        await updateHorasExtras(registroIdEfectivo, {
          detalles,
          horasLaboralesMes: horasLaboralesMes !== 220 ? horasLaboralesMes : undefined,
        }, token);
        addToast(MESSAGES.success.updated, 'success');
      } else {
        // Modo creación
        console.log('➕ Llamando a CREATE');
        await createHorasExtras(dto, token);
        addToast(MESSAGES.success.created, 'success');
      }
      
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Error al guardar:', error);
      const message = error?.message || (esEdicion ? MESSAGES.error.update : MESSAGES.error.create);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }
  
  function resetForm() {
    setEmpleadoId('');
    setAnio(new Date().getFullYear());
    setMes(new Date().getMonth() + 1);
    setQuincena(1);
    setHorasLaboralesMes(220);
    setDetalles([]);
    setErrors({});
    setRegistroOriginal(null);
  }
  
  function handleClose() {
    if (loading) return;
    onClose();
  }

  // ========== RENDER ==========
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={titulo}
      icon={<Clock size={22} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-5xl"
    >
      {loadingRegistro ? (
        <div className="p-8 flex justify-center">
          <Loader />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* ========== INFORMACIÓN BÁSICA ========== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Selector de Empleado */}
              {!esEdicion && (
                <div className="md:col-span-2">
                  <label 
                    htmlFor="empleadoId" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <User size={16} className="inline mr-1" />
                    Empleado *
                  </label>
                  {loadingEmpleados ? (
                    <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                      <span style={{ color: 'var(--text-muted)' }}>Cargando empleados...</span>
                    </div>
                  ) : (
                    <>
                      <select
                        id="empleadoId"
                        value={empleadoId}
                        onChange={(e) => setEmpleadoId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          background: 'var(--surface)',
                          borderColor: errors.empleadoId ? '#ef4444' : 'var(--border)',
                          color: 'var(--text-primary)',
                        }}
                        disabled={loading}
                      >
                        <option value="">Seleccione un empleado</option>
                        {empleados.map(emp => (
                          <option key={emp._id} value={emp._id}>
                            {formatEmpleadoLabel(emp)}
                          </option>
                        ))}
                      </select>
                      {errors.empleadoId && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.empleadoId}
                        </p>
                      )}
                      {empleadoSeleccionado && empleadoSeleccionado.salario && (
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                          Salario: ${empleadoSeleccionado.salario.monto.toLocaleString('es-CO')} {empleadoSeleccionado.salario.moneda}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {esEdicion && registroOriginal && (
                <div className="md:col-span-2 p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    <User size={16} className="inline mr-1" />
                    Empleado: {typeof registroOriginal.empleadoId === 'string' 
                      ? registroOriginal.empleadoId 
                      : `${registroOriginal.empleadoId.nombre} ${registroOriginal.empleadoId.apellido}`}
                  </p>
                </div>
              )}
              
              {/* Año */}
              <div>
                <label 
                  htmlFor="anio" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Año *
                </label>
                <input
                  type="number"
                  id="anio"
                  value={anio}
                  onChange={(e) => setAnio(parseInt(e.target.value))}
                  min={2020}
                  max={2050}
                  className="w-full px-3 py-2 rounded-lg border transition-colors"
                  style={{
                    background: 'var(--surface)',
                    borderColor: errors.anio ? '#ef4444' : 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  disabled={loading || esEdicion}
                />
                {errors.anio && (
                  <p className="mt-1 text-sm text-red-500">{errors.anio}</p>
                )}
              </div>
              
              {/* Mes */}
              <div>
                <label 
                  htmlFor="mes" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Mes *
                </label>
                <select
                  id="mes"
                  value={mes}
                  onChange={(e) => setMes(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border transition-colors"
                  style={{
                    background: 'var(--surface)',
                    borderColor: errors.mes ? '#ef4444' : 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  disabled={loading || esEdicion}
                >
                  {MESES_LABELS.map((label, index) => (
                    <option key={index + 1} value={index + 1}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.mes && (
                  <p className="mt-1 text-sm text-red-500">{errors.mes}</p>
                )}
              </div>
              
              {/* Quincena */}
              <div>
                <label 
                  htmlFor="quincena" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Quincena *
                </label>
                <select
                  id="quincena"
                  value={quincena}
                  onChange={(e) => setQuincena(parseInt(e.target.value) as 1 | 2)}
                  className="w-full px-3 py-2 rounded-lg border transition-colors"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  disabled={loading || esEdicion}
                >
                  {QUINCENAS.map(q => (
                    <option key={q.value} value={q.value}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Horas Laborales del Mes */}
              <div>
                <label 
                  htmlFor="horasLaboralesMes" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Calendar size={16} className="inline mr-1" />
                  Horas Laborales Mes *
                </label>
                <input
                  type="number"
                  id="horasLaboralesMes"
                  value={horasLaboralesMes}
                  onChange={(e) => setHorasLaboralesMes(parseInt(e.target.value))}
                  min={1}
                  max={300}
                  className="w-full px-3 py-2 rounded-lg border transition-colors"
                  style={{
                    background: 'var(--surface)',
                    borderColor: errors.horasLaboralesMes ? '#ef4444' : 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  disabled={loading}
                />
                {errors.horasLaboralesMes && (
                  <p className="mt-1 text-sm text-red-500">{errors.horasLaboralesMes}</p>
                )}
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Por defecto: 220 horas (Ley Colombiana)
                </p>
              </div>
              
            </div>
            
            {/* ========== RESUMEN DE CÁLCULOS ========== */}
            {salarioBase > 0 && (
              <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
                <ResumenCalculos
                  salarioBase={salarioBase}
                  horasLaboralesMes={horasLaboralesMes}
                  totalHoras={totalHoras}
                  totalRecargoCOP={totalRecargoCOP}
                  moneda={monedaSalario}
                />
              </div>
            )}
            
            {/* ========== DETALLES DE HORAS EXTRAS ========== */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                <Clock size={16} className="inline mr-1" />
                Detalles de Horas Extras *
              </label>
              <FormularioDetalleHora
                detalles={detalles}
                onChange={setDetalles}
              />
              {errors.detalles && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.detalles}
                </p>
              )}
            </div>
            
            {/* Errores de detalles individuales */}
            {Object.keys(errors).filter(k => k.startsWith('detalle_')).length > 0 && (
              <div className="p-3 rounded-lg border" style={{ background: '#fee2e2', borderColor: '#ef4444' }}>
                {Object.entries(errors)
                  .filter(([k]) => k.startsWith('detalle_'))
                  .map(([k, v]) => (
                    <p key={k} className="text-sm text-red-700">{v}</p>
                  ))}
              </div>
            )}
            
          </div>
          
          {/* ========== FOOTER CON ACCIONES ========== */}
          <div 
            className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-primary)',
              }}
            >
              <X size={18} className="mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingEmpleados || (salarioBase === 0 && !esEdicion)}
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              style={{
                background: loading ? 'var(--surface-muted)' : 'var(--ot-blue-500)',
                color: loading ? 'var(--text-muted)' : '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {esEdicion ? 'Actualizar' : 'Registrar'}
                </>
              )}
            </button>
          </div>
          
        </form>
      )}
    </Modal>
  );
}
