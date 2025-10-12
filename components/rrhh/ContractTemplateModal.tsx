"use client";
import React from 'react';
import { 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Settings,
  Building2
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { 
  getAvailableContractTemplates,
  assignContractTemplates,
  verifyTemplateAssignments,
  clearTemplateAssignments
} from '@/lib/service-rrhh/api';
import type { ContractTemplate, Area } from '@/lib/service-rrhh/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  token: string;
  area?: Area;
}

export default function ContractTemplateModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  token,
  area 
}: Props) {
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const [templates, setTemplates] = React.useState<ContractTemplate[]>([]);
  const [assignments, setAssignments] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const [loadingAssignments, setLoadingAssignments] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  const loadTemplates = React.useCallback(async () => {
    try {
      setLoadingTemplates(true);
      console.log('Loading contract templates...');
      const data = await getAvailableContractTemplates(token);
      console.log('Templates loaded:', data);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar las plantillas de contratos.',
      });
    } finally {
      setLoadingTemplates(false);
    }
  }, [token, toast]);

  const loadAssignments = React.useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const data = await verifyTemplateAssignments(token);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar las asignaciones de plantillas.',
      });
    } finally {
      setLoadingAssignments(false);
    }
  }, [token, toast]);

  React.useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, loading templates...');
      loadTemplates();
      loadAssignments();
    }
  }, [isOpen, loadTemplates, loadAssignments]);

  const handleAssignTemplates = async () => {
    try {
      setActionLoading(true);
      await assignContractTemplates(token);
      
      toast({
        type: 'success',
        title: 'Plantillas asignadas',
        description: 'Las plantillas de contratos se asignaron correctamente a las áreas y cargos.',
      });
      
      loadAssignments();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error assigning templates:', error);
      toast({
        type: 'error',
        title: 'Error',
        description: error.message || 'No se pudieron asignar las plantillas.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAssignments = async () => {
    try {
      setActionLoading(true);
      await clearTemplateAssignments(token);
      
      toast({
        type: 'success',
        title: 'Asignaciones limpiadas',
        description: 'Las asignaciones de plantillas se limpiaron correctamente.',
      });
      
      loadAssignments();
    } catch (error: any) {
      console.error('Error clearing assignments:', error);
      toast({
        type: 'error',
        title: 'Error',
        description: error.message || 'No se pudieron limpiar las asignaciones.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getTemplateForArea = (areaCode: string) => {
    return templates.find(t => t.areaCode === areaCode);
  };

  const getTemplateForCargo = (cargoCode: string) => {
    return templates.find(t => t.cargoCode === cargoCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 backdrop-blur-sm transition-opacity ${
            theme === 'dark' ? 'bg-black/60' : 'bg-black/50'
          }`}
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`relative w-full max-w-4xl transform overflow-hidden rounded-2xl shadow-2xl transition-all ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <FileText size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Plantillas de Contratos
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Gestiona las plantillas de contratos para áreas y cargos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Plantillas Disponibles */}
            <div className="mb-8">
              <h4 className={`text-md font-semibold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Settings size={16} />
                Plantillas Disponibles
              </h4>
              
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                  <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Cargando plantillas...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.length === 0 ? (
                    <div className={`col-span-2 text-center py-8 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No hay plantillas disponibles
                    </div>
                  ) : (
                    templates.map((template) => (
                    <div
                      key={template.templateId}
                      className={`p-4 rounded-xl border ${
                        theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {template.name}
                        </h5>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          theme === 'dark'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {template.areaCode}
                        </div>
                      </div>
                      <p className={`text-sm mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          Área: {template.areaCode}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          Cargo: {template.cargoCode}
                        </span>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Estado de Asignaciones */}
            <div className="mb-8">
              <h4 className={`text-md font-semibold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Building2 size={16} />
                Estado de Asignaciones
              </h4>
              
              {loadingAssignments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                  <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Cargando asignaciones...
                  </span>
                </div>
              ) : assignments ? (
                <div className="space-y-4">
                  {/* Resumen */}
                  <div className={`p-4 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {assignments.summary?.totalAreas || 0}
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Áreas Totales
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-green-500`}>
                          {assignments.summary?.areasWithTemplates || 0}
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Con Plantilla
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {assignments.summary?.totalCargos || 0}
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Cargos Totales
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-green-500`}>
                          {assignments.summary?.cargosWithTemplates || 0}
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Con Plantilla
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalle por Área */}
                  {assignments.areas && assignments.areas.length > 0 && (
                    <div className="space-y-2">
                      <h5 className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Asignaciones por Área:
                      </h5>
                      {assignments.areas.map((area: any) => (
                        <div
                          key={area.code}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700/30 border-gray-600'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ background: '#6B7280' }}>
                              <Building2 size={14} className="text-white" />
                            </div>
                            <div>
                              <div className={`font-medium ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {area.name}
                              </div>
                              <div className={`text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {area.code}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {area.hasTemplate ? (
                              <>
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span className={`text-sm font-medium text-green-500`}>
                                  {getTemplateForArea(area.code)?.name || 'Plantilla asignada'}
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={16} className="text-yellow-500" />
                                <span className={`text-sm ${
                                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                                }`}>
                                  Sin plantilla
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`text-center py-8 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No se pudo cargar el estado de asignaciones
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleAssignTemplates}
                disabled={actionLoading || loadingTemplates}
                variant="primary"
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Asignando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Asignar Plantillas
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleClearAssignments}
                disabled={actionLoading || loadingAssignments}
                variant="danger"
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Limpiando...
                  </>
                ) : (
                  <>
                    <X size={16} />
                    Limpiar Asignaciones
                  </>
                )}
              </Button>
              
              <Button
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
