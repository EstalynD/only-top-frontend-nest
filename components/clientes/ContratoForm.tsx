"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addToast } from '@/components/ui/Toast';
import { 
  createContrato, 
  updateContrato,
  getPaymentProcessors,
  getCommissionScales,
} from '@/lib/service-clientes/api-contratos';
import type { 
  ContratoModelo, 
  CreateContratoModeloDto,
  UpdateContratoModeloDto,
  PaymentProcessor,
  CommissionScale,
} from '@/lib/service-clientes/types-contratos';
import { 
  PeriodicidadPago, 
  TipoComision,
} from '@/lib/service-clientes/types-contratos';
import { 
  PERIODICIDADES_PAGO, 
  TIPOS_COMISION,
} from '@/lib/service-clientes/constants-contratos';
import { Calendar, DollarSign, CreditCard, FileText, AlertCircle } from 'lucide-react';

type ContratoFormProps = {
  modeloId?: string;
  modeloNombre?: string;
  contrato?: ContratoModelo;
  isEdit?: boolean;
};

export function ContratoForm({ modeloId, modeloNombre, contrato, isEdit = false }: ContratoFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [paymentProcessors, setPaymentProcessors] = React.useState<PaymentProcessor[]>([]);
  const [commissionScales, setCommissionScales] = React.useState<CommissionScale[]>([]);

  // Form data
  const [formData, setFormData] = React.useState<CreateContratoModeloDto>({
    modeloId: modeloId || '',
    fechaInicio: contrato?.fechaInicio ? contrato.fechaInicio.split('T')[0] : new Date().toISOString().split('T')[0],
    periodicidadPago: contrato?.periodicidadPago || PeriodicidadPago.MENSUAL,
    fechaInicioCobro: contrato?.fechaInicioCobro ? contrato.fechaInicioCobro.split('T')[0] : new Date().toISOString().split('T')[0],
    tipoComision: contrato?.tipoComision || TipoComision.ESCALONADO,
    comisionFijaPorcentaje: contrato?.comisionFija?.porcentaje || undefined,
    comisionEscalonadaId: contrato?.comisionEscalonada?.escalaId || undefined,
    procesadorPagoId: typeof contrato?.procesadorPagoId === 'object' ? contrato.procesadorPagoId._id : contrato?.procesadorPagoId || '',
    notasInternas: contrato?.notasInternas || '',
  });

  // Load processors and scales
  React.useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [processors, scales] = await Promise.all([
          getPaymentProcessors(token),
          getCommissionScales(token),
        ]);
        setPaymentProcessors(processors.filter(p => p.isActive));
        setCommissionScales(scales);

        // Set default escala if not editing
        if (!isEdit && scales.length > 0) {
          const activeScale = scales.find(s => s.isActive) || scales.find(s => s.isDefault) || scales[0];
          if (activeScale) {
            setFormData(prev => ({ ...prev, comisionEscalonadaId: activeScale._id }));
          }
        }

        // Set default processor if not editing
        if (!isEdit && processors.length > 0) {
          const activeProcessor = processors.find(p => p.isActive);
          if (activeProcessor) {
            setFormData(prev => ({ ...prev, procesadorPagoId: activeProcessor._id }));
          }
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error al cargar datos',
          description: 'No se pudieron cargar los procesadores de pago o escalas de comisión',
        });
      }
    };

    loadData();
  }, [token, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validaciones
    if (!formData.modeloId) {
      addToast({
        type: 'error',
        title: 'Error de validación',
        description: 'Debe seleccionar una modelo',
      });
      return;
    }

    if (!formData.procesadorPagoId) {
      addToast({
        type: 'error',
        title: 'Error de validación',
        description: 'Debe seleccionar un procesador de pago',
      });
      return;
    }

    if (formData.tipoComision === TipoComision.FIJO && !formData.comisionFijaPorcentaje) {
      addToast({
        type: 'error',
        title: 'Error de validación',
        description: 'Debe ingresar el porcentaje de comisión fija',
      });
      return;
    }

    if (formData.tipoComision === TipoComision.ESCALONADO && !formData.comisionEscalonadaId) {
      addToast({
        type: 'error',
        title: 'Error de validación',
        description: 'Debe seleccionar una escala de comisión',
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && contrato) {
        const updateDto: UpdateContratoModeloDto = {
          fechaInicio: formData.fechaInicio,
          periodicidadPago: formData.periodicidadPago,
          fechaInicioCobro: formData.fechaInicioCobro,
          tipoComision: formData.tipoComision,
          comisionFijaPorcentaje: formData.comisionFijaPorcentaje,
          comisionEscalonadaId: formData.comisionEscalonadaId,
          procesadorPagoId: formData.procesadorPagoId,
          notasInternas: formData.notasInternas,
        };
        await updateContrato(token, contrato._id, updateDto);
        addToast({
          type: 'success',
          title: 'Contrato actualizado',
          description: 'El contrato ha sido actualizado exitosamente',
        });
        router.push(`/clientes/contratos/${contrato._id}`);
      } else {
        const newContrato = await createContrato(token, formData);
        addToast({
          type: 'success',
          title: 'Contrato creado',
          description: 'El contrato ha sido creado exitosamente',
        });
        router.push(`/clientes/contratos/${newContrato._id}`);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: isEdit ? 'Error al actualizar' : 'Error al crear',
        description: error?.message || 'No se pudo procesar el contrato',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedScale = commissionScales.find(s => s._id === formData.comisionEscalonadaId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información de la Modelo */}
      {modeloNombre && (
        <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} style={{ color: 'var(--ot-blue-600)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Modelo Seleccionada
            </h3>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--ot-blue-50)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--ot-blue-700)' }}>
              {modeloNombre}
            </p>
          </div>
        </div>
      )}

      {/* Fechas del Contrato */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={20} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Fechas del Contrato
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Fecha de Inicio del Contrato <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.fechaInicio}
              onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Fecha desde la cual se considera vinculada la modelo
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Fecha de Inicio de Cobro <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.fechaInicioCobro}
              onChange={(e) => setFormData({ ...formData, fechaInicioCobro: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Fecha desde la cual comienza el primer ciclo de facturación
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Periodicidad de Pago <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.periodicidadPago}
            onChange={(e) => setFormData({ ...formData, periodicidadPago: e.target.value as PeriodicidadPago })}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {PERIODICIDADES_PAGO.map((periodicidad) => (
              <option key={periodicidad.value} value={periodicidad.value}>
                {periodicidad.label}
              </option>
            ))}
          </select>
          <div className="mt-2 p-3 rounded-lg" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
            <p className="text-xs flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {formData.periodicidadPago === PeriodicidadPago.QUINCENAL
                ? 'Las facturas se enviarán automáticamente al cierre de cada periodo quincenal (día 15 y último día del mes)'
                : 'Las facturas se enviarán automáticamente el primer día del mes siguiente'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Comisión */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <DollarSign size={20} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Estructura de Comisión
          </h3>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Tipo de Comisión <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.tipoComision}
            onChange={(e) => {
              const tipo = e.target.value as TipoComision;
              setFormData({ 
                ...formData, 
                tipoComision: tipo,
                comisionFijaPorcentaje: tipo === TipoComision.FIJO ? formData.comisionFijaPorcentaje : undefined,
                comisionEscalonadaId: tipo === TipoComision.ESCALONADO ? formData.comisionEscalonadaId : undefined,
              });
            }}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {TIPOS_COMISION.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {formData.tipoComision === TipoComision.FIJO ? (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Porcentaje Fijo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                max="100"
                step="0.01"
                value={formData.comisionFijaPorcentaje || ''}
                onChange={(e) => setFormData({ ...formData, comisionFijaPorcentaje: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 pr-12 rounded-lg border outline-none transition-all duration-200"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
                placeholder="30"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>
                %
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Porcentaje que la modelo pagará a OnlyTop sobre sus ingresos
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Escala de Comisión <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.comisionEscalonadaId || ''}
              onChange={(e) => setFormData({ ...formData, comisionEscalonadaId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">Seleccionar escala</option>
              {commissionScales.map((scale) => (
                <option key={scale._id} value={scale._id}>
                  {scale.name} {scale.isActive && '(Activa)'} {scale.isDefault && '(Por Defecto)'}
                </option>
              ))}
            </select>
            {selectedScale && (
              <div className="mt-3 p-4 rounded-lg" style={{ background: 'var(--background)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Tramos de la Escala:
                </p>
                <div className="space-y-1">
                  {selectedScale.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>
                        ${rule.minUsd.toLocaleString()} {rule.maxUsd ? `- $${rule.maxUsd.toLocaleString()}` : 'en adelante'}
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--ot-blue-600)' }}>
                        {rule.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Procesador de Pago */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={20} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Medio de Pago
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Procesador de Pago <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.procesadorPagoId}
            onChange={(e) => setFormData({ ...formData, procesadorPagoId: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">Seleccionar procesador</option>
            {paymentProcessors.map((processor) => (
              <option key={processor._id} value={processor._id}>
                {processor.name} ({processor.code})
              </option>
            ))}
          </select>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Medio principal por el que la modelo enviará sus pagos
          </p>
        </div>
      </div>

      {/* Notas Internas */}
      <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <FileText size={20} style={{ color: 'var(--ot-blue-600)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Notas Internas (Opcional)
          </h3>
        </div>

        <textarea
          value={formData.notasInternas}
          onChange={(e) => setFormData({ ...formData, notasInternas: e.target.value })}
          rows={4}
          placeholder="Notas adicionales sobre el contrato..."
          className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200 resize-none"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm"
          style={{
            background: loading ? '#93c5fd' : 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))',
            color: '#ffffff',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Guardando...' : isEdit ? 'Actualizar Contrato' : 'Crear Contrato'}
        </button>
      </div>
    </form>
  );
}

