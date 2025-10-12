"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { 
  getPaymentProcessors,
  createPaymentProcessor,
  updatePaymentProcessor,
  deletePaymentProcessor,
  getCommissionScales,
  createCommissionScale,
  updateCommissionScale,
  deleteCommissionScale,
  getActiveCommissionScale,
  activateCommissionScale,
  calculateCommission,
  createDefaultCommissionScale,
  getInternalCommissions,
  updateInternalCommissions,
  calculateAllInternalCommissions
} from '@/lib/service-sistema/finance.api';
import type { 
  PaymentProcessor, 
  CreatePaymentProcessorRequest,
  CommissionScale, 
  CreateCommissionScaleRequest,
  CommissionRule,
  CommissionType,
  CommissionCalculation,
  InternalCommissions,
  UpdateInternalCommissionsRequest,
  PerformanceScale,
  AllCommissionsCalculation
} from '@/lib/service-sistema/finance.api';
import { 
  CreditCard, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2,
  Calculator,
  CheckCircle,
  DollarSign,
  Percent,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function FinanzasPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  // Estados principales
  const [processors, setProcessors] = React.useState<PaymentProcessor[]>([]);
  const [scales, setScales] = React.useState<CommissionScale[]>([]);
  const [activeScale, setActiveScale] = React.useState<CommissionScale | null>(null);
  const [internalCommissions, setInternalCommissions] = React.useState<InternalCommissions | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Modal estados
  const [showProcessorModal, setShowProcessorModal] = React.useState(false);
  const [showScaleModal, setShowScaleModal] = React.useState(false);
  const [, setShowCalculatorModal] = React.useState(false);
  const [showInternalModal, setShowInternalModal] = React.useState(false);
  const [showInternalCalculatorModal, setShowInternalCalculatorModal] = React.useState(false);
  const [editingProcessor, setEditingProcessor] = React.useState<PaymentProcessor | null>(null);
  const [editingScale, setEditingScale] = React.useState<CommissionScale | null>(null);

  // Confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    show: boolean;
    type: 'processor' | 'scale';
    item: PaymentProcessor | CommissionScale | null;
  }>({ show: false, type: 'processor', item: null });

  // Estados de carga
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Formularios
  const [processorForm, setProcessorForm] = React.useState<CreatePaymentProcessorRequest>({
    name: '',
    commissionType: 'PERCENTAGE',
    commissionValue: 0,
    effectiveDate: new Date().toISOString().split('T')[0],
    isActive: true,
    description: '',
  });

  const [scaleForm, setScaleForm] = React.useState<CreateCommissionScaleRequest>({
    name: '',
    isActive: false,
    isDefault: false,
    rules: [{ minUsd: 0, maxUsd: 19999, percentage: 10 }],
    description: '',
  });

  const [calculatorForm, setCalculatorForm] = React.useState({
    amount: '',
    result: null as CommissionCalculation | null,
  });

  // Formulario comisiones internas
  const [internalForm, setInternalForm] = React.useState<UpdateInternalCommissionsRequest>({
    salesCloserPercent: 2,
    salesCloserMonths: 2,
    traffickerPercent: 2,
    chattersMinPercent: 0.5,
    chattersMaxPercent: 2,
    chattersPerformanceScale: [
      { fromPercent: 0, toPercent: 79.99, commissionPercent: 0.5 },
      { fromPercent: 80, toPercent: 99.99, commissionPercent: 1 },
      { fromPercent: 100, commissionPercent: 2 }
    ],
    description: '',
  });

  // Calculadora comisiones internas
  const [internalCalculatorForm, setInternalCalculatorForm] = React.useState({
    subscriptionAmount: '',
    monthsActive: '',
    netSubscriptionAmount: '',
    goalCompletionPercent: '',
    baseAmountForChatters: '',
    result: null as AllCommissionsCalculation | null,
  });

  // Cargar datos iniciales
  React.useEffect(() => {
    if (!token) return;
    
    const loadData = async () => {
      try {
        const [processorsRes, scalesRes, activeRes, internalRes] = await Promise.all([
          getPaymentProcessors(token),
          getCommissionScales(token),
          getActiveCommissionScale(token),
          getInternalCommissions(token)
        ]);
        
        setProcessors(processorsRes);
        setScales(scalesRes);
        setActiveScale(activeRes);
        setInternalCommissions(internalRes);
        
        // Actualizar formulario con datos existentes
        if (internalRes) {
          setInternalForm({
            salesCloserPercent: internalRes.salesCloserPercent,
            salesCloserMonths: internalRes.salesCloserMonths,
            traffickerPercent: internalRes.traffickerPercent,
            chattersMinPercent: internalRes.chattersMinPercent,
            chattersMaxPercent: internalRes.chattersMaxPercent,
            chattersPerformanceScale: [...internalRes.chattersPerformanceScale],
            description: internalRes.description || '',
          });
        }
      } catch (error) {
        toast({
          type: 'error',
          title: 'Error al cargar datos',
          description: error instanceof Error ? error.message : 'Error desconocido'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, toast]);

  // === PAYMENT PROCESSORS ===

  const openProcessorModal = (processor?: PaymentProcessor) => {
    if (processor) {
      setEditingProcessor(processor);
      setProcessorForm({
        name: processor.name,
        commissionType: processor.commissionType,
        commissionValue: processor.commissionValue,
        effectiveDate: processor.effectiveDate.split('T')[0],
        isActive: processor.isActive,
        description: processor.description || '',
      });
    } else {
      setEditingProcessor(null);
      setProcessorForm({
        name: '',
        commissionType: 'PERCENTAGE',
        commissionValue: 0,
        effectiveDate: new Date().toISOString().split('T')[0],
        isActive: true,
        description: '',
      });
    }
    setShowProcessorModal(true);
  };

  const handleProcessorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      if (editingProcessor) {
        const updated = await updatePaymentProcessor(token, editingProcessor._id, processorForm);
        setProcessors(prev => prev.map(p => p._id === updated._id ? updated : p));
        toast({ type: 'success', title: 'Procesador actualizado', description: `${updated.name} actualizado exitosamente` });
      } else {
        const created = await createPaymentProcessor(token, processorForm);
        setProcessors(prev => [created, ...prev]);
        toast({ type: 'success', title: 'Procesador creado', description: `${created.name} creado exitosamente` });
      }
      
      setShowProcessorModal(false);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al guardar procesador',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // === COMMISSION SCALES ===

  const openScaleModal = (scale?: CommissionScale) => {
    if (scale) {
      setEditingScale(scale);
      setScaleForm({
        name: scale.name,
        isActive: scale.isActive,
        isDefault: scale.isDefault,
        rules: [...scale.rules],
        description: scale.description || '',
      });
    } else {
      setEditingScale(null);
      setScaleForm({
        name: '',
        isActive: false,
        isDefault: false,
        rules: [{ minUsd: 0, maxUsd: 19999, percentage: 10 }],
        description: '',
      });
    }
    setShowScaleModal(true);
  };

  const handleScaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      if (editingScale) {
        const updated = await updateCommissionScale(token, editingScale._id, scaleForm);
        setScales(prev => prev.map(s => s._id === updated._id ? updated : s));
        if (updated.isActive) setActiveScale(updated);
        toast({ type: 'success', title: 'Escala actualizada', description: `${updated.name} actualizada exitosamente` });
      } else {
        const created = await createCommissionScale(token, scaleForm);
        setScales(prev => [created, ...prev]);
        if (created.isActive) setActiveScale(created);
        toast({ type: 'success', title: 'Escala creada', description: `${created.name} creada exitosamente` });
      }
      
      setShowScaleModal(false);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al guardar escala',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateScale = async (scale: CommissionScale) => {
    if (!token) return;

    try {
      const activated = await activateCommissionScale(token, scale._id);
      setScales(prev => prev.map(s => ({ ...s, isActive: s._id === activated._id })));
      setActiveScale(activated);
      toast({ type: 'success', title: 'Escala activada', description: `${activated.name} es ahora la escala activa` });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al activar escala',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // === RULES MANAGEMENT ===

  const addRule = () => {
    const lastRule = scaleForm.rules[scaleForm.rules.length - 1];
    const newMinUsd = lastRule.maxUsd ? lastRule.maxUsd + 1 : lastRule.minUsd + 10000;
    
    setScaleForm(prev => ({
      ...prev,
      rules: [...prev.rules, { minUsd: newMinUsd, maxUsd: newMinUsd + 9999, percentage: 10 }]
    }));
  };

  const updateRule = (index: number, field: keyof CommissionRule, value: number | undefined) => {
    setScaleForm(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const removeRule = (index: number) => {
    if (scaleForm.rules.length <= 1) return;
    
    setScaleForm(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  // === DELETE HANDLERS ===

  const handleDelete = async () => {
    if (!token || !deleteConfirm.item) return;

    setDeleting(true);
    try {
      if (deleteConfirm.type === 'processor') {
        await deletePaymentProcessor(token, deleteConfirm.item._id);
        setProcessors(prev => prev.filter(p => p._id !== deleteConfirm.item!._id));
        toast({ type: 'success', title: 'Procesador eliminado' });
      } else {
        await deleteCommissionScale(token, deleteConfirm.item._id);
        setScales(prev => prev.filter(s => s._id !== deleteConfirm.item!._id));
        toast({ type: 'success', title: 'Escala eliminada' });
      }
      
      setDeleteConfirm({ show: false, type: 'processor', item: null });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al eliminar',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setDeleting(false);
    }
  };

  // === CALCULATOR ===

  const handleCalculate = async () => {
    if (!token || !calculatorForm.amount) return;

    try {
      const result = await calculateCommission(token, parseFloat(calculatorForm.amount));
      setCalculatorForm(prev => ({ ...prev, result }));
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error en cálculo',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  const handleCreateDefault = async () => {
    if (!token) return;

    try {
      const defaultScale = await createDefaultCommissionScale(token);
      setScales(prev => [defaultScale, ...prev]);
      setActiveScale(defaultScale);
      toast({ type: 'success', title: 'Escala por defecto creada' });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al crear escala por defecto',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // === INTERNAL COMMISSIONS ===

  const handleInternalCommissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const updated = await updateInternalCommissions(token, internalForm);
      setInternalCommissions(updated);
      toast({ type: 'success', title: 'Comisiones internas actualizadas' });
      setShowInternalModal(false);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al actualizar comisiones internas',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInternalCalculate = async () => {
    if (!token) return;

    const { subscriptionAmount, monthsActive, netSubscriptionAmount, goalCompletionPercent, baseAmountForChatters } = internalCalculatorForm;
    
    if (!subscriptionAmount || !monthsActive || !netSubscriptionAmount || !goalCompletionPercent || !baseAmountForChatters) {
      toast({ type: 'error', title: 'Error', description: 'Todos los campos son requeridos' });
      return;
    }

    try {
      const result = await calculateAllInternalCommissions(token, {
        subscriptionAmount: parseFloat(subscriptionAmount),
        monthsActive: parseInt(monthsActive),
        netSubscriptionAmount: parseFloat(netSubscriptionAmount),
        goalCompletionPercent: parseFloat(goalCompletionPercent),
        baseAmountForChatters: parseFloat(baseAmountForChatters),
      });
      
      setInternalCalculatorForm(prev => ({ ...prev, result }));
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error en cálculo',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // === PERFORMANCE SCALE MANAGEMENT ===

  const addPerformanceScale = () => {
    const lastScale = internalForm.chattersPerformanceScale![internalForm.chattersPerformanceScale!.length - 1];
    const newFromPercent = lastScale.toPercent ? lastScale.toPercent + 0.01 : lastScale.fromPercent + 20;
    
    setInternalForm(prev => ({
      ...prev,
      chattersPerformanceScale: [
        ...prev.chattersPerformanceScale!,
        { fromPercent: newFromPercent, toPercent: newFromPercent + 19.99, commissionPercent: 1 }
      ]
    }));
  };

  const updatePerformanceScale = (index: number, field: keyof PerformanceScale, value: number | undefined) => {
    setInternalForm(prev => ({
      ...prev,
      chattersPerformanceScale: prev.chattersPerformanceScale!.map((scale, i) => 
        i === index ? { ...scale, [field]: value } : scale
      )
    }));
  };

  const removePerformanceScale = (index: number) => {
    if (internalForm.chattersPerformanceScale!.length <= 1) return;
    
    setInternalForm(prev => ({
      ...prev,
      chattersPerformanceScale: prev.chattersPerformanceScale!.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" label="Cargando configuración de finanzas..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Configuración de Finanzas
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Gestiona procesadores de pago y escalas de comisión para el sistema.
        </p>
      </div>

      {/* Calculadora de comisiones */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Calculator size={20} style={{ color: 'var(--ot-blue-500)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Calculadora de Comisiones
              </h2>
            </div>
            <Button onClick={() => setShowCalculatorModal(true)} variant="neutral" className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Calculator size={16} />
              Calculadora Avanzada
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <Input
                label="Monto en USD"
                type="number"
                step="0.01"
                min="0"
                placeholder="1000.00"
                value={calculatorForm.amount}
                onChange={(e) => setCalculatorForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <Button
              onClick={handleCalculate}
              disabled={!calculatorForm.amount}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Calculator size={16} />
              Calcular
            </Button>
          </div>
          
          {calculatorForm.result && (
            <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Comisión:</span>
                  <div className="font-semibold" style={{ color: 'var(--ot-blue-600)' }}>
                    {calculatorForm.result.commissionPercentage}% = ${calculatorForm.result.commissionAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Monto neto:</span>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    ${calculatorForm.result.netAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Escala:</span>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {calculatorForm.result.scaleName}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Procesadores de Pago */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <CreditCard size={20} style={{ color: 'var(--ot-blue-500)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Procesadores de Pago
              </h2>
            </div>
            <Button onClick={() => openProcessorModal()} className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Plus size={16} />
              Nuevo Procesador
            </Button>
          </div>

          {processors.length > 0 ? (
            <div className="space-y-3">
              {processors.map((processor) => (
                <div 
                  key={processor._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border"
                  style={{ 
                    background: 'var(--surface-muted)', 
                    borderColor: 'var(--border)' 
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {processor.name}
                      </h3>
                      {processor.isActive && (
                        <span className="px-2 py-1 text-xs rounded-full" style={{
                          background: 'var(--ot-green-100)',
                          color: 'var(--ot-green-700)'
                        }}>
                          Activo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-wrap" style={{ color: 'var(--text-muted)' }}>
                      <span>
                        {processor.commissionType === 'PERCENTAGE' ? (
                          <>{processor.commissionValue}% comisión</>
                        ) : (
                          <>${processor.commissionValue} {processor.commissionType === 'FIXED_USD' ? 'USD' : 'COP'} fijo</>
                        )}
                      </span>
                      <span>•</span>
                      <span>Desde: {new Date(processor.effectiveDate).toLocaleDateString()}</span>
                    </div>
                    {processor.description && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {processor.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                    <Button
                      onClick={() => openProcessorModal(processor)}
                      variant="neutral"
                      className="p-2"
                    >
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      onClick={() => setDeleteConfirm({ show: true, type: 'processor', item: processor })}
                      variant="danger"
                      className="p-2"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
              <p>No hay procesadores configurados</p>
              <p className="text-xs">Crea el primer procesador de pago</p>
            </div>
          )}
        </div>
      </Card>

      {/* Escalas de Comisión */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} style={{ color: 'var(--ot-blue-500)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Escalas de Comisión
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {scales.length === 0 && (
                <Button onClick={handleCreateDefault} variant="neutral" className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <Plus size={16} />
                  Crear Por Defecto
                </Button>
              )}
              <Button onClick={() => openScaleModal()} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Plus size={16} />
                Nueva Escala
              </Button>
            </div>
          </div>

          {activeScale && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--ot-blue-50)', borderColor: 'var(--ot-blue-200)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} style={{ color: 'var(--ot-blue-600)' }} />
                <span className="font-medium" style={{ color: 'var(--ot-blue-800)' }}>
                  Escala Activa: {activeScale.name}
                </span>
              </div>
              <div className="text-sm" style={{ color: 'var(--ot-blue-700)' }}>
                {activeScale.rules.map((rule, index) => (
                  <span key={index}>
                    ${rule.minUsd.toLocaleString()}{rule.maxUsd ? ` - $${rule.maxUsd.toLocaleString()}` : '+'}: {rule.percentage}%
                    {index < activeScale.rules.length - 1 && ' • '}
                  </span>
                ))}
              </div>
            </div>
          )}

          {scales.length > 0 ? (
            <div className="space-y-3">
              {scales.map((scale) => (
                <div 
                  key={scale._id}
                  className="p-4 rounded-lg border"
                  style={{ 
                    background: 'var(--surface-muted)', 
                    borderColor: 'var(--border)' 
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {scale.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {scale.isActive && (
                          <span className="px-2 py-1 text-xs rounded-full" style={{
                            background: 'var(--ot-green-100)',
                            color: 'var(--ot-green-700)'
                          }}>
                            Activa
                          </span>
                        )}
                        {scale.isDefault && (
                          <span className="px-2 py-1 text-xs rounded-full" style={{
                            background: 'var(--ot-blue-100)',
                            color: 'var(--ot-blue-700)'
                          }}>
                            Por Defecto
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!scale.isActive && (
                        <Button
                          onClick={() => handleActivateScale(scale)}
                          variant="success"
                          className="px-3 py-1 text-sm"
                        >
                          Activar
                        </Button>
                      )}
                      <Button
                        onClick={() => openScaleModal(scale)}
                        variant="neutral"
                        className="p-2"
                      >
                        <Edit3 size={16} />
                      </Button>
                      {!scale.isActive && (
                        <Button
                          onClick={() => setDeleteConfirm({ show: true, type: 'scale', item: scale })}
                          variant="danger"
                          className="p-2"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    {scale.rules.map((rule, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded" style={{ background: 'var(--background)' }}>
                        <span style={{ color: 'var(--text-primary)' }}>
                          ${rule.minUsd.toLocaleString()}{rule.maxUsd ? ` - $${rule.maxUsd.toLocaleString()}` : '+'}
                        </span>
                        <span className="font-medium" style={{ color: 'var(--ot-blue-600)' }}>
                          {rule.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {scale.description && (
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      {scale.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
              <p>No hay escalas de comisión configuradas</p>
              <p className="text-xs">Crea la primera escala de comisión</p>
            </div>
          )}
        </div>
      </Card>

      {/* Comisiones Internas */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Users size={20} style={{ color: 'var(--ot-blue-500)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Comisiones Internas
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <Button 
                onClick={() => setShowInternalCalculatorModal(true)} 
                variant="neutral" 
                className="flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Calculator size={16} />
                Calculadora
              </Button>
              <Button onClick={() => setShowInternalModal(true)} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Edit3 size={16} />
                Configurar
              </Button>
            </div>
          </div>

          {internalCommissions ? (
            <div className="space-y-6">
              {/* Sales Closer */}
              <div className="p-4 rounded-lg border" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <Target size={18} style={{ color: 'var(--ot-green-600)' }} />
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Sales Closer
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Comisión:</span>
                    <div className="font-semibold" style={{ color: 'var(--ot-green-600)' }}>
                      {internalCommissions.salesCloserPercent}%
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Meses aplicables:</span>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {internalCommissions.salesCloserMonths} meses
                    </div>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Solo aplica por los meses configurados.
                </p>
              </div>

              {/* Trafficker */}
              <div className="p-4 rounded-lg border" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 size={18} style={{ color: 'var(--ot-blue-600)' }} />
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Trafficker
                  </h3>
                </div>
                <div className="text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Comisión:</span>
                  <div className="font-semibold" style={{ color: 'var(--ot-blue-600)' }}>
                    {internalCommissions.traffickerPercent}%
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Sobre suscripciones netas atribuibles a tráfico.
                </p>
              </div>

              {/* Chatters */}
              <div className="p-4 rounded-lg border" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <Users size={18} style={{ color: 'var(--ot-purple-600)' }} />
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Chatters
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Comisión mínima:</span>
                    <div className="font-semibold" style={{ color: 'var(--ot-purple-600)' }}>
                      {internalCommissions.chattersMinPercent}%
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Comisión máxima:</span>
                    <div className="font-semibold" style={{ color: 'var(--ot-purple-600)' }}>
                      {internalCommissions.chattersMaxPercent}%
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Escala por cumplimiento de meta:
                  </h4>
                  <div className="space-y-2">
                    {internalCommissions.chattersPerformanceScale.map((scale, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded text-xs" style={{ background: 'var(--background)' }}>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {scale.fromPercent}%{scale.toPercent ? ` - ${scale.toPercent}%` : ' - ∞'}
                        </span>
                        <span className="font-medium" style={{ color: 'var(--ot-purple-600)' }}>
                          {scale.commissionPercent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Escala según cumplimiento de meta del grupo.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p>Configuración de comisiones internas no encontrada</p>
              <p className="text-xs">Haz clic en &quot;Configurar&quot; para establecer las comisiones</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal Procesador de Pago */}
      <Modal
        isOpen={showProcessorModal}
        onClose={() => setShowProcessorModal(false)}
        title={editingProcessor ? 'Editar Procesador' : 'Nuevo Procesador'}
        icon={<CreditCard size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      >
        <form onSubmit={handleProcessorSubmit} className="p-6 space-y-4">
          <Input
            label="Nombre del procesador"
            value={processorForm.name}
            onChange={(e) => setProcessorForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="PayPal, Stripe, Bancolombia..."
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Tipo de comisión
            </label>
            <div className="space-y-2">
              {[
                { value: 'PERCENTAGE', label: 'Porcentaje (%)', icon: <Percent size={16} /> },
                { value: 'FIXED_USD', label: 'Fijo en USD ($)', icon: <DollarSign size={16} /> },
                { value: 'FIXED_COP', label: 'Fijo en COP ($)', icon: <DollarSign size={16} /> },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="commissionType"
                    value={option.value}
                    checked={processorForm.commissionType === option.value}
                    onChange={(e) => setProcessorForm(prev => ({ ...prev, commissionType: e.target.value as CommissionType }))}
                    className="text-blue-600"
                  />
                  <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {option.icon}
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Input
            label={
              processorForm.commissionType === 'PERCENTAGE' 
                ? 'Porcentaje de comisión' 
                : `Monto fijo (${processorForm.commissionType === 'FIXED_USD' ? 'USD' : 'COP'})`
            }
            type="number"
            step={processorForm.commissionType === 'PERCENTAGE' ? '0.01' : '1'}
            min="0"
            max={processorForm.commissionType === 'PERCENTAGE' ? '100' : undefined}
            value={processorForm.commissionValue.toString()}
            onChange={(e) => setProcessorForm(prev => ({ ...prev, commissionValue: parseFloat(e.target.value) || 0 }))}
            required
          />

          <Input
            label="Fecha efectiva"
            type="date"
            value={processorForm.effectiveDate}
            onChange={(e) => setProcessorForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
            required
          />

          <Input
            label="Descripción (opcional)"
            value={processorForm.description || ''}
            onChange={(e) => setProcessorForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Notas adicionales sobre el procesador"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={processorForm.isActive}
              onChange={(e) => setProcessorForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Procesador activo
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowProcessorModal(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-4 py-2"
            >
              {submitting ? 'Guardando...' : editingProcessor ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Escala de Comisión */}
      <Modal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
        title={editingScale ? 'Editar Escala' : 'Nueva Escala'}
        icon={<TrendingUp size={20} style={{ color: 'var(--ot-blue-500)' }} />}
        maxWidth="4xl"
      >
        <form onSubmit={handleScaleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre de la escala"
              value={scaleForm.name}
              onChange={(e) => setScaleForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Default, Premium, VIP..."
              required
            />

            <Input
              label="Descripción (opcional)"
              value={scaleForm.description || ''}
              onChange={(e) => setScaleForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción de la escala"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={scaleForm.isActive}
                onChange={(e) => setScaleForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Activar esta escala
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={scaleForm.isDefault}
                onChange={(e) => setScaleForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Marcar como predeterminada
              </span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Reglas de Comisión
              </h3>
              <Button
                type="button"
                onClick={addRule}
                variant="neutral"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Añadir Regla
              </Button>
            </div>

            <div className="space-y-3">
              {scaleForm.rules.map((rule, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Min USD"
                      type="number"
                      min="0"
                      value={rule.minUsd.toString()}
                      onChange={(e) => updateRule(index, 'minUsd', parseInt(e.target.value) || 0)}
                      required
                    />
                    <Input
                      label="Max USD (opcional)"
                      type="number"
                      min="0"
                      value={rule.maxUsd?.toString() || ''}
                      onChange={(e) => updateRule(index, 'maxUsd', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Dejar vacío para 'y más'"
                    />
                    <Input
                      label="% Comisión"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={rule.percentage.toString()}
                      onChange={(e) => updateRule(index, 'percentage', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  {scaleForm.rules.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeRule(index)}
                      variant="danger"
                      className="p-2"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowScaleModal(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-4 py-2"
            >
              {submitting ? 'Guardando...' : editingScale ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title={`Eliminar ${deleteConfirm.type === 'processor' ? 'Procesador' : 'Escala'}`}
        description={
          deleteConfirm.item ? (
            <div>
              <p>¿Estás seguro de que deseas eliminar <strong>{deleteConfirm.item.name}</strong>?</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
          ) : null
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        severity="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, type: 'processor', item: null })}
      />

      {/* Modal Comisiones Internas */}
      <Modal
        isOpen={showInternalModal}
        onClose={() => setShowInternalModal(false)}
        title="Configurar Comisiones Internas"
        icon={<Users size={20} style={{ color: 'var(--ot-blue-500)' }} />}
        maxWidth="4xl"
      >
        <form onSubmit={handleInternalCommissionsSubmit} className="p-6 space-y-6">
          {/* Sales Closer */}
          <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Target size={18} style={{ color: 'var(--ot-green-600)' }} />
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Sales Closer
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Comisión (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={internalForm.salesCloserPercent?.toString() || ''}
                onChange={(e) => setInternalForm(prev => ({ ...prev, salesCloserPercent: parseFloat(e.target.value) || 0 }))}
                required
              />
              <Input
                label="Meses aplicables"
                type="number"
                min="1"
                max="12"
                value={internalForm.salesCloserMonths?.toString() || ''}
                onChange={(e) => setInternalForm(prev => ({ ...prev, salesCloserMonths: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Solo aplica por los meses configurados.
            </p>
          </div>

          {/* Trafficker */}
          <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 size={18} style={{ color: 'var(--ot-blue-600)' }} />
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Trafficker
              </h3>
            </div>
            <Input
              label="Comisión (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={internalForm.traffickerPercent?.toString() || ''}
              onChange={(e) => setInternalForm(prev => ({ ...prev, traffickerPercent: parseFloat(e.target.value) || 0 }))}
              required
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Sobre suscripciones netas atribuibles a tráfico.
            </p>
          </div>

          {/* Chatters */}
          <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Users size={18} style={{ color: 'var(--ot-purple-600)' }} />
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Chatters
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Comisión mínima (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={internalForm.chattersMinPercent?.toString() || ''}
                onChange={(e) => setInternalForm(prev => ({ ...prev, chattersMinPercent: parseFloat(e.target.value) || 0 }))}
                required
              />
              <Input
                label="Comisión máxima (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={internalForm.chattersMaxPercent?.toString() || ''}
                onChange={(e) => setInternalForm(prev => ({ ...prev, chattersMaxPercent: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Escala por cumplimiento de meta
                </h4>
                <Button
                  type="button"
                  onClick={addPerformanceScale}
                  variant="neutral"
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Añadir tramo
                </Button>
              </div>

              <div className="space-y-3">
                {internalForm.chattersPerformanceScale?.map((scale, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        label="Desde %"
                        type="number"
                        min="0"
                        max="1000"
                        step="0.01"
                        value={scale.fromPercent.toString()}
                        onChange={(e) => updatePerformanceScale(index, 'fromPercent', parseFloat(e.target.value) || 0)}
                        required
                      />
                      <Input
                        label="Hasta % (opcional)"
                        type="number"
                        min="0"
                        max="1000"
                        step="0.01"
                        value={scale.toPercent?.toString() || ''}
                        onChange={(e) => updatePerformanceScale(index, 'toPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="Dejar vacío para '∞'"
                      />
                      <Input
                        label="Pct comisión (%)"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={scale.commissionPercent.toString()}
                        onChange={(e) => updatePerformanceScale(index, 'commissionPercent', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    {internalForm.chattersPerformanceScale!.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePerformanceScale(index)}
                        variant="danger"
                        className="p-2"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Escala según cumplimiento de meta del grupo.
            </p>
          </div>

          <Input
            label="Descripción (opcional)"
            value={internalForm.description || ''}
            onChange={(e) => setInternalForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción de la configuración"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowInternalModal(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-4 py-2"
            >
              {submitting ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Calculadora Comisiones Internas */}
      <Modal
        isOpen={showInternalCalculatorModal}
        onClose={() => setShowInternalCalculatorModal(false)}
        title="Calculadora de Comisiones Internas"
        icon={<Calculator size={20} style={{ color: 'var(--ot-blue-500)' }} />}
        maxWidth="3xl"
      >
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Monto suscripción ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="1000.00"
              value={internalCalculatorForm.subscriptionAmount}
              onChange={(e) => setInternalCalculatorForm(prev => ({ ...prev, subscriptionAmount: e.target.value }))}
            />
            <Input
              label="Meses activos"
              type="number"
              min="1"
              placeholder="12"
              value={internalCalculatorForm.monthsActive}
              onChange={(e) => setInternalCalculatorForm(prev => ({ ...prev, monthsActive: e.target.value }))}
            />
            <Input
              label="Suscripción neta atribuible ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="800.00"
              value={internalCalculatorForm.netSubscriptionAmount}
              onChange={(e) => setInternalCalculatorForm(prev => ({ ...prev, netSubscriptionAmount: e.target.value }))}
            />
            <Input
              label="% Cumplimiento meta"
              type="number"
              step="0.01"
              min="0"
              placeholder="85.5"
              value={internalCalculatorForm.goalCompletionPercent}
              onChange={(e) => setInternalCalculatorForm(prev => ({ ...prev, goalCompletionPercent: e.target.value }))}
            />
            <Input
              label="Monto base chatters ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="500.00"
              value={internalCalculatorForm.baseAmountForChatters}
              onChange={(e) => setInternalCalculatorForm(prev => ({ ...prev, baseAmountForChatters: e.target.value }))}
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleInternalCalculate}
              disabled={!internalCalculatorForm.subscriptionAmount || !internalCalculatorForm.monthsActive}
              className="flex items-center gap-2"
            >
              <Calculator size={16} />
              Calcular Comisiones
            </Button>
          </div>

          {internalCalculatorForm.result && (
            <div className="space-y-4">
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Resultados del Cálculo
              </h3>
              
              {/* Sales Closer */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--ot-green-50)', borderColor: 'var(--ot-green-200)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} style={{ color: 'var(--ot-green-600)' }} />
                  <span className="font-medium" style={{ color: 'var(--ot-green-800)' }}>
                    Sales Closer
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: 'var(--ot-green-700)' }}>Comisión:</span>
                    <div className="font-semibold">${internalCalculatorForm.result.salesCloser.commissionAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ot-green-700)' }}>Meses aplicables:</span>
                    <div className="font-semibold">{internalCalculatorForm.result.salesCloser.applicableMonths}</div>
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--ot-green-600)' }}>
                  {internalCalculatorForm.result.salesCloser.note}
                </p>
              </div>

              {/* Trafficker */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--ot-blue-50)', borderColor: 'var(--ot-blue-200)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} style={{ color: 'var(--ot-blue-600)' }} />
                  <span className="font-medium" style={{ color: 'var(--ot-blue-800)' }}>
                    Trafficker
                  </span>
                </div>
                <div className="text-sm">
                  <span style={{ color: 'var(--ot-blue-700)' }}>Comisión:</span>
                  <div className="font-semibold">${internalCalculatorForm.result.trafficker.commissionAmount.toFixed(2)}</div>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--ot-blue-600)' }}>
                  {internalCalculatorForm.result.trafficker.note}
                </p>
              </div>

              {/* Chatters */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--ot-purple-50)', borderColor: 'var(--ot-purple-200)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} style={{ color: 'var(--ot-purple-600)' }} />
                  <span className="font-medium" style={{ color: 'var(--ot-purple-800)' }}>
                    Chatters
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: 'var(--ot-purple-700)' }}>Comisión:</span>
                    <div className="font-semibold">${internalCalculatorForm.result.chatters.commissionAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ot-purple-700)' }}>% Aplicado:</span>
                    <div className="font-semibold">{internalCalculatorForm.result.chatters.commissionPercent}%</div>
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--ot-purple-600)' }}>
                  {internalCalculatorForm.result.chatters.note}
                </p>
              </div>

              {/* Resumen */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}>
                <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Resumen Total
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Sales Closer:</span>
                    <div className="font-semibold" style={{ color: 'var(--ot-green-600)' }}>
                      ${internalCalculatorForm.result.summary.breakdown.salesCloser.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Trafficker:</span>
                    <div className="font-semibold" style={{ color: 'var(--ot-blue-600)' }}>
                      ${internalCalculatorForm.result.summary.breakdown.trafficker.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Chatters:</span>
                    <div className="font-semibold" style={{ color: 'var(--ot-purple-600)' }}>
                      ${internalCalculatorForm.result.summary.breakdown.chatters.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total:</span>
                    <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      ${internalCalculatorForm.result.summary.totalCommission.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
