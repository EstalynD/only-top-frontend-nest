"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { CardSection } from '@/components/ui/Card';
import { 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Info,
  Code,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoaderExamples() {
  const [showCode, setShowCode] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleCode = (exampleId: string) => {
    setShowCode(prev => ({ ...prev, [exampleId]: !prev[exampleId] }));
  };

  const toggleLoading = (exampleId: string) => {
    setLoadingStates(prev => ({ ...prev, [exampleId]: !prev[exampleId] }));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const codeExamples = {
    basic: `<Loader />`,
    sizes: `<Loader size="xs" />
<Loader size="sm" />
<Loader size="md" />
<Loader size="lg" />
<Loader size="xl" />`,
    types: `<Loader type="spinner" />
<Loader type="dots" />
<Loader type="pulse" />
<Loader type="infinity" />
<Loader type="bars" />
<Loader type="ring" />`,
    variants: `<Loader variant="primary" />
<Loader variant="secondary" />
<Loader variant="accent" />
<Loader variant="success" />
<Loader variant="warning" />
<Loader variant="error" />`,
    states: `<Loader state="loading" />
<Loader state="success" text="Completado" showText />
<Loader state="error" text="Error" showText />`,
    withText: `<Loader text="Cargando datos..." showText />
<Loader text="Procesando..." showText centered />`,
    button: `<Button loading={true} loadingText="Guardando...">
  Guardar
</Button>`,
    custom: `<Loader 
  type="infinity"
  variant="primary"
  size="lg"
  text="Cargando..."
  showText
  centered
  className="my-4"
/>`
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">Loader Component</h1>
        <p className="text-muted-foreground">
          Componente de carga profesional con múltiples variantes, tamaños y estados.
        </p>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">React.memo</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">useMemo</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Accesible</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">TypeScript</span>
        </div>
      </div>

      {/* Basic Usage */}
      <CardSection 
        title="Uso Básico" 
        description="El componente Loader más simple con configuración por defecto."
        className="space-y-4"
      >
        <div className="flex items-center gap-4">
          <Loader />
          <span className="text-sm text-muted-foreground">Loader por defecto</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleCode('basic')}
          >
            {showCode.basic ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCode.basic ? 'Ocultar' : 'Mostrar'} código
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(codeExamples.basic)}
          >
            <Copy size={16} />
            Copiar
          </Button>
        </div>
        
        {showCode.basic && (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{codeExamples.basic}</code>
          </pre>
        )}
      </CardSection>

      {/* Sizes */}
      <CardSection 
        title="Tamaños" 
        description="Diferentes tamaños disponibles para el componente Loader."
        className="space-y-4"
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Loader size="xs" />
            <span className="text-xs text-muted-foreground">xs</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader size="sm" />
            <span className="text-xs text-muted-foreground">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader size="md" />
            <span className="text-xs text-muted-foreground">md</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader size="lg" />
            <span className="text-xs text-muted-foreground">lg</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader size="xl" />
            <span className="text-xs text-muted-foreground">xl</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleCode('sizes')}
          >
            {showCode.sizes ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCode.sizes ? 'Ocultar' : 'Mostrar'} código
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(codeExamples.sizes)}
          >
            <Copy size={16} />
            Copiar
          </Button>
        </div>
        
        {showCode.sizes && (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{codeExamples.sizes}</code>
          </pre>
        )}
      </CardSection>

      {/* Types */}
      <CardSection 
        title="Tipos de Animación" 
        description="Diferentes estilos de animación para el loader."
        className="space-y-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader type="spinner" />
            <span className="text-sm font-medium">Spinner</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader type="dots" />
            <span className="text-sm font-medium">Dots</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader type="pulse" />
            <span className="text-sm font-medium">Pulse</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader type="infinity" />
            <span className="text-sm font-medium">Infinity</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader type="bars" />
            <span className="text-sm font-medium">Bars</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader type="ring" />
            <span className="text-sm font-medium">Ring</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleCode('types')}
          >
            {showCode.types ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCode.types ? 'Ocultar' : 'Mostrar'} código
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(codeExamples.types)}
          >
            <Copy size={16} />
            Copiar
          </Button>
        </div>
        
        {showCode.types && (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{codeExamples.types}</code>
          </pre>
        )}
      </CardSection>

      {/* Variants */}
      <CardSection 
        title="Variantes de Color" 
        description="Diferentes colores y variantes para diferentes contextos."
        className="space-y-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader variant="primary" />
            <span className="text-sm font-medium">Primary</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader variant="secondary" />
            <span className="text-sm font-medium">Secondary</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader variant="accent" />
            <span className="text-sm font-medium">Accent</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader variant="success" />
            <span className="text-sm font-medium">Success</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader variant="warning" />
            <span className="text-sm font-medium">Warning</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <Loader variant="error" />
            <span className="text-sm font-medium">Error</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleCode('variants')}
          >
            {showCode.variants ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCode.variants ? 'Ocultar' : 'Mostrar'} código
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(codeExamples.variants)}
          >
            <Copy size={16} />
            Copiar
          </Button>
        </div>
        
        {showCode.variants && (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{codeExamples.variants}</code>
          </pre>
        )}
      </CardSection>

      {/* States */}
      <CardSection 
        title="Estados" 
        description="Diferentes estados del loader: cargando, éxito y error."
        className="space-y-4"
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Loader state="loading" />
            <span className="text-sm text-muted-foreground">Loading</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader state="success" text="Completado" showText />
            <span className="text-sm text-muted-foreground">Success</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader state="error" text="Error" showText />
            <span className="text-sm text-muted-foreground">Error</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleCode('states')}
          >
            {showCode.states ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCode.states ? 'Ocultar' : 'Mostrar'} código
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(codeExamples.states)}
          >
            <Copy size={16} />
            Copiar
          </Button>
        </div>
        
        {showCode.states && (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{codeExamples.states}</code>
          </pre>
        )}
      </CardSection>

      {/* With Text */}
      <CardSection 
        title="Con Texto" 
        description="Loaders con texto descriptivo para mejor UX."
        className="space-y-4"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Loader text="Cargando datos..." showText />
          </div>
          <div className="flex justify-center">
            <Loader text="Procesando..." showText centered />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleCode('withText')}
          >
            {showCode.withText ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCode.withText ? 'Ocultar' : 'Mostrar'} código
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(codeExamples.withText)}
          >
            <Copy size={16} />
            Copiar
          </Button>
        </div>
        
        {showCode.withText && (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{codeExamples.withText}</code>
          </pre>
        )}
      </CardSection>

      {/* Button Integration */}
      <CardSection 
        title="Integración con Button" 
        description="El componente Button ya incluye soporte para loading states."
        className="space-y-4"
      >
        <div className="flex items-center gap-4">
          <Button 
            loading={loadingStates.button1}
            loadingText="Guardando..."
            onClick={() => toggleLoading('button1')}
          >
            Guardar
          </Button>
          <Button 
            variant="secondary"
            loading={loadingStates.button2}
            loadingText="Enviando..."
            onClick={() => toggleLoading('button2')}
          >
            Enviar
          </Button>
          <Button 
            variant="primary"
            loading={loadingStates.button3}
            loadingText="Eliminando..."
            onClick={() => toggleLoading('button3')}
          >
            Eliminar
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleCode('button')}
          >
            {showCode.button ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCode.button ? 'Ocultar' : 'Mostrar'} código
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(codeExamples.button)}
          >
            <Copy size={16} />
            Copiar
          </Button>
        </div>
        
        {showCode.button && (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{codeExamples.button}</code>
          </pre>
        )}
      </CardSection>

      {/* Custom Example */}
      <CardSection 
        title="Ejemplo Personalizado" 
        description="Combinación de diferentes props para casos específicos."
        className="space-y-4"
      >
        <div className="flex justify-center py-8">
          <Loader 
            type="infinity"
            variant="primary"
            size="lg"
            text="Cargando datos importantes..."
            showText
            centered
            className="my-4"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleCode('custom')}
          >
            {showCode.custom ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCode.custom ? 'Ocultar' : 'Mostrar'} código
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(codeExamples.custom)}
          >
            <Copy size={16} />
            Copiar
          </Button>
        </div>
        
        {showCode.custom && (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{codeExamples.custom}</code>
          </pre>
        )}
      </CardSection>

      {/* Features */}
      <CardSection 
        title="Características" 
        description="Funcionalidades y mejoras implementadas en el componente."
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-primary">Rendimiento</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• React.memo para evitar re-renders innecesarios</li>
              <li>• useMemo para cálculos costosos</li>
              <li>• Optimización de estilos CSS</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-primary">Accesibilidad</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Atributos ARIA completos</li>
              <li>• Soporte para screen readers</li>
              <li>• Estados de loading accesibles</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-primary">Flexibilidad</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 6 tipos de animación</li>
              <li>• 6 variantes de color</li>
              <li>• 5 tamaños diferentes</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-primary">Integración</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Compatible con tema oscuro/claro</li>
              <li>• Integración con Button</li>
              <li>• TypeScript completo</li>
            </ul>
          </div>
        </div>
      </CardSection>
    </div>
  );
}