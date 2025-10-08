"use client";
import AttendanceEnabledFromCard from '@/components/sistema/AttendanceEnabledFromCard';
import AttendanceStatusCards from '@/components/sistema/AttendanceStatusCards';
import FixedScheduleOverviewCard from '@/components/sistema/FixedScheduleOverviewCard';
import RotatingShiftsList from '@/components/sistema/RotatingShiftsList';
import type { AttendanceConfig as AttendanceConfigType } from '@/lib/service-sistema/attendance.api';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
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
  Clock, 
  Calendar, 
  Users, 
  Plus, 
  Edit3, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  Settings,
  Timer,
  RotateCcw,
  Building2,
  Briefcase,
  Users2,
  ChevronRight
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import ShiftAssignmentsModal from '@/components/rrhh/ShiftAssignmentsModal';
import { getAllAreas, getAllCargos } from '@/lib/service-rrhh/api';
import type { Area, Cargo } from '@/lib/service-rrhh/types';

export default function AsistenciaPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  // Estados principales
  const [config, setConfig] = React.useState<AttendanceConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'config' | 'assignments'>('config');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" label="Cargando configuración de asistencia..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Configuración de Asistencia
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Administra horarios fijos y turnos rotativos para tu organización.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{
              borderBottomColor: activeTab === 'config' ? 'var(--ot-blue-500)' : 'transparent',
              color: activeTab === 'config' ? 'var(--ot-blue-600)' : 'var(--text-muted)'
            }}
          >
            <div className="flex items-center gap-2">
              <Settings size={16} />
              Configuración
            </div>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{
              borderBottomColor: activeTab === 'assignments' ? 'var(--ot-blue-500)' : 'transparent',
              color: activeTab === 'assignments' ? 'var(--ot-blue-600)' : 'var(--text-muted)'
            }}
          >
            <div className="flex items-center gap-2">
              <Users2 size={16} />
              Asignaciones
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content - Configuración */}
      {activeTab === 'config' && (
        <>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clock size={20} style={{ color: 'var(--ot-blue-500)' }} />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Configuraciones de Asistencia
                  </h2>
                </div>
                <Button onClick={() => setShowConfigModal(true)} variant="neutral" className="flex items-center gap-2">
                  <Settings size={16} />
                  Configurar
                </Button>
              </div>

          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Ambas configuraciones están disponibles para ser asignadas a empleados según área y cargo.
          </p>

          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <AttendanceEnabledFromCard token={token || ''} onUpdated={(cfg: AttendanceConfigType) => setConfig(cfg)} />
              </div>
              <AttendanceStatusCards 
                fixedEnabled={!!config.fixedScheduleEnabled}
                rotatingEnabled={!!config.rotatingShiftsEnabled}
                onToggleFixed={handleToggleFixedSchedule}
                onToggleRotating={handleToggleRotatingShifts}
              />
            </div>
          )}
        </div>
  </Card>

      {/* Horario Fijo */}
      {config?.fixedScheduleEnabled && (
        <>
          <FixedScheduleOverviewCard fixedSchedule={config.fixedSchedule} onEdit={() => setShowFixedScheduleModal(true)} />
          {config.fixedSchedule?.lunchBreakEnabled && config.fixedSchedule?.lunchBreak && (
            <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Descanso de almuerzo: {formatTimeRange(config.fixedSchedule.lunchBreak)}
            </div>
          )}
        </>
      )}

  {/* Turnos Rotativos */}
      {config?.rotatingShiftsEnabled && (
        <RotatingShiftsList 
          shifts={config.rotatingShifts}
          onNew={() => openShiftModal()}
          onToggle={handleToggleShift}
          onEdit={(s) => openShiftModal(s)}
          onDelete={(s) => setDeleteConfirm({ show: true, shift: s })}
        />
      )}

  {/* Configuración General */}
      {config && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings size={20} style={{ color: 'var(--ot-blue-500)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Configuración General
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Timer size={16} style={{ color: 'var(--ot-blue-600)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Duración de descanso
                  </span>
                </div>
                <p className="text-lg font-semibold" style={{ color: 'var(--ot-blue-600)' }}>
                  {config.breakDurationMinutes} min
                </p>
              </div>
              
              <div className="p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} style={{ color: 'var(--ot-green-600)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Tolerancia
                  </span>
                </div>
                <p className="text-lg font-semibold" style={{ color: 'var(--ot-green-600)' }}>
                  {config.toleranceMinutes} min
                </p>
              </div>
              
              <div className="p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} style={{ color: 'var(--ot-purple-600)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Fines de semana
                  </span>
                </div>
                <p className="text-lg font-semibold" style={{ color: 'var(--ot-purple-600)' }}>
                  {config.weekendEnabled ? 'Habilitado' : 'Deshabilitado'}
                </p>
              </div>
              
              <div className="p-3 rounded-lg" style={{ background: 'var(--surface-muted)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} style={{ color: 'var(--ot-yellow-600)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Horas extra
                  </span>
                </div>
                <p className="text-lg font-semibold" style={{ color: 'var(--ot-yellow-600)' }}>
                  {config.overtimeEnabled ? 'Habilitado' : 'Deshabilitado'}
                </p>
              </div>
            </div>
          </div>
        </Card>
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
        maxWidth="max-w-3xl"
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

        </>
      )}

      {/* Tab Contenido - Asignaciones */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Horario Fijo - Asignaciones */}
          {config?.fixedScheduleEnabled && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} style={{ color: 'var(--ot-blue-500)' }} />
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Horario Fijo - Asignaciones
                    </h2>
                  </div>
                  <Button 
                    onClick={() => openAssignmentsModal('FIXED')}
                    className="flex items-center gap-2"
                  >
                    <Users2 size={16} />
                    Gestionar Asignaciones
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border" style={{ 
                    background: 'var(--surface-muted)', 
                    borderColor: 'var(--border)' 
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 size={16} style={{ color: 'var(--ot-blue-600)' }} />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Áreas Asignadas
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {config.fixedSchedule?.assignedAreas?.length || 0} áreas asignadas
                    </p>
                    {config.fixedSchedule?.assignedAreas && config.fixedSchedule.assignedAreas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {config.fixedSchedule.assignedAreas.slice(0, 3).map(areaId => {
                          const area = areas.find(a => a._id === areaId);
                          return area ? (
                            <span 
                              key={areaId}
                              className="px-2 py-1 text-xs rounded"
                              style={{
                                background: 'var(--ot-blue-100)',
                                color: 'var(--ot-blue-700)'
                              }}
                            >
                              {area.name}
                            </span>
                          ) : null;
                        })}
                        {config.fixedSchedule.assignedAreas.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded" style={{
                            background: 'var(--surface-muted)',
                            color: 'var(--text-muted)'
                          }}>
                            +{config.fixedSchedule.assignedAreas.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg border" style={{ 
                    background: 'var(--surface-muted)', 
                    borderColor: 'var(--border)' 
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={16} style={{ color: 'var(--ot-green-600)' }} />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Cargos Asignados
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {config.fixedSchedule?.assignedCargos?.length || 0} cargos asignados
                    </p>
                    {config.fixedSchedule?.assignedCargos && config.fixedSchedule.assignedCargos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {config.fixedSchedule.assignedCargos.slice(0, 3).map(cargoId => {
                          const cargo = cargos.find(c => c._id === cargoId);
                          return cargo ? (
                            <span 
                              key={cargoId}
                              className="px-2 py-1 text-xs rounded"
                              style={{
                                background: 'var(--ot-green-100)',
                                color: 'var(--ot-green-700)'
                              }}
                            >
                              {cargo.name}
                            </span>
                          ) : null;
                        })}
                        {config.fixedSchedule.assignedCargos.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded" style={{
                            background: 'var(--surface-muted)',
                            color: 'var(--text-muted)'
                          }}>
                            +{config.fixedSchedule.assignedCargos.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Turnos Rotativos - Asignaciones */}
          {config?.rotatingShiftsEnabled && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <RotateCcw size={20} style={{ color: 'var(--ot-green-500)' }} />
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Turnos Rotativos - Asignaciones
                    </h2>
                  </div>
                </div>

                {config.rotatingShifts.length > 0 ? (
                  <div className="space-y-4">
                    {config.rotatingShifts.map((shift) => (
                      <div 
                        key={shift.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border"
                        style={{ 
                          background: 'var(--surface-muted)', 
                          borderColor: 'var(--border)' 
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: '1.2em' }}>
                              {getShiftTypeIcon(shift.type)}
                            </span>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {shift.name}
                                </h3>
                                <span 
                                  className="px-2 py-1 text-xs rounded-full"
                                  style={{
                                    background: shift.isActive ? 'var(--ot-green-100)' : 'var(--ot-red-100)',
                                    color: shift.isActive ? 'var(--ot-green-700)' : 'var(--ot-red-700)'
                                  }}
                                >
                                  {shift.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm mt-1 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                                <span>{formatTimeRange(shift.timeSlot)}</span>
                                <span>•</span>
                                <span>{getShiftDuration(shift.timeSlot)}</span>
                                {shift.description && (
                                  <>
                                    <span>•</span>
                                    <span className="break-words max-w-[220px] sm:max-w-none">{shift.description}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
                          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                            <Building2 size={14} />
                            <span>{shift.assignedAreas?.length || 0} áreas</span>
                            <Briefcase size={14} />
                            <span>{shift.assignedCargos?.length || 0} cargos</span>
                          </div>
                          {/* Chips de Áreas asignadas */}
                          {shift.assignedAreas && shift.assignedAreas.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {shift.assignedAreas.slice(0, 3).map(areaId => {
                                const area = areas.find(a => a._id === areaId);
                                return area ? (
                                  <span key={areaId} className="px-2 py-1 text-xs rounded" style={{ background: 'var(--ot-blue-100)', color: 'var(--ot-blue-700)' }}>
                                    {area.name}
                                  </span>
                                ) : null;
                              })}
                              {shift.assignedAreas.length > 3 && (
                                <span className="px-2 py-1 text-xs rounded" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                                  +{shift.assignedAreas.length - 3} más
                                </span>
                              )}
                            </div>
                          )}
                          {/* Chips de Cargos asignados */}
                          {shift.assignedCargos && shift.assignedCargos.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {shift.assignedCargos.slice(0, 3).map(cargoId => {
                                const cargo = cargos.find(c => c._id === cargoId);
                                return cargo ? (
                                  <span key={cargoId} className="px-2 py-1 text-xs rounded" style={{ background: 'var(--ot-green-100)', color: 'var(--ot-green-700)' }}>
                                    {cargo.name}
                                  </span>
                                ) : null;
                              })}
                              {shift.assignedCargos.length > 3 && (
                                <span className="px-2 py-1 text-xs rounded" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                                  +{shift.assignedCargos.length - 3} más
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              onClick={() => openAssignmentsModal('ROTATING', shift)}
                              variant="neutral"
                              className="p-2"
                              title="Gestionar asignaciones"
                            >
                              <Users2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    <RotateCcw size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No hay turnos configurados</p>
                    <p className="text-xs">Crea turnos para gestionar asignaciones</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
  )}

      {/* Confirm Dialog */}
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

      {/* Modal de Asignaciones */}
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
  );
}
