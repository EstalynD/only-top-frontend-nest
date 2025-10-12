"use client";
import React from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import { useTheme } from '@/lib/theme';
import { 
  getContratosByEmpleado, 
  getEstadisticasContratos,
  generarContratoLaboral,
  getInfoContratoLaboral,
  validarPlantillaContrato,
  generarPdfContrato
} from '@/lib/service-rrhh/contratos-api';
import type { Contrato, ContratosStats } from '@/lib/service-rrhh/contratos-types';
import type { ContratoLaboralInfo, PlantillaValidation } from '@/lib/service-rrhh/types';
import CrearDocumentoModal from '@/components/rrhh/CrearDocumentoModal';

interface Props {
  empleadoId: string;
  token: string;
}

export default function ContratosTab({ empleadoId, token }: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [contratos, setContratos] = React.useState<Contrato[]>([]);
  const [estadisticas, setEstadisticas] = React.useState<ContratosStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = React.useState<string>('');
  const [openCrearDocumento, setOpenCrearDocumento] = React.useState(false);
  
  // Estados para plantillas de contratos
  const [plantillaValidation, setPlantillaValidation] = React.useState<PlantillaValidation | null>(null);
  const [contratoLaboralInfo, setContratoLaboralInfo] = React.useState<ContratoLaboralInfo | null>(null);
  const [loadingPlantilla, setLoadingPlantilla] = React.useState(false);
  const [generandoContrato, setGenerandoContrato] = React.useState(false);

  React.useEffect(() => {
    loadContratos();
    loadPlantillaValidation();
  }, [empleadoId, token]);

  const calcularEstadisticas = (contratos: Contrato[]) => {
    const estadisticas = {
      total: contratos.length,
      porEstado: {} as Record<string, number>,
      porTipo: {} as Record<string, number>,
      proximosAVencer: 0,
      vencidos: 0
    };

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30);

  contratos.forEach(contrato => {
      // Contar por estado
      estadisticas.porEstado[contrato.estado] = (estadisticas.porEstado[contrato.estado] || 0) + 1;
      
      // Contar por tipo
      estadisticas.porTipo[contrato.tipoContrato] = (estadisticas.porTipo[contrato.tipoContrato] || 0) + 1;
      
      // Contar próximos a vencer
      if (contrato.fechaFin) {
        const fin = new Date(contrato.fechaFin);
        if (fin <= fechaLimite && fin > new Date()) {
          estadisticas.proximosAVencer++;
        }
      }
      
      // Contar vencidos
      if (contrato.fechaFin) {
        const fin = new Date(contrato.fechaFin);
        if (fin < new Date()) {
          estadisticas.vencidos++;
        }
      }
    });

    return estadisticas;
  };

  const loadContratos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getContratosByEmpleado(empleadoId, token);
      console.log('📋 Response from getContratosByEmpleado:', response);
      console.log('📋 Response type:', typeof response);
      console.log('📋 Is array:', Array.isArray(response));
      // requestJSON já desenrola a resposta, então response já é o array
      const contratosArray = Array.isArray(response) ? response : [];
      setContratos(contratosArray);
      console.log('📋 Contratos set to:', contratosArray);
      
      // Calcular estadísticas basándose en los contratos del empleado
      const estadisticasCalculadas = calcularEstadisticas(contratosArray);
      setEstadisticas(estadisticasCalculadas);
      console.log('📊 Estadísticas calculadas:', estadisticasCalculadas);
    } catch (err: any) {
      console.error('Error loading contratos:', err);
      // Si el endpoint no existe, usar datos mock para desarrollo
      if (err.status === 404) {
        console.log('Endpoint no implementado, usando datos mock');
        setContratos([]);
        setError(null);
      } else {
        setError(err.message || 'No se pudieron cargar los contratos');
        setContratos([]); // Asegurar que siempre sea un array
        toast({
          type: 'error',
          title: 'Error al cargar contratos',
          description: 'No se pudieron obtener los contratos del empleado.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPlantillaValidation = async () => {
    try {
      setLoadingPlantilla(true);
      const response = await validarPlantillaContrato(empleadoId, token);
      setPlantillaValidation(response.data);
    } catch (err: any) {
      console.error('Error loading plantilla validation:', err);
      if (err.status === 404) {
        console.log('Endpoint de validación de plantilla no implementado');
        setPlantillaValidation({ tienePlantilla: false });
      } else {
        setPlantillaValidation({ tienePlantilla: false });
      }
    } finally {
      setLoadingPlantilla(false);
    }
  };

  const handleGenerarContratoLaboral = async () => {
    try {
      setGenerandoContrato(true);
      
      // Primero obtener la información del contrato
      const infoResponse = await getInfoContratoLaboral(empleadoId, token);
      setContratoLaboralInfo(infoResponse.data);
      
      // Luego generar el PDF
      const pdfResponse = await generarContratoLaboral(empleadoId, token);
      
      // Crear blob y descargar
      const blob = new Blob([new Uint8Array(pdfResponse.data)], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrato-laboral-${infoResponse.data.contractNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        type: 'success',
        title: 'Contrato generado',
        description: 'El contrato laboral se ha generado y descargado correctamente.',
      });
      
      // Recargar contratos para mostrar el nuevo
      loadContratos();
      
    } catch (err: any) {
      console.error('Error generating contract:', err);
      toast({
        type: 'error',
        title: 'Error al generar contrato',
        description: err.message || 'No se pudo generar el contrato laboral.',
      });
    } finally {
      setGenerandoContrato(false);
    }
  };

  const handleDocumentoCreado = () => {
    setOpenCrearDocumento(false);
    toast({
      type: 'success',
      title: 'Documento creado',
      description: 'El documento se subió correctamente.'
    });
    // Si deseas refrescar otra pestaña/lista de documentos, aquí podrías emitir un evento o levantar estado al padre.
  };

  const abrirPdfEnNuevaPestana = (base64: string, filename: string) => {
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      // Abrir en nueva pestaña
      window.open(url, '_blank');
      // Programar descarga opcional con filename si se desea
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      // No hacer click automático aquí para solo "ver"; la acción de descargar hará click
      // Limpieza
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 60_000);
    } catch (e) {
      console.error('Error abriendo PDF:', e);
      toast({ type: 'error', title: 'Error', description: 'No se pudo abrir el PDF.' });
    }
  };

  const handleVerContrato = async (contratoId: string) => {
    try {
      const pdf = await generarPdfContrato(contratoId, token);
      abrirPdfEnNuevaPestana(pdf.pdfBuffer, pdf.filename || `contrato-${contratoId}.pdf`);
    } catch (err: any) {
      console.error('Error al ver contrato:', err);
      toast({ type: 'error', title: 'Error', description: 'No se pudo generar el PDF del contrato.' });
    }
  };

  const handleDescargarContrato = async (contratoId: string) => {
    try {
      const pdf = await generarPdfContrato(contratoId, token);
      const byteCharacters = atob(pdf.pdfBuffer);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: pdf.mimeType || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdf.filename || `contrato-${contratoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ type: 'success', title: 'Descarga iniciada', description: 'El contrato se está descargando.' });
    } catch (err: any) {
      console.error('Error al descargar contrato:', err);
      toast({ type: 'error', title: 'Error', description: 'No se pudo descargar el contrato.' });
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'RECHAZADO':
        return <XCircle size={16} className="text-red-500" />;
      case 'EN_REVISION':
        return <Clock size={16} className="text-yellow-500" />;
      case 'TERMINADO':
        return <AlertTriangle size={16} className="text-gray-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'EN_REVISION':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'TERMINADO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTipoContrato = (tipo: string) => {
    return tipo.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Asegurar que contratos siempre sea un array
  const contratosSeguros = Array.isArray(contratos) ? contratos : [];
  
  const contratosFiltrados = filtroEstado 
    ? contratosSeguros.filter(contrato => contrato.estado === filtroEstado)
    : contratosSeguros;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <Loader size="lg" variant="primary" />
          </div>
          <p className={`mt-4 text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Cargando contratos...
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
          Error al cargar contratos
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {error}
        </p>
        <Button variant="primary" onClick={loadContratos}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h3 className={`text-base sm:text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Contratos Laborales
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {contratosSeguros.length} contrato{contratosSeguros.length !== 1 ? 's' : ''} registrado{contratosSeguros.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button type="button" variant="secondary" className="px-3 py-2 text-sm w-full sm:w-auto">
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-2 text-sm w-full sm:w-auto"
            onClick={() => { console.debug('Abrir modal crear documento'); setOpenCrearDocumento(true); }}
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Subir Documento</span>
            <span className="sm:hidden">Subir</span>
          </Button>
          {plantillaValidation?.tienePlantilla && (
            <Button 
              type="button" 
              variant="primary" 
              className="px-3 py-2 text-sm w-full sm:w-auto"
              onClick={handleGenerarContratoLaboral}
              disabled={generandoContrato}
            >
              {generandoContrato ? (
                <Loader size="sm" variant="primary" />
              ) : (
                <FileText size={16} />
              )}
              <span className="hidden sm:inline">
                {generandoContrato ? 'Generando...' : 'Generar Contrato'}
              </span>
              <span className="sm:hidden">
                {generandoContrato ? 'Generando...' : 'Generar'}
              </span>
            </Button>
          )}
          <Button type="button" variant="primary" className="px-3 py-2 text-sm w-full sm:w-auto">
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Contrato</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className={`rounded-lg border p-3 sm:p-4 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText size={16} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Total
                </p>
                <p className={`text-lg sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {estadisticas.total}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg border p-3 sm:p-4 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle size={16} className="sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Aprobados
                </p>
                <p className={`text-lg sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {estadisticas.porEstado.APROBADO || 0}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg border p-3 sm:p-4 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock size={16} className="sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  En Revisión
                </p>
                <p className={`text-lg sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {estadisticas.porEstado.EN_REVISION || 0}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg border p-3 sm:p-4 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle size={16} className="sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className="hidden sm:inline">Próximos a Vencer</span>
                  <span className="sm:hidden">Próximos</span>
                </p>
                <p className={`text-lg sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {estadisticas.proximosAVencer}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de Plantilla de Contrato */}
      {plantillaValidation && (
        <div className={`rounded-lg border p-4 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Plantilla de Contrato Disponible
              </h4>
              {plantillaValidation.tienePlantilla ? (
                <div className="mt-1">
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <strong>Plantilla:</strong> {plantillaValidation.templateName}
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Área: {plantillaValidation.areaCode} | Cargo: {plantillaValidation.cargoCode}
                  </p>
                </div>
              ) : (
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  No hay plantilla de contrato configurada para este empleado.
                </p>
              )}
            </div>
            {plantillaValidation.tienePlantilla && (
              <Button 
                type="button" 
                variant="primary" 
                size="sm"
                onClick={handleGenerarContratoLaboral}
                disabled={generandoContrato}
              >
                {generandoContrato ? (
                  <Loader size="sm" variant="primary" />
                ) : (
                  <FileText size={16} />
                )}
                <span className="ml-2">
                  {generandoContrato ? 'Generando...' : 'Generar'}
                </span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <label className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Estado:
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className={`px-3 py-1 rounded-md border text-sm w-full sm:w-auto ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Todos</option>
            <option value="EN_REVISION">En Revisión</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="TERMINADO">Terminado</option>
          </select>
        </div>
      </div>

      {/* Lista de contratos */}
      {contratosFiltrados.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <FileText size={20} className={`sm:w-6 sm:h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            No hay contratos
          </h3>
          <p className={`text-sm mb-4 px-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {filtroEstado 
              ? `No hay contratos con estado "${filtroEstado}"`
              : 'Este empleado no tiene contratos registrados'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {plantillaValidation?.tienePlantilla && (
              <Button 
                type="button" 
                variant="primary" 
                className="px-3 py-2 text-sm"
                onClick={handleGenerarContratoLaboral}
                disabled={generandoContrato}
              >
                {generandoContrato ? (
                  <Loader size="sm" variant="primary" />
                ) : (
                  <FileText size={16} />
                )}
                <span className="hidden sm:inline ml-2">
                  {generandoContrato ? 'Generando...' : 'Generar Contrato Laboral'}
                </span>
                <span className="sm:hidden ml-2">
                  {generandoContrato ? 'Generando...' : 'Generar'}
                </span>
              </Button>
            )}
            <Button type="button" variant="primary" className="px-3 py-2 text-sm">
              <Plus size={16} />
              <span className="hidden sm:inline">Crear Primer Contrato</span>
              <span className="sm:hidden">Crear Contrato</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-2 text-sm"
              onClick={() => { console.debug('Abrir modal crear documento (empty state)'); setOpenCrearDocumento(true); }}
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Subir Documento</span>
              <span className="sm:hidden">Subir</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {contratosFiltrados.map((contrato) => (
            <div
              key={contrato._id}
              className={`rounded-lg border p-4 sm:p-6 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h4 className={`text-base sm:text-lg font-semibold truncate ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {contrato.numeroContrato}
                    </h4>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getEstadoColor(contrato.estado)}`}>
                      {getEstadoIcon(contrato.estado)}
                      {contrato.estado.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Tipo de Contrato
                      </label>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatTipoContrato(contrato.tipoContrato)}
                      </p>
                    </div>

                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Fecha de Inicio
                      </label>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatDate(contrato.fechaInicio)}
                      </p>
                    </div>

                    {contrato.fechaFin && (
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Fecha de Fin
                        </label>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatDate(contrato.fechaFin)}
                        </p>
                      </div>
                    )}
                  </div>

                  {contrato.aprobacion?.comentarios && (
                    <div className="mb-4">
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Comentarios
                      </label>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {contrato.aprobacion.comentarios}
                      </p>
                    </div>
                  )}

                  {contrato.aprobacion?.comentarios?.includes('generado automáticamente') && (
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 text-blue-400' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <FileText size={10} />
                        Creado automáticamente desde documento
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                  <Button type="button" variant="secondary" className="px-3 py-2 text-sm" onClick={() => handleVerContrato(contrato._id)}>
                    <Eye size={16} />
                    <span className="hidden sm:inline ml-1">Ver</span>
                  </Button>
                  <Button type="button" variant="secondary" className="px-3 py-2 text-sm" onClick={() => handleDescargarContrato(contrato._id)}>
                    <Download size={16} />
                    <span className="hidden sm:inline ml-1">Descargar</span>
                  </Button>
                  <Button type="button" variant="secondary" className="px-3 py-2 text-sm">
                    <Edit size={16} />
                    <span className="hidden sm:inline ml-1">Editar</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal para crear documento */}
      <CrearDocumentoModal
        isOpen={openCrearDocumento}
        onClose={() => setOpenCrearDocumento(false)}
        empleadoId={empleadoId}
        onCreated={handleDocumentoCreado}
      />
    </div>
  );
}
