"use client";

import React, { useState } from 'react';
import { AttendanceProvider } from '@/components/rrhh/attendance/AttendanceContext';
import { AttendanceStats } from '@/components/rrhh/attendance/AttendanceStats';
import { AttendanceFilters } from '@/components/rrhh/attendance/AttendanceFilters';
import { EmployeeGrid } from '@/components/rrhh/attendance/EmployeeGrid';
import ExportPanel from '@/components/rrhh/attendance/ExportPanel';
import PendingJustificationsPanel from '@/components/rrhh/attendance/PendingJustificationsPanel';
import MemorandumAdminPanel from '@/components/rrhh/attendance/MemorandumAdminPanel';
import { Card } from '@/components/ui/Card';
import { FileText, Users, AlertTriangle, FileCheck } from 'lucide-react';

type ActiveTab = 'registros' | 'justificaciones' | 'reportes' | 'memorandos';

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('registros');

  const tabs = [
    { id: 'registros', label: 'Registros de Asistencia', icon: Users },
    { id: 'justificaciones', label: 'Justificaciones', icon: FileCheck },
    { id: 'reportes', label: 'Reportes y Exportación', icon: FileText },
    { id: 'memorandos', label: 'Memorandos', icon: AlertTriangle }
  ];

  return (
    <AttendanceProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Control de Asistencia
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona la asistencia, horarios y memorandos del personal
          </p>
        </div>

        {/* Tabs */}
        <Card className="mb-6 p-1">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Content */}
        {activeTab === 'registros' && (
          <div>
            <AttendanceStats />
            <AttendanceFilters />
            <EmployeeGrid />
          </div>
        )}

        {activeTab === 'justificaciones' && (
          <div>
            <PendingJustificationsPanel />
          </div>
        )}

        {activeTab === 'reportes' && (
          <div>
            <AttendanceStats />
            <ExportPanel />
          </div>
        )}

        {activeTab === 'memorandos' && (
          <div>
            <MemorandumAdminPanel />
          </div>
        )}
      </div>
    </AttendanceProvider>
  );
}
