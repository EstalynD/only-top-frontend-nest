"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/lib/theme';
import { resetPasswordEmpleado } from '@/lib/service-rrhh/empleados-api';
import { Key, Copy, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Loader from '@/components/ui/Loader';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleadoId: string;
  empleadoNombre: string;
  token: string;
  onSuccess?: () => void;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  empleadoId,
  empleadoNombre,
  token,
  onSuccess
}: ResetPasswordModalProps) {
  const { toast } = useToast();
  const { theme } = useTheme();

  const [loading, setLoading] = React.useState(false);
  const [passwordReset, setPasswordReset] = React.useState<{ username: string; password: string; email: string } | null>(null);
  const [mostrarPassword, setMostrarPassword] = React.useState(false);
  const [copied, setCopied] = React.useState<'username' | 'password' | 'email' | null>(null);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const resultado = await resetPasswordEmpleado(empleadoId, token);
      setPasswordReset(resultado);
      toast({
        type: 'success',
        title: 'Contraseña reseteada exitosamente',
        description: `Se ha generado una nueva contraseña para ${empleadoNombre}`
      });
      // No llamar onSuccess aquí, mantener el modal abierto para mostrar la contraseña
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al resetear contraseña',
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
    setPasswordReset(null);
    setMostrarPassword(false);
    setCopied(null);
    // Si se cerró después de mostrar la contraseña, llamar onSuccess
    if (passwordReset) {
      onSuccess?.();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={passwordReset ? 'Contraseña Reseteada' : 'Resetear Contraseña'}
      icon={<Key size={20} className="text-orange-600 dark:text-orange-400" />}
      maxWidth="lg"
    >
      <div className="p-4 sm:p-6">
        {!passwordReset ? (
          /* Confirmación de reset */
          <div className="space-y-4">
            {/* Información del empleado */}
            <div className={`p-4 rounded-lg border-l-4 ${
              theme === 'dark' 
                ? 'bg-orange-900/20 border-orange-500' 
                : 'bg-orange-50 border-orange-500'
            }`}>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
              }`}>
                Se generará una nueva contraseña para:
              </p>
              <p className={`text-base font-semibold mt-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {empleadoNombre}
              </p>
            </div>

            {/* Advertencia importante */}
            <div className={`p-4 rounded-lg border-l-4 ${
              theme === 'dark' 
                ? 'bg-yellow-900/20 border-yellow-500' 
                : 'bg-yellow-50 border-yellow-500'
            }`}>
              <div className="flex gap-3">
                <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'
                }`}>
                  <strong>Importante:</strong> Se generará una nueva contraseña segura. La contraseña anterior quedará invalidada inmediatamente. Asegúrate de guardar la nueva contraseña de forma segura.
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                variant="neutral"
                onClick={handleClose}
                disabled={loading}
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                variant="secondary"
                onClick={handleResetPassword}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    Reseteando...
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    Resetear Contraseña
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Mostrar nueva contraseña */
          <div className="space-y-4">
            {/* Éxito */}
            <div className={`p-4 rounded-lg border-l-4 flex gap-3 ${
              theme === 'dark' 
                ? 'bg-green-900/20 border-green-500' 
                : 'bg-green-50 border-green-500'
            }`}>
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-green-200' : 'text-green-800'
                }`}>
                  Contraseña reseteada exitosamente
                </p>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-700'
                }`}>
                  Guarda la nueva contraseña de forma segura
                </p>
              </div>
            </div>

            {/* Usuario */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Usuario
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={passwordReset.username}
                  readOnly
                  className={`flex-1 px-3 py-2 text-sm font-mono rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
                <Button
                  variant={copied === 'username' ? 'success' : 'secondary'}
                  size="sm"
                  onClick={() => handleCopy(passwordReset.username, 'username')}
                  title="Copiar usuario"
                >
                  {copied === 'username' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Nueva Contraseña
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={passwordReset.password}
                    readOnly
                    className={`w-full px-3 py-2 pr-10 text-sm font-mono rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title={mostrarPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Button
                  variant={copied === 'password' ? 'success' : 'secondary'}
                  size="sm"
                  onClick={() => handleCopy(passwordReset.password, 'password')}
                  title="Copiar contraseña"
                >
                  {copied === 'password' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Correo Electrónico
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={passwordReset.email}
                  readOnly
                  className={`flex-1 px-3 py-2 text-sm font-mono rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
                <Button
                  variant={copied === 'email' ? 'success' : 'secondary'}
                  size="sm"
                  onClick={() => handleCopy(passwordReset.email, 'email')}
                  title="Copiar correo"
                >
                  {copied === 'email' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>

            {/* Advertencia final */}
            <div className={`p-4 rounded-lg border-l-4 ${
              theme === 'dark' 
                ? 'bg-red-900/20 border-red-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex gap-3">
                <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-800'
                }`}>
                  <strong>Advertencia:</strong> Esta es la única vez que se mostrará la nueva contraseña. La contraseña anterior ya no es válida. Guárdala de forma segura antes de cerrar esta ventana.
                </p>
              </div>
            </div>

            {/* Botón cerrar */}
            <div className="flex justify-end pt-4">
              <Button variant="primary" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
