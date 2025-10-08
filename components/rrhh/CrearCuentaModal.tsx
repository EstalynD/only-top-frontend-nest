"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { crearCuentaParaEmpleado, type CrearCuentaResponse } from '@/lib/service-rrhh/empleados.api';
import { UserPlus, Copy, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Loader from '@/components/ui/Loader';

interface CrearCuentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleadoId: string;
  empleadoNombre: string;
  token: string;
  onSuccess?: () => void;
}

export default function CrearCuentaModal({
  isOpen,
  onClose,
  empleadoId,
  empleadoNombre,
  token,
  onSuccess
}: CrearCuentaModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [cuentaCreada, setCuentaCreada] = React.useState<CrearCuentaResponse | null>(null);
  const [mostrarPassword, setMostrarPassword] = React.useState(false);
  const [copied, setCopied] = React.useState<'username' | 'password' | 'email' | null>(null);

  const handleCrearCuenta = async () => {
    setLoading(true);
    try {
      const resultado = await crearCuentaParaEmpleado(token, empleadoId);
      setCuentaCreada(resultado);
      toast({
        type: 'success',
        title: 'Cuenta creada exitosamente',
        description: `Se ha creado la cuenta para ${empleadoNombre}`
      });
      onSuccess?.();
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al crear cuenta',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, field: 'username' | 'password' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
      toast({
        type: 'success',
        title: 'Copiado',
        description: `${field === 'username' ? 'Usuario' : field === 'password' ? 'Contraseña' : 'Correo'} copiado al portapapeles`
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error',
        description: 'No se pudo copiar al portapapeles'
      });
    }
  };

  const handleClose = () => {
    setCuentaCreada(null);
    setMostrarPassword(false);
    setCopied(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={cuentaCreada ? 'Cuenta Creada' : 'Crear Cuenta de Usuario'}
      icon={<UserPlus size={20} style={{ color: 'var(--ot-blue-600)' }} />}
      maxWidth="max-w-lg"
    >
      <div style={{ padding: '1.5rem' }}>
        {!cuentaCreada ? (
          /* Confirmación de creación */
          <div className="space-y-4">
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--ot-blue-50)',
                borderLeft: '4px solid var(--ot-blue-500)',
                borderRadius: '0.375rem'
              }}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--ot-gray-700)' }}>
                Se creará una cuenta de usuario para:
              </p>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ot-gray-900)', marginTop: '0.5rem' }}>
                {empleadoNombre}
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--ot-yellow-50)',
                borderLeft: '4px solid var(--ot-yellow-500)',
                borderRadius: '0.375rem'
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <AlertCircle size={18} style={{ color: 'var(--ot-yellow-600)', flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem', color: 'var(--ot-gray-700)' }}>
                  <strong>Importante:</strong> Se generarán credenciales automáticamente. Asegúrate de guardarlas de forma segura, ya que la contraseña solo se mostrará una vez.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={handleClose}
                disabled={loading}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--ot-gray-700)',
                  backgroundColor: 'white',
                  border: '1px solid var(--ot-gray-300)',
                  borderRadius: '0.375rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancelar
              </button>
              <Button
                onClick={handleCrearCuenta}
                disabled={loading}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Mostrar credenciales */
          <div className="space-y-4">
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--ot-green-50)',
                borderLeft: '4px solid var(--ot-green-500)',
                borderRadius: '0.375rem',
                display: 'flex',
                gap: '0.5rem'
              }}
            >
              <CheckCircle size={20} style={{ color: 'var(--ot-green-600)', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ot-green-800)' }}>
                  Cuenta creada exitosamente
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--ot-green-700)', marginTop: '0.25rem' }}>
                  Guarda estas credenciales de forma segura
                </p>
              </div>
            </div>

            {/* Usuario */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ot-gray-700)', marginBottom: '0.5rem' }}>
                Usuario
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={cuentaCreada.username}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '0.625rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    backgroundColor: 'var(--ot-gray-50)',
                    border: '1px solid var(--ot-gray-300)',
                    borderRadius: '0.375rem',
                    color: 'var(--ot-gray-900)'
                  }}
                />
                <button
                  onClick={() => handleCopy(cuentaCreada.username, 'username')}
                  style={{
                    padding: '0.625rem',
                    backgroundColor: copied === 'username' ? 'var(--ot-green-100)' : 'var(--ot-gray-100)',
                    border: '1px solid var(--ot-gray-300)',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Copiar usuario"
                >
                  {copied === 'username' ? (
                    <CheckCircle size={18} style={{ color: 'var(--ot-green-600)' }} />
                  ) : (
                    <Copy size={18} style={{ color: 'var(--ot-gray-600)' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ot-gray-700)', marginBottom: '0.5rem' }}>
                Contraseña
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={cuentaCreada.password}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      paddingRight: '2.5rem',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      backgroundColor: 'var(--ot-gray-50)',
                      border: '1px solid var(--ot-gray-300)',
                      borderRadius: '0.375rem',
                      color: 'var(--ot-gray-900)'
                    }}
                  />
                  <button
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '0.25rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--ot-gray-500)'
                    }}
                    title={mostrarPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  onClick={() => handleCopy(cuentaCreada.password, 'password')}
                  style={{
                    padding: '0.625rem',
                    backgroundColor: copied === 'password' ? 'var(--ot-green-100)' : 'var(--ot-gray-100)',
                    border: '1px solid var(--ot-gray-300)',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Copiar contraseña"
                >
                  {copied === 'password' ? (
                    <CheckCircle size={18} style={{ color: 'var(--ot-green-600)' }} />
                  ) : (
                    <Copy size={18} style={{ color: 'var(--ot-gray-600)' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Correo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ot-gray-700)', marginBottom: '0.5rem' }}>
                Correo Electrónico
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={cuentaCreada.email}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '0.625rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    backgroundColor: 'var(--ot-gray-50)',
                    border: '1px solid var(--ot-gray-300)',
                    borderRadius: '0.375rem',
                    color: 'var(--ot-gray-900)'
                  }}
                />
                <button
                  onClick={() => handleCopy(cuentaCreada.email, 'email')}
                  style={{
                    padding: '0.625rem',
                    backgroundColor: copied === 'email' ? 'var(--ot-green-100)' : 'var(--ot-gray-100)',
                    border: '1px solid var(--ot-gray-300)',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Copiar correo"
                >
                  {copied === 'email' ? (
                    <CheckCircle size={18} style={{ color: 'var(--ot-green-600)' }} />
                  ) : (
                    <Copy size={18} style={{ color: 'var(--ot-gray-600)' }} />
                  )}
                </button>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--ot-red-50)',
                borderLeft: '4px solid var(--ot-red-500)',
                borderRadius: '0.375rem',
                marginTop: '1rem'
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <AlertCircle size={18} style={{ color: 'var(--ot-red-600)', flexShrink: 0, marginTop: '0.125rem' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--ot-red-800)' }}>
                  <strong>Advertencia:</strong> Esta es la única vez que se mostrará la contraseña. Guárdala de forma segura antes de cerrar esta ventana.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
