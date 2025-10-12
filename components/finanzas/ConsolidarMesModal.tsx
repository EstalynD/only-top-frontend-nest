"use client";

import React, { useState, CSSProperties, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import { useTheme } from '@/lib/theme';
import { 
  Lock, 
  AlertTriangle,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface ConsolidarMesModalProps {
  periodo: string;
  totalGastos: string;
  categorias: number;
  gastos: number;
  onConfirm: (notasCierre?: string) => void;
  onClose: () => void;
}

export default function ConsolidarMesModal({ 
  periodo,
  totalGastos,
  categorias,
  gastos,
  onConfirm, 
  onClose 
}: ConsolidarMesModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [notasCierre, setNotasCierre] = useState('');

  const handleConfirm = () => {
    onConfirm(notasCierre || undefined);
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

  const headerIcon = useMemo(
    () => (
      <div
        className="p-2 rounded-lg"
        style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
      >
        <Lock size={20} />
      </div>
    ),
    [],
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Consolidar Costos del Mes"
      icon={headerIcon}
      maxWidth="2xl"
    >
      <div className="p-6 space-y-6">
        {/* Advertencia */}
        <section 
          className="rounded-xl border-2 p-6 space-y-3"
          style={{
            borderColor: '#ef4444',
            background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={32} color="#ef4444" />
            <div>
              <h3 className="text-lg font-bold" style={{ color: '#ef4444' }}>
                ⚠️ Acción Irreversible
              </h3>
              <p className="text-sm" style={mutedTextStyle}>
                Esta operación no se puede deshacer
              </p>
            </div>
          </div>

          <div className="space-y-2 pl-11">
            <p style={{ color: 'var(--text-primary)' }}>
              Al consolidar los costos fijos del periodo <strong>{periodo}</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm" style={mutedTextStyle}>
              <li>No se podrán registrar más gastos en este periodo</li>
              <li>No se podrán editar ni eliminar gastos existentes</li>
              <li>No se podrán crear ni eliminar categorías</li>
              <li>El total se restará automáticamente del bank_onlytop</li>
              <li>Se vinculará con el periodo consolidado si existe</li>
            </ul>
          </div>
        </section>

        {/* Resumen de Consolidación */}
        <section className="rounded-xl border p-6 space-y-4" style={sectionStyle}>
          <h3
            className="text-lg font-semibold flex items-center gap-2"
            style={titleBlueStyle}
          >
            <CheckCircle size={20} />
            Resumen de Consolidación
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border" style={{ 
              background: 'var(--surface-muted)',
              borderColor: 'var(--border)',
            }}>
              <p className="text-sm" style={mutedTextStyle}>
                Total de Gastos
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {totalGastos}
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{ 
              background: 'var(--surface-muted)',
              borderColor: 'var(--border)',
            }}>
              <p className="text-sm" style={mutedTextStyle}>
                Categorías
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {categorias}
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{ 
              background: 'var(--surface-muted)',
              borderColor: 'var(--border)',
            }}>
              <p className="text-sm" style={mutedTextStyle}>
                Gastos Registrados
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {gastos}
              </p>
            </div>
          </div>
        </section>

        {/* Notas de Cierre */}
        <section className="rounded-xl border p-6 space-y-4" style={sectionStyle}>
          <h3
            className="text-lg font-semibold flex items-center gap-2"
            style={titlePurpleStyle}
          >
            <FileText size={20} />
            Notas de Cierre (Opcional)
          </h3>

          <div>
            <textarea
              value={notasCierre}
              onChange={(e) => setNotasCierre(e.target.value)}
              placeholder="Agrega notas o comentarios sobre el cierre de este mes..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              style={inputStyle}
            />
            <p className="text-xs mt-1" style={mutedTextStyle}>
              Estas notas se guardarán como registro interno del periodo consolidado
            </p>
          </div>
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
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
            }}
          >
            <Lock size={18} />
            Consolidar Periodo
          </button>
        </div>
      </div>
    </Modal>
  );
}
