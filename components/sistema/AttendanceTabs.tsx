"use client";
import React from 'react';
import { Settings, Users2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface AttendanceTabsProps {
  activeTab: 'config' | 'assignments';
  onTabChange: (tab: 'config' | 'assignments') => void;
}

export function AttendanceTabs({ activeTab, onTabChange }: AttendanceTabsProps) {
  const { theme } = useTheme();

  return (
    <div className={`border-b ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <nav className="flex space-x-6 sm:space-x-8">
        <button
          onClick={() => onTabChange('config')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'config'
              ? theme === 'dark'
                ? 'border-blue-400 text-blue-400'
                : 'border-blue-600 text-blue-600'
              : theme === 'dark'
                ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings size={16} />
            <span className="hidden sm:inline">Configuración</span>
            <span className="sm:hidden">Config</span>
          </div>
        </button>
        <button
          onClick={() => onTabChange('assignments')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'assignments'
              ? theme === 'dark'
                ? 'border-blue-400 text-blue-400'
                : 'border-blue-600 text-blue-600'
              : theme === 'dark'
                ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users2 size={16} />
            <span className="hidden sm:inline">Asignaciones</span>
            <span className="sm:hidden">Asign.</span>
          </div>
        </button>
      </nav>
    </div>
  );
}

export default AttendanceTabs;
