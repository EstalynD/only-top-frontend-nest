"use client";

import { useState, useEffect, CSSProperties, useMemo } from 'react';
import { Users, DollarSign, AlertTriangle, CheckCircle, Calendar, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import { GastosFijos } from '@/lib/service-finanzas';
import type {
  QuincenaEnum,
  GenerarNominaResultado,
  GenerarNominaResponse,
  GenerarNominaQuincenalDto,
} from '@/lib/service-finanzas/service-gastos-fijos';
import {
  getQuincenaLabel,
  getFechaPagoQuincena,
  formatFecha,
  GASTOS_FIJOS_MESSAGES,
} from '@/lib/service-finanzas/service-gastos-fijos';

interface EmpleadoPreview {
  _id: string;
  nombreCompleto: string;
  cargo?: { name: string };
  salario?: { monto: number };
}

interface GenerarNominaModalProps {
  mes: number;
  anio: number;
  quincena: QuincenaEnum;
  onClose: () => void;
  onSuccess?: (resultado: GenerarNominaResultado) => void;
}

type ModoPago = 'MENSUAL_COMPLETO' | 'QUINCENAL_DIVIDIDO';

export default function GenerarNominaModal({
  mes,
  anio,
  quincena,
  onClose,
  onSuccess,
}: GenerarNominaModalProps) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados
  const [empleados, setEmpleados] = useState<EmpleadoPreview[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<GenerarNominaResultado | null>(null);

  // NUEVOS ESTADOS PARA OPCIONES PROFESIONALES
  const [modoPago, setModoPago] = useState<ModoPago>('QUINCENAL_DIVIDIDO');
  const [selectedEmpleados, setSelectedEmpleados] = useState<Set<string>>(new Set());

  const getMesLabel = (mesNum: number): string => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mesNum - 1] || '';
  };

  // Calcular totales DINÁMICOS basados en selección
  const empleadosSeleccionados = empleados.filter(emp => selectedEmpleados.has(emp._id));
  const totalEmpleadosSeleccionados = empleadosSeleccionados.length;
  
  const totalNomina = empleadosSeleccionados.reduce((sum, emp) => {
    const salario = emp.salario?.monto || 0;
    // Si es MENSUAL_COMPLETO, suma el salario completo; si es QUINCENAL_DIVIDIDO, suma la mitad
    return sum + (modoPago === 'MENSUAL_COMPLETO' ? salario : salario / 2);
  }, 0);

  const fechaPago = getFechaPagoQuincena(mes, anio, quincena);
  const periodoLabel = `${getQuincenaLabel(quincena)} - ${getMesLabel(mes)} ${anio}`;

  // Cargar empleados al montar
  useEffect(() => {
    if (token) {
      cargarEmpleados();
    }
  }, [token]);

  // Auto-seleccionar todos los empleados al cargarlos
  useEffect(() => {
    if (empleados.length > 0 && selectedEmpleados.size === 0) {
      setSelectedEmpleados(new Set(empleados.map(e => e._id)));
    }
  }, [empleados]);

  const cargarEmpleados = async () => {
    if (!token) return;
    
    setLoadingEmpleados(true);
    setError(null);
    
    try {
      const { getAllEmpleados } = await import('@/lib/service-rrhh/empleados-api');
      const empleadosData = await getAllEmpleados(token, false); // Solo activos
      
      const empleadosConSalario = empleadosData
        .filter((emp: any) => emp.salario && emp.salario.monto > 0)
        .map((emp: any) => ({
          _id: emp._id,
          nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim() || 'Sin nombre',
          cargo: emp.cargoId,
          salario: emp.salario,
        }));
      
      setEmpleados(empleadosConSalario);
      
      if (empleadosConSalario.length === 0) {
        setError('No se encontraron empleados activos con salario configurado.');
      }
    } catch (err: any) {
      console.error('Error al cargar empleados:', err);
      setError(err.message || 'Error al cargar empleados');
    } finally {
      setLoadingEmpleados(false);
    }
  };

  // Funciones de selección
  const toggleEmpleado = (empleadoId: string) => {
    setSelectedEmpleados(prev => {
      const newSet = new Set(prev);
      if (newSet.has(empleadoId)) {
        newSet.delete(empleadoId);
      } else {
        newSet.add(empleadoId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedEmpleados(new Set(empleados.map(e => e._id)));
  };

  const deselectAll = () => {
    setSelectedEmpleados(new Set());
  };

  const handleGenerar = async () => {
    if (!token || totalEmpleadosSeleccionados === 0) return;
    
    setGenerando(true);
    setError(null);
    
    try {
      const dto: GenerarNominaQuincenalDto = { 
        mes, 
        anio, 
        quincena,
        modoPago,
        empleadosSeleccionados: Array.from(selectedEmpleados),
      };
      const response: GenerarNominaResponse = await GastosFijos.generarNominaQuincenal(token, dto);
      setResultado(response.data);
      
      // Esperar 2 segundos para mostrar el resultado antes de cerrar
      setTimeout(() => {
        onSuccess?.(response.data);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error al generar nómina:', err);
      setError(err.message || GASTOS_FIJOS_MESSAGES.errorGenerarNomina);
    } finally {
      setGenerando(false);
    }
  };

  // Estilos
  const labelStyle: CSSProperties = {
    color: 'var(--text-primary)',
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)',
  };

  const titleColorStyle: CSSProperties = {
    color: isDark ? '#c084fc' : 'var(--ot-purple-600)',
  };

  const buttonPrimaryStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  };

  const cardStyle: CSSProperties = {
    background: 'var(--surface-muted)',
    borderColor: 'var(--border)',
  };

  const tableHeaderStyle: CSSProperties = {
    background: 'var(--surface-muted)',
    borderColor: 'var(--border)',
  };

  const headerIcon = useMemo(
    () => (
      <div
        className="p-2 rounded-lg"
        style={{ background: 'var(--ot-purple-100)', color: 'var(--ot-purple-600)' }}
      >
        <Users size={20} />
      </div>
    ),
    [],
  );

  // Si se generó exitosamente
  if (resultado) {
    const successIcon = (
      <div
        className="p-2 rounded-lg"
        style={{ background: '#d1fae5', color: '#10b981' }}
      >
        <CheckCircle size={20} />
      </div>
    );

    return (
      <Modal
        isOpen
        onClose={onClose}
        title="Nómina Generada"
        icon={successIcon}
        maxWidth="md"
      >
        <div className="p-6">
          <div className="text-center">
            <p style={mutedTextStyle} className="text-sm mb-6">
              La nómina quincenal se generó correctamente
            </p>
            
            <div className="space-y-2 text-left">
              <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={mutedTextStyle}>Gastos generados:</span>
                <span className="font-semibold" style={labelStyle}>{resultado.generados || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={mutedTextStyle}>Empleados procesados:</span>
                <span className="font-semibold" style={labelStyle}>{resultado.generados || 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span style={mutedTextStyle}>Total nómina:</span>
                <span className="font-bold text-lg" style={{ color: '#10b981' }}>
                  $ 0.00
                </span>
              </div>
            </div>

            {resultado.errores && resultado.errores.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-left">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                  ⚠️ Advertencias:
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-400 list-disc list-inside">
                  {resultado.errores.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Generar Nómina Quincenal - ${periodoLabel}`}
      icon={headerIcon}
      maxWidth="5xl"
    >
      <div className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#fee2e2', color: '#991b1b' }}>
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* NUEVA SECCIÓN: Modo de Pago */}
          <div style={cardStyle} className="p-5 rounded-lg border space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={titleColorStyle}>
              <DollarSign size={20} />
              Modo de Pago
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Opción: Mensual Completo */}
              <label className="flex-1 flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-purple-400" style={{ borderColor: modoPago === 'MENSUAL_COMPLETO' ? '#8b5cf6' : 'var(--border)', background: modoPago === 'MENSUAL_COMPLETO' ? 'rgba(139, 92, 246, 0.05)' : 'transparent' }}>
                <input
                  type="radio"
                  name="modoPago"
                  value="MENSUAL_COMPLETO"
                  checked={modoPago === 'MENSUAL_COMPLETO'}
                  onChange={(e) => setModoPago(e.target.value as ModoPago)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold" style={labelStyle}>Pago Mensual Completo</p>
                  <p className="text-xs mt-1" style={mutedTextStyle}>
                    Se paga el salario mensual completo en la <strong>segunda quincena</strong> (final de mes).
                  </p>
                </div>
              </label>

              {/* Opción: Dividido en 2 Quincenas */}
              <label className="flex-1 flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-purple-400" style={{ borderColor: modoPago === 'QUINCENAL_DIVIDIDO' ? '#8b5cf6' : 'var(--border)', background: modoPago === 'QUINCENAL_DIVIDIDO' ? 'rgba(139, 92, 246, 0.05)' : 'transparent' }}>
                <input
                  type="radio"
                  name="modoPago"
                  value="QUINCENAL_DIVIDIDO"
                  checked={modoPago === 'QUINCENAL_DIVIDIDO'}
                  onChange={(e) => setModoPago(e.target.value as ModoPago)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold" style={labelStyle}>Dividido en 2 Quincenas</p>
                  <p className="text-xs mt-1" style={mutedTextStyle}>
                    Se divide el salario mensual en dos partes iguales (50% en cada quincena).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Resumen Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Empleados Seleccionados */}
            <div style={cardStyle} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <Users size={20} style={mutedTextStyle} />
                <span style={{ color: '#3b82f6' }} className="text-2xl font-bold">
                  {totalEmpleadosSeleccionados} / {empleados.length}
                </span>
              </div>
              <p style={mutedTextStyle} className="text-sm">Empleados Seleccionados</p>
            </div>

            {/* Total Nómina */}
            <div style={cardStyle} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={20} style={mutedTextStyle} />
                <span style={{ color: '#10b981' }} className="text-2xl font-bold">
                  ${totalNomina.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p style={mutedTextStyle} className="text-sm">
                Total {modoPago === 'MENSUAL_COMPLETO' ? 'Mensual' : 'Quincenal'}
              </p>
            </div>

            {/* Fecha de Pago */}
            <div style={cardStyle} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={20} style={mutedTextStyle} />
                <span style={labelStyle} className="text-lg font-semibold">
                  {formatFecha(fechaPago)}
                </span>
              </div>
              <p style={mutedTextStyle} className="text-sm">Fecha de Pago</p>
            </div>
          </div>

          {/* Advertencia Dinámica */}
          <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#fef3c7', color: '#92400e' }}>
            <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Importante</p>
              <p className="text-sm mt-1">
                {modoPago === 'MENSUAL_COMPLETO' ? (
                  <>Se generarán {totalEmpleadosSeleccionados} gastos fijos de categoría NOMINA con el <strong>salario mensual completo</strong> en la <strong>segunda quincena</strong> (final de mes).</>
                ) : (
                  <>Se generarán {totalEmpleadosSeleccionados * 2} gastos fijos de categoría NOMINA (uno por quincena), dividiendo el <strong>salario mensual en mitades</strong> para cada empleado.</>
                )}
                {' '}Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          {/* NUEVA SECCIÓN: Botones de Selección */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={titleColorStyle}>
              Seleccionar Empleados
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                disabled={loadingEmpleados || selectedEmpleados.size === empleados.length}
              >
                Seleccionar Todos
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                disabled={loadingEmpleados || selectedEmpleados.size === 0}
              >
                Deseleccionar Todos
              </button>
            </div>
          </div>

          {/* Tabla de empleados CON CHECKBOXES */}
          {loadingEmpleados ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={tableHeaderStyle} className="border-b">
                      <th className="px-4 py-3 text-center text-sm font-semibold" style={labelStyle}>
                        Seleccionar
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={labelStyle}>
                        Empleado
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={labelStyle}>
                        Cargo
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold" style={labelStyle}>
                        Salario Mensual
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold" style={labelStyle}>
                        {modoPago === 'MENSUAL_COMPLETO' ? 'Pago Completo' : 'Pago Quincenal'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((emp, idx) => {
                      const isSelected = selectedEmpleados.has(emp._id);
                      const pagoMostrado = modoPago === 'MENSUAL_COMPLETO' 
                        ? (emp.salario?.monto || 0) 
                        : (emp.salario?.monto || 0) / 2;
                      
                      return (
                        <tr
                          key={emp._id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                          style={{ borderColor: 'var(--border)', opacity: isSelected ? 1 : 0.5 }}
                          onClick={() => toggleEmpleado(emp._id)}
                        >
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEmpleado(emp._id);
                              }}
                              className="inline-flex items-center justify-center"
                            >
                              {isSelected ? (
                                <CheckSquare size={20} style={{ color: '#8b5cf6' }} />
                              ) : (
                                <Square size={20} style={mutedTextStyle} />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3" style={labelStyle}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                                {emp.nombreCompleto.charAt(0)}
                              </div>
                              <span className="font-medium">{emp.nombreCompleto}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3" style={mutedTextStyle}>
                            {emp.cargo?.name || 'Sin cargo'}
                          </td>
                          <td className="px-4 py-3 text-right font-medium" style={labelStyle}>
                            ${emp.salario?.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold" style={{ color: isSelected ? '#10b981' : 'var(--text-muted)' }}>
                            ${pagoMostrado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={tableHeaderStyle} className="border-t">
                      <td colSpan={4} className="px-4 py-3 text-right font-bold" style={labelStyle}>
                        TOTAL NÓMINA ({totalEmpleadosSeleccionados} empleados):
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lg" style={{ color: '#10b981' }}>
                        ${totalNomina.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-all"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-muted)',
              }}
              disabled={generando}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGenerar}
              className="px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              style={buttonPrimaryStyle}
              disabled={generando || loadingEmpleados || totalEmpleadosSeleccionados === 0}
            >
              {generando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generando Nómina...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Confirmar y Generar ({totalEmpleadosSeleccionados} empleados)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
  );
}
