"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, Settings } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import AttendanceEnabledFromCard from './AttendanceEnabledFromCard';
import AttendanceStatusCards from './AttendanceStatusCards';
import FixedScheduleOverviewCard from './FixedScheduleOverviewCard';
import RotatingShiftsSection from './RotatingShiftsSection';
import type { AttendanceConfig, Shift } from '@/lib/service-sistema/attendance.api';

interface AttendanceConfigSectionProps {
  config: AttendanceConfig | null;
  token: string;
  onConfigUpdated: (config: AttendanceConfig) => void;
  onShowConfigModal: () => void;
  onShowFixedScheduleModal: () => void;
  onToggleFixedSchedule: (enabled: boolean) => void;
  onToggleRotatingShifts: (enabled: boolean) => void;
  // Props para Turnos Rotativos
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

export function AttendanceConfigSection({
  config,
  token,
  onConfigUpdated,
  onShowConfigModal,
  onShowFixedScheduleModal,
  onToggleFixedSchedule,
  onToggleRotatingShifts,
  // Props para Turnos Rotativos
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
}: AttendanceConfigSectionProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Configuraciones de Asistencia */}
      <Card>
        <div className="p-4 sm:p-6">
          {/* Header Responsivo */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-blue-800/50' : 'bg-blue-100'
              }`}>
                <Clock size={18} className={`sm:w-5 sm:h-5 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-base sm:text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Configuraciones de Asistencia
              </h2>
            </div>
            <Button 
              onClick={onShowConfigModal} 
              variant="neutral" 
              className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
              size="sm"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Configurar</span>
              <span className="sm:hidden">Configurar</span>
            </Button>
          </div>

          <p className={`text-sm sm:text-base mb-4 sm:mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Ambas configuraciones están disponibles para ser asignadas a empleados según área y cargo.
          </p>

          {config && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <AttendanceEnabledFromCard 
                  token={token} 
                  onUpdated={onConfigUpdated} 
                />
              </div>
              <AttendanceStatusCards 
                fixedEnabled={!!config.fixedScheduleEnabled}
                rotatingEnabled={!!config.rotatingShiftsEnabled}
                onToggleFixed={onToggleFixedSchedule}
                onToggleRotating={onToggleRotatingShifts}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Horario Fijo */}
      {config?.fixedScheduleEnabled && (
        <FixedScheduleOverviewCard 
          fixedSchedule={config.fixedSchedule} 
          onEdit={onShowFixedScheduleModal} 
        />
      )}

      {/* Turnos Rotativos */}
      <RotatingShiftsSection
        config={config}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        filteredShifts={filteredShifts}
        paginatedShifts={paginatedShifts}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        onOpenShiftModal={onOpenShiftModal}
        onToggleShift={onToggleShift}
        onDeleteShift={onDeleteShift}
        onOpenAssignmentsModal={onOpenAssignmentsModal}
      />
    </div>
  );
}

export default AttendanceConfigSection;
