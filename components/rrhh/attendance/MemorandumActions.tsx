"use client";

import React from 'react';
import { FileText, AlertCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { 
  generateMemorandum, 
  getMemorandumTypeLabel, 
  getMemorandumTypeColor,
  type MemorandumType 
} from '@/lib/service-rrhh/memorandum.api';
import type { AttendanceSummary } from '@/lib/service-rrhh/attendance.api';

interface MemorandumActionsProps {
  userId: string;
  summary: AttendanceSummary;
  onSuccess?: () => void;
}

export function MemorandumActions({ userId, summary, onSuccess }: MemorandumActionsProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<MemorandumType | null>(null);

  // Determine which memorandum types are applicable
  const applicableTypes: MemorandumType[] = React.useMemo(() => {
    const types: MemorandumType[] = [];
    
    // Ausencia: no check-in registered
    if (!summary.checkIn) {
      types.push('AUSENCIA');
    }
    
    // Llegada tarde: is late
    if (summary.isLate && summary.checkIn) {
      types.push('LLEGADA_TARDE');
    }
    
    // Salida anticipada: checked out before expected end time
    if (summary.checkOut && summary.expectedHours) {
      const checkInTime = summary.checkIn ? new Date(summary.checkIn).getTime() : 0;
      const checkOutTime = new Date(summary.checkOut).getTime();
      const workedMillis = checkOutTime - checkInTime;
      const workedHours = workedMillis / (1000 * 60 * 60);
      
      // If worked less than expected hours (with some tolerance), it's early departure
      if (workedHours < (summary.expectedHours - 0.5)) {
        types.push('SALIDA_ANTICIPADA');
      }
    }
    
    return types;
  }, [summary]);

  const handleGenerateMemorandum = async (type: MemorandumType) => {
    if (!token) return;

    setLoading(true);
    try {
      await generateMemorandum(token, {
        type,
        userId,
        date: summary.date
      });

      toast({
        type: 'success',
        title: 'Memorando generado',
        description: `El memorando de ${getMemorandumTypeLabel(type)} ha sido generado y descargado.`
      });

      setShowConfirm(false);
      setSelectedType(null);
      onSuccess?.();
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al generar memorando',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (type: MemorandumType) => {
    setSelectedType(type);
    setShowConfirm(true);
  };

  if (applicableTypes.length === 0) {
    return null;
  }

  const getMemorandumIcon = (type: MemorandumType) => {
    switch (type) {
      case 'AUSENCIA':
        return XCircle;
      case 'LLEGADA_TARDE':
        return Clock;
      case 'SALIDA_ANTICIPADA':
        return AlertCircle;
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div style={{ 
          fontSize: '0.875rem', 
          fontWeight: 500,
          color: 'var(--ot-gray-700)',
          marginBottom: '0.5rem'
        }}>
          <FileText size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Generar Memorando
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {applicableTypes.map(type => {
            const Icon = getMemorandumIcon(type);
            return (
              <button
                key={type}
                onClick={() => openConfirmModal(type)}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: getMemorandumTypeColor(type),
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Icon size={16} />
                {getMemorandumTypeLabel(type)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedType(null);
        }}
        title="Confirmar Generación de Memorando"
        icon={<FileText size={20} style={{ color: 'var(--ot-orange-600)' }} />}
      >
        <div style={{ padding: '1rem 0' }}>
          {selectedType && (
            <>
              <p style={{ marginBottom: '1rem', color: 'var(--ot-gray-700)' }}>
                ¿Estás seguro de que deseas generar un memorando de{' '}
                <strong>{getMemorandumTypeLabel(selectedType)}</strong> para{' '}
                <strong>{summary.empleadoNombre || 'este empleado'}</strong>?
              </p>
              
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--ot-yellow-50)',
                borderLeft: '4px solid var(--ot-yellow-500)',
                borderRadius: '0.375rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--ot-gray-700)',
                  margin: 0
                }}>
                  <strong>Fecha:</strong> {new Date(summary.date).toLocaleDateString('es-PE')}<br />
                  {summary.checkIn && <><strong>Entrada:</strong> {new Date(summary.checkIn).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}<br /></>}
                  {summary.checkOut && <><strong>Salida:</strong> {new Date(summary.checkOut).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}<br /></>}
                  {summary.lateMinutes && summary.lateMinutes > 0 && <><strong>Minutos tarde:</strong> {summary.lateMinutes}<br /></>}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setSelectedType(null);
                  }}
                  disabled={loading}
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--ot-gray-700)',
                    backgroundColor: 'white',
                    border: '1px solid var(--ot-gray-300)',
                    borderRadius: '0.375rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleGenerateMemorandum(selectedType)}
                  disabled={loading}
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'white',
                    backgroundColor: 'var(--ot-blue-600)',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Generando...' : 'Generar Memorando'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
