"use client";
import React from 'react';
import { 
  FileText, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  User,
  Upload,
  File,
  Image,
  Shield,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import { useTheme } from '@/lib/theme';
import { getDocumentosByEmpleado, getEstadisticasDocumentos, descargarDocumento, deleteDocumento } from '@/lib/service-rrhh/documentos-api';
import type { Documento, DocumentosStats } from '@/lib/service-rrhh/contratos-types';
import CrearDocumentoModal from '@/components/rrhh/CrearDocumentoModal';
import EditarDocumentoModal from '@/components/rrhh/EditarDocumentoModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface Props {
  empleadoId: string;
  token: string;
}

export default function DocumentosTab({ empleadoId, token }: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [documentos, setDocumentos] = React.useState<Documento[]>([]);
  const [estadisticas, setEstadisticas] = React.useState<DocumentosStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = React.useState<string>('');
  const [filtroEstado, setFiltroEstado] = React.useState<string>('');
  const [openCrearDocumento, setOpenCrearDocumento] = React.useState(false);
  const [openEditarDocumento, setOpenEditarDocumento] = React.useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = React.useState<Documento | null>(null);
  const [openConfirmacionEliminar, setOpenConfirmacionEliminar] = React.useState(false);
  const [documentoAEliminar, setDocumentoAEliminar] = React.useState<Documento | null>(null);
  const [eliminando, setEliminando] = React.useState(false);

  React.useEffect(() => {
    loadDocumentos();
    loadEstadisticas();
  }, [empleadoId, token]);

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDocumentosByEmpleado(empleadoId, token);
      // requestJSON já desenrola a resposta, então response já é o array
      setDocumentos(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error('Error loading documentos:', err);
      // Si el endpoint no existe, usar datos mock para desarrollo
      if (err.status === 404) {
        console.log('Endpoint no implementado, usando datos mock');
        setDocumentos([]);
        setError(null);
      } else {
        setError(err.message || 'No se pudieron cargar los documentos');
        setDocumentos([]); // Asegurar que siempre sea un array
        toast({
          type: 'error',
          title: 'Error al cargar documentos',
          description: 'No se pudieron obtener los documentos del empleado.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentoCreado = (tipoDocumento?: string) => {
    setOpenCrearDocumento(false);
    
    if (tipoDocumento === 'CONTRATO_LABORAL') {
      toast({
        type: 'success',
        title: 'Documento y Contrato creados',
        description: 'El documento de contrato laboral se subió correctamente y se creó automáticamente un contrato en el sistema.'
      });
    } else {
      toast({
        type: 'success',
        title: 'Documento creado',
        description: 'El documento se subió correctamente.'
      });
    }
    
    // Refrescar lista y estadísticas al crear
    loadDocumentos();
    loadEstadisticas();
  };

  const handleEditarDocumento = (documento: Documento) => {
    setDocumentoSeleccionado(documento);
    setOpenEditarDocumento(true);
  };

  const handleDocumentoActualizado = () => {
    setOpenEditarDocumento(false);
    setDocumentoSeleccionado(null);
    toast({
      type: 'success',
      title: 'Documento actualizado',
      description: 'Los cambios se guardaron correctamente.'
    });
    // Refrescar lista y estadísticas al actualizar
    loadDocumentos();
    loadEstadisticas();
  };

  const handleEliminarDocumento = (documento: Documento) => {
    setDocumentoAEliminar(documento);
    setOpenConfirmacionEliminar(true);
  };

  const confirmarEliminacion = async () => {
    if (!documentoAEliminar) return;

    try {
      setEliminando(true);
      await deleteDocumento(documentoAEliminar._id, token);
      toast({
        type: 'success',
        title: 'Documento eliminado',
        description: 'El documento se eliminó correctamente.'
      });
      // Refrescar lista y estadísticas al eliminar
      loadDocumentos();
      loadEstadisticas();
      // Cerrar modal y limpiar estado
      setOpenConfirmacionEliminar(false);
      setDocumentoAEliminar(null);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Error al eliminar',
        description: err?.message || 'No se pudo eliminar el documento'
      });
    } finally {
      setEliminando(false);
    }
  };

  const cancelarEliminacion = () => {
    setOpenConfirmacionEliminar(false);
    setDocumentoAEliminar(null);
    setEliminando(false);
  };

  const loadEstadisticas = async () => {
    try {
      const response = await getEstadisticasDocumentos(empleadoId, token);
      // requestJSON já desenrola a resposta, então response já é o objeto de estatísticas
      setEstadisticas(response);
    } catch (err: any) {
      console.error('Error loading estadísticas:', err);
      // Si el endpoint no existe, usar datos mock para desarrollo
      if (err.status === 404) {
        console.log('Endpoint de estadísticas no implementado, usando datos mock');
        setEstadisticas({
          total: 0,
          porEstado: {},
          porTipo: {},
          proximosAVencer: 0,
          vencidos: 0
        });
      }
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'RECHAZADO':
        return <XCircle size={16} className="text-red-500" />;
      case 'PENDIENTE':
        return <Clock size={16} className="text-yellow-500" />;
      case 'VENCIDO':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'RENOVADO':
        return <FileText size={16} className="text-blue-500" />;
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
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'VENCIDO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'RENOVADO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'CEDULA_IDENTIDAD':
      case 'RUT':
        return <User size={16} className="text-blue-500" />;
      case 'DIPLOMA':
      case 'CERTIFICADO_ACADEMICO':
        return <FileText size={16} className="text-green-500" />;
      case 'CERTIFICADO_LABORAL':
      case 'CERTIFICADO_MEDICO':
      case 'CERTIFICADO_PENALES':
      case 'CERTIFICADO_POLICIA':
        return <File size={16} className="text-orange-500" />;
      case 'CONTRATO_LABORAL':
        return <FileText size={16} className="text-purple-500" />;
      case 'HOJA_VIDA':
        return <FileText size={16} className="text-indigo-500" />;
      case 'FOTO_PERFIL':
        return <Image size={16} className="text-pink-500" />;
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };

  const formatTipoDocumento = (tipo: string) => {
    return tipo.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Asegurar que documentos siempre sea un array
  const documentosSeguros = Array.isArray(documentos) ? documentos : [];
  
  const documentosFiltrados = documentosSeguros.filter(doc => {
    if (filtroTipo && doc.tipoDocumento !== filtroTipo) return false;
    if (filtroEstado && doc.estado !== filtroEstado) return false;
    return true;
  });

  const handleVer = (doc: Documento) => {
    // Si es imagen o PDF, podemos abrir directamente la URL almacenada
    const url = typeof doc === 'object' ? (doc as any).urlArchivo || '' : '';
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    // Fallback: intentar descargar para ver
    handleDescargar(doc);
  };

  const handleDescargar = async (doc: Documento) => {
    try {
      const resp = await descargarDocumento(doc._id, token);
      // requestJSON já desenrola a resposta, então resp já é o objeto de dados
      const url = resp.url;
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nombreOriginal || doc.nombre || 'documento';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        throw new Error('No se recibió URL de descarga');
      }
    } catch (e: any) {
      toast({ type: 'error', title: 'Descarga fallida', description: e?.message || 'No se pudo descargar el documento' });
    }
  };

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
            Cargando documentos...
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
          Error al cargar documentos
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {error}
        </p>
        <Button variant="primary" onClick={loadDocumentos}>
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
            Documentos del Empleado
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {documentosSeguros.length} documento{documentosSeguros.length !== 1 ? 's' : ''} registrado{documentosSeguros.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button type="button" variant="secondary" className="px-3 py-2 text-sm w-full sm:w-auto">
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            className="px-3 py-2 text-sm w-full sm:w-auto"
            onClick={() => setOpenCrearDocumento(true)}
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Subir Documento</span>
            <span className="sm:hidden">Subir</span>
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
                  Pendientes
                </p>
                <p className={`text-lg sm:text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {estadisticas.porEstado.PENDIENTE || 0}
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

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <label className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Tipo:
          </label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className={`px-3 py-1 rounded-md border text-sm w-full sm:w-auto ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Todos</option>
            <option value="CEDULA_IDENTIDAD">Cédula de Identidad</option>
            <option value="RUT">RUT</option>
            <option value="DIPLOMA">Diploma</option>
            <option value="CERTIFICADO_ACADEMICO">Certificado Académico</option>
            <option value="CERTIFICADO_LABORAL">Certificado Laboral</option>
            <option value="CERTIFICADO_MEDICO">Certificado Médico</option>
            <option value="CERTIFICADO_PENALES">Certificado Penales</option>
            <option value="CERTIFICADO_POLICIA">Certificado Policía</option>
            <option value="CONTRATO_LABORAL">Contrato Laboral</option>
            <option value="HOJA_VIDA">Hoja de Vida</option>
            <option value="FOTO_PERFIL">Foto de Perfil</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

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
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="VENCIDO">Vencido</option>
            <option value="RENOVADO">Renovado</option>
          </select>
        </div>
      </div>

      {/* Lista de documentos */}
      {documentosFiltrados.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <FileText size={20} className={`sm:w-6 sm:h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            No hay documentos
          </h3>
          <p className={`text-sm mb-4 px-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {filtroTipo || filtroEstado 
              ? 'No hay documentos que coincidan con los filtros seleccionados'
              : 'Este empleado no tiene documentos registrados'
            }
          </p>
          <Button
            type="button"
            variant="primary"
            className="px-3 py-2 text-sm"
            onClick={() => setOpenCrearDocumento(true)}
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Subir Primer Documento</span>
            <span className="sm:hidden">Subir Documento</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {documentosFiltrados.map((documento) => (
            <div
              key={documento._id}
              className={`rounded-lg border p-4 sm:p-6 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {getTipoIcon(documento.tipoDocumento)}
                      <h4 className={`text-base sm:text-lg font-semibold truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {documento.nombre}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(documento.estado)}`}>
                        {getEstadoIcon(documento.estado)}
                        {documento.estado}
                      </span>
                      {documento.esConfidencial && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          <Shield size={12} />
                          Confidencial
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Tipo de Documento
                      </label>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatTipoDocumento(documento.tipoDocumento)}
                      </p>
                    </div>

                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Fecha de Emisión
                      </label>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatDate(documento.fechaEmision)}
                      </p>
                    </div>

                    {documento.fechaVencimiento && (
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Fecha de Vencimiento
                        </label>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatDate(documento.fechaVencimiento)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Tamaño del Archivo
                      </label>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatFileSize(documento.tamañoBytes)}
                      </p>
                    </div>

                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Formato
                      </label>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {documento.formato.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {documento.descripcion && (
                    <div className="mb-4">
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Descripción
                      </label>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {documento.descripcion}
                      </p>
                    </div>
                  )}

                  {documento.tags && documento.tags.length > 0 && (
                    <div className="mb-4">
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {documento.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              theme === 'dark' 
                                ? 'bg-blue-900/30 text-blue-400' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {documento.validacion?.observaciones && (
                    <div className="mb-4">
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Observaciones
                      </label>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {documento.validacion.observaciones}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                  <Button type="button" variant="secondary" className="px-3 py-2 text-sm" onClick={() => handleVer(documento)} title="Ver documento">
                    <Eye size={16} />
                    <span className="hidden sm:inline ml-1">Ver</span>
                  </Button>
                  <Button type="button" variant="secondary" className="px-3 py-2 text-sm" onClick={() => handleDescargar(documento)} title="Descargar documento">
                    <Download size={16} />
                    <span className="hidden sm:inline ml-1">Descargar</span>
                  </Button>
                  <Button type="button" variant="secondary" className="px-3 py-2 text-sm" onClick={() => handleEditarDocumento(documento)} title="Editar documento">
                    <Edit size={16} />
                    <span className="hidden sm:inline ml-1">Editar</span>
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                    onClick={() => handleEliminarDocumento(documento)} 
                    title="Eliminar documento"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline ml-1">Eliminar</span>
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
        onCreated={(docId) => {
          // No podemos obtener el tipo de documento aquí, pero podemos verificar si se creó un contrato
          // El mensaje se mostrará desde el backend o podemos hacer una verificación adicional
          handleDocumentoCreado();
        }}
      />

      {/* Modal para editar documento */}
      <EditarDocumentoModal
        isOpen={openEditarDocumento}
        onClose={() => {
          setOpenEditarDocumento(false);
          setDocumentoSeleccionado(null);
        }}
        documento={documentoSeleccionado}
        onUpdated={handleDocumentoActualizado}
      />

      {/* Modal de confirmación para eliminar documento */}
      <ConfirmationModal
        isOpen={openConfirmacionEliminar}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        title="Eliminar Documento"
        message={`¿Estás seguro de que quieres eliminar el documento "${documentoAEliminar?.nombre}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={eliminando}
        icon={<Trash2 size={24} />}
      />
    </div>
  );
}
