"use client";
import React from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import Modal from '../ui/Modal';
import Loader from '../ui/Loader';
import { useAuth } from '@/lib/auth';
import { importSalesFromExcel } from '@/lib/service-chatter/api';
import { addToast } from '../ui/Toast';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportExcelModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportExcelModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [result, setResult] = React.useState<{
    exitosas: number;
    fallidas: number;
    errores: Array<{ fila: number; mensaje: string }>;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validar tipo de archivo
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      addToast({
        type: 'error',
        title: 'Archivo inválido',
        description: 'Por favor selecciona un archivo Excel (.xlsx o .xls)',
      });
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Archivo muy grande',
        description: 'El archivo no debe superar 10MB',
      });
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !token) return;

    try {
      setLoading(true);
      const importResult = await importSalesFromExcel(token, file);
      
      setResult(importResult);
      
      if (importResult.exitosas > 0) {
        addToast({
          type: 'success',
          title: 'Importación completada',
          description: `${importResult.exitosas} ventas registradas exitosamente`,
        });
        
        if (importResult.fallidas === 0) {
          // Si todas fueron exitosas, cerrar modal y recargar
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 1500);
        }
      } else {
        addToast({
          type: 'error',
          title: 'Importación fallida',
          description: 'No se pudo registrar ninguna venta',
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error al importar',
        description: error.message || 'Ocurrió un error al procesar el archivo',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setDragActive(false);
    onClose();
  };

  const containerStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  };

  const dragAreaStyle: React.CSSProperties = {
    border: `2px dashed ${dragActive ? 'var(--ot-blue-500)' : 'var(--border)'}`,
    borderRadius: '0.75rem',
    padding: '3rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: dragActive ? 'var(--surface-muted)' : 'transparent',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Ventas desde Excel"
      icon={<Upload size={20} style={{ color: 'var(--ot-blue-500)' }} />}
      maxWidth="max-w-3xl"
    >
      <div className="p-6 space-y-6">
        {/* Área de carga de archivo */}
        {!result && (
          <div
            style={dragAreaStyle}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />

            <FileSpreadsheet
              size={48}
              className="mx-auto mb-4"
              style={{ color: 'var(--ot-blue-500)', opacity: 0.6 }}
            />

            {file ? (
              <div>
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {file.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-3 text-sm px-4 py-2 rounded-lg"
                  style={{
                    background: 'var(--surface-muted)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Cambiar archivo
                </button>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Arrastra tu archivo Excel aquí
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  o haz clic para seleccionar un archivo
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Formatos soportados: .xlsx, .xls (máximo 10MB)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Resultado de importación */}
        {result && (
          <div style={containerStyle} className="space-y-4">
            <div className="flex items-start gap-3">
              {result.exitosas > 0 ? (
                <CheckCircle size={24} style={{ color: '#10b981', flexShrink: 0 }} />
              ) : (
                <AlertCircle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                  Resultado de la Importación
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ background: 'var(--surface-muted)', border: '1px solid #10b981' }}
                  >
                    <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                      {result.exitosas}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Ventas exitosas
                    </div>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ background: 'var(--surface-muted)', border: '1px solid #ef4444' }}
                  >
                    <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                      {result.fallidas}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Ventas fallidas
                    </div>
                  </div>
                </div>

                {result.errores.length > 0 && (
                  <div>
                    <h4
                      className="font-medium mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Errores encontrados:
                    </h4>
                    <div
                      className="max-h-60 overflow-y-auto space-y-2 p-3 rounded"
                      style={{ background: 'var(--surface-muted)' }}
                    >
                      {result.errores.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-2 rounded"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                        >
                          <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                          <div className="flex-1 text-sm">
                            <span className="font-semibold" style={{ color: '#ef4444' }}>
                              Fila {error.fila}:
                            </span>{' '}
                            <span style={{ color: 'var(--text-primary)' }}>
                              {error.mensaje}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Información de ayuda */}
        {!result && (
          <div
            className="p-4 rounded-lg space-y-2"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={18} style={{ color: 'var(--ot-blue-500)', flexShrink: 0, marginTop: 2 }} />
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                <strong>Importante:</strong>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>Descarga la plantilla Excel antes de importar</li>
                  <li>Asegúrate de que todos los IDs sean válidos</li>
                  <li>Los chatters deben estar asignados a las modelos correspondientes</li>
                  <li>La primera fila debe contener los encabezados</li>
                  <li>La segunda fila es un ejemplo y será ignorada</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <X size={16} className="inline mr-2" />
            {result ? 'Cerrar' : 'Cancelar'}
          </button>
          {!result && file && (
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--ot-blue-500)',
                color: 'white',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <Loader size="sm" />
              ) : (
                <>
                  <Upload size={16} className="inline mr-2" />
                  Importar Ventas
                </>
              )}
            </button>
          )}
          {result && result.exitosas > 0 && (
            <button
              type="button"
              onClick={() => {
                onSuccess();
                handleClose();
              }}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: '#10b981',
                color: 'white',
              }}
            >
              <CheckCircle size={16} className="inline mr-2" />
              Finalizar
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
