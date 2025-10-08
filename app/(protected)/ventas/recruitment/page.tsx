"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, FileDown, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { getActivities, getSalesClosers, deleteActivity, exportToExcel, exportToPdf } from '@/lib/service-recruitment/api';
import ActivityList from '@/components/recruitment/ActivityList';
import type { RecruitmentActivity, SalesCloser } from '@/lib/service-recruitment/types';
import { MESSAGES } from '@/lib/service-recruitment/constants';

const baseCardStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)'
};

const createAccentCard = (hex: string): CSSProperties => ({
  background: `linear-gradient(135deg, ${hex}22, transparent)`,
  border: `1px solid ${hex}33`
});

const BLUE_HEX = '#1c41d9';
const GREEN_HEX = '#059669';
const PURPLE_HEX = '#7c3aed';
const ORANGE_HEX = '#ea580c';

const BLUE_ACCENT = createAccentCard(BLUE_HEX);
const GREEN_ACCENT = createAccentCard(GREEN_HEX);
const PURPLE_ACCENT = createAccentCard(PURPLE_HEX);
const ORANGE_ACCENT = createAccentCard(ORANGE_HEX);

type QuickStatKey = 'totalActivities' | 'totalContacts' | 'totalMeetings' | 'totalModels';
type QuickStatConfig = { key: QuickStatKey; label: string; color: string; accent: CSSProperties };
type QuickStat = QuickStatConfig & { value: number };

const QUICK_STATS_CONFIG: QuickStatConfig[] = [
  { key: 'totalActivities', label: 'Total Actividades', color: BLUE_HEX, accent: BLUE_ACCENT },
  { key: 'totalContacts', label: 'Contactos Totales', color: GREEN_HEX, accent: GREEN_ACCENT },
  { key: 'totalMeetings', label: 'Reuniones Realizadas', color: PURPLE_HEX, accent: PURPLE_ACCENT },
  { key: 'totalModels', label: 'Modelos Cerradas', color: ORANGE_HEX, accent: ORANGE_ACCENT },
];

export default function RecruitmentPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [activities, setActivities] = useState<RecruitmentActivity[]>([]);
  const [salesClosers, setSalesClosers] = useState<SalesCloser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [activitiesData, salesClosersData] = await Promise.all([
        getActivities(token),
        getSalesClosers(token),
      ]);
      setActivities(activitiesData);
      setSalesClosers(salesClosersData);
    } catch (error: any) {
      toast({ type: 'error', title: error?.message || MESSAGES.ERROR_LOADING });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token, loadData]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(MESSAGES.CONFIRM_DELETE)) return;
    if (!token) return;

    try {
      await deleteActivity(token, id);
      setActivities((prev) => prev.filter((activity) => activity._id !== id));
      toast({ type: 'success', title: MESSAGES.ACTIVITY_DELETED });
    } catch (error: any) {
      toast({ type: 'error', title: error?.message || MESSAGES.ERROR_DELETING });
    }
  }, [token, toast]);

  const handleExportExcel = useCallback(async () => {
    if (!token) return;

    try {
      setExporting(true);
      setShowExportMenu(false);
      await exportToExcel(token);
      toast({ type: 'success', title: 'Exportación exitosa', description: 'El archivo Excel se ha descargado' });
    } catch (error: any) {
      toast({ type: 'error', title: 'Error al exportar', description: error?.message });
    } finally {
      setExporting(false);
    }
  }, [token, toast]);

  const handleExportPdf = useCallback(async () => {
    if (!token) return;

    try {
      setExporting(true);
      setShowExportMenu(false);
      await exportToPdf(token);
      toast({ type: 'success', title: 'Exportación exitosa', description: 'El archivo PDF se ha descargado' });
    } catch (error: any) {
      toast({ type: 'error', title: 'Error al exportar', description: error?.message });
    } finally {
      setExporting(false);
    }
  }, [token, toast]);

  const quickStats: QuickStat[] = useMemo(() => {
    if (activities.length === 0) return [];

    const totals: Record<QuickStatKey, number> = {
      totalActivities: activities.length,
      totalContacts: activities.reduce((sum, activity) => sum + activity.contactosObtenidos.length, 0),
      totalMeetings: activities.reduce((sum, activity) => sum + activity.reunionesRealizadas, 0),
      totalModels: activities.reduce((sum, activity) => sum + activity.modelosCerradas.length, 0),
    };

    return QUICK_STATS_CONFIG.map((config) => ({
      ...config,
      value: totals[config.key],
    }));
  }, [activities]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))' }}
            >
              <Calendar size={28} className="text-white" />
            </div>
            Agenda de Recruitment
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gestiona las actividades diarias de prospección y cierre de modelos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Menú de exportación */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all border hover:opacity-90"
              style={{ borderColor: GREEN_HEX, color: GREEN_HEX, background: 'var(--surface)' }}
            >
              <FileDown size={18} />
              {exporting ? 'Exportando...' : 'Exportar'}
              <ChevronDown size={16} />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50"
                style={{ ...baseCardStyle, padding: '0.25rem' }}
              >
                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-4 py-3 transition-colors flex items-center gap-2 rounded-lg hover:opacity-90"
                  style={{ color: GREEN_HEX }}
                >
                  <FileDown size={16} style={{ color: GREEN_HEX }} />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="w-full text-left px-4 py-3 transition-colors flex items-center gap-2 rounded-lg hover:opacity-90"
                  style={{ color: ORANGE_HEX }}
                >
                  <FileDown size={16} style={{ color: ORANGE_HEX }} />
                  <span>PDF (.pdf)</span>
                </button>
              </div>
            )}
          </div>

          <Link
            href="/ventas/recruitment/stats"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all border hover:opacity-90"
            style={{ borderColor: PURPLE_HEX, color: PURPLE_HEX, background: 'var(--surface)' }}
          >
            <TrendingUp size={18} />
            Estadísticas
          </Link>

          <Link
            href="/ventas/recruitment/nueva"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-purple-500))' }}
          >
            <Plus size={20} />
            Nueva Actividad
          </Link>
        </div>
      </div>

      {/* Stats rápidas */}
      {!loading && quickStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <div
              key={stat.key}
              className="rounded-xl p-4"
              style={{ ...baseCardStyle, ...stat.accent }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Lista de actividades */}
      <ActivityList
        activities={activities}
        salesClosers={salesClosers}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}

