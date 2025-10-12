"use client";
import React, { useState } from 'react';
import { Button } from './Button';
import { Save, Download, Trash2, Settings, User, Plus, Check, X } from 'lucide-react';

export default function ButtonExamples() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Button Component - Ejemplos Mejorados</h1>
      
      {/* Estados Básicos */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Estados Básicos</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="neutral">Neutral</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      {/* Tamaños */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tamaños</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Estados de Loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Estados de Loading</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            loading={isLoading}
            loadingText="Guardando..."
            onClick={handleLoadingDemo}
            icon={<Save size={16} />}
          >
            Guardar
          </Button>
          
          <Button 
            loading={true}
            loadingText="Descargando..."
            variant="success"
            icon={<Download size={16} />}
          >
            Descargar
          </Button>
          
          <Button 
            loading={true}
            loadingSize="lg"
            variant="danger"
            icon={<Trash2 size={16} />}
          >
            Eliminar
          </Button>
        </div>
      </section>

      {/* Iconos */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Iconos</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            icon={<User size={16} />}
            iconPosition="left"
          >
            Usuario
          </Button>
          
          <Button 
            icon={<Settings size={16} />}
            iconPosition="right"
            variant="secondary"
          >
            Configuración
          </Button>
          
          <Button 
            icon={<Plus size={16} />}
            variant="success"
          >
            Agregar
          </Button>
        </div>
      </section>

      {/* Accesibilidad Avanzada */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Accesibilidad Avanzada</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            ariaLabel="Botón de confirmación con descripción adicional"
            ariaDescribedBy="button-description"
            variant="success"
            icon={<Check size={16} />}
          >
            Confirmar
          </Button>
          
          <Button 
            ariaPressed={isPressed}
            onClick={() => setIsPressed(!isPressed)}
            variant={isPressed ? "primary" : "secondary"}
            icon={<Check size={16} />}
          >
            {isPressed ? "Activo" : "Inactivo"}
          </Button>
          
          <Button 
            ariaExpanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            variant="neutral"
            icon={<Settings size={16} />}
          >
            {isExpanded ? "Ocultar" : "Mostrar"} Opciones
          </Button>
        </div>
        <p id="button-description" className="text-sm text-gray-600 dark:text-gray-400">
          Este botón ejecuta una acción importante que requiere confirmación.
        </p>
      </section>

      {/* Manejo de Eventos Avanzado */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Manejo de Eventos Avanzado</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            preventMultipleClicks={true}
            onClick={() => alert("Solo se puede hacer click una vez")}
            variant="primary"
          >
            Un Solo Click
          </Button>
          
          <Button 
            debounceMs={1000}
            onClick={() => alert("Debounced click")}
            variant="secondary"
          >
            Debounced (1s)
          </Button>
          
          <Button 
            disabled={true}
            variant="neutral"
          >
            Deshabilitado
          </Button>
        </div>
      </section>

      {/* Responsividad */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Responsividad</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            responsive={true}
            full={false}
            variant="primary"
          >
            Responsive
          </Button>
          
          <Button 
            responsive={false}
            size="lg"
            variant="secondary"
          >
            Tamaño Fijo
          </Button>
          
          <Button 
            full={true}
            variant="success"
          >
            Ancho Completo
          </Button>
        </div>
      </section>

      {/* Combinaciones Complejas */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Combinaciones Complejas</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            loading={isLoading}
            loadingText="Procesando..."
            icon={<Save size={16} />}
            variant="primary"
            size="lg"
            full={false}
            ariaLabel="Guardar cambios importantes"
            preventMultipleClicks={true}
            onClick={handleLoadingDemo}
          >
            Guardar Cambios
          </Button>
          
          <Button 
            icon={<Trash2 size={16} />}
            iconPosition="right"
            variant="danger"
            size="sm"
            ariaLabel="Eliminar elemento permanentemente"
            ariaDescribedBy="delete-warning"
            onClick={() => alert("¿Estás seguro?")}
          >
            Eliminar
          </Button>
        </div>
        <p id="delete-warning" className="text-sm text-red-600 dark:text-red-400">
          ⚠️ Esta acción no se puede deshacer
        </p>
      </section>

      {/* Estados de Loading con Diferentes Tamaños */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading con Diferentes Tamaños</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button loading={true} loadingSize="xs" size="sm">XS Loader</Button>
          <Button loading={true} loadingSize="sm" size="md">SM Loader</Button>
          <Button loading={true} loadingSize="md" size="lg">MD Loader</Button>
          <Button loading={true} loadingSize="lg" size="lg">LG Loader</Button>
          <Button loading={true} loadingSize="xl" size="lg">XL Loader</Button>
        </div>
      </section>

      {/* Botones con Iconos y Loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Iconos + Loading</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            loading={true}
            icon={<Save size={16} />}
            loadingText="Guardando..."
            variant="primary"
          >
            Guardar
          </Button>
          
          <Button 
            loading={true}
            icon={<Download size={16} />}
            iconPosition="right"
            loadingText="Descargando..."
            variant="success"
          >
            Descargar
          </Button>
          
          <Button 
            loading={true}
            icon={<Settings size={16} />}
            loadingText="Configurando..."
            variant="secondary"
          >
            Configurar
          </Button>
        </div>
      </section>
    </div>
  );
}
