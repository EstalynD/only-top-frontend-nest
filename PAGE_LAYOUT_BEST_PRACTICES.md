# Mejores Prácticas para Páginas con Layout

## Estructura Correcta de Páginas

### ✅ Formato Correcto

```tsx
"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import MiComponente from '@/components/MiComponente';

export default function MiPagina() {
  const { token, ready } = useAuth();

  // El layout ya maneja la autenticación y loading states
  if (!ready || !token) {
    return null; // El layout se encarga del loading y redirección
  }

  return <MiComponente token={token} />;
}
```

### ❌ Formato Incorrecto (Evitar)

```tsx
// NO hacer esto - duplica funcionalidad del layout
export default function MiPagina() {
  const { token, ready } = useAuth();
  const { theme } = useTheme();

  if (!ready) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Loading spinner */}
      </div>
    );
  }

  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Error message */}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MiComponente token={token} />
      </div>
    </div>
  );
}
```

## Responsabilidades del Layout vs Páginas

### ProtectedLayout se encarga de:
- ✅ Autenticación y verificación de token
- ✅ Estados de loading y redirección
- ✅ Estructura del sidebar y navbar
- ✅ Contenedores responsivos
- ✅ Padding y márgenes globales
- ✅ Fondo y colores de tema

### Las páginas se encargan de:
- ✅ Lógica específica del componente
- ✅ Estados internos del componente
- ✅ Renderizado del contenido principal
- ✅ Validaciones específicas de la página

## Estructura del Layout

El `ProtectedLayout` proporciona:

```tsx
// Desktop Layout
<div className="hidden md:flex min-h-[calc(100vh-4rem)]">
  <Sidebar variant="desktop" />
  <main className="flex-1 overflow-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {children} {/* Tu página aquí */}
    </div>
  </main>
</div>

// Mobile Layout
<div className="md:hidden min-h-[calc(100vh-4rem)] relative">
  {/* Mobile sidebar overlay */}
  <main className="overflow-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {children} {/* Tu página aquí */}
    </div>
  </main>
</div>
```

## Beneficios de esta Estructura

1. **Consistencia**: Todas las páginas tienen el mismo comportamiento
2. **Mantenibilidad**: Cambios en el layout se aplican automáticamente
3. **Performance**: Menos re-renders innecesarios
4. **Responsive**: Funciona correctamente en todos los dispositivos
5. **Accesibilidad**: Estructura semántica correcta
6. **SEO**: Mejor estructura HTML

## Ejemplos de Componentes de Página

### Página Simple
```tsx
"use client";
import React from 'react';
import { useAuth } from '@/lib/auth';
import MiComponente from '@/components/MiComponente';

export default function MiPagina() {
  const { token, ready } = useAuth();
  if (!ready || !token) return null;
  return <MiComponente token={token} />;
}
```

### Página con Estado
```tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import MiComponente from '@/components/MiComponente';

export default function MiPagina() {
  const { token, ready } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (token) {
      // Cargar datos
      setLoading(false);
    }
  }, [token]);

  if (!ready || !token) return null;

  return <MiComponente token={token} loading={loading} data={data} />;
}
```

## Clases CSS Disponibles

El layout ya incluye estas clases de utilidad:
- `bg-background` - Fondo principal
- `text-foreground` - Color de texto principal
- `text-primary` - Color de texto primario
- `text-muted` - Color de texto secundario
- `border-border` - Color de bordes
- `bg-surface` - Fondo de superficies
- `bg-surface-muted` - Fondo de superficies secundarias

## Notas Importantes

1. **No duplicar estilos**: El layout ya maneja colores, fondos y contenedores
2. **Usar el token**: Siempre pasar el token a los componentes que lo necesiten
3. **Manejar loading**: Usar estados internos para loading específico del componente
4. **Responsive**: El layout ya es responsive, no agregar clases adicionales
5. **Accesibilidad**: Mantener estructura semántica correcta
