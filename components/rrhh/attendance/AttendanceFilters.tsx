"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { useAttendanceContext } from './AttendanceContext';

export function AttendanceFilters() {
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterShiftStatus,
    setFilterShiftStatus,
    refreshData,
    refreshing,
    filteredEmployees,
    employees
  } = useAttendanceContext();

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro por Estado de Asistencia */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="present">Presentes</option>
            <option value="late">Tardanzas</option>
            <option value="absent">Ausentes</option>
          </select>
        </div>

        {/* Filtro por Estado de Turno */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterShiftStatus}
            onChange={(e) => setFilterShiftStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los turnos</option>
            <option value="EN_CURSO">🟢 En Curso</option>
            <option value="FUTURO">🕒 Próximos</option>
            <option value="FINALIZADO">🔴 Finalizados</option>
          </select>
        </div>

        {/* Botón Refrescar */}
        <Button
          onClick={() => refreshData(false)}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Refrescar'}
        </Button>
      </div>

      {/* Contador de resultados */}
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Mostrando <span className="font-semibold text-gray-900 dark:text-white">{filteredEmployees.length}</span> de{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{employees.length}</span> empleados
      </div>
    </Card>
  );
}
