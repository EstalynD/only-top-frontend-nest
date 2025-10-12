"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Grid3X3, List, Search, Eye, EyeOff, Building2, Briefcase, Users2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { Shift, TimeSlot } from '@/lib/service-sistema/attendance.api';
import { formatTimeRange, calculateClientDuration, formatDuration, getShiftTypeIcon } from '@/lib/service-sistema/attendance.api';

interface RotatingShiftsSectionProps {
  config: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  filteredShifts: Shift[];
  paginatedShifts: Shift[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
  onOpenShiftModal: (shift?: Shift) => void;
  onToggleShift: (shift: Shift) => void;
  onDeleteShift: (shift: Shift) => void;
  onOpenAssignmentsModal: (scheduleType: 'ROTATING', shift: Shift) => void;
}

export function RotatingShiftsSection({
  config,
  searchQuery,
  setSearchQuery,
  showInactive,
  setShowInactive,
  viewMode,
  setViewMode,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  filteredShifts,
  paginatedShifts,
  totalPages,
  startIndex,
  endIndex,
  onOpenShiftModal,
  onToggleShift,
  onDeleteShift,
  onOpenAssignmentsModal,
}: RotatingShiftsSectionProps) {
  const { theme } = useTheme();

  const getShiftDuration = (timeSlot: TimeSlot) => {
    const duration = calculateClientDuration(timeSlot);
    return formatDuration(duration.minutes);
  };

  if (!config?.rotatingShiftsEnabled) return null;

  return (
    <Card>
      <div className="p-4 sm:p-6">
        {/* Header Responsivo */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-green-800/50' : 'bg-green-100'
            }`}>
              <RotateCcw size={18} className={`sm:w-5 sm:h-5 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <h2 className={`text-base sm:text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Turnos Rotativos
            </h2>
          </div>
          <Button 
            onClick={() => onOpenShiftModal()}
            className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            variant="primary"
            size="sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Turno</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Controles */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Buscar turnos por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                  : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Toggle de vista */}
            <div className={`flex items-center rounded-xl border ${
              theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-2 rounded-l-xl transition-colors duration-200 ${
                  viewMode === 'table'
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="Vista de tabla"
              >
                <List size={16} />
                <span className="hidden sm:inline text-sm">Tabla</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-3 py-2 rounded-r-xl transition-colors duration-200 ${
                  viewMode === 'cards'
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="Vista de tarjetas"
              >
                <Grid3X3 size={16} />
                <span className="hidden sm:inline text-sm">Cards</span>
              </button>
            </div>
            
            <Button
              onClick={() => setShowInactive(!showInactive)}
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors duration-200 ${
                theme === 'dark'
                  ? 'border-gray-600 hover:bg-gray-800 text-gray-300'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className="hidden sm:inline text-sm">
                {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
              </span>
            </Button>
          </div>
        </div>

        {/* Contenido según el modo de vista */}
        {filteredShifts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <RotateCcw size={32} className={`sm:w-10 sm:h-10 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`} />
            </div>
            <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {searchQuery ? 'No se encontraron resultados' : 'No hay turnos configurados'}
            </h3>
            <p className={`text-sm sm:text-base mb-6 max-w-md mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primer turno rotativo'
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => onOpenShiftModal()}
                variant="primary"
                className="px-6 py-3 rounded-xl font-medium"
              >
                Crear Primer Turno
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {viewMode === 'table' ? (
              /* Tabla de turnos */
              <div className={`rounded-xl border overflow-hidden ${
                theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${
                      theme === 'dark' ? 'bg-gray-800/70' : 'bg-gray-50'
                    }`}>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            Turno
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            Horario
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            Duración
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            Estado
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            Asignaciones
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            Acciones
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                    }`}>
                      {paginatedShifts.map((shift) => (
                        <tr
                          key={shift.id}
                          className={`transition-colors duration-150 hover:bg-opacity-50 ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-700/50' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* Turno */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="text-lg">
                                {getShiftTypeIcon(shift.type)}
                              </div>
                              <div>
                                <div className={`text-sm font-medium ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {shift.name}
                                </div>
                                {shift.description && (
                                  <div className={`text-xs truncate max-w-xs ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {shift.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Horario */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {formatTimeRange(shift.timeSlot)}
                            </div>
                          </td>

                          {/* Duración */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {getShiftDuration(shift.timeSlot)}
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                shift.isActive
                                  ? theme === 'dark'
                                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                                    : 'bg-green-100 text-green-800 border border-green-200'
                                  : theme === 'dark'
                                    ? 'bg-gray-800 text-gray-400 border border-gray-700'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {shift.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>

                          {/* Asignaciones */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm">
                              <div className={`flex items-center gap-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                              }`}>
                                <Building2 size={14} />
                                <span>{shift.assignedAreas?.length || 0}</span>
                              </div>
                              <div className={`flex items-center gap-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                              }`}>
                                <Briefcase size={14} />
                                <span>{shift.assignedCargos?.length || 0}</span>
                              </div>
                            </div>
                          </td>

                          {/* Acciones */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onOpenAssignmentsModal('ROTATING', shift)}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                                title="Gestionar asignaciones"
                              >
                                <Users2 size={16} />
                              </button>
                              <button
                                onClick={() => onToggleShift(shift)}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                                title={shift.isActive ? 'Desactivar turno' : 'Activar turno'}
                              >
                                {shift.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button
                                onClick={() => onOpenShiftModal(shift)}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                                title="Editar turno"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => onDeleteShift(shift)}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
                                    : 'hover:bg-red-50 text-red-500 hover:text-red-700'
                                }`}
                                title="Eliminar turno"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Vista de cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {paginatedShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className={`rounded-xl border p-4 sm:p-6 transition-all duration-200 hover:shadow-lg ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {/* Header del turno */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getShiftTypeIcon(shift.type)}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm sm:text-base ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {shift.name}
                          </h3>
                          <p className={`text-xs sm:text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {formatTimeRange(shift.timeSlot)}
                          </p>
                        </div>
                      </div>
                      
                      <span 
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          shift.isActive
                            ? theme === 'dark'
                              ? 'bg-green-900/30 text-green-400 border border-green-800'
                              : 'bg-green-100 text-green-800 border border-green-200'
                            : theme === 'dark'
                              ? 'bg-gray-800 text-gray-400 border border-gray-700'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {shift.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Información del turno */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          Duración:
                        </span>
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {getShiftDuration(shift.timeSlot)}
                        </span>
                      </div>
                      
                      {shift.description && (
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {shift.description}
                        </div>
                      )}
                    </div>

                    {/* Asignaciones */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          Asignaciones:
                        </span>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            <Building2 size={14} />
                            <span>{shift.assignedAreas?.length || 0}</span>
                          </div>
                          <div className={`flex items-center gap-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            <Briefcase size={14} />
                            <span>{shift.assignedCargos?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onOpenAssignmentsModal('ROTATING', shift)}
                        variant="ghost"
                        className="flex-1 text-xs px-2 py-1 h-auto"
                      >
                        <Users2 size={12} className="mr-1" />
                        Asignaciones
                      </Button>
                      <button
                        onClick={() => onToggleShift(shift)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        title={shift.isActive ? 'Desactivar turno' : 'Activar turno'}
                      >
                        {shift.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => onOpenShiftModal(shift)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        title="Editar turno"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteShift(shift)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
                            : 'hover:bg-red-50 text-red-500 hover:text-red-700'
                        }`}
                        title="Eliminar turno"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginador */}
            {totalPages > 1 && (
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-xl border ${
                theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
              }`}>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredShifts.length)} de {filteredShifts.length} turnos
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  >
                    <option value={5}>5 por página</option>
                    <option value={10}>10 por página</option>
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                  </select>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === 1
                          ? theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                          : theme === 'dark' 
                            ? 'text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : theme === 'dark'
                                  ? 'text-gray-300 hover:bg-gray-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                          : theme === 'dark' 
                            ? 'text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default RotatingShiftsSection;
