"use client";

import { useState, useEffect, CSSProperties, useMemo } from 'react';
import { Save, AlertCircle, DollarSign, FileText, Calendar, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import { Select, type SelectOption } from '@/components/ui/selectUI';
import { GastosFijos } from '@/lib/service-finanzas';
import type {
  RegistrarGastoFijoDto,
  ActualizarGastoFijoDto,
  GastoFijoFormateadoDto,
  QuincenaEnum,
  CategoriaGasto,
} from '@/lib/service-finanzas/service-gastos-fijos';
import {
  categoriaRequiereEmpleado,
  getFechaPagoQuincena,
  getCategoriaLabel,
  getCategoriaIcon,
  getCategoriaColor,
  getQuincenaLabel,
} from '@/lib/service-finanzas/service-gastos-fijos';
import {
  OPCIONES_MESES,
  OPCIONES_QUINCENA,
  OPCIONES_CATEGORIA,
  GASTOS_FIJOS_MESSAGES,
  GASTOS_FIJOS_VALIDATIONS,
} from '@/lib/service-finanzas/service-gastos-fijos';

interface EmpleadoOption {
  id: string;
  nombreCompleto: string;
  cargo?: { name: string };
  salario?: number;
}

interface GastoFijoFormProps {
  initialData?: GastoFijoFormateadoDto;
  mesInicial?: number;
  anioInicial?: number;
  quincenaInicial?: QuincenaEnum;
  onSubmit?: (data: RegistrarGastoFijoDto | ActualizarGastoFijoDto) => Promise<void>;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GastoFijoForm({
  initialData,
  mesInicial,
  anioInicial,
  quincenaInicial,
  onSubmit,
  onClose,
  onSuccess,
}: GastoFijoFormProps) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isEditing = !!initialData;

  // Estados del formulario
  const [mes, setMes] = useState(initialData?.mes || mesInicial || new Date().getMonth() + 1);
  const [anio, setAnio] = useState(initialData?.anio || anioInicial || new Date().getFullYear());
  const [quincena, setQuincena] = useState<QuincenaEnum>(
    initialData?.quincena || quincenaInicial || ('PRIMERA_QUINCENA' as QuincenaEnum)
  );
  const [categoria, setCategoria] = useState<CategoriaGasto>(initialData?.categoria || ('OTROS' as CategoriaGasto));
  const [empleadoId, setEmpleadoId] = useState(initialData?.empleadoId || '');
  const [montoUSD, setMontoUSD] = useState(initialData?.montoOriginalUSD ? parseFloat(initialData.montoOriginalUSD.replace(/[^0-9.-]+/g, '')) : 0);
  const [concepto, setConcepto] = useState(initialData?.concepto || '');
  const [fechaPago, setFechaPago] = useState(initialData?.fechaPago?.split('T')[0] || '');
  const [numeroFactura, setNumeroFactura] = useState(initialData?.numeroFactura || '');
  const [archivoComprobante, setArchivoComprobante] = useState(initialData?.archivoComprobante || '');

  // Estados de UI
  const [empleados, setEmpleados] = useState<EmpleadoOption[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar empleados si es necesario
  useEffect(() => {
    if (token && categoriaRequiereEmpleado(categoria)) {
      cargarEmpleados();
    }
  }, [token, categoria]);

  // Calcular fecha de pago automática
  useEffect(() => {
    if (!fechaPago && mes && anio && quincena) {
      const fechaCalculada = getFechaPagoQuincena(mes, anio, quincena);
      setFechaPago(fechaCalculada);
    }
  }, [mes, anio, quincena]);

  const cargarEmpleados = async () => {
    if (!token) return;
    
    setLoadingEmpleados(true);
    try {
      // Importar dinámicamente el servicio RRHH
      const { getAllEmpleados } = await import('@/lib/service-rrhh/empleados-api');
      const empleadosData = await getAllEmpleados(token, false);
      
      const empleadosOptions = empleadosData.map((emp: any) => ({
        id: emp._id,
        nombreCompleto: `${emp.nombre || ''} ${emp.apellido || ''}`.trim() || 'Sin nombre',
        cargo: emp.cargoId,
        salario: emp.salario?.monto,
      }));
      
      setEmpleados(empleadosOptions);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setEmpleados([]);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const validarFormulario = (): string | null => {
    if (montoUSD <= GASTOS_FIJOS_VALIDATIONS.montoMin) {
      return GASTOS_FIJOS_MESSAGES.montoInvalido;
    }
    if (montoUSD > GASTOS_FIJOS_VALIDATIONS.montoMax) {
      return `El monto no puede superar $${GASTOS_FIJOS_VALIDATIONS.montoMax.toLocaleString()}`;
    }
    if (!concepto || concepto.length < GASTOS_FIJOS_VALIDATIONS.conceptoMinLength) {
      return GASTOS_FIJOS_MESSAGES.conceptoRequerido;
    }
    if (categoriaRequiereEmpleado(categoria) && !empleadoId) {
      return GASTOS_FIJOS_MESSAGES.empleadoRequerido;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialData) {
        // Actualizar gasto existente
        const dto: ActualizarGastoFijoDto = {
          montoUSD,
          concepto,
          fechaPago: fechaPago || undefined,
          numeroFactura: numeroFactura || undefined,
          archivoComprobante: archivoComprobante || undefined,
        };
        
        if (onSubmit) {
          await onSubmit(dto);
        } else {
          await GastosFijos.actualizarGasto(token!, initialData.id, dto);
        }
      } else {
        // Registrar nuevo gasto
        const dto: RegistrarGastoFijoDto = {
          mes,
          anio,
          quincena,
          categoria,
          empleadoId: categoriaRequiereEmpleado(categoria) ? empleadoId : undefined,
          montoUSD,
          concepto,
          fechaPago: fechaPago || undefined,
          numeroFactura: numeroFactura || undefined,
          archivoComprobante: archivoComprobante || undefined,
        };
        
        if (onSubmit) {
          await onSubmit(dto);
        } else {
          await GastosFijos.registrarGasto(token!, dto);
        }
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error al guardar gasto:', err);
      setError(err.message || GASTOS_FIJOS_MESSAGES.errorRegistrarGasto);
    } finally {
      setLoading(false);
    }
  };

  // Estilos
  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  const labelStyle: CSSProperties = {
    color: 'var(--text-primary)',
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)',
  };

  const buttonPrimaryStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  };

  const sectionStyle: CSSProperties = {
    background: 'var(--surface-muted)',
    borderColor: 'var(--border)',
  };

  const titleColorStyle: CSSProperties = {
    color: isDark ? '#60a5fa' : 'var(--ot-blue-600)',
  };

  const headerIcon = useMemo(
    () => (
      <div
        className="p-2 rounded-lg"
        style={{ background: 'var(--ot-purple-100)', color: 'var(--ot-purple-600)' }}
      >
        {isEditing ? <FileText size={20} /> : <Save size={20} />}
      </div>
    ),
    [isEditing],
  );

  const empleadoSeleccionado = empleados.find(e => e.id === empleadoId);
  const requiereEmpleado = categoriaRequiereEmpleado(categoria);

  // Opciones para los selects
  const mesOptions: SelectOption[] = OPCIONES_MESES.map(opcion => ({
    value: String(opcion.value),
    label: opcion.label,
  }));

  const quincenaOptions: SelectOption[] = OPCIONES_QUINCENA.map(opcion => ({
    value: opcion.value,
    label: opcion.label,
  }));

  const categoriaOptions: SelectOption[] = OPCIONES_CATEGORIA.map(cat => ({
    value: cat.value,
    label: `${cat.icon} ${cat.label}`,
  }));

  const empleadoOptions: SelectOption[] = empleados.map(emp => ({
    value: emp.id,
    label: `${emp.nombreCompleto}${emp.cargo?.name ? ` - ${emp.cargo.name}` : ''}`,
  }));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}
      icon={headerIcon}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#fee2e2', color: '#991b1b' }}>
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Sección: Periodo */}
          {!isEditing && (
            <div style={sectionStyle} className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={titleColorStyle}>
                <Calendar size={18} />
                Periodo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={labelStyle}>
                    Mes <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={String(mes)}
                    onChange={(value) => setMes(Number(value))}
                    options={mesOptions}
                    size="md"
                    fullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={labelStyle}>
                    Año <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(Number(e.target.value))}
                    min={GASTOS_FIJOS_VALIDATIONS.anioMin}
                    max={GASTOS_FIJOS_VALIDATIONS.anioMax}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={labelStyle}>
                    Quincena <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={quincena}
                    onChange={(value) => setQuincena(value as QuincenaEnum)}
                    options={quincenaOptions}
                    size="md"
                    fullWidth
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sección: Detalles del Gasto */}
          <div style={sectionStyle} className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={titleColorStyle}>
              <FileText size={18} />
              Detalles del Gasto
            </h3>

            <div className="space-y-4">
              {/* Categoría */}
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={labelStyle}>
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={categoria}
                    onChange={(value) => {
                      setCategoria(value as CategoriaGasto);
                      setEmpleadoId(''); // Reset empleado al cambiar categoría
                    }}
                    options={categoriaOptions}
                    size="md"
                    fullWidth
                  />
                  <p className="text-xs mt-1" style={mutedTextStyle}>
                    {OPCIONES_CATEGORIA.find(c => c.value === categoria)?.description}
                  </p>
                </div>
              )}

              {/* Empleado (solo para NOMINA) */}
              {requiereEmpleado && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={labelStyle}>
                    Empleado <span className="text-red-500">*</span>
                  </label>
                  {loadingEmpleados ? (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                      <span style={mutedTextStyle} className="text-sm">Cargando empleados...</span>
                    </div>
                  ) : (
                    <>
                      {isEditing ? (
                        <div
                          className="px-4 py-2.5 rounded-lg border"
                          style={{
                            background: 'var(--surface-muted)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {empleadoSeleccionado?.nombreCompleto || 'Empleado no encontrado'}
                        </div>
                      ) : (
                        <Select
                          value={empleadoId}
                          onChange={(value) => setEmpleadoId(value)}
                          options={empleadoOptions}
                          placeholder="Seleccionar empleado..."
                          size="md"
                          fullWidth
                        />
                      )}
                      {empleadoSeleccionado && empleadoSeleccionado.salario && (
                        <p className="text-xs mt-1" style={mutedTextStyle}>
                          💰 Salario mensual: ${empleadoSeleccionado.salario.toLocaleString()} USD
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium mb-2" style={labelStyle}>
                  Monto (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={mutedTextStyle} />
                  <input
                    type="number"
                    value={montoUSD}
                    onChange={(e) => setMontoUSD(parseFloat(e.target.value) || 0)}
                    min={GASTOS_FIJOS_VALIDATIONS.montoMin}
                    max={GASTOS_FIJOS_VALIDATIONS.montoMax}
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={inputStyle}
                    required
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs mt-1" style={mutedTextStyle}>
                  Monto debe estar entre $0.01 y ${GASTOS_FIJOS_VALIDATIONS.montoMax.toLocaleString()}
                </p>
              </div>

              {/* Concepto */}
              <div>
                <label className="block text-sm font-medium mb-2" style={labelStyle}>
                  Concepto <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  minLength={GASTOS_FIJOS_VALIDATIONS.conceptoMinLength}
                  maxLength={GASTOS_FIJOS_VALIDATIONS.conceptoMaxLength}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  style={inputStyle}
                  required
                  placeholder="Describe el gasto..."
                />
                <p className="text-xs mt-1 text-right" style={mutedTextStyle}>
                  {concepto.length}/{GASTOS_FIJOS_VALIDATIONS.conceptoMaxLength}
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Información Adicional (Opcional) */}
          <div style={sectionStyle} className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={titleColorStyle}>
              <FileText size={18} />
              Información Adicional (Opcional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={labelStyle}>
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={labelStyle}>
                  Número de Factura
                </label>
                <input
                  type="text"
                  value={numeroFactura}
                  onChange={(e) => setNumeroFactura(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={inputStyle}
                  placeholder="FAC-2024-001"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2" style={labelStyle}>
                URL del Comprobante
              </label>
              <input
                type="url"
                value={archivoComprobante}
                onChange={(e) => setArchivoComprobante(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={inputStyle}
                placeholder="https://..."
              />
            </div>
          </div>

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
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              style={buttonPrimaryStyle}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{isEditing ? 'Actualizar' : 'Registrar'} Gasto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
  );
}
