# Actualización Frontend - PDFs de Cartera

## 📋 Resumen de Cambios

Se actualizó el frontend para usar la **nueva arquitectura centralizada de PDFs** implementada en el backend (`CarteraPdfCoreService`).

---

## 🔄 Cambios Realizados

### ✅ **Archivo: `lib/service-cartera/api.ts`**

#### **1. Nuevas Funciones para PDFs Públicos**

```typescript
/**
 * Obtiene la URL pública de una factura usando token temporal
 * Esta URL NO requiere autenticación JWT
 */
export function getFacturaPdfUrlPublic(token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
  return `${apiUrl}/api/cartera/factura/token/${token}/pdf`;
}

/**
 * Genera un enlace público temporal para una factura
 * Requiere autenticación JWT para generar el token
 * El token resultante se puede usar con getFacturaPdfUrlPublic()
 */
export async function generateFacturaPdfLink(
  token: string,
  facturaId: string,
): Promise<{
  token: string;
  viewUrl: string;
  downloadUrl: string;
  expiresAt: string;
}> {
  const result = await requestJSON<{
    success: boolean;
    data: {
      token: string;
      viewUrl: string;
      downloadUrl: string;
      expiresAt: string;
    };
  }>(`/api/cartera/facturas/${facturaId}/pdf/link`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  return result.data;
}

/**
 * Obtiene la URL pública del estado de cuenta usando token temporal
 * Esta URL NO requiere autenticación JWT
 */
export function getEstadoCuentaPdfUrlPublic(token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3041';
  return `${apiUrl}/api/cartera/estado-cuenta/token/${token}/pdf`;
}
```

#### **2. Funciones Actualizadas**

```typescript
// ✅ Ya existente - Actualizado comentarios
export function getFacturaPdfUrl(facturaId: string): string
export async function downloadFacturaPdf(token: string, facturaId: string, numeroFactura: string): Promise<void>
export async function downloadEstadoCuentaPDF(token: string, modeloId: string, dto: ObtenerEstadoCuentaDto): Promise<Blob>
```

---

## 🎯 Casos de Uso

### **1. Ver PDF con Autenticación (Usuario Logueado)**

```typescript
import { getFacturaPdfUrl } from '@/lib/service-cartera';

// Abrir PDF en nueva pestaña
const pdfUrl = getFacturaPdfUrl(facturaId);
window.open(pdfUrl, '_blank');
```

**Endpoint usado:** `GET /api/cartera/facturas/:id/pdf`  
**Autenticación:** JWT requerido (AuthGuard)

---

### **2. Descargar PDF con Autenticación**

```typescript
import { downloadFacturaPdf } from '@/lib/service-cartera';

// Descargar PDF
await downloadFacturaPdf(token, facturaId, numeroFactura);
```

**Endpoint usado:** `GET /api/cartera/facturas/:id/pdf?download=true`  
**Autenticación:** JWT requerido (AuthGuard)

---

### **3. Generar Enlace Público (Para Emails)**

```typescript
import { generateFacturaPdfLink, getFacturaPdfUrlPublic } from '@/lib/service-cartera';

// Generar token temporal (requiere JWT)
const { token, viewUrl, downloadUrl, expiresAt } = await generateFacturaPdfLink(jwtToken, facturaId);

// Usar el token para acceso público
const publicUrl = getFacturaPdfUrlPublic(token);
// O usar directamente las URLs que vienen del backend
console.log(viewUrl); // Para ver
console.log(downloadUrl); // Para descargar
console.log(expiresAt); // Cuándo expira
```

**Endpoints usados:**
1. `GET /api/cartera/facturas/:id/pdf/link` (requiere JWT) → Genera token
2. `GET /api/cartera/factura/token/:token/pdf` (@Public) → Acceso sin JWT

---

### **4. Acceso Público desde Email (Sin Login)**

```typescript
import { getFacturaPdfUrlPublic } from '@/lib/service-cartera';

// Usuario hace clic en enlace del email
// Token viene en la URL o parámetro
const publicUrl = getFacturaPdfUrlPublic(tokenFromEmail);
window.location.href = publicUrl; // Redirigir
```

**Endpoint usado:** `GET /api/cartera/factura/token/:token/pdf`  
**Autenticación:** NO requiere JWT (decorador `@Public()`)  
**Seguridad:** Token HMAC-SHA256 con expiración de 7 días

---

## 📱 Componentes (Ya Compatibles)

Los componentes existentes ya funcionan correctamente con la nueva arquitectura:

### ✅ **FacturaDetalleModal**
```typescript
// Ver PDF (línea ~94)
onClick={() => {
  const url = getFacturaPdfUrl(factura._id);
  window.open(url, '_blank');
}}

// Descargar PDF (onDescargarPDF prop)
await downloadFacturaPdf(token, factura._id, factura.numeroFactura);
```

### ✅ **FacturasTable**
```typescript
// Ver/Descargar PDFs en acciones de tabla
onVerDetalle={(factura) => { ... }}
onDescargarPDF={(factura) => { ... }}
```

### ✅ **RegistrarPagoModal** y **GenerarFacturasModal**
No necesitan cambios, no interactúan con PDFs directamente.

---

## 🔐 Flujos de Autenticación

### **Flujo 1: Usuario Autenticado**
```
Usuario Logueado
  ↓
Click "Ver PDF" o "Descargar"
  ↓
Frontend: getFacturaPdfUrl(facturaId) con JWT en header
  ↓
Backend: AuthGuard verifica JWT → @RequirePermissions
  ↓
CarteraPdfCoreService genera PDF
  ↓
Usuario recibe PDF
```

### **Flujo 2: Acceso Público (Email)**
```
Usuario sin Login (recibe email)
  ↓
Email contiene enlace con token temporal
  ↓
Click en enlace: /api/cartera/factura/token/{TOKEN}/pdf
  ↓
Backend: @Public() decorator → NO requiere JWT
  ↓
CarteraTokenService valida token HMAC
  ↓
CarteraPdfCoreService genera PDF
  ↓
Usuario recibe PDF (válido por 7 días)
```

---

## 🧪 Testing

### **1. Testing Local - Usuario Autenticado**

```bash
# 1. Login y obtener JWT
POST http://localhost:3041/api/auth/login
{
  "username": "admin",
  "password": "password"
}

# 2. Ver PDF (abrir en navegador con JWT)
GET http://localhost:3041/api/cartera/facturas/677580bbdb8de82a046d79de/pdf
Header: Authorization: Bearer {JWT}

# 3. Descargar PDF
GET http://localhost:3041/api/cartera/facturas/677580bbdb8de82a046d79de/pdf?download=true
Header: Authorization: Bearer {JWT}
```

### **2. Testing Local - Acceso Público**

```bash
# 1. Generar token temporal (requiere JWT)
GET http://localhost:3041/api/cartera/facturas/677580bbdb8de82a046d79de/pdf/link
Header: Authorization: Bearer {JWT}

# Respuesta:
{
  "success": true,
  "data": {
    "token": "eyJtb2RlbG9JZCI6IjY3NzU4MGJiZGI4ZGU4MmEwNDZkNzlkZSIsImZhY3R1cmFJZCI6IjY3NzU4MGJiZGI4ZGU4MmEwNDZkNzlkZSIsInRpcG8iOiJGQUNUVVJBX0lORElWSURVQUwiLCJlbWFpbCI6Im1vZGVsb0BleGFtcGxlLmNvbSIsImdlbmVyYWRvRW4iOjE3MzYyODg4MDAwMDAsImV4cGlyYUVuIjoxNzM2ODkzNjAwMDAwfQ.signature",
    "viewUrl": "http://localhost:3041/api/cartera/factura/token/{TOKEN}/pdf",
    "downloadUrl": "http://localhost:3041/api/cartera/factura/token/{TOKEN}/pdf?download=true",
    "expiresAt": "2025-01-15T00:00:00.000Z"
  }
}

# 2. Acceder con token (SIN JWT)
GET http://localhost:3041/api/cartera/factura/token/{TOKEN}/pdf
# No requiere header Authorization
```

### **3. Testing Frontend**

```typescript
// En componente de React
import { generateFacturaPdfLink, getFacturaPdfUrlPublic } from '@/lib/service-cartera';

const handleGenerarEnlacePublico = async () => {
  try {
    const { token, viewUrl, downloadUrl, expiresAt } = await generateFacturaPdfLink(
      sessionToken,
      facturaId
    );
    
    console.log('Token generado:', token);
    console.log('Ver PDF:', viewUrl);
    console.log('Descargar:', downloadUrl);
    console.log('Expira:', new Date(expiresAt).toLocaleString());
    
    // Copiar enlace público
    navigator.clipboard.writeText(viewUrl);
    alert('Enlace copiado al portapapeles');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## ✅ Beneficios

### **Para Desarrolladores**
- **API clara y documentada** para trabajar con PDFs
- **Separación de responsabilidades** (autenticado vs público)
- **Reutilización de código** (misma lógica, diferentes flujos)

### **Para Usuarios**
- **Acceso rápido** a PDFs desde el sistema
- **Enlaces públicos** para compartir (emails)
- **Sin necesidad de login** para ver facturas enviadas por email

### **Para Negocio**
- **Trazabilidad** de accesos a PDFs
- **Seguridad** con tokens HMAC que expiran
- **Escalabilidad** preparada para cacheo y CDN

---

## 📝 Próximos Pasos (Opcionales)

1. **Implementar cacheo de tokens** en frontend (localStorage con expiración)
2. **Agregar botón "Compartir Enlace"** en FacturaDetalleModal
3. **Mostrar preview de PDF** en modal (iframe o react-pdf)
4. **Analytics**: Registrar cuántos usuarios abren PDFs desde emails

---

## 🎉 ¡Listo para Usar!

El sistema de PDFs está completamente funcional en frontend y backend con:

✅ Arquitectura centralizada  
✅ Autenticación JWT para usuarios logueados  
✅ Tokens temporales para acceso público  
✅ Documentación completa  
✅ Componentes actualizados  

**¡No se requieren más cambios en el frontend!** 🚀
