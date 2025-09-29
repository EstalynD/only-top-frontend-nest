"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { 
  getCurrencies, 
  updateCurrency,
  getAvailableTimezones,
  getSelectedTimezone,
  updateTimezone,
  createTrm, 
  getCurrentTrm, 
  listTrm 
} from '@/lib/service-sistema/api';
import { formatCurrency, formatDate, normalizeEffectiveDate, validateTrmAmount } from '@/lib/service-sistema/helpers';
import type { CurrencyFormatSpec, Timezone, TrmEntry, DisplayFormat, CurrencyCode } from '@/lib/service-sistema/types';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Plus, 
  Calendar,
  Globe,
  History,
  Edit3,
  Check
} from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function ConfiguracionPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  // Estados
  const [currencies, setCurrencies] = React.useState<CurrencyFormatSpec[]>([]);
  const [availableTimezones, setAvailableTimezones] = React.useState<Timezone[]>([]);
  const [selectedTimezone, setSelectedTimezone] = React.useState<Timezone | null>(null);
  const [currentTrm, setCurrentTrm] = React.useState<TrmEntry | null>(null);
  const [trmHistory, setTrmHistory] = React.useState<TrmEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal estados
  const [showCurrencyModal, setShowCurrencyModal] = React.useState(false);
  const [editingCurrency, setEditingCurrency] = React.useState<CurrencyFormatSpec | null>(null);
  const [currencyForm, setCurrencyForm] = React.useState({
    displayFormat: 'CODE_SYMBOL' as DisplayFormat,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const [updatingCurrency, setUpdatingCurrency] = React.useState(false);
  const [updatingTimezone, setUpdatingTimezone] = React.useState(false);
  
  // Modal TRM
  const [showTrmModal, setShowTrmModal] = React.useState(false);
  const [trmForm, setTrmForm] = React.useState({
    effectiveAt: '',
    copPerUsd: '',
    note: ''
  });
  const [submitting, setSubmitting] = React.useState(false);

  // Cargar datos iniciales
  React.useEffect(() => {
    if (!token) return;
    
    const loadData = async () => {
      try {
        const [currenciesRes, availableTimezonesRes, selectedTimezoneRes, currentTrmRes, historyRes] = await Promise.all([
          getCurrencies(token),
          getAvailableTimezones(token),
          getSelectedTimezone(token),
          getCurrentTrm(token),
          listTrm(token, { limit: 10 })
        ]);
        
        setCurrencies(currenciesRes);
        setAvailableTimezones(availableTimezonesRes);
        setSelectedTimezone(selectedTimezoneRes);
        setCurrentTrm(currentTrmRes);
        setTrmHistory(historyRes);
      } catch (error) {
        toast({
          type: 'error',
          title: 'Error al cargar configuración',
          description: error instanceof Error ? error.message : 'Error desconocido'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, toast]);

  const handleEditCurrency = (currency: CurrencyFormatSpec) => {
    setEditingCurrency(currency);
    setCurrencyForm({
      displayFormat: currency.displayFormat,
      minimumFractionDigits: currency.minimumFractionDigits,
      maximumFractionDigits: currency.maximumFractionDigits,
    });
    setShowCurrencyModal(true);
  };

  const handleUpdateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingCurrency) return;

    setUpdatingCurrency(true);
    try {
      await updateCurrency(token, editingCurrency.code, currencyForm);
      
      // Recargar currencies
      const updatedCurrencies = await getCurrencies(token);
      setCurrencies(updatedCurrencies);
      
      toast({
        type: 'success',
        title: 'Moneda actualizada',
        description: `Configuración de ${editingCurrency.code} actualizada exitosamente`
      });
      
      setShowCurrencyModal(false);
      setEditingCurrency(null);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al actualizar moneda',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setUpdatingCurrency(false);
    }
  };

  const handleTimezoneChange = async (country: 'Colombia' | 'Peru') => {
    if (!token) return;

    setUpdatingTimezone(true);
    try {
      const updatedTimezone = await updateTimezone(token, { timezone: country });
      setSelectedTimezone(updatedTimezone);
      
      toast({
        type: 'success',
        title: 'Zona horaria actualizada',
        description: `Zona horaria cambiada a ${country}`
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al actualizar zona horaria',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setUpdatingTimezone(false);
    }
  };

  const handleCreateTrm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const copPerUsd = parseFloat(trmForm.copPerUsd);
    const validationError = validateTrmAmount(copPerUsd);
    if (validationError) {
      toast({ type: 'error', title: 'Error de validación', description: validationError });
      return;
    }

    if (!trmForm.effectiveAt) {
      toast({ type: 'error', title: 'Error de validación', description: 'La fecha de vigencia es requerida' });
      return;
    }

    setSubmitting(true);
    try {
      const effectiveAt = normalizeEffectiveDate(new Date(trmForm.effectiveAt));
      await createTrm(token, {
        effectiveAt,
        copPerUsd,
        meta: { note: trmForm.note || undefined, createdBy: 'admin' }
      });

      // Recargar datos
      const [newCurrent, newHistory] = await Promise.all([
        getCurrentTrm(token),
        listTrm(token, { limit: 10 })
      ]);
      
      setCurrentTrm(newCurrent);
      setTrmHistory(newHistory);
      
      const copSpec = currencies.find(c => c.code === 'COP') || { 
        code: 'COP' as CurrencyCode, 
        symbol: '$', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0, 
        displayFormat: 'CODE_SYMBOL' as DisplayFormat,
        isActive: true,
        sample: 'COP $100' 
      };
      
      toast({
        type: 'success',
        title: 'TRM creado',
        description: `TRM de ${formatCurrency(copPerUsd, copSpec)} creado exitosamente`
      });
      
      setShowTrmModal(false);
      setTrmForm({ effectiveAt: '', copPerUsd: '', note: '' });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al crear TRM',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openTrmModal = () => {
    // Inicializar con fecha de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setTrmForm({
      effectiveAt: today.toISOString().split('T')[0],
      copPerUsd: '',
      note: ''
    });
    setShowTrmModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" label="Cargando configuración del sistema..." />
      </div>
    );
  }

  const copSpec = currencies.find(c => c.code === 'COP');
  const usdSpec = currencies.find(c => c.code === 'USD');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Configuración del Sistema
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Gestiona las configuraciones globales del sistema: monedas, zonas horarias y TRM.
        </p>
      </div>

      {/* Monedas */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <DollarSign size={20} style={{ color: 'var(--ot-blue-500)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Monedas Soportadas
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currencies.map((currency) => (
              <div 
                key={currency.code}
                className="p-4 rounded-lg border"
                style={{ 
                  background: 'var(--surface-muted)', 
                  borderColor: 'var(--border)' 
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {currency.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-2 py-1 rounded" style={{ 
                      background: 'var(--ot-blue-100)', 
                      color: 'var(--ot-blue-700)' 
                    }}>
                      {currency.symbol}
                    </span>
                    <button
                      onClick={() => handleEditCurrency(currency)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      title="Editar configuración"
                    >
                      <Edit3 size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                  Ejemplo: {currency.sample}
                </p>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Decimales: {currency.minimumFractionDigits}-{currency.maximumFractionDigits}</span>
                  <span className="px-2 py-1 rounded text-xs" style={{
                    background: currency.displayFormat === 'CODE_SYMBOL' ? 'var(--ot-green-100)' : 'var(--ot-yellow-100)',
                    color: currency.displayFormat === 'CODE_SYMBOL' ? 'var(--ot-green-700)' : 'var(--ot-yellow-700)'
                  }}>
                    {currency.displayFormat === 'CODE_SYMBOL' ? 'Código + Símbolo' : 'Solo Símbolo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Zonas Horarias */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={20} style={{ color: 'var(--ot-blue-500)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Zona Horaria del Sistema
            </h2>
          </div>
          
          <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--ot-blue-50)', borderColor: 'var(--ot-blue-200)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Check size={16} style={{ color: 'var(--ot-blue-600)' }} />
              <span className="font-medium" style={{ color: 'var(--ot-blue-800)' }}>
                Zona horaria activa: {selectedTimezone?.country || 'Colombia'}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--ot-blue-700)' }}>
              {selectedTimezone ? `${selectedTimezone.code} (UTC ${selectedTimezone.utcOffset})` : 'COT (UTC -05:00)'}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Seleccionar zona horaria:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTimezones.map((tz) => (
                <button
                  key={tz.iana}
                  onClick={() => handleTimezoneChange(tz.country as 'Colombia' | 'Peru')}
                  disabled={updatingTimezone || selectedTimezone?.country === tz.country}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedTimezone?.country === tz.country
                      ? 'border-blue-500 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{ 
                    background: selectedTimezone?.country === tz.country 
                      ? 'var(--ot-blue-50)' 
                      : 'var(--surface-muted)',
                    borderColor: selectedTimezone?.country === tz.country 
                      ? 'var(--ot-blue-500)' 
                      : 'var(--border)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {tz.country}
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedTimezone?.country === tz.country && (
                        <Check size={16} style={{ color: 'var(--ot-blue-600)' }} />
                      )}
                      <span className="text-sm px-2 py-1 rounded" style={{ 
                        background: 'var(--ot-blue-100)', 
                        color: 'var(--ot-blue-700)' 
                      }}>
                        {tz.code}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    UTC {tz.utcOffset}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {tz.iana}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* TRM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TRM Actual */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp size={20} style={{ color: 'var(--ot-blue-500)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  TRM Actual
                </h2>
              </div>
              <Button onClick={openTrmModal} className="flex items-center gap-2">
                <Plus size={16} />
                Nuevo TRM
              </Button>
            </div>
            
            {currentTrm ? (
              <div className="space-y-3">
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--ot-blue-600)' }}>
                    {copSpec && formatCurrency(currentTrm.copPerUsd, copSpec)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    por 1 USD
                  </div>
                </div>
                <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    Vigente desde: {formatDate(currentTrm.effectiveAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    Actualizado: {formatDate(currentTrm.updatedAt)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                <p>No hay TRM configurado</p>
                <p className="text-xs">Crea el primer TRM para comenzar</p>
              </div>
            )}
          </div>
        </Card>

        {/* Historial TRM */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <History size={20} style={{ color: 'var(--ot-blue-500)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Historial TRM
              </h2>
            </div>
            
            {trmHistory.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {trmHistory.map((trm) => (
                  <div 
                    key={trm._id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ 
                      background: 'var(--surface-muted)', 
                      borderColor: 'var(--border)' 
                    }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {copSpec && formatCurrency(trm.copPerUsd, copSpec)}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(trm.effectiveAt)}
                      </div>
                    </div>
                    {trm.meta?.note && (
                      <div className="text-xs max-w-32 truncate" style={{ color: 'var(--text-muted)' }}>
                        {trm.meta.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <History size={32} className="mx-auto mb-2 opacity-50" />
                <p>Sin historial</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal Crear TRM */}
      <Modal
        isOpen={showTrmModal}
        onClose={() => setShowTrmModal(false)}
        title="Crear Nuevo TRM"
        icon={<Plus size={20} style={{ color: 'var(--ot-blue-500)' }} />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateTrm} className="p-6 space-y-4">
          <Input
            label="Fecha de vigencia"
            type="date"
            value={trmForm.effectiveAt}
            onChange={(e) => setTrmForm(prev => ({ ...prev, effectiveAt: e.target.value }))}
            required
          />
          
          <Input
            label="TRM (COP por USD)"
            type="number"
            step="0.01"
            min="1000"
            max="10000"
            placeholder="4100.00"
            value={trmForm.copPerUsd}
            onChange={(e) => setTrmForm(prev => ({ ...prev, copPerUsd: e.target.value }))}
            required
          />
          
          <Input
            label="Nota (opcional)"
            placeholder="Comentario sobre este TRM"
            value={trmForm.note}
            onChange={(e) => setTrmForm(prev => ({ ...prev, note: e.target.value }))}
          />
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowTrmModal(false)}
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
              {submitting ? 'Creando...' : 'Crear TRM'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Moneda */}
      <Modal
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title={`Editar ${editingCurrency?.code || 'Moneda'}`}
        icon={<Edit3 size={20} style={{ color: 'var(--ot-blue-500)' }} />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateCurrency} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Formato de visualización
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayFormat"
                  value="CODE_SYMBOL"
                  checked={currencyForm.displayFormat === 'CODE_SYMBOL'}
                  onChange={(e) => setCurrencyForm(prev => ({ ...prev, displayFormat: e.target.value as DisplayFormat }))}
                  className="text-blue-600"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Código + Símbolo (ej: {editingCurrency?.code} ${editingCurrency?.code === 'USD' ? '100.00' : '4100'})
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayFormat"
                  value="SYMBOL_ONLY"
                  checked={currencyForm.displayFormat === 'SYMBOL_ONLY'}
                  onChange={(e) => setCurrencyForm(prev => ({ ...prev, displayFormat: e.target.value as DisplayFormat }))}
                  className="text-blue-600"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Solo Símbolo (ej: ${editingCurrency?.code === 'USD' ? '100.00' : '4100'})
                </span>
              </label>
            </div>
          </div>
          
          <Input
            label="Decimales mínimos"
            type="number"
            min="0"
            max="4"
            value={currencyForm.minimumFractionDigits.toString()}
            onChange={(e) => setCurrencyForm(prev => ({ ...prev, minimumFractionDigits: parseInt(e.target.value) || 0 }))}
            required
          />
          
          <Input
            label="Decimales máximos"
            type="number"
            min="0"
            max="4"
            value={currencyForm.maximumFractionDigits.toString()}
            onChange={(e) => setCurrencyForm(prev => ({ ...prev, maximumFractionDigits: parseInt(e.target.value) || 0 }))}
            required
          />
          
          <div className="p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Vista previa:
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {currencyForm.displayFormat === 'CODE_SYMBOL' 
                ? `${editingCurrency?.code || 'XXX'} $${(editingCurrency?.code === 'USD' ? 100 : 4100).toLocaleString('en-US', { minimumFractionDigits: currencyForm.minimumFractionDigits, maximumFractionDigits: currencyForm.maximumFractionDigits })}`
                : `$${(editingCurrency?.code === 'USD' ? 100 : 4100).toLocaleString('en-US', { minimumFractionDigits: currencyForm.minimumFractionDigits, maximumFractionDigits: currencyForm.maximumFractionDigits })}`
              }
            </p>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowCurrencyModal(false)}
              disabled={updatingCurrency}
              className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={updatingCurrency}
              className="px-4 py-2"
            >
              {updatingCurrency ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
