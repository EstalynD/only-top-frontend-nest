"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

// Componentes del sistema de asistencia
import AttendanceHeader from '@/components/sistema/AttendanceHeader';
import AttendanceTabs from '@/components/sistema/AttendanceTabs';
import AttendanceConfigSection from '@/components/sistema/AttendanceConfigSection';
import AttendanceAssignmentsSection from '@/components/sistema/AttendanceAssignmentsSection';
import AttendanceGeneralConfig from '@/components/sistema/AttendanceGeneralConfig';
import SupernumeraryConfig from '@/components/sistema/SupernumeraryConfig';
import { 
  getAttendanceConfig,
  updateAttendanceConfig,
  addShift,
  updateShift,
  deleteShift,
  toggleShiftStatus,
  toggleFixedSchedule,
  toggleRotatingShifts,
  getFixedScheduleAssignments,
  formatFixedScheduleAssignmentsSummary,
  formatAssignmentsSummary,
  getScheduleTypeDisplayName,
  getScheduleTypeIcon,
  type ScheduleType
} from '@/lib/service-sistema/attendance.api';
import type { 
  AttendanceConfig, 
  UpdateAttendanceConfigRequest,
  Shift,
  CreateShiftRequest,
  TimeSlot,
  FixedSchedule,
  ShiftType
} from '@/lib/service-sistema/attendance.api';
import { 
  formatTimeRange, 
  calculateClientDuration, 
  formatDuration, 
  getShiftTypeIcon, 
  getDayName, 
  validateShift
} from '@/lib/service-sistema/attendance.api';
import { 
  Settings,
  Timer,
  RotateCcw,
  Building2,
  Briefcase,
  Users2,
  Plus, 
  Edit3, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  Grid3X3,
  List,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Calendar
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import ShiftAssignmentsModal from '@/components/rrhh/ShiftAssignmentsModal';
import { getAllAreas, getAllCargos } from '@/lib/service-rrhh/api';
import type { Area, Cargo } from '@/lib/service-rrhh/types';

export default function AsistenciaPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();

  // Estados principales
  const [config, setConfig] = React.useState<AttendanceConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'config' | 'assignments'>('config');
  
  // Estados para turnos rotativos
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showInactive, setShowInactive] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  // Modal estados
  const [showConfigModal, setShowConfigModal] = React.useState(false);
  const [showShiftModal, setShowShiftModal] = React.useState(false);
  const [showFixedScheduleModal, setShowFixedScheduleModal] = React.useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = React.useState(false);
  const [editingShift, setEditingShift] = React.useState<Shift | null>(null);
  const [assignmentScheduleType, setAssignmentScheduleType] = React.useState<ScheduleType>('FIXED');

  // Confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    show: boolean;
    shift: Shift | null;
  }>({ show: false, shift: null });

  // Estados de carga
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Áreas y Cargos (API real)
  const [areas, setAreas] = React.useState<Area[]>([]);
  const [cargos, setCargos] = React.useState<Cargo[]>([]);

  // Formularios
  const [configForm, setConfigForm] = React.useState<UpdateAttendanceConfigRequest>({
    fixedScheduleEnabled: true,
    rotatingShiftsEnabled: true,
    breakDurationMinutes: 30,
    toleranceMinutes: 15,
    weekendEnabled: true,
    overtimeEnabled: false,
    timezone: 'America/Bogota',
    description: '',
  });

  const [shiftForm, setShiftForm] = React.useState<CreateShiftRequest>({
    name: '',
    type: 'CUSTOM',
    timeSlot: { startTime: '09:00', endTime: '17:00' },
    description: '',
    isActive: true,
  });

  const [fixedScheduleForm, setFixedScheduleForm] = React.useState<FixedSchedule>({
    monday: { startTime: '09:00', endTime: '18:00' },
    tuesday: { startTime: '09:00', endTime: '18:00' },
    wednesday: { startTime: '09:00', endTime: '18:00' },
    thursday: { startTime: '09:00', endTime: '18:00' },
    friday: { startTime: '09:00', endTime: '18:00' },
    saturday: { startTime: '09:00', endTime: '14:00' },
    sunday: undefined,
  });

  // Cargar datos iniciales
  React.useEffect(() => {
    if (!token) return;
    
    const loadData = async () => {
      try {
        const [configRes, areasRes, cargosRes] = await Promise.all([
          getAttendanceConfig(token),
          getAllAreas(token, true),
          getAllCargos(token, true)
        ]);
        setConfig(configRes);
        setAreas(areasRes);
        setCargos(cargosRes);
        
        // Actualizar formularios con datos existentes
        setConfigForm({
          fixedScheduleEnabled: configRes.fixedScheduleEnabled,
          rotatingShiftsEnabled: configRes.rotatingShiftsEnabled,
          breakDurationMinutes: configRes.breakDurationMinutes,
          toleranceMinutes: configRes.toleranceMinutes,
          weekendEnabled: configRes.weekendEnabled,
          overtimeEnabled: configRes.overtimeEnabled,
          timezone: configRes.timezone || 'America/Bogota',
          description: configRes.description || '',
        });

        if (configRes.fixedSchedule) {
          setFixedScheduleForm(configRes.fixedSchedule);
        }
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

  // === CONFIGURATION HANDLERS ===

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const updated = await updateAttendanceConfig(token, configForm);
      setConfig(updated);
      toast({ type: 'success', title: 'Configuración actualizada' });
      setShowConfigModal(false);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al actualizar configuración',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFixedScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const updated = await updateAttendanceConfig(token, { 
        fixedSchedule: fixedScheduleForm
      });
      setConfig(updated);
      toast({ type: 'success', title: 'Horario fijo actualizado' });
      setShowFixedScheduleModal(false);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al actualizar horario',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // === SHIFT HANDLERS ===

  const openShiftModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setShiftForm({
        name: shift.name,
        type: shift.type,
        timeSlot: { ...shift.timeSlot },
        description: shift.description || '',
        isActive: shift.isActive,
      });
    } else {
      setEditingShift(null);
      setShiftForm({
        name: '',
        type: 'CUSTOM',
        timeSlot: { startTime: '09:00', endTime: '17:00' },
        description: '',
        isActive: true,
      });
    }
    setShowShiftModal(true);
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validar formulario
    const validationErrors = validateShift(shiftForm);
    if (validationErrors.length > 0) {
      toast({
        type: 'error',
        title: 'Error de validación',
        description: validationErrors[0]
      });
      return;
    }

    setSubmitting(true);
    try {
      let updated: AttendanceConfig;
      
      if (editingShift) {
        updated = await updateShift(token, editingShift.id, shiftForm);
        toast({ type: 'success', title: 'Turno actualizado' });
      } else {
        updated = await addShift(token, shiftForm);
        toast({ type: 'success', title: 'Turno creado' });
      }
      
      setConfig(updated);
      setShowShiftModal(false);
    } catch (error) {
      toast({
        type: 'error',
        title: editingShift ? 'Error al actualizar turno' : 'Error al crear turno',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShift = async () => {
    if (!token || !deleteConfirm.shift) return;

    setDeleting(true);
    try {
      const updated = await deleteShift(token, deleteConfirm.shift.id);
      setConfig(updated);
      toast({ type: 'success', title: 'Turno eliminado' });
      setDeleteConfirm({ show: false, shift: null });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al eliminar turno',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleShift = async (shift: Shift) => {
    if (!token) return;

    try {
      const updated = await toggleShiftStatus(token, shift.id);
      setConfig(updated);
      toast({ 
        type: 'success', 
        title: `Turno ${updated.rotatingShifts.find(s => s.id === shift.id)?.isActive ? 'activado' : 'desactivado'}` 
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al cambiar estado del turno',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  const handleToggleFixedSchedule = async (enabled: boolean) => {
    if (!token) return;

    try {
      const updated = await toggleFixedSchedule(token, enabled);
      setConfig(updated);
      setConfigForm(prev => ({ ...prev, fixedScheduleEnabled: enabled }));
      toast({ 
        type: 'success', 
        title: `Horario fijo ${enabled ? 'habilitado' : 'deshabilitado'}` 
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al cambiar estado del horario fijo',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  const handleToggleRotatingShifts = async (enabled: boolean) => {
    if (!token) return;

    try {
      const updated = await toggleRotatingShifts(token, enabled);
      setConfig(updated);
      setConfigForm(prev => ({ ...prev, rotatingShiftsEnabled: enabled }));
      toast({ 
        type: 'success', 
        title: `Turnos rotativos ${enabled ? 'habilitados' : 'deshabilitados'}` 
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al cambiar estado de turnos rotativos',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // === ASSIGNMENT HANDLERS ===

  const openAssignmentsModal = (scheduleType: ScheduleType, shift?: Shift) => {
    setAssignmentScheduleType(scheduleType);
    setEditingShift(shift || null);
    setShowAssignmentsModal(true);
  };

  const handleAssignmentsUpdated = async () => {
    if (!token) return;
    
    try {
      const updated = await getAttendanceConfig(token);
      setConfig(updated);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al actualizar configuración',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // === UTILITY FUNCTIONS ===

  const getShiftDuration = (timeSlot: TimeSlot) => {
    const duration = calculateClientDuration(timeSlot);
    return formatDuration(duration.minutes);
  };

  // Filtrado y paginación de turnos rotativos
  const filteredShifts = React.useMemo(() => {
    if (!config?.rotatingShifts) return [];
    
    return config.rotatingShifts.filter(shift => {
      const matchesSearch = searchQuery === '' || 
        shift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = showInactive || shift.isActive;
      
      return matchesSearch && matchesStatus;
    });
  }, [config?.rotatingShifts, searchQuery, showInactive]);

  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedShifts = filteredShifts.slice(startIndex, endIndex);

  // Reset página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showInactive]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
        <div className="text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <Loader size="lg" variant="primary" />
          </div>
          <p className={`text-sm sm:text-base font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Cargando configuración de asistencia...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Header */}
          <AttendanceHeader />

      {/* Tabs */}
          <AttendanceTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          {/* Tab Content - Configuración */}
          {activeTab === 'config' && (
            <div className="space-y-6 sm:space-y-8 lg:space-y-12">
              <AttendanceConfigSection
                config={config}
                token={token || ''}
                onConfigUpdated={setConfig}
                onShowConfigModal={() => setShowConfigModal(true)}
                onShowFixedScheduleModal={() => setShowFixedScheduleModal(true)}
                onToggleFixedSchedule={handleToggleFixedSchedule}
                onToggleRotatingShifts={handleToggleRotatingShifts}
                // Props para Turnos Rotativos
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
                onOpenShiftModal={openShiftModal}
                onToggleShift={handleToggleShift}
                onDeleteShift={(shift) => setDeleteConfirm({ show: true, shift })}
                onOpenAssignmentsModal={openAssignmentsModal}
              />

              {/* Configuración General */}
              <AttendanceGeneralConfig config={config} />

              {/* Configuración de Supernumerarios */}
              {config && (
                <SupernumeraryConfig 
                  config={config} 
                  onUpdate={async (updates) => {
                    if (!token) return;
                    try {
                      await updateAttendanceConfig(token, updates);
                      // Recargar configuración
                      const configRes = await getAttendanceConfig(token);
                      setConfig(configRes);
                      toast({
                        type: 'success',
                        title: 'Configuración actualizada',
                        description: 'La configuración de supernumerarios se actualizó correctamente'
                      });
                    } catch (error: any) {
                      toast({
                        type: 'error',
                        title: 'Error',
                        description: error.message || 'No se pudo actualizar la configuración'
                      });
                    }
                  }}
                />
              )}
            </div>
          )}


  {/* Modal Configuración General */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Configuración General"
        icon={<Settings size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      >
        <form onSubmit={handleConfigSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Duración de descanso (minutos)"
              type="number"
              min="0"
              max="240"
              value={configForm.breakDurationMinutes?.toString() || ''}
              onChange={(e) => setConfigForm(prev => ({ ...prev, breakDurationMinutes: parseInt(e.target.value) || 0 }))}
              required
            />
            <Input
              label="Tolerancia llegada tarde (minutos)"
              type="number"
              min="0"
              max="60"
              value={configForm.toleranceMinutes?.toString() || ''}
              onChange={(e) => setConfigForm(prev => ({ ...prev, toleranceMinutes: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>

          <Input
            label="Zona horaria"
            value={configForm.timezone || ''}
            onChange={(e) => setConfigForm(prev => ({ ...prev, timezone: e.target.value }))}
            placeholder="America/Bogota"
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={configForm.weekendEnabled || false}
                onChange={(e) => setConfigForm(prev => ({ ...prev, weekendEnabled: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Habilitar asistencia en fines de semana
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={configForm.overtimeEnabled || false}
                onChange={(e) => setConfigForm(prev => ({ ...prev, overtimeEnabled: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Habilitar seguimiento de horas extra
              </span>
            </label>
          </div>

          <Input
            label="Descripción (opcional)"
            value={configForm.description || ''}
            onChange={(e) => setConfigForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción de la configuración"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
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
              {submitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

  {/* Modal Horario Fijo */}
      <Modal
        isOpen={showFixedScheduleModal}
        onClose={() => setShowFixedScheduleModal(false)}
        title="Configurar Horario Fijo"
        icon={<Calendar size={20} style={{ color: 'var(--ot-blue-500)' }} />}
        maxWidth="3xl"
      >
        <form onSubmit={handleFixedScheduleSubmit} className="p-6 space-y-6">
          {/* Configuración de Almuerzo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Habilitar descanso de almuerzo (aplica a todos los días activos)
              </label>
              <button
                type="button"
                onClick={() => setFixedScheduleForm(prev => ({
                  ...prev,
                  lunchBreakEnabled: !prev.lunchBreakEnabled,
                }))}
                className="inline-flex items-center gap-2 text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {fixedScheduleForm.lunchBreakEnabled ? <ToggleRight size={18} className="text-green-500"/> : <ToggleLeft size={18} className="text-gray-400"/>}
                {fixedScheduleForm.lunchBreakEnabled ? 'Activado' : 'Desactivado'}
              </button>
            </div>
            {fixedScheduleForm.lunchBreakEnabled && (
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={!!fixedScheduleForm.lunchBreak}
                    onChange={(e) => setFixedScheduleForm(prev => ({
                      ...prev,
                      lunchBreak: e.target.checked ? (prev.lunchBreak ?? { startTime: '13:00', endTime: '14:00' }) : undefined
                    }))}
                  />
                  Usar rango fijo de almuerzo (opcional)
                </label>
                {fixedScheduleForm.lunchBreak && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Almuerzo</span>
                    <Input
                      type="time"
                      value={fixedScheduleForm.lunchBreak.startTime}
                      onChange={(e) => setFixedScheduleForm(prev => ({
                        ...prev,
                        lunchBreak: { startTime: e.target.value, endTime: prev.lunchBreak!.endTime }
                      }))}
                      className="w-28 md:w-32"
                    />
                    <span style={{ color: 'var(--text-muted)' }}>a</span>
                    <Input
                      type="time"
                      value={fixedScheduleForm.lunchBreak.endTime}
                      onChange={(e) => setFixedScheduleForm(prev => ({
                        ...prev,
                        lunchBreak: { startTime: prev.lunchBreak!.startTime, endTime: e.target.value }
                      }))}
                      className="w-28 md:w-32"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const).map((day) => {
              const timeSlot = fixedScheduleForm[day];
              return (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="w-full sm:w-28">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {getDayName(day)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="time"
                    value={timeSlot?.startTime || ''}
                    onChange={(e) => setFixedScheduleForm(prev => ({
                      ...prev,
                      [day]: timeSlot ? { ...timeSlot, startTime: e.target.value } : { startTime: e.target.value, endTime: '18:00' }
                    }))}
                    className="w-full sm:w-28 md:w-32"
                  />
                  <span style={{ color: 'var(--text-muted)' }}>a</span>
                  <Input
                    type="time"
                    value={timeSlot?.endTime || ''}
                    onChange={(e) => setFixedScheduleForm(prev => ({
                      ...prev,
                      [day]: timeSlot ? { ...timeSlot, endTime: e.target.value } : { startTime: '09:00', endTime: e.target.value }
                    }))}
                    className="w-full sm:w-28 md:w-32"
                  />
                  
                  {timeSlot && (
                    <span className="text-xs px-2 py-1 rounded ml-2" style={{
                      background: 'var(--ot-blue-100)',
                      color: 'var(--ot-blue-700)'
                    }}>
                      {getShiftDuration(timeSlot)}
                    </span>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setFixedScheduleForm(prev => ({ ...prev, [day]: undefined }))}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Deshabilitar día"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowFixedScheduleModal(false)}
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
              {submitting ? 'Guardando...' : 'Guardar Horario'}
            </Button>
          </div>
        </form>
      </Modal>

  {/* Modal Turno */}
      <Modal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        title={editingShift ? 'Editar Turno' : 'Nuevo Turno'}
        icon={<Clock size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      >
        <form onSubmit={handleShiftSubmit} className="p-6 space-y-4">
          <Input
            label="Nombre del turno"
            value={shiftForm.name}
            onChange={(e) => setShiftForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Turno Mañana, Turno Tarde, etc."
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Tipo de turno
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'AM', label: 'Mañana', icon: '🌅' },
                { value: 'PM', label: 'Tarde', icon: '🌆' },
                { value: 'MADRUGADA', label: 'Madrugada', icon: '🌙' },
                { value: 'CUSTOM', label: 'Personalizado', icon: '⚙️' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50" style={{ borderColor: 'var(--border)' }}>
                  <input
                    type="radio"
                    name="shiftType"
                    value={option.value}
                    checked={shiftForm.type === option.value}
                    onChange={(e) => setShiftForm(prev => ({ ...prev, type: e.target.value as ShiftType }))}
                    className="text-blue-600"
                  />
                  <span>{option.icon}</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hora de inicio"
              type="time"
              value={shiftForm.timeSlot.startTime}
              onChange={(e) => setShiftForm(prev => ({ 
                ...prev, 
                timeSlot: { ...prev.timeSlot, startTime: e.target.value }
              }))}
              required
            />
            <Input
              label="Hora de fin"
              type="time"
              value={shiftForm.timeSlot.endTime}
              onChange={(e) => setShiftForm(prev => ({ 
                ...prev, 
                timeSlot: { ...prev.timeSlot, endTime: e.target.value }
              }))}
              required
            />
          </div>

          {shiftForm.timeSlot.startTime && shiftForm.timeSlot.endTime && (
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Duración del turno:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {getShiftDuration(shiftForm.timeSlot)}
                  {calculateClientDuration(shiftForm.timeSlot).isOvernight && (
                    <span className="ml-2 text-xs px-2 py-1 rounded" style={{
                      background: 'var(--ot-purple-100)',
                      color: 'var(--ot-purple-700)'
                    }}>
                      Nocturno
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          <Input
            label="Descripción (opcional)"
            value={shiftForm.description || ''}
            onChange={(e) => setShiftForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción del turno"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={shiftForm.isActive || false}
              onChange={(e) => setShiftForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Turno activo
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowShiftModal(false)}
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
              {submitting ? 'Guardando...' : editingShift ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

          {/* Tab Contenido - Asignaciones */}
          {activeTab === 'assignments' && (
            <div className="space-y-6 sm:space-y-8 lg:space-y-12">
              <AttendanceAssignmentsSection
                config={config}
                areas={areas}
                cargos={cargos}
                onOpenAssignmentsModal={openAssignmentsModal}
              />
                  </div>
          )}

          {/* Modales y Diálogos */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Eliminar Turno"
        description={
          deleteConfirm.shift ? (
            <div>
              <p>¿Estás seguro de que deseas eliminar el turno <strong>{deleteConfirm.shift.name}</strong>?</p>
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
        onConfirm={handleDeleteShift}
        onCancel={() => setDeleteConfirm({ show: false, shift: null })}
      />

      <ShiftAssignmentsModal
        isOpen={showAssignmentsModal}
        onClose={() => setShowAssignmentsModal(false)}
        scheduleType={assignmentScheduleType}
        shift={editingShift}
        fixedSchedule={config?.fixedSchedule}
        token={token || ''}
        areas={areas}
        cargos={cargos}
        onAssignmentsUpdated={handleAssignmentsUpdated}
      />
        </div>
      </div>
    </div>
  );
}
