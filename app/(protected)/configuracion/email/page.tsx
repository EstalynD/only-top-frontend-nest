"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { 
  getEmailConfig, 
  saveEmailConfig, 
  verifyEmailConfig, 
  getEmailEnabled, 
  setEmailEnabled, 
  testEmail as testEmailApi 
} from '@/lib/service-sistema/email.api';
import type { EmailConfig, EmailConfigRequest } from '@/lib/service-sistema/email.api';
import { 
  Mail, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Send,
  Eye,
  EyeOff,
  Shield,
  Server
} from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function EmailConfigPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  // Estados
  const [config, setConfig] = React.useState<EmailConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Formulario
  const [form, setForm] = React.useState<EmailConfigRequest>({
    provider: 'brevo-smtp',
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    authUser: '',
    authPass: '',
    from: '',
    fromName: '',
    replyTo: '',
    enabled: false,
  });

  const [testEmailAddress, setTestEmailAddress] = React.useState('');

  // Cargar configuración inicial
  React.useEffect(() => {
    if (!token) return;
    
    const loadConfig = async () => {
      try {
        const [configRes, enabledRes] = await Promise.all([
          getEmailConfig(token),
          getEmailEnabled(token)
        ]);
        
        if (configRes) {
          setConfig(configRes);
          setForm({
            provider: configRes.provider,
            host: configRes.host,
            port: configRes.port,
            secure: configRes.secure,
            authUser: configRes.authUser,
            authPass: configRes.authPass, // This will be masked
            from: configRes.from,
            fromName: configRes.fromName || '',
            replyTo: configRes.replyTo || '',
            enabled: enabledRes.enabled,
          });
        }
      } catch (error) {
        toast({
          type: 'error',
          title: 'Error al cargar configuración',
          description: error instanceof Error ? error.message : 'Error desconocido'
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [token, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      const savedConfig = await saveEmailConfig(token, form);
      setConfig(savedConfig);
      
      toast({
        type: 'success',
        title: 'Configuración guardada',
        description: 'La configuración de email se ha guardado exitosamente'
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!token) return;

    setVerifying(true);
    try {
      const result = await verifyEmailConfig(token);
      
      if (result.ok) {
        toast({
          type: 'success',
          title: 'Verificación exitosa',
          description: 'La configuración de email es válida'
        });
      } else {
        toast({
          type: 'error',
          title: 'Verificación fallida',
          description: result.error || 'Error de verificación'
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error de verificación',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleToggleEnabled = async () => {
    if (!token) return;

    try {
      const result = await setEmailEnabled(token, !form.enabled);
      setForm(prev => ({ ...prev, enabled: result.enabled }));
      
      toast({
        type: 'success',
        title: result.enabled ? 'Email habilitado' : 'Email deshabilitado',
        description: `El servicio de email ha sido ${result.enabled ? 'habilitado' : 'deshabilitado'}`
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al cambiar estado',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  const handleTestEmail = async () => {
    if (!token || !testEmailAddress) return;

    setTesting(true);
    try {
      const result = await testEmailApi(token, { to: testEmailAddress });
      
      toast({
        type: 'success',
        title: 'Email enviado',
        description: `Email de prueba enviado a ${testEmailAddress}. ID: ${result.id}`
      });
      
      setTestEmailAddress('');
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al enviar email',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" label="Cargando configuración de email..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Configuración de Email
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Configura el servicio de email usando Brevo SMTP para envío de notificaciones del sistema.
        </p>
      </div>

      {/* Estado del servicio */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${form.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                {form.enabled ? (
                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                ) : (
                  <XCircle size={20} style={{ color: '#6b7280' }} />
                )}
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Estado del Servicio
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {form.enabled ? 'Email habilitado y funcionando' : 'Email deshabilitado'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleToggleEnabled}
              variant={form.enabled ? 'danger' : 'success'}
              className="px-4 py-2 w-full sm:w-auto justify-center"
            >
              {form.enabled ? 'Deshabilitar' : 'Habilitar'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Configuración SMTP */}
      <Card>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Server size={20} style={{ color: 'var(--ot-blue-500)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Configuración SMTP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Host SMTP"
              value={form.host}
              onChange={(e) => setForm(prev => ({ ...prev, host: e.target.value }))}
              placeholder="smtp-relay.brevo.com"
              required
            />
            
            <Input
              label="Puerto"
              type="number"
              value={form.port?.toString() || ''}
              onChange={(e) => setForm(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
              placeholder="587"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Usuario SMTP / Login"
              value={form.authUser}
              onChange={(e) => setForm(prev => ({ ...prev, authUser: e.target.value }))}
              placeholder="tu-email@dominio.com"
              required
            />
            
            <div className="relative">
              <Input
                label="Password / API Key"
                type={showPassword ? 'text' : 'password'}
                value={form.authPass}
                onChange={(e) => setForm(prev => ({ ...prev, authPass: e.target.value }))}
                placeholder="Tu clave SMTP de Brevo"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.secure || false}
                onChange={(e) => setForm(prev => ({ ...prev, secure: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Conexión segura (SSL/TLS)
              </span>
            </label>
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />

          <div className="space-y-4">
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Configuración del remitente
            </h3>
            
            <Input
              label="Email remitente (From)"
              type="email"
              value={form.from}
              onChange={(e) => setForm(prev => ({ ...prev, from: e.target.value }))}
              placeholder="noreply@tudominio.com"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del remitente (opcional)"
                value={form.fromName || ''}
                onChange={(e) => setForm(prev => ({ ...prev, fromName: e.target.value }))}
                placeholder="OnlyTop System"
              />
              
              <Input
                label="Reply-To (opcional)"
                type="email"
                value={form.replyTo || ''}
                onChange={(e) => setForm(prev => ({ ...prev, replyTo: e.target.value }))}
                placeholder="support@tudominio.com"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button
              type="button"
              onClick={handleVerify}
              disabled={verifying || !form.authUser || !form.authPass}
              variant="neutral"
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Shield size={16} />
              {verifying ? 'Verificando...' : 'Verificar Conexión'}
            </Button>
            
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Settings size={16} />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Prueba de email */}
      {config && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Send size={20} style={{ color: 'var(--ot-blue-500)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Prueba de Email
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="flex-1 w-full">
                <Input
                  label="Email de prueba"
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="test@ejemplo.com"
                />
              </div>
              <Button
                onClick={handleTestEmail}
                disabled={testing || !testEmailAddress || !form.enabled}
                className="flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Mail size={16} />
                {testing ? 'Enviando...' : 'Enviar Prueba'}
              </Button>
            </div>
            
            {!form.enabled && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Habilita el servicio de email para enviar pruebas
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
