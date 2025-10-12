# Tab de Gestión de Cuenta de Empleado

## Descripción
El nuevo tab "Cuenta" en la página de detalle del empleado permite a los administradores de RRHH gestionar las cuentas de usuario de los empleados de forma centralizada.

## Funcionalidades

### 1. Visualización del Estado de la Cuenta
- **Cuenta Activa**: Muestra cuando el empleado ya tiene una cuenta vinculada
- **Sin Cuenta**: Indica cuando el empleado no tiene cuenta de usuario

### 2. Creación de Cuenta
- **Botón "Crear Cuenta de Usuario"**: Solo visible cuando el empleado no tiene cuenta
- **Generación automática**:
  - Username basado en nombre.apellido (sin acentos, normalizado)
  - Contraseña segura de 12 caracteres con mayúsculas, minúsculas, números y símbolos
  - Email del empleado como correo principal

### 3. Información de Cuenta Creada
- **Username**: Nombre de usuario generado
- **Contraseña Temporal**: Contraseña generada (con opción de mostrar/ocultar)
- **Email**: Correo electrónico asociado
- **Funciones de copia**: Botones para copiar cada campo al portapapeles

### 4. Información de Cuenta Existente
- **Username**: Nombre de usuario actual
- **Email**: Correo electrónico asociado
- **ID de Usuario**: Identificador único de la cuenta
- **Funciones de copia**: Para cada campo

### 5. Validaciones de Permisos
El tab solo es accesible para usuarios con los siguientes permisos:
- `sistema.empleados.crear_cuenta`
- `system.admin`
- `rrhh:empleados:update`

### 6. Funcionalidades Futuras (Placeholder)
- **Resetear Contraseña**: Para cambiar la contraseña de cuentas existentes
- **Editar Cuenta**: Para modificar información de la cuenta

## Componentes Utilizados

### CuentaTab.tsx
Componente principal que maneja toda la lógica de gestión de cuentas.

**Props:**
- `empleadoId`: ID del empleado
- `token`: Token de autenticación
- `empleadoNombre`: Nombre completo del empleado
- `hasUserAccount`: Boolean indicando si tiene cuenta
- `userAccount`: Información de la cuenta (opcional)
- `userProfile`: Perfil del usuario actual para validar permisos
- `onAccountCreated`: Callback cuando se crea una cuenta

### API Integration
- **Endpoint**: `POST /api/rrhh/empleados/:id/crear-cuenta`
- **Función**: `crearCuentaParaEmpleado(empleadoId, token)`
- **Respuesta**: `{ username: string, password: string, email: string }`

## Seguridad

### Contraseñas
- Generadas con 12 caracteres
- Incluyen mayúsculas, minúsculas, números y símbolos
- Deben ser cambiadas en el primer inicio de sesión
- Se muestran solo una vez al crear la cuenta

### Permisos
- Validación estricta de permisos antes de mostrar el tab
- Solo administradores de RRHH pueden gestionar cuentas
- Verificación en frontend y backend

### Información Sensible
- Las contraseñas se pueden ocultar/mostrar
- Funciones de copia para facilitar el uso
- Alertas de seguridad sobre el manejo de credenciales

## Integración con EmpleadoDetallePage

### Nuevo Tab
- Agregado como quinto tab en la navegación
- Icono: `UserCheck` de Lucide React
- Posición: Después del tab de "Dotación"

### Estado
- Se actualiza automáticamente cuando se crea una cuenta
- Recarga la información del empleado para reflejar cambios
- Mantiene sincronización con el backend

## Estilos y UX

### Tema
- Compatible con modo claro y oscuro
- Colores consistentes con el resto de la aplicación
- Iconos y estados visuales claros

### Responsive
- Diseño adaptable para móviles y desktop
- Botones y campos optimizados para diferentes tamaños
- Navegación por tabs funcional en todos los dispositivos

### Feedback Visual
- Estados de carga durante operaciones
- Mensajes de éxito y error
- Indicadores visuales de estado de cuenta
- Alertas de seguridad prominentes

## Consideraciones Técnicas

### Performance
- Carga lazy del componente solo cuando se accede al tab
- No afecta el rendimiento de otros tabs
- Optimización de re-renders

### Error Handling
- Manejo robusto de errores de API
- Mensajes de error descriptivos
- Fallbacks para casos edge

### Accesibilidad
- Navegación por teclado
- Etiquetas descriptivas
- Contraste adecuado
- Iconos con significado semántico
