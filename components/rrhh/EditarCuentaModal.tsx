"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/lib/theme';
import { editarCuentaEmpleado } from '@/lib/service-rrhh/empleados-api';
import { Edit, CheckCircle, AlertCircle } from 'lucide-react';
import Loader from '@/components/ui/Loader';

interface EditarCuentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleadoId: string;
  empleadoNombre: string;
  token: string;
  currentAccount: {
    id: string;
    username: string;
    email: string | null;
  };
  onSuccess?: () => void;
}

export default function EditarCuentaModal({
  isOpen,
  onClose,
  empleadoId,
  empleadoNombre,
  token,
  currentAccount,
  onSuccess
}: EditarCuentaModalProps) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    username: currentAccount.username,
    email: currentAccount.email || '',
    displayName: empleadoNombre
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        username: currentAccount.username,
        email: currentAccount.email || '',
        displayName: empleadoNombre
      });
      setErrors({});
    }
  }, [isOpen, currentAccount, empleadoNombre]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      newErrors.username = 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre para mostrar es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updateData: { username?: string; email?: string; displayName?: string } = {};
      
      // Solo incluir campos que han cambiado
      if (formData.username !== currentAccount.username) {
        updateData.username = formData.username;
      }
      if (formData.email !== (currentAccount.email || '')) {
        updateData.email = formData.email;
      }
      if (formData.displayName !== empleadoNombre) {
        updateData.displayName = formData.displayName;
      }

      // Si no hay cambios, mostrar mensaje
      if (Object.keys(updateData).length === 0) {
        toast({
          type: 'info',
          title: 'Sin cambios',
          description: 'No se detectaron cambios en la información de la cuenta'
        });
        onClose();
        return;
      }

      await editarCuentaEmpleado(empleadoId, updateData, token);
      
      toast({
        type: 'success',
        title: 'Cuenta actualizada exitosamente',
        description: 'La información de la cuenta ha sido actualizada'
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al actualizar cuenta',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: currentAccount.username,
      email: currentAccount.email || '',
      displayName: empleadoNombre
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Cuenta de Usuario"
      icon={<Edit size={20} className="text-blue-600 dark:text-blue-400" />}
      maxWidth="lg"
    >
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Información del empleado */}
          <div className={`p-4 rounded-lg border-l-4 ${
            theme === 'dark' 
              ? 'bg-blue-900/20 border-blue-500' 
              : 'bg-blue-50 border-blue-500'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Editando cuenta de:
            </p>
            <p className={`text-base font-semibold mt-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {empleadoNombre}
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Nombre de Usuario *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.username
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Ingresa el nombre de usuario"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Ingresa el correo electrónico"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Nombre para Mostrar *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.displayName
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Ingresa el nombre para mostrar"
              />
              {errors.displayName && (
                <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
              )}
            </div>
          </div>

          {/* Advertencia */}
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
                <strong>Importante:</strong> Los cambios en el nombre de usuario y correo electrónico pueden afectar el acceso del empleado al sistema. Asegúrate de comunicar estos cambios al empleado.
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
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader size="sm" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Actualizar Cuenta
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
