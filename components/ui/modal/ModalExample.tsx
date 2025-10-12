"use client";
import React, { useState } from 'react';
import { Button } from '../Button';
import Modal from '../Modal';
import { useModal } from '@/lib/hooks/useModal';
import { useLazyModal } from '@/lib/hooks/useLazyModal';
import { User, Settings, AlertCircle } from 'lucide-react';

export default function ModalExample() {
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  
  // Ejemplo básico
  const basicModal = useModal();
  
  // Ejemplo con lazy loading
  const lazyModal = useModal();
  const lazyContent = useLazyModal({ delay: 1000 });
  
  // Ejemplo con loading
  const loadingModal = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const handleLazyModalOpen = () => {
    lazyModal.openModal();
    lazyContent.loadContent();
  };

  const handleLoadingModalOpen = () => {
    loadingModal.openModal();
    setIsLoading(true);
    
    // Simular carga
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Ejemplos de Modal Mejorado</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Modal Básico */}
        <Button onClick={basicModal.openModal} className="flex items-center gap-2">
          <User size={16} />
          Modal Básico
        </Button>

        {/* Modal con Lazy Loading */}
        <Button onClick={handleLazyModalOpen} className="flex items-center gap-2">
          <Settings size={16} />
          Modal Lazy Loading
        </Button>

        {/* Modal con Loading */}
        <Button onClick={handleLoadingModalOpen} className="flex items-center gap-2">
          <AlertCircle size={16} />
          Modal con Loading
        </Button>
      </div>

      {/* Modal Básico */}
      <Modal
        isOpen={basicModal.isOpen}
        onClose={basicModal.closeModal}
        title="Modal Básico"
        icon={<User size={20} />}
        description="Este es un ejemplo de modal básico con todas las mejoras implementadas."
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={basicModal.closeModal}>
              Cancelar
            </Button>
            <Button onClick={basicModal.closeModal}>
              Confirmar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p>Este modal incluye:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>✅ Accesibilidad completa (ARIA, focus trap)</li>
            <li>✅ Animaciones suaves con Framer Motion</li>
            <li>✅ React Portal para renderizado óptimo</li>
            <li>✅ Gestión de teclado (Escape, Tab)</li>
            <li>✅ Prevención de scroll del body</li>
            <li>✅ Componentes modulares y reutilizables</li>
            <li>🚀 <strong>Cierre optimizado sin demoras</strong></li>
            <li>🚀 <strong>Transiciones más fluidas</strong></li>
          </ul>
        </div>
      </Modal>

      {/* Modal con Lazy Loading */}
      <Modal
        isOpen={lazyModal.isOpen}
        onClose={lazyModal.closeModal}
        title="Modal con Lazy Loading"
        icon={<Settings size={20} />}
        description="Este modal carga su contenido de forma diferida para mejor performance."
        isLoading={lazyContent.isLoading}
        loadingComponent={
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-500">Cargando contenido...</p>
          </div>
        }
        footer={
          <Button onClick={lazyModal.closeModal}>
            Cerrar
          </Button>
        }
      >
        {lazyContent.isLoaded && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contenido Cargado</h3>
            <p>Este contenido se cargó de forma diferida para optimizar el rendimiento inicial.</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm">El lazy loading es especialmente útil para:</p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Componentes pesados</li>
                <li>Datos que requieren tiempo de carga</li>
                <li>Mejorar el tiempo de carga inicial</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal con Loading */}
      <Modal
        isOpen={loadingModal.isOpen}
        onClose={loadingModal.closeModal}
        title="Modal con Loading"
        icon={<AlertCircle size={20} />}
        description="Este modal muestra un estado de carga mientras procesa información."
        isLoading={isLoading}
        footer={
          <Button 
            onClick={loadingModal.closeModal}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Cerrar'}
          </Button>
        }
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Procesamiento de Datos</h3>
          <p>Este modal simula el procesamiento de datos importantes.</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm">
              Los indicadores de carga mejoran la percepción de rendimiento 
              y mantienen al usuario informado sobre el estado de la aplicación.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
