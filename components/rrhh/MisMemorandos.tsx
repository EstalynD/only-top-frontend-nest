"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import {
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { empleadoGetMemorandos } from '@/lib/service-rrhh/memorandum.api';
import type { Memorandum, MemorandumFilters } from '@/lib/service-rrhh/memorandum-types';
import {
  getMemorandumStatusLabel,
  getMemorandumStatusColor,
  getMemorandumTypeLabel,
  getMemorandumTypeIcon,
  canBeSubsaned,
  getDaysRemaining,
  formatDeadlineWarning
} from '@/lib/service-rrhh/memorandum-types';
import MemorandumDetailModal from './MemorandumDetailModal';

export default function MisMemorandos() {
  const { theme } = useTheme();
  const { token } = useAuth();

  const [memorandos, setMemorandos] = useState<Memorandum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MemorandumFilters>({});
  const [selectedMemorandum, setSelectedMemorandum] = useState<Memorandum | null>(null);

  useEffect(() => {
    cargarMemorandos();
  }, [filters]);

  const cargarMemorandos = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await empleadoGetMemorandos(token, filters);
      setMemorandos(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los memorandos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <AlertCircle className="w-5 h-5" />;
      case 'SUBSANADO':
      case 'EN_REVISIÓN':
        return <Clock className="w-5 h-5" />;
      case 'APROBADO':
        return <CheckCircle className="w-5 h-5" />;
      case 'RECHAZADO':
        return <XCircle className="w-5 h-5" />;
      case 'EXPIRADO':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusBgColor = (status: string) => {
    const color = getMemorandumStatusColor(status as any);
    const isDark = theme === 'dark';
    
    const colors: Record<string, string> = {
      'yellow': isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200',
      'blue': isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200',
      'purple': isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200',
      'green': isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200',
      'red': isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200',
      'orange': isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200',
      'gray': isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
    };
    
    return colors[color] || colors['gray'];
  };

  const getStatusTextColor = (status: string) => {
    const color = getMemorandumStatusColor(status as any);
    const isDark = theme === 'dark';
    
    const colors: Record<string, string> = {
      'yellow': isDark ? 'text-yellow-200' : 'text-yellow-800',
      'blue': isDark ? 'text-blue-200' : 'text-blue-800',
      'purple': isDark ? 'text-purple-200' : 'text-purple-800',
      'green': isDark ? 'text-green-200' : 'text-green-800',
      'red': isDark ? 'text-red-200' : 'text-red-800',
      'orange': isDark ? 'text-orange-200' : 'text-orange-800',
      'gray': isDark ? 'text-gray-300' : 'text-gray-600'
    };
    
    return colors[color] || colors['gray'];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filtros */}
      <div className="rounded-xl p-3 sm:p-4 border ot-theme-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 ot-theme-text-secondary">
              Estado
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ot-input"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="SUBSANADO">Subsanado</option>
              <option value="EN_REVISIÓN">En Revisión</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
              <option value="EXPIRADO">Expirado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 ot-theme-text-secondary">
              Tipo
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ot-input"
            >
              <option value="">Todos</option>
              <option value="LLEGADA_TARDE">Llegada Tarde</option>
              <option value="SALIDA_ANTICIPADA">Salida Anticipada</option>
              <option value="AUSENCIA">Ausencia</option>
              <option value="SALIDA_OMITIDA">Salida Omitida</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({})}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-colors text-xs sm:text-sm ot-input hover:opacity-80"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className={`rounded-xl p-3 sm:p-4 border ${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-800 text-red-200'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {/* Lista de Memorandos */}
      {memorandos.length === 0 ? (
        <div className="rounded-xl p-6 sm:p-8 border text-center ot-theme-card ot-theme-text-muted">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm sm:text-base">No tienes memorandos registrados</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {memorandos.map((memorandum) => {
            const canSubsane = canBeSubsaned(memorandum);
            const daysRemaining = getDaysRemaining(memorandum.subsanationDeadline);
            const isUrgent = daysRemaining <= 2 && memorandum.status === 'PENDIENTE';

            return (
              <div
                key={memorandum._id}
                onClick={() => setSelectedMemorandum(memorandum)}
                className={`rounded-xl p-3 sm:p-4 border cursor-pointer transition-all hover:shadow-lg ${
                  getStatusBgColor(memorandum.status)
                }`}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={`p-1.5 sm:p-2 rounded-lg ${getStatusTextColor(memorandum.status)} flex-shrink-0`}>
                      <div className="w-4 h-4 sm:w-5 sm:h-5">
                        {getStatusIcon(memorandum.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <span className="font-mono text-xs sm:text-sm font-semibold ot-theme-text">
                          {memorandum.memorandumCode}
                        </span>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${
                          getStatusBgColor(memorandum.status)
                        } ${getStatusTextColor(memorandum.status)}`}>
                          {getMemorandumStatusLabel(memorandum.status)}
                        </span>
                      </div>

                      {/* Type and Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-base sm:text-lg">
                            {getMemorandumTypeIcon(memorandum.type)}
                          </span>
                          <span className="text-xs sm:text-sm font-medium ot-theme-text-secondary">
                            {getMemorandumTypeLabel(memorandum.type)}
                          </span>
                        </div>
                        <span className="text-xs ot-theme-text-muted">
                          {new Date(memorandum.incidentDate).toLocaleDateString('es-CO')}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm mb-2 ot-theme-text-secondary">
                        {memorandum.description}
                      </p>

                      {/* Deadline Warning */}
                      {memorandum.status === 'PENDIENTE' && (
                        <div className={`flex items-center gap-1 sm:gap-2 text-xs ${
                          isUrgent
                            ? theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
                            : theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
                        }`}>
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="font-medium">
                            {formatDeadlineWarning(memorandum.subsanationDeadline)}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      {canSubsane && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMemorandum(memorandum);
                          }}
                          className={`mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            theme === 'dark'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          Subsanar Ahora
                        </button>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ot-theme-text-muted" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedMemorandum && (
        <MemorandumDetailModal
          memorandum={selectedMemorandum}
          isOpen={!!selectedMemorandum}
          onClose={() => setSelectedMemorandum(null)}
          onSuccess={cargarMemorandos}
        />
      )}
    </div>
  );
}
