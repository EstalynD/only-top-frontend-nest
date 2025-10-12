"use client";
import React from 'react';
import { 
  Package, 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Tag,
  Hash,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import { useTheme } from '@/lib/theme';
import { 
  dotacionApi, 
  formatCurrency, 
  formatDate, 
  getActionColor, 
  getActionIcon,
  type EndowmentTracking,
  type EndowmentSummary
} from '@/lib/service-rrhh/dotacion-api';

interface Props {
  empleadoId: string;
  token: string;
}

export default function DotacionTab({ empleadoId, token }: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [historial, setHistorial] = React.useState<EndowmentTracking[]>([]);
  const [resumen, setResumen] = React.useState<EndowmentSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeView, setActiveView] = React.useState<'historial' | 'resumen'>('historial');

  React.useEffect(() => {
    loadDotacionData();
  }, [empleadoId, token]);

  const loadDotacionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [historialData, resumenData] = await Promise.all([
        dotacionApi.getEmpleadoHistorial(empleadoId, token),
        dotacionApi.getEmpleadoResumen(empleadoId, token)
      ]);
      
      setHistorial(historialData);
      setResumen(resumenData);
    } catch (err: any) {
      console.error('Error loading dotacion data:', err);
      setError(err.message || 'No se pudo cargar la información de dotación');
      toast({
        type: 'error',
        title: 'Error al cargar dotación',
        description: 'No se pudo obtener la información de dotación del empleado.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getConditionIcon = (condition?: string) => {
    switch (condition?.toUpperCase()) {
      case 'NUEVO':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'BUENO':
        return <CheckCircle size={16} className="text-blue-500" />;
      case 'REGULAR':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'DAÑADO':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getConditionColor = (condition?: string) => {
    switch (condition?.toUpperCase()) {
      case 'NUEVO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'BUENO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'REGULAR':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'DAÑADO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return <Tag size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent size={16} /> : <Tag size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <Loader size="lg" variant="primary" />
          </div>
          <p className={`mt-4 text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Cargando información de dotación...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
        }`}>
          <AlertTriangle size={24} className={theme === 'dark' ? 'text-red-400' : 'text-red-500'} />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Error al cargar dotación
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {error}
        </p>
        <Button variant="primary" onClick={loadDotacionData}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con resumen rápido */}
      {resumen && (
        <div className={`rounded-lg border p-4 sm:p-6 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Package size={20} />
              Resumen de Dotación
            </h3>
            <div className="flex gap-2">
              <Button 
                variant={activeView === 'historial' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveView('historial')}
              >
                <FileText size={16} />
                Historial
              </Button>
              <Button 
                variant={activeView === 'resumen' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveView('resumen')}
              >
                <Eye size={16} />
                Resumen
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {resumen.totalEntregas}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Entregas
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {resumen.totalDevoluciones}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Devoluciones
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {resumen.itemsActivos}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Items Activos
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {formatCurrency(resumen.valorTotalEstimado, 'COP')}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Valor Total
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Historial */}
      {activeView === 'historial' && (
        <div className="space-y-4">
          {historial.length === 0 ? (
            <div className={`rounded-lg border p-8 text-center ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <Package size={48} className={`mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Sin historial de dotación
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Este empleado no tiene registros de dotación aún.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map((item) => (
                <div key={item._id} className={`rounded-lg border p-4 sm:p-6 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getActionIcon(item.action)}</span>
                        <div>
                          <h4 className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.itemId.name}
                          </h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {item.itemId.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="flex items-center gap-2 px-2 py-1 rounded-md"
                            style={{ 
                              backgroundColor: item.categoryId.color ? `${item.categoryId.color}20` : 'transparent',
                              color: item.categoryId.color || (theme === 'dark' ? '#9CA3AF' : '#6B7280')
                            }}
                          >
                            {getCategoryIcon(item.categoryId.icon)}
                            <span className={`text-sm font-medium`}>
                              {item.categoryId.name}
                            </span>
                          </div>
                        </div>
                        
                        {item.itemId.brand && (
                          <div className="flex items-center gap-2">
                            <Package size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {item.itemId.brand} {item.itemId.model}
                            </span>
                          </div>
                        )}
                        
                        {item.itemId.serialNumber && (
                          <div className="flex items-center gap-2">
                            <Hash size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                            <span className={`text-sm font-mono ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {item.itemId.serialNumber}
                            </span>
                          </div>
                        )}
                        
                        {item.itemId.estimatedValue && (
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                            <span className={`text-sm font-semibold ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {formatCurrency(item.itemId.estimatedValue.monto, item.itemId.estimatedValue.moneda)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {item.observations && (
                        <div className="mb-4">
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <strong>Observaciones:</strong> {item.observations}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                          {item.action}
                        </span>
                        
                        {item.condition && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                            {getConditionIcon(item.condition)}
                            {item.condition}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-right">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {formatDate(item.actionDate)}
                        </span>
                      </div>
                      
                      {item.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {item.location}
                          </span>
                        </div>
                      )}
                      
                      {item.referenceNumber && (
                        <div className="flex items-center gap-2">
                          <Hash size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={`text-xs font-mono ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {item.referenceNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista de Resumen */}
      {activeView === 'resumen' && resumen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estadísticas por acción */}
          <div className={`rounded-lg border p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <FileText size={20} />
              Estadísticas por Acción
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Entregas
                </span>
                <span className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>
                  {resumen.totalEntregas}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Devoluciones
                </span>
                <span className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {resumen.totalDevoluciones}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Mantenimientos
                </span>
                <span className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {resumen.totalMantenimientos}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Reparaciones
                </span>
                <span className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  {resumen.totalReparaciones}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Reemplazos
                </span>
                <span className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {resumen.totalReemplazos}
                </span>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div className={`rounded-lg border p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Tag size={20} />
              Categorías
            </h4>
            {resumen.categorias.length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                No hay categorías registradas
              </p>
            ) : (
              <div className="space-y-2">
                {resumen.categorias.map((categoria, index) => {
                  // Buscar la categoría completa en el historial para obtener icono y color
                  const categoriaCompleta = historial.find(h => h.categoryId.name === categoria)?.categoryId;
                  
                  return (
                    <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div 
                        className="flex items-center gap-2"
                        style={{ 
                          color: categoriaCompleta?.color || (theme === 'dark' ? '#9CA3AF' : '#6B7280')
                        }}
                      >
                        {getCategoryIcon(categoriaCompleta?.icon)}
                        <span className={`text-sm font-medium`}>
                          {categoria}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
