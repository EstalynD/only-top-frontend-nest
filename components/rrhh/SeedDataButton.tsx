"use client";
import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { seedDefaults } from '@/lib/service-rrhh/api';

interface Props {
  onSuccess: () => void;
  token: string;
}

export default function SeedDataButton({ onSuccess, token }: Props) {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSeedData = async () => {
    try {
      setLoading(true);
      // Ejecutar seeder real en el backend
      await seedDefaults(token);
      
      toast({
        type: 'success',
        title: 'Datos predefinidos cargados',
        description: 'Se han creado 5 áreas y 10 cargos predefinidos exitosamente.',
      });
      
      setShowConfirm(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error seeding data:', error);
      toast({
        type: 'error',
        title: 'Error al cargar datos',
        description: error.message || 'No se pudieron cargar los datos predefinidos.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        variant="success"
        className="flex items-center gap-2"
      >
        <Download size={16} />
        Cargar Predefinidos
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Cargar Datos Predefinidos"
        description={
          <div className="space-y-3">
            <p>
              Esta acción creará automáticamente las siguientes áreas y cargos predefinidos:
            </p>
            <div className="p-4 rounded-lg text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <div className="font-medium mb-2">Áreas a crear:</div>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Marketing (MKT)</strong> - Community Manager, Fotógrafo/Productor</li>
                <li>• <strong>Traffic (TRF)</strong> - Trafficker</li>
                <li>• <strong>Sales (SLS)</strong> - Chatter, Chatter Supernumerario, Team Leader</li>
                <li>• <strong>Recruitment (REC)</strong> - Sales Closer</li>
                <li>• <strong>Administrativo (ADM)</strong> - Manager, Manager Assistant</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              Los datos existentes no se verán afectados. Solo se crearán nuevos elementos.
            </p>
          </div>
        }
        confirmLabel="Cargar Datos"
        severity="info"
        icon={<CheckCircle2 size={20} style={{ color: 'var(--ot-blue-500)' }} />}
        loading={loading}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleSeedData}
      />
    </>
  );
}
