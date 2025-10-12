/**
 * Modal para crear y editar registros de Horas Extras
 * Componente profesional con validaciones, cálculos en tiempo real y UX optimizada
 */

"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Save, X, User, Calendar, AlertCircle, Building2, Hash, FileText, Settings } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useModal } from '@/lib/hooks/useModal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/lib/theme';
import { Select, SelectField } from '@/components/ui/selectUI';
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
  
  // ========== HOOKS Y ESTADO ==========
  const { toast } = useToast();
  const { theme } = useTheme();
  
  // Usar el hook de modal mejorado
  const modal = useModal({
    preventBodyScroll: true,
    closeOnEscape: true,
    closeOnBackdropClick: false // No cerrar al hacer click en backdrop para formularios
  });

  // Helper styles for consistent styling
  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    transition: 'all 0.2s'
  };
  
  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
    color: 'var(--text-primary)'
  };

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
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
  
  // Sincronizar el estado del modal con las props
  useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.openModal();
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal();
    }
  }, [isOpen, modal.isOpen]);
  
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
    modal.closeModal();
    onClose();
  }

  // Footer del modal
  const modalFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="neutral"
        onClick={handleClose}
        disabled={loading || loadingData}
        size="md"
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        type="submit"
        disabled={loading || loadingData || loadingEmpleados || (salarioBase === 0 && !esEdicion)}
        size="md"
      >
        <Save size={16} />
        {loading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Registrar'}
      </Button>
    </div>
  );

  // ========== RENDER ==========
  
  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={handleClose}
      title={titulo}
      icon={<Clock size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="7xl"
      description="Complete la información del registro de horas extras. Los campos marcados con * son obligatorios."
      footer={modalFooter}
      closeOnBackdropClick={false}
      closeOnEscape={true}
      preventBodyScroll={true}
      isLoading={loadingRegistro}
      loadingComponent={
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--ot-blue-500)' }}></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Cargando datos del registro...
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Layout principal con dos columnas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Columna Izquierda */}
          <div className="space-y-4">
            {/* Información del Empleado */}
            <div className="rounded-lg p-3 sm:p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <User size={16} />
                Información del Empleado
              </h3>
              
              {/* Selector de Empleado */}
              {!esEdicion && (
                <div>
                  {loadingEmpleados ? (
                    <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                      <span style={{ color: 'var(--text-muted)' }}>Cargando empleados...</span>
                    </div>
                  ) : (
                    <>
                      <SelectField
                        label="Empleado"
                        value={empleadoId}
                        onChange={setEmpleadoId}
                        options={empleados.map(emp => ({
                          value: emp._id,
                          label: formatEmpleadoLabel(emp)
                        }))}
                        placeholder="Seleccione un empleado"
                        required
                        error={errors.empleadoId}
                        disabled={loading}
                        clearable
                      />
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
                <div className="p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    <User size={16} className="inline mr-1" />
                    Empleado: {typeof registroOriginal.empleadoId === 'string' 
                      ? registroOriginal.empleadoId 
                      : `${registroOriginal.empleadoId.nombre} ${registroOriginal.empleadoId.apellido}`}
                  </p>
                </div>
              )}
            </div>

            {/* Información del Período */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Calendar size={16} />
                Información del Período
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Año */}
                  <div>
                    <label style={labelStyle}>
                      Año *
                    </label>
                    <input
                      type="number"
                      value={anio}
                      onChange={(e) => setAnio(parseInt(e.target.value))}
                      min={2020}
                      max={2050}
                      style={{
                        ...inputStyle,
                        borderColor: errors.anio ? '#ef4444' : 'var(--border)',
                      }}
                      disabled={loading || esEdicion}
                      required
                    />
                    {errors.anio && (
                      <p className="mt-1 text-sm text-red-500">{errors.anio}</p>
                    )}
                  </div>
                  
                  {/* Mes */}
                  <div>
                    <SelectField
                      label="Mes"
                      value={mes.toString()}
                      onChange={(value) => setMes(parseInt(value))}
                      options={MESES_LABELS.map((label, index) => ({
                        value: (index + 1).toString(),
                        label: label
                      }))}
                      placeholder="Seleccione el mes"
                      required
                      error={errors.mes}
                      disabled={loading || esEdicion}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Quincena */}
                  <div>
                    <SelectField
                      label="Quincena"
                      value={quincena.toString()}
                      onChange={(value) => setQuincena(parseInt(value) as 1 | 2)}
                      options={QUINCENAS.map(q => ({
                        value: q.value.toString(),
                        label: q.label
                      }))}
                      placeholder="Seleccione la quincena"
                      required
                      disabled={loading || esEdicion}
                    />
                  </div>
                  
                  {/* Horas Laborales del Mes */}
                  <div>
                    <label style={labelStyle}>
                      Horas Laborales Mes *
                    </label>
                    <input
                      type="number"
                      value={horasLaboralesMes}
                      onChange={(e) => setHorasLaboralesMes(parseInt(e.target.value))}
                      min={1}
                      max={300}
                      style={{
                        ...inputStyle,
                        borderColor: errors.horasLaboralesMes ? '#ef4444' : 'var(--border)',
                      }}
                      disabled={loading}
                      required
                    />
                    {errors.horasLaboralesMes && (
                      <p className="mt-1 text-sm text-red-500">{errors.horasLaboralesMes}</p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Por defecto: 220 horas (Ley Colombiana)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            {/* Resumen de Cálculos */}
            {salarioBase > 0 && (
              <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Hash size={16} />
                  Resumen de Cálculos
                </h3>
                <ResumenCalculos
                  salarioBase={salarioBase}
                  horasLaboralesMes={horasLaboralesMes}
                  totalHoras={totalHoras}
                  totalRecargoCOP={totalRecargoCOP}
                  moneda={monedaSalario}
                />
              </div>
            )}

            {/* Detalles de Horas Extras */}
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-muted)' }}>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Clock size={16} />
                Detalles de Horas Extras
              </h3>
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
              <div className="rounded-lg p-3 border" style={{ background: '#fee2e2', borderColor: '#ef4444' }}>
                <h4 className="text-sm font-medium text-red-700 mb-2">Errores en detalles:</h4>
                {Object.entries(errors)
                  .filter(([k]) => k.startsWith('detalle_'))
                  .map(([k, v]) => (
                    <p key={k} className="text-sm text-red-700">{v}</p>
                  ))}
              </div>
            )}
          </div>
        </div>

      </form>
    </Modal>
  );
}
