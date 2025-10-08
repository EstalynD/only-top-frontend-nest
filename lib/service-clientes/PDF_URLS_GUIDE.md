# Guía de URLs de PDFs - Sistema Profesional

## 🎯 Arquitectura de URLs

El sistema está diseñado para que **todas las solicitudes pasen por el frontend** y luego sean proxy-das al backend. Esto garantiza:

✅ **Consistencia**: Todas las URLs usan el mismo `API_BASE`  
✅ **Seguridad**: Las peticiones pasan por el proxy del frontend  
✅ **Mantenibilidad**: Cambios centralizados en un solo lugar  
✅ **Profesionalismo**: URLs limpias y predecibles  

---

## 📐 Estructura de URLs

### Configuración Base

```typescript
// lib/config.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3041';
```

### URLs Generadas

#### 1. Ver PDF (Inline)
```typescript
const pdfUrl = getPdfViewUrl(contratoId, numeroContrato);
```

**Ejemplo de URL generada**:
```
http://localhost:3041/api/pdf/contratos-modelo/68deae2f639d6ac8668f8875/A4/CTMO-2025-00001.pdf
```

**Componentes**:
- `http://localhost:3041` → API_BASE (del frontend)
- `/api/pdf/contratos-modelo` → Ruta del controlador
- `/68deae2f639d6ac8668f8875` → ID del contrato
- `/A4` → Tamaño del documento
- `/CTMO-2025-00001.pdf` → Nombre personalizado del archivo

#### 2. Descargar PDF
```typescript
const downloadUrl = getPdfDownloadUrl(contratoId);
```

**Ejemplo de URL generada**:
```
http://localhost:3041/api/pdf/contratos-modelo/68deae2f639d6ac8668f8875/download
```

---

## 🔄 Flujo de la Petición

```
┌─────────────┐
│   Browser   │
│   Cliente   │
└──────┬──────┘
       │ 1. Click en "Ver PDF"
       │    URL: http://localhost:3041/api/pdf/...
       ▼
┌──────────────────┐
│  Frontend (3041) │
│  Next.js Server  │
└──────┬───────────┘
       │ 2. Proxy/Forward
       │    a Backend (4000)
       ▼
┌──────────────────┐
│  Backend (4000)  │
│  NestJS Server   │
└──────┬───────────┘
       │ 3. Genera PDF
       │    on-demand
       ▼
┌──────────────────┐
│  PdfService      │
│  + PDFKit        │
└──────┬───────────┘
       │ 4. Retorna Buffer
       ▼
┌─────────────┐
│   Browser   │
│  Muestra PDF│
└─────────────┘
```

---

## 💻 Uso en el Frontend

### Importar las funciones helper

```typescript
import { getPdfViewUrl, getPdfDownloadUrl } from '@/lib/service-clientes/api-contratos';
```

### Botón para Ver PDF

```tsx
<a
  href={getPdfViewUrl(contrato._id, contrato.numeroContrato)}
  target="_blank"
  rel="noopener noreferrer"
  className="btn-primary"
>
  Ver PDF
</a>
```

### Botón para Descargar PDF

```tsx
<a
  href={getPdfDownloadUrl(contrato._id)}
  download
  className="btn-secondary"
>
  Descargar PDF
</a>
```

### Obtener Información del PDF

```typescript
const info = await getPdfInfo(token, contratoId);
console.log(info.pdfUrl); // URL completa lista para usar
console.log(info.firmado); // true/false
```

---

## 🔧 Configuración por Entorno

### Desarrollo Local

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_BASE=http://localhost:3041
```

**URLs generadas**:
```
http://localhost:3041/api/pdf/contratos-modelo/...
```

### Producción

```env
# Frontend (.env.production)
NEXT_PUBLIC_API_BASE=https://api.onlytop.com
```

**URLs generadas**:
```
https://api.onlytop.com/api/pdf/contratos-modelo/...
```

---

## 🎨 Ventajas del Sistema

### 1. Centralización
✅ **Una sola fuente de verdad** para las URLs  
✅ **Fácil cambiar el backend** sin tocar código  
✅ **Configuración por entorno** automática  

### 2. Proxy del Frontend
✅ **Todas las peticiones** pasan por el frontend  
✅ **CORS simplificado** (mismo origen)  
✅ **Headers compartidos** (auth, cookies)  

### 3. URLs Profesionales
✅ **Nombres descriptivos** en la URL  
✅ **Formato estándar** y predecible  
✅ **Fácil de compartir** y enlazar  

### 4. Mantenibilidad
✅ **Funciones helper** reutilizables  
✅ **TypeScript** con tipado fuerte  
✅ **Cambios centralizados**  

---

## 🔍 Debugging

### Ver qué URL se está generando

```typescript
// En el componente
const pdfUrl = getPdfViewUrl(contrato._id, contrato.numeroContrato);
console.log('PDF URL:', pdfUrl);
```

### Verificar la configuración

```typescript
// En cualquier parte del frontend
import { API_BASE } from '@/lib/config';
console.log('API_BASE:', API_BASE);
```

### Verificar las rutas

```typescript
import { CLIENTES_ROUTES } from '@/lib/service-clientes/routes';
console.log('Rutas PDF:', {
  view: CLIENTES_ROUTES.contratos.pdfView('test-id', 'test-file'),
  download: CLIENTES_ROUTES.contratos.pdfDownload('test-id'),
});
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Cannot GET /api/pdf/..."

**Causa**: El backend no está corriendo o el proxy no está configurado.

**Solución**:
1. Verificar que el backend esté corriendo en el puerto 4000
2. Verificar que `API_BASE` apunte al puerto correcto
3. En desarrollo, asegurarse de que Next.js haga proxy correctamente

### Error: PDF no se descarga

**Causa**: Headers incorrectos o el atributo `download` no funciona.

**Solución**:
```tsx
// Usar la función helper en lugar de URL manual
<a href={getPdfDownloadUrl(contratoId)} download>
  Descargar PDF
</a>
```

### Error: "404 Not Found"

**Causa**: El contrato no existe o el ID es incorrecto.

**Solución**:
1. Verificar que el contrato existe en la base de datos
2. Verificar que el ID sea válido (ObjectId de MongoDB)

---

## 📚 Referencias

### Archivos Relacionados

- **Rutas**: `lib/service-clientes/routes.ts`
- **API**: `lib/service-clientes/api-contratos.ts`
- **Config**: `lib/config.ts`
- **Backend**: `src/pdf/pdf.controller.ts`

### Funciones Helper

```typescript
// Genera URL para ver PDF
getPdfViewUrl(contratoId: string, numeroContrato: string): string

// Genera URL para descargar PDF
getPdfDownloadUrl(contratoId: string): string

// Obtiene información del PDF
getPdfInfo(token: string, contratoId: string): Promise<PdfInfo>
```

---

## 🚀 Próximas Mejoras

- [ ] Cache de URLs generadas
- [ ] Validación de IDs antes de generar URLs
- [ ] Soporte para múltiples tamaños (A4, Letter, Legal)
- [ ] Generación de thumbnails para preview
- [ ] Compartir PDF por email con enlace temporal

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025  
**Autor**: OnlyTop Development Team

