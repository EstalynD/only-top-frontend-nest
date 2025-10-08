"use client";
import React, { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  Target,
  Users,
  DollarSign,
  Calendar,
  Bell,
  BellOff,
  Save,
  TrendingUp,
  Pencil,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import type {
  RecruitmentGoal,
  CreateGoalDto,
  UpdateGoalDto,
} from '@/lib/service-recruitment/goals-api';
import type { SalesCloser } from '@/lib/service-recruitment/types';

interface GoalModalProps {
  goal: RecruitmentGoal | null;
  salesClosers: SalesCloser[];
  onSave: (data: CreateGoalDto | UpdateGoalDto) => void;
  onClose: () => void;
}

type GoalFormState = {
  salesCloserId: string;
  titulo: string;
  descripcion: string;
  tipo: 'MODELOS_CERRADAS' | 'FACTURACION';
  valorObjetivo: number;
  moneda: string;
  periodo: 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL' | 'PERSONALIZADO';
  fechaInicio: string;
  fechaFin: string;
  notificacionesActivas: boolean;
  umbralNotificaciones: number[];
  estado: 'ACTIVA' | 'COMPLETADA' | 'CANCELADA' | 'VENCIDA';
};

const TIPO_OPTIONS = [
  { value: 'MODELOS_CERRADAS', label: 'Modelos Cerradas', icon: Users },
  { value: 'FACTURACION', label: 'Facturación', icon: DollarSign },
] as const;

const PERIODO_OPTIONS = [
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'TRIMESTRAL', label: 'Trimestral' },
  { value: 'ANUAL', label: 'Anual' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
] as const;

const ESTADO_OPTIONS = [
  { value: 'ACTIVA', label: 'Activa' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'VENCIDA', label: 'Vencida' },
] as const;

export default function GoalModal({ goal, salesClosers, onSave, onClose }: GoalModalProps) {
  const isEditing = Boolean(goal);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const resolvedSalesCloserId =
    goal && typeof goal.salesCloserId !== 'string'
      ? goal.salesCloserId._id
      : (goal?.salesCloserId as string | undefined) ?? '';

  const [formData, setFormData] = useState<GoalFormState>({
    salesCloserId: resolvedSalesCloserId,
    titulo: goal?.titulo || '',
    descripcion: goal?.descripcion || '',
    tipo: goal?.tipo || 'MODELOS_CERRADAS',
    valorObjetivo: goal?.valorObjetivo || 1,
    moneda: goal?.moneda || 'USD',
    periodo: goal?.periodo || 'MENSUAL',
    fechaInicio: goal?.fechaInicio ? goal.fechaInicio.split('T')[0] : new Date().toISOString().split('T')[0],
    fechaFin: goal?.fechaFin ? goal.fechaFin.split('T')[0] : '',
    notificacionesActivas: goal?.notificacionesActivas ?? true,
    umbralNotificaciones: goal?.umbralNotificaciones?.length
      ? [...goal.umbralNotificaciones]
      : [25, 50, 75, 90, 100],
    estado: goal?.estado || 'ACTIVA',
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const dataToSend: Record<string, unknown> = { ...formData };

    if (isEditing) {
      delete dataToSend.salesCloserId;
      delete dataToSend.tipo;
      delete dataToSend.periodo;
    } else {
      delete dataToSend.estado;
    }

    onSave(dataToSend as CreateGoalDto | UpdateGoalDto);
  };

  const sectionStyle: CSSProperties = {
    background: 'var(--surface)',
    borderColor: 'var(--border)',
    boxShadow: 'var(--shadow)',
  };

  const inputStyle: CSSProperties = {
    background: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
  };

  const mutedTextStyle: CSSProperties = {
    color: 'var(--text-muted)',
  };

  const titleBlueStyle: CSSProperties = {
    color: isDark ? '#60a5fa' : 'var(--ot-blue-600)',
  };

  const titlePurpleStyle: CSSProperties = {
    color: isDark ? '#c084fc' : 'var(--ot-purple-600)',
  };

  const titleGreenStyle: CSSProperties = {
    color: isDark ? '#34d399' : 'var(--ot-green-600)',
  };

  const baseToggleStyle: CSSProperties = {
    borderColor: 'var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    boxShadow: 'none',
  };

  const highlightPalette = useMemo(
    () => ({
      purple: {
        background: isDark ? 'rgba(139, 92, 246, 0.2)' : 'var(--ot-purple-50)',
        border: isDark ? 'rgba(168, 85, 247, 0.7)' : 'var(--ot-purple-500)',
        text: isDark ? '#ede9fe' : 'var(--ot-purple-700)',
        glow: isDark ? '0 0 0 1px rgba(139, 92, 246, 0.3)' : '0 0 0 1px rgba(139, 92, 246, 0.12)',
      },
      blue: {
        background: isDark ? 'rgba(59, 130, 246, 0.22)' : 'var(--ot-blue-50)',
        border: isDark ? 'rgba(59, 130, 246, 0.65)' : 'var(--ot-blue-500)',
        text: isDark ? '#e0f2fe' : 'var(--ot-blue-700)',
        glow: isDark ? '0 0 0 1px rgba(59, 130, 246, 0.28)' : '0 0 0 1px rgba(59, 130, 246, 0.12)',
      },
      green: {
        background: isDark ? 'rgba(16, 185, 129, 0.2)' : 'var(--ot-green-50)',
        border: isDark ? 'rgba(16, 185, 129, 0.6)' : 'var(--ot-green-500)',
        text: isDark ? '#d1fae5' : 'var(--ot-green-700)',
        glow: isDark ? '0 0 0 1px rgba(16, 185, 129, 0.22)' : '0 0 0 1px rgba(16, 185, 129, 0.1)',
      },
    }),
    [isDark],
  );

  const headerIcon = useMemo(
    () => (
      <div
        className="p-2 rounded-lg"
        style={{ background: 'var(--ot-purple-100)', color: 'var(--ot-purple-600)' }}
      >
        {isEditing ? <Pencil size={20} /> : <Target size={20} />}
      </div>
    ),
    [isEditing],
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Editar Meta' : 'Nueva Meta'}
      icon={headerIcon}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información Básica */}
        <section className="rounded-xl border p-6 space-y-4" style={sectionStyle}>
          <h3
            className="text-lg font-semibold flex items-center gap-2"
            style={titleBlueStyle}
          >
            <Calendar size={20} />
            Información Básica
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sales Closer (solo al crear) */}
            {!isEditing && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Sales Closer *
                </label>
                <select
                  required
                  value={formData.salesCloserId}
                  onChange={(e) => setFormData({ ...formData, salesCloserId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                >
                  <option value="">Selecciona un Sales Closer</option>
                  {salesClosers.map((sc) => (
                    <option key={sc._id} value={sc._id}>
                      {sc.nombre} {sc.apellido} - {sc.correoElectronico}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Título de la Meta *
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Cerrar 5 modelos este mes"
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={inputStyle}
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional de la meta..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* Configuración de Meta */}
        <section className="rounded-xl border p-6 space-y-4" style={sectionStyle}>
          <h3 className="text-lg font-semibold flex items-center gap-2" style={titlePurpleStyle}>
            <TrendingUp size={20} />
            Configuración de Meta
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo (solo al crear) */}
            {!isEditing && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tipo de Meta *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TIPO_OPTIONS.map((tipo) => {
                    const Icon = tipo.icon;
                    const isSelected = formData.tipo === tipo.value;
                    return (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo: tipo.value })}
                        className="flex items-center gap-3 p-4 rounded-lg border-2 transition-all"
                        style={{
                          ...baseToggleStyle,
                          ...(isSelected
                            ? {
                                borderColor: highlightPalette.purple.border,
                                background: highlightPalette.purple.background,
                                color: highlightPalette.purple.text,
                                boxShadow: highlightPalette.purple.glow,
                              }
                            : undefined),
                        }}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{tipo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Valor Objetivo */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Target size={16} />
                Valor Objetivo *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.valorObjetivo}
                onChange={(e) => setFormData({ ...formData, valorObjetivo: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={mutedTextStyle}>
                {formData.tipo === 'MODELOS_CERRADAS' ? 'Número de modelos' : 'Monto de facturación'}
              </p>
            </div>

            {/* Moneda (solo para FACTURACION) */}
            {formData.tipo === 'FACTURACION' && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <DollarSign size={16} />
                  Moneda
                </label>
                <select
                  value={formData.moneda}
                  onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={inputStyle}
                >
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                </select>
              </div>
            )}

            {/* Periodo (solo al crear) */}
            {!isEditing && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Periodo *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {PERIODO_OPTIONS.map((periodo) => {
                    const isSelected = formData.periodo === periodo.value;
                    return (
                      <button
                        key={periodo.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, periodo: periodo.value })}
                        className="px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm"
                        style={{
                          ...baseToggleStyle,
                          ...(isSelected
                            ? {
                                borderColor: highlightPalette.purple.border,
                                background: highlightPalette.purple.background,
                                color: highlightPalette.purple.text,
                                boxShadow: highlightPalette.purple.glow,
                              }
                            : undefined),
                        }}
                      >
                        {periodo.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fechas */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Calendar size={16} />
                Fecha Inicio *
              </label>
              <input
                type="date"
                required
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Calendar size={16} />
                Fecha Fin *
              </label>
              <input
                type="date"
                required
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                min={formData.fechaInicio}
                className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={inputStyle}
              />
            </div>

            {/* Estado (solo al editar) */}
            {isEditing && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Estado de la Meta
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ESTADO_OPTIONS.map((estado) => {
                    const isSelected = formData.estado === estado.value;
                    return (
                      <button
                        key={estado.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, estado: estado.value })}
                        className="px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm"
                        style={{
                          ...baseToggleStyle,
                          ...(isSelected
                            ? {
                                borderColor: highlightPalette.blue.border,
                                background: highlightPalette.blue.background,
                                color: highlightPalette.blue.text,
                                boxShadow: highlightPalette.blue.glow,
                              }
                            : undefined),
                        }}
                      >
                        {estado.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Notificaciones */}
        <section className="rounded-xl border p-6 space-y-4" style={sectionStyle}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={titleGreenStyle}>
              {formData.notificacionesActivas ? <Bell size={20} /> : <BellOff size={20} />}
              Notificaciones Automáticas
            </h3>
            <button
              type="button"
              onClick={() => setFormData({ 
                ...formData, 
                notificacionesActivas: !formData.notificacionesActivas 
              })}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all border"
              style={{
                ...baseToggleStyle,
                ...(formData.notificacionesActivas
                  ? {
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.95))'
                        : 'linear-gradient(135deg, var(--ot-green-500), var(--ot-green-600))',
                      borderColor: highlightPalette.green.border,
                      color: '#ffffff',
                      boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)',
                    }
                  : {
                      color: isDark ? 'var(--text-primary)' : 'var(--text-muted)',
                    }),
              }}
            >
              {formData.notificacionesActivas ? 'Activadas' : 'Desactivadas'}
            </button>
          </div>

          {formData.notificacionesActivas && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Umbrales de Notificación (%)
              </label>
              <div className="flex flex-wrap gap-2">
                {[25, 50, 75, 90, 100].map((umbral) => {
                  const isActive = formData.umbralNotificaciones.includes(umbral);
                  return (
                    <button
                      key={umbral}
                      type="button"
                      onClick={() => {
                        const current = formData.umbralNotificaciones;
                        setFormData({
                          ...formData,
                          umbralNotificaciones: isActive
                            ? current.filter((u: number) => u !== umbral)
                            : [...current, umbral].sort((a, b) => a - b),
                        });
                      }}
                      className="px-4 py-2 rounded-lg border-2 transition-all font-medium"
                      style={{
                        ...baseToggleStyle,
                        ...(isActive
                          ? {
                              borderColor: highlightPalette.green.border,
                              background: highlightPalette.green.background,
                              color: highlightPalette.green.text,
                              boxShadow: highlightPalette.green.glow,
                            }
                          : undefined),
                      }}
                    >
                      {umbral}%
                    </button>
                  );
                })}
              </div>
              <p className="text-xs mt-2" style={mutedTextStyle}>
                Recibirás notificaciones por email al alcanzar estos porcentajes de progreso
              </p>
            </div>
          )}
        </section>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--text-muted)',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))',
              color: 'white',
            }}
          >
            <Save size={18} />
            {goal ? 'Actualizar Meta' : 'Crear Meta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
