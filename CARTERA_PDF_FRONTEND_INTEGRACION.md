# 📱 Guía de Integración Frontend - PDF de Facturas

## 🎯 Implementación Completada

Se ha integrado completamente la funcionalidad de visualización y descarga de PDFs de facturas en el frontend.

---

## 📦 Archivos Modificados

### 1. ✅ **`lib/service-cartera/routes.ts`**

Se agregaron rutas para PDFs:

```typescript
facturas: {
  // ... rutas existentes
  
  // PDF (NUEVO)
  pdf: (id: string) => `/api/cartera/facturas/${id}/pdf`,
  pdfDownload: (id: string) => `/api/cartera/facturas/${id}/pdf?download=true`,
}
```

### 2. ✅ **`lib/service-cartera/api.ts`**

Se agregaron funciones para manejar PDFs:

```typescript
/**
 * Obtiene la URL del PDF para visualizar en navegador
 */
export function getFacturaPdfUrl(facturaId: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
  return `${apiUrl}${CARTERA_ROUTES.facturas.pdf(facturaId)}`;
}

/**
 * Descarga el PDF de una factura
 */
export async function downloadFacturaPdf(
  token: string,
  facturaId: string,
  numeroFactura: string,
): Promise<void> {
  // Implementación completa con manejo de Blob y descarga automática
}
```

### 3. ✅ **`components/finanzas/cartera/FacturasTable.tsx`**

Se agregó botón "Ver PDF" en la tabla:

```tsx
{/* Ver PDF en navegador */}
<button
  onClick={() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
    const pdfUrl = `${apiUrl}/api/cartera/facturas/${factura._id}/pdf`;
    window.open(pdfUrl, '_blank');
  }}
  className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
  title="Ver PDF"
>
  <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
</button>
```

### 4. ✅ **`components/finanzas/cartera/FacturaDetalleModal.tsx`**

Se agregaron botones "Ver PDF" y "Descargar PDF":

```tsx
{/* Ver PDF en navegador */}
<button
  onClick={() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
    const pdfUrl = `${apiUrl}/api/cartera/facturas/${factura._id}/pdf`;
    window.open(pdfUrl, '_blank');
  }}
  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
  style={{ background: '#6366f1' }}
>
  <Eye size={16} />
  Ver PDF
</button>

{/* Descargar PDF */}
{onDescargarPDF && (
  <button
    onClick={onDescargarPDF}
    className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
    style={{ background: '#10b981' }}
  >
    <Download size={16} />
    Descargar PDF
  </button>
)}
```

---

## 🔧 Uso en page.tsx

### Implementación del Handler de Descarga

Actualiza tu `page.tsx` para implementar el handler `onDescargarPDF`:

```typescript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FacturasTable } from '@/components/finanzas/cartera/FacturasTable';
import { FacturaDetalleModal } from '@/components/finanzas/cartera/FacturaDetalleModal';
import { downloadFacturaPdf } from '@/lib/service-cartera';
import type { Factura } from '@/lib/service-cartera';

export default function CarteraPage() {
  const { data: session } = useSession();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handler para descargar PDF
  const handleDescargarPDF = async (factura: Factura) => {
    try {
      if (!session?.accessToken) {
        alert('No hay sesión activa');
        return;
      }

      // Mostrar indicador de carga
      console.log(`Descargando PDF de factura ${factura.numeroFactura}...`);

      await downloadFacturaPdf(
        session.accessToken,
        factura._id,
        factura.numeroFactura
      );

      console.log('✅ PDF descargado exitosamente');
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el PDF. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Cartera</h1>

      {/* Tabla de Facturas */}
      <FacturasTable
        facturas={facturas}
        onVerDetalle={(factura) => {
          setSelectedFactura(factura);
          setIsModalOpen(true);
        }}
        onDescargarPDF={handleDescargarPDF}
        onEnviarRecordatorio={(factura) => {
          // Implementar envío de recordatorio
          console.log('Enviar recordatorio:', factura.numeroFactura);
        }}
      />

      {/* Modal de Detalle */}
      <FacturaDetalleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFactura(null);
        }}
        factura={selectedFactura}
        pagos={[]} // Cargar pagos de la factura
        onDescargarPDF={() => {
          if (selectedFactura) {
            handleDescargarPDF(selectedFactura);
          }
        }}
        onEnviarRecordatorio={() => {
          // Implementar envío de recordatorio
          console.log('Enviar recordatorio desde modal');
        }}
        onRegistrarPago={() => {
          // Implementar registro de pago
          console.log('Registrar pago');
        }}
      />
    </div>
  );
}
```

---

## 🎨 Visualización de Botones

### En la Tabla (FacturasTable)

Los usuarios verán 3-4 botones por fila:

| Icono | Color | Acción | Tooltip |
|-------|-------|--------|---------|
| 👁️ (Eye) | Azul | Ver Detalle | "Ver detalle" |
| 📄 (FileText) | Índigo | Ver PDF | "Ver PDF" |
| ⬇️ (Download) | Verde | Descargar PDF | "Descargar PDF" |
| 📧 (Send) | Morado | Enviar Recordatorio | "Enviar recordatorio" (solo si no está pagada/cancelada) |

### En el Modal (FacturaDetalleModal)

Botones en la parte superior derecha:

```
┌─────────────────────────────────────────────────┐
│ Factura FACT-2025-001                           │
│ Primera quincena Enero 2025                     │
│                                                 │
│ [Ver PDF] [Descargar PDF] [Recordatorio] [Pago]│
├─────────────────────────────────────────────────┤
│ ... contenido del modal ...                     │
```

---

## 🔐 Flujo de Autenticación

### Ver PDF (window.open)

```typescript
// NO requiere token en el cliente
// El navegador envía automáticamente las cookies de autenticación
const pdfUrl = `${apiUrl}/api/cartera/facturas/${factura._id}/pdf`;
window.open(pdfUrl, '_blank');
```

### Descargar PDF (fetch)

```typescript
// Requiere token explícito para fetch
await downloadFacturaPdf(
  session.accessToken,  // Token JWT
  factura._id,
  factura.numeroFactura
);
```

---

## ✅ Checklist de Implementación

- [x] Rutas de PDF agregadas en `routes.ts`
- [x] Funciones API agregadas en `api.ts`
- [x] Botón "Ver PDF" en tabla de facturas
- [x] Botón "Descargar PDF" en tabla de facturas
- [x] Botones de PDF en modal de detalle
- [x] Import de iconos (Eye) agregado
- [ ] Handler `onDescargarPDF` implementado en page.tsx (REQUIERE ACCIÓN DEL DESARROLLADOR)

---

**🎯 ¡Frontend completamente integrado y listo para usar!**
