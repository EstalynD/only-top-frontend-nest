"use client";
import React, { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Clock, Calendar, FileText, BarChart3, AlertCircle } from 'lucide-react';
import MarcadorAsistencia from '@/components/rrhh/MarcadorAsistencia';
import MiHorario from '@/components/rrhh/MiHorario';
import MisRegistros from '@/components/rrhh/MisRegistros';
import MiReporte from '@/components/rrhh/MiReporte';
import MisMemorandos from '@/components/rrhh/MisMemorandos';

export default function MiAsistenciaPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('marcar');

  const tabs = [
    {
      id: 'marcar',
      label: 'Marcar',
      icon: <Clock size={16} />
    },
    {
      id: 'horario',
      label: 'Mi Horario',
      icon: <Calendar size={16} />
    },
    {
      id: 'registros',
      label: 'Registros',
      icon: <FileText size={16} />
    },
    {
      id: 'memorandos',
      label: 'Memorandos',
      icon: <AlertCircle size={16} />
    },
    {
      id: 'reporte',
      label: 'Reporte',
      icon: <BarChart3 size={16} />
    }
  ];

  return (
    <div className="min-h-screen ot-theme-bg">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold ot-theme-text">
            Mi Asistencia
          </h1>
          <p className="mt-1 text-sm sm:text-base ot-theme-text-secondary">
            Gestiona tu asistencia diaria y consulta tu historial
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            className="w-full"
          />
        </div>

        {/* Content */}
        <div className="w-full">
          <TabPanel>
            {activeTab === 'marcar' && <MarcadorAsistencia />}
            {activeTab === 'horario' && <MiHorario />}
            {activeTab === 'registros' && <MisRegistros />}
            {activeTab === 'memorandos' && <MisMemorandos />}
            {activeTab === 'reporte' && <MiReporte />}
          </TabPanel>
        </div>
      </div>
    </div>
  );
}
