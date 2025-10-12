# Sistema de Asistencia para Empleados - Frontend

## 📋 Descripción

Interfaz de usuario completa para que los empleados puedan marcar su asistencia diaria y consultar su información de forma autónoma.

---

## 🎨 Componentes Implementados

### 1. **MarcadorAsistencia.tsx**
Componente principal para marcar asistencia en tiempo real.

**Características:**
- ⏰ Reloj en tiempo real
- ✅ Botones dinámicos según estado actual
- 📊 Resumen del día en vivo
- 🎯 Última marcación visible
- 🚨 Mensajes de error y éxito
- 📱 Diseño responsive

**Ubicación:** `components/rrhh/MarcadorAsistencia.tsx`

---

### 2. **MiHorario.tsx**
Visualización del horario asignado al empleado.

**Características:**
- 📅 Muestra horario fijo o turnos rotativos
- ⏰ Horarios por día de la semana
- ☕ Información de descansos
- 📝 Detalles de tolerancia
- 🎨 Diseño claro y organizado

**Ubicación:** `components/rrhh/MiHorario.tsx`

---

### 3. **MisRegistros.tsx**
Historial completo de registros de asistencia.

**Características:**
- 📆 Filtros por rango de fechas
- 📋 Agrupación por día
- 🔍 Vista expandible/colapsable
- 🏷️ Estados visuales con colores
- 💾 Datos poblados (áreas, cargos)
- 📱 Tabla responsive

**Ubicación:** `components/rrhh/MisRegistros.tsx`

---

### 4. **MiReporte.tsx**
Reporte estadístico de asistencia.

**Características:**
- 📊 Estadísticas consolidadas
- 📈 Métricas de puntualidad
- ⏱️ Total de horas trabajadas
- 📉 Promedio diario
- 📋 Tabla detallada por día
- 🎯 Indicadores visuales

**Ubicación:** `components/rrhh/MiReporte.tsx`

---

## 📄 Página Principal

### **mi-asistencia/page.tsx**

Página contenedora con sistema de tabs.

**Estructura:**
```tsx
<MiAsistenciaPage>
  <Tabs>
    <Tab: Marcar>      → MarcadorAsistencia
    <Tab: Mi Horario>  → MiHorario
    <Tab: Registros>   → MisRegistros
    <Tab: Reporte>     → MiReporte
  </Tabs>
</MiAsistenciaPage>
```

**Ruta:** `/mi-asistencia`

---

## 🔌 API Service

### **attendance.api.ts**

Servicio completamente actualizado con todos los endpoints.

**Nuevas Funciones:**
```typescript
// Marcar asistencia
empleadoMarcarAsistencia(token, body)

// Estado actual
empleadoObtenerEstadoActual(token)

// Resumen
empleadoObtenerMiResumenHoy(token)
empleadoObtenerMiResumen(token, date)

// Registros
empleadoObtenerMisRegistros(token, params)

// Horario
empleadoObtenerMiHorario(token)

// Tiempo restante
empleadoObtenerTiempoRestante(token)

// Reporte
empleadoObtenerMiReporte(token, startDate, endDate)
```

**Nueva Interfaz:**
```typescript
interface CurrentAttendanceStatus {
  lastRecord: { ... } | null;
  nextExpectedType: AttendanceType | null;
  todayRecords: Array<{ ... }>;
  summary: AttendanceSummary;
  scheduleInfo: UserSchedule | null;
  canMarkAttendance: boolean;
  allowedTypes: AttendanceType[];
}
```

---

## 🎨 Características de UI/UX

### Diseño Responsive
- ✅ Mobile-first approach
- ✅ Adapta a tablets y desktop
- ✅ Touch-friendly buttons
- ✅ Optimizado para uso móvil

### Temas
- 🌙 **Dark Mode** totalmente soportado
- ☀️ **Light Mode** con buenos contrastes
- 🎨 Colores semánticos para estados

### Accesibilidad
- ♿ Contraste adecuado
- 🔤 Textos legibles
- 🎯 Áreas de toque grandes
- 📢 Mensajes claros

---

## 🚀 Uso

### Marcar Asistencia

1. Usuario ingresa a `/mi-asistencia`
2. Ve su estado actual y hora
3. Sistema muestra botones disponibles según secuencia
4. Usuario hace clic en el botón apropiado (Entrada/Salida/etc.)
5. Sistema marca y actualiza automáticamente

### Consultar Horario

1. Usuario va a tab "Mi Horario"
2. Ve su horario asignado
3. Información de tolerancias y descansos

### Ver Registros

1. Usuario va a tab "Registros"
2. Selecciona rango de fechas
3. Ve historial agrupado por día
4. Puede expandir cada día para ver detalles

### Generar Reporte

1. Usuario va a tab "Reporte"
2. Selecciona período
3. Sistema genera estadísticas
4. Ve métricas y tabla detallada

---

## 🔄 Flujo de Datos

```
┌──────────────┐
│  Componente  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  attendance.api  │
│  (Service Layer) │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   HTTP Request   │
│  Bearer Token    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Backend API     │
│  /api/rrhh/...   │
└──────────────────┘
```

---

## 📦 Archivos Creados

```
only-top-frontend/
├── lib/
│   └── service-rrhh/
│       └── attendance.api.ts                    [ACTUALIZADO]
│
├── components/
│   └── rrhh/
│       ├── MarcadorAsistencia.tsx              [NUEVO]
│       ├── MiHorario.tsx                       [NUEVO]
│       ├── MisRegistros.tsx                    [NUEVO]
│       └── MiReporte.tsx                       [NUEVO]
│
├── app/
│   └── (protected)/
│       └── mi-asistencia/
│           └── page.tsx                        [NUEVO]
│
└── components/
    └── layout/
        └── Sidebar.tsx                         [ACTUALIZADO]
```

---

## 🎯 Estados de Asistencia

### Visual por Color

| Estado | Color | Descripción |
|--------|-------|-------------|
| `PRESENT` | 🟢 Verde | Llegó a tiempo |
| `LATE` | 🟡 Amarillo | Llegó tarde |
| `ABSENT` | 🔴 Rojo | No asistió |
| `EXCUSED` | 🔵 Azul | Justificado |

### Tipos de Marcación

| Tipo | Icono | Label |
|------|-------|-------|
| `CHECK_IN` | 🏢 LogIn | Entrada |
| `CHECK_OUT` | 👋 LogOut | Salida |
| `BREAK_START` | ☕ Coffee | Inicio descanso |
| `BREAK_END` | ▶️ Play | Fin descanso |

---

## 🛠️ Tecnologías Utilizadas

- **React** - Componentes funcionales con hooks
- **TypeScript** - Tipado fuerte
- **Tailwind CSS** - Estilos utility-first
- **Lucide React** - Iconografía
- **Next.js** - Framework React
- **fetch API** - Llamadas HTTP

---

## 📱 Capturas de Pantalla

### Vista Principal - Marcar
```
┌─────────────────────────────────┐
│   🕐 14:35:42                   │
│   Miércoles, 9 de octubre       │
├─────────────────────────────────┤
│   Última Marcación              │
│   🏢 Entrada - 08:30            │
│   ✅ A Tiempo                   │
├─────────────────────────────────┤
│   Marcar Asistencia             │
│   ┌──────────┐  ┌──────────┐  │
│   │    ☕    │  │    👋    │  │
│   │ Descanso │  │  Salida  │  │
│   └──────────┘  └──────────┘  │
├─────────────────────────────────┤
│   Resumen de Hoy                │
│   8.5h Total | 7.5h Trabajadas │
└─────────────────────────────────┘
```

### Vista Registros
```
┌─────────────────────────────────┐
│   📅 Miércoles, 9 oct 2025      │
│   4 registros                   │
│   ✅ A Tiempo              ▼    │
├─────────────────────────────────┤
│   🏢 Entrada        08:30       │
│   ☕ Inicio desc.   12:00       │
│   ▶️ Fin descanso   13:00       │
│   👋 Salida         17:00       │
└─────────────────────────────────┘
```

---

## 🔐 Permisos Necesarios

El sistema valida automáticamente en el backend:
- `rrhh.attendance.empleado.marcar` - Para marcar asistencia
- `rrhh.attendance.empleado.ver` - Para ver información

> **Nota:** Los permisos se verifican en cada llamada al API mediante el token JWT.

---

## 🚨 Manejo de Errores

### Errores Comunes

1. **"Cannot mark CHECK_OUT without CHECK_IN"**
   - Solución: Marcar entrada primero

2. **"Marking outside allowed working hours"**
   - Solución: Verificar horario asignado

3. **"User ID not found in request"**
   - Solución: Verificar autenticación

### Mensajes al Usuario

Los componentes muestran mensajes claros:
- ✅ Éxito: Verde con checkmark
- ❌ Error: Rojo con alerta
- ℹ️ Info: Azul con información

---

## 🧪 Testing Recomendado

### Flujo Completo

1. Login con usuario empleado
2. Navegar a "Mi Asistencia"
3. Marcar entrada (CHECK_IN)
4. Verificar que aparezca en "última marcación"
5. Ver que botón de entrada desaparezca
6. Marcar descanso (BREAK_START)
7. Marcar fin de descanso (BREAK_END)
8. Marcar salida (CHECK_OUT)
9. Verificar resumen del día
10. Ir a "Registros" y verificar historial
11. Ir a "Reporte" y generar estadísticas

---

## 📚 Próximas Mejoras

- [ ] Notificaciones push para recordatorios
- [ ] Geolocalización automática
- [ ] Modo offline con sincronización
- [ ] Gráficos de tendencias
- [ ] Exportar reporte a PDF
- [ ] Comparación con períodos anteriores
- [ ] Widget para pantalla de inicio

---

## 🤝 Integración con Backend

El frontend está 100% integrado con los endpoints del backend:

```
Frontend              Backend
--------              -------
/mi-asistencia   →   /api/rrhh/attendance/empleado/*
  ↓
MarcadorAsistencia   /empleado/marcar
MiHorario            /empleado/mi-horario
MisRegistros         /empleado/mis-registros
MiReporte            /empleado/mi-reporte
```

---

## 📞 Soporte

Para problemas o dudas:
- Revisar documentación del backend: `ATTENDANCE_EMPLEADO_README.md`
- Verificar logs del navegador (F12)
- Verificar respuestas del API en Network tab

---

**Versión Frontend**: 1.0.0  
**Fecha de Implementación**: 9 de Octubre de 2025  
**Estado**: ✅ Completamente Funcional  
**Compatibilidad**: Backend v2.0.0+
