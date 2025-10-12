"use client";
import React, { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { Download, FileSpreadsheet, Calendar, Users, User, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminExportarExcel, adminExportarIndividual, adminExportarEquipo, type ExportFilters } from '@/lib/service-rrhh/attendance.api';
import { useAuth } from '@/lib/auth';

interface ExportPanelProps {
  areas?: Array<{ _id: string; name: string; code: string }>;
  cargos?: Array<{ _id: string; name: string; code: string }>;
  empleados?: Array<{ _id: string; nombre: string; apellido: string; correoElectronico: string }>;
  onExport?: () => void;
}

export default function ExportPanel({ areas = [], cargos = [], empleados = [], onExport }: ExportPanelProps) {
  const { theme } = useTheme();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtros de exportación
  const [filters, setFilters] = useState<ExportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Último mes
    endDate: new Date().toISOString().split('T')[0], // Hoy
    areaId: '',
    cargoId: '',
    userId: '',
    status: '',
    hasJustification: undefined
  });

  const [exportType, setExportType] = useState<'general' | 'individual' | 'team'>('general');

  const handleExport = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      switch (exportType) {
        case 'general':
          await adminExportarExcel(token, filters);
          setSuccess('Reporte general exportado correctamente');
          break;
        case 'individual':
          if (!filters.userId) {
            setError('Debes seleccionar un empleado para exportar el reporte individual');
            return;
          }
          await adminExportarIndividual(token, filters.userId, filters.startDate, filters.endDate);
          setSuccess('Reporte individual exportado correctamente');
          break;
        case 'team':
          await adminExportarEquipo(token, filters.startDate, filters.endDate, filters.areaId, filters.cargoId);
          setSuccess('Reporte de equipo exportado correctamente');
          break;
      }

      onExport?.();
    } catch (err: any) {
      setError(err.message || 'Error al exportar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const getExportTypeLabel = (type: string) => {
    switch (type) {
      case 'general': return 'Reporte General';
      case 'individual': return 'Reporte Individual';
      case 'team': return 'Reporte de Equipo';
      default: return type;
    }
  };

  const getExportTypeDescription = (type: string) => {
    switch (type) {
      case 'general': return 'Todos los registros con filtros aplicados';
      case 'individual': return 'Resumen detallado de un empleado específico';
      case 'team': return 'Estadísticas por área o cargo';
      default: return '';
    }
  };

  const getPreviewCount = () => {
    // Esta sería una estimación basada en los filtros
    // En una implementación real, podrías hacer una llamada previa para obtener el conteo
    return '~';
  };

  return (
    <div className={`rounded-xl p-6 border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'
        }`}>
          <FileSpreadsheet className={`w-5 h-5 ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Exportar Reportes
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Generar reportes de asistencia en formato Excel
          </p>
        </div>
      </div>

      {/* Tipo de Exportación */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-3 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Tipo de Reporte
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['general', 'individual', 'team'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setExportType(type)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                exportType === type
                  ? theme === 'dark'
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-blue-500 bg-blue-50'
                  : theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className={`font-medium mb-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {getExportTypeLabel(type)}
              </div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {getExportTypeDescription(type)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className={`w-4 h-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`} />
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Filtros
          </span>
        </div>

        {/* Rango de fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Filtros específicos por tipo */}
        {exportType === 'individual' && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Empleado
            </label>
            <select
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Seleccionar empleado...</option>
              {empleados.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.nombre} {emp.apellido} - {emp.correoElectronico}
                </option>
              ))}
            </select>
          </div>
        )}

        {exportType === 'team' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Área (opcional)
              </label>
              <select
                value={filters.areaId}
                onChange={(e) => setFilters(prev => ({ ...prev, areaId: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Todas las áreas</option>
                {areas.map((area) => (
                  <option key={area._id} value={area._id}>
                    {area.name} ({area.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Cargo (opcional)
              </label>
              <select
                value={filters.cargoId}
                onChange={(e) => setFilters(prev => ({ ...prev, cargoId: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Todos los cargos</option>
                {cargos.map((cargo) => (
                  <option key={cargo._id} value={cargo._id}>
                    {cargo.name} ({cargo.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Filtros adicionales para reporte general */}
        {exportType === 'general' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Área
              </label>
              <select
                value={filters.areaId}
                onChange={(e) => setFilters(prev => ({ ...prev, areaId: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Todas las áreas</option>
                {areas.map((area) => (
                  <option key={area._id} value={area._id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Todos los estados</option>
                <option value="PRESENT">Presente</option>
                <option value="LATE">Tardanza</option>
                <option value="ABSENT">Ausente</option>
                <option value="EXCUSED">Justificado</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Justificación
              </label>
              <select
                value={filters.hasJustification === undefined ? '' : filters.hasJustification.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters(prev => ({ 
                    ...prev, 
                    hasJustification: value === '' ? undefined : value === 'true'
                  }));
                }}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Todos</option>
                <option value="true">Con justificación</option>
                <option value="false">Sin justificación</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Preview y Botón de Exportación */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {getExportTypeLabel(exportType)}
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filters.startDate} - {filters.endDate}
            </div>
          </div>
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {getPreviewCount()} registros
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={loading || (exportType === 'individual' && !filters.userId)}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Exportando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar a Excel
            </div>
          )}
        </Button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className={`mt-4 p-3 rounded-lg border ${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-800 text-red-200'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {error}
        </div>
      )}

      {success && (
        <div className={`mt-4 p-3 rounded-lg border ${
          theme === 'dark'
            ? 'bg-green-900/20 border-green-800 text-green-200'
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          {success}
        </div>
      )}
    </div>
  );
}
