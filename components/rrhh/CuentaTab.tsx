"use client";
import React from 'react';
import { 
  User, 
  UserPlus, 
  Key, 
  Mail, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/lib/theme';
import { crearCuentaParaEmpleado, resetPasswordEmpleado } from '@/lib/service-rrhh/empleados-api';
import type { UserProfile } from '@/lib/service-user/types';

interface Props {
  empleadoId: string;
  token: string;
  empleadoNombre: string;
  hasUserAccount: boolean;
  userAccount?: {
    id: string;
    username: string;
    email: string | null;
  } | null;
  userProfile: UserProfile | null;
  onAccountCreated?: () => void;
  onOpenCreateModal?: () => void;
  onOpenResetModal?: () => void;
  onOpenEditModal?: () => void;
}

interface CuentaInfo {
  username: string;
  password: string;
  email: string;
}

export default function CuentaTab({ 
  empleadoId, 
  token, 
  empleadoNombre, 
  hasUserAccount, 
  userAccount, 
  userProfile,
  onAccountCreated,
  onOpenCreateModal,
  onOpenResetModal,
  onOpenEditModal
}: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [nuevaCuenta, setNuevaCuenta] = React.useState<CuentaInfo | null>(null);

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    return userProfile.permissions.includes(permission);
  };

  const canManageAccounts = hasPermission('sistema.empleados.crear_cuenta') || 
                           hasPermission('system.admin') ||
                           hasPermission('rrhh:empleados:update');

  const handleCrearCuenta = () => {
    if (!canManageAccounts) {
      toast({
        type: 'error',
        title: 'Sin permisos',
        description: 'No tienes permisos para crear cuentas de empleados.',
      });
      return;
    }
    if (onOpenCreateModal) {
      onOpenCreateModal();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        type: 'success',
        title: 'Copiado',
        description: `${label} copiado al portapapeles.`,
      });
    }).catch(() => {
      toast({
        type: 'error',
        title: 'Error',
        description: 'No se pudo copiar al portapapeles.',
      });
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!canManageAccounts) {
    return (
      <div className="text-center py-12">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'
        }`}>
          <Shield size={24} className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'} />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Sin permisos
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          No tienes permisos para gestionar cuentas de empleados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-lg border p-6 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <User size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Gestión de Cuenta de Usuario
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Administra la cuenta de usuario del empleado
            </p>
          </div>
        </div>

        {/* Estado de la cuenta */}
        <div className="flex items-center gap-3 mb-6">
          {hasUserAccount ? (
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                Cuenta activa
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-500" />
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                Sin cuenta de usuario
              </span>
            </div>
          )}
        </div>

        {/* Información de la cuenta existente */}
        {hasUserAccount && userAccount && (
          <div className={`rounded-lg border p-4 mb-6 ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`text-base font-semibold mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <User size={16} />
              Información de la Cuenta
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Nombre de Usuario
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-sm font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {userAccount.username}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(userAccount.username, 'Nombre de usuario')}
                    className="p-1 h-6 w-6"
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Correo Electrónico
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {userAccount.email || 'No especificado'}
                  </p>
                  {userAccount.email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(userAccount.email!, 'Correo electrónico')}
                      className="p-1 h-6 w-6"
                    >
                      <Copy size={12} />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  ID de Usuario
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-sm font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {userAccount.id}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(userAccount.id, 'ID de usuario')}
                    className="p-1 h-6 w-6"
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nueva cuenta creada */}
        {nuevaCuenta && (
          <div className={`rounded-lg border p-4 mb-6 ${
            theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
          }`}>
            <h4 className={`text-base font-semibold mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-700'
            }`}>
              <CheckCircle size={16} />
              Cuenta Creada Exitosamente
            </h4>
            <div className="space-y-3">
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Nombre de Usuario
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-sm font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {nuevaCuenta.username}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(nuevaCuenta.username, 'Nombre de usuario')}
                    className="p-1 h-6 w-6"
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Contraseña Temporal
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-sm font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {showPassword ? nuevaCuenta.password : '••••••••••••'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 h-6 w-6"
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(nuevaCuenta.password, 'Contraseña')}
                    className="p-1 h-6 w-6"
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Correo Electrónico
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {nuevaCuenta.email}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(nuevaCuenta.email, 'Correo electrónico')}
                    className="p-1 h-6 w-6"
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg ${
              theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className={`mt-0.5 ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
                  }`}>
                    Importante
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'
                  }`}>
                    Guarda esta información de forma segura. La contraseña temporal debe ser cambiada en el primer inicio de sesión.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!hasUserAccount && (
            <Button
              variant="primary"
              onClick={handleCrearCuenta}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Crear Cuenta de Usuario
                </>
              )}
            </Button>
          )}

          {hasUserAccount && (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => {
                  if (onOpenResetModal) {
                    onOpenResetModal();
                  }
                }}
              >
                <Key size={16} />
                Resetear Contraseña
              </Button>
              
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => {
                  if (onOpenEditModal) {
                    onOpenEditModal();
                  }
                }}
              >
                <Mail size={16} />
                Editar Cuenta
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className={`rounded-lg border p-6 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h4 className={`text-base font-semibold mb-3 flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <Shield size={16} />
          Información de Seguridad
        </h4>
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <strong>Permisos:</strong> Los permisos de la cuenta se asignan automáticamente según el cargo y área del empleado.
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-green-300' : 'text-green-700'
            }`}>
              <strong>Seguridad:</strong> Las contraseñas se generan de forma segura y deben ser cambiadas en el primer inicio de sesión.
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              <strong>Acceso:</strong> El empleado podrá acceder al sistema usando su nombre de usuario y la contraseña temporal proporcionada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
