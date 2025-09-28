# Regla de estructura de `lib/`

Estructura profesional y consistente para servicios de API, utilidades compartidas y tipos.

## Árbol propuesto

```
/lib
 ├── service-auth/
 │    ├── routes.ts        # Definición de endpoints de auth
 │    ├── constants.ts     # Constantes (ej. storage keys, roles, errores)
 │    ├── api.ts           # Funciones para llamar a la API de auth
 │    ├── helpers.ts       # Utilidades específicas de auth
 │    └── types.ts         # Tipos e interfaces
 │
 ├── service-user/
 │    ├── routes.ts
 │    ├── constants.ts
 │    ├── api.ts
 │    └── types.ts
 │
 └── utils/                # Utilidades genéricas (no ligadas a un servicio)
      ├── fetcher.ts
      ├── validators.ts
      └── formatters.ts
```

> Nota: la configuración de base de API (por ejemplo `NEXT_PUBLIC_API_BASE`) se centraliza en `lib/config.ts`.

---

## Principios

- Separación por dominio: cada servicio (`service-auth`, `service-user`, etc.) define sus endpoints, tipos y helpers específicos.
- Utilidades genéricas van a `utils/` y se consumen desde cualquier servicio.
- Exportaciones nombradas por defecto; evitar `export default` (mejor para refactors y tree‑shaking).
- Sin dependencias circulares: servicios consumen `utils/`, nunca entre sí directamente (usar capas superiores si hay composición).
- Tipado estricto: todas las funciones públicas deben tiparse (inputs/outputs). No usar `any`.
- Errores consistentes: las funciones de `api.ts` lanzan `Error` con mensaje claro; manejo en UI/Layouts.

---

## Detalle por archivo

### service-*/routes.ts
Mapa de rutas relativas al dominio. Evita strings repetidos en `api.ts`.

```ts
// service-auth/routes.ts
export const AUTH_ROUTES = {
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',
} as const;
```

### service-*/constants.ts
Constantes del dominio: claves de storage, roles, mensajes, etc.

```ts
// service-auth/constants.ts
export const AUTH_STORAGE_KEYS = {
  token: 'ot_token',
} as const;

export const AUTH_ERRORS = {
  invalidCredentials: 'Credenciales inválidas',
  unauthorized: 'No autorizado',
} as const;
```

### service-*/types.ts
Interfaces y tipos relacionados al dominio. Evita duplicación entre UI y llamadas de red.

```ts
// service-auth/types.ts
export type AuthUser = {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
};

export type LoginResponse = {
  token: string;
  expiresAt: number;
  user: Pick<AuthUser, 'username'>;
};

export type MeResponse = { user: Pick<AuthUser, 'username'> };
```

### service-*/api.ts
Uso de `utils/fetcher.ts` para invocar la API con base URL centralizada. No manejar `localStorage` aquí; mantenerlo en provider/hook.

```ts
// service-auth/api.ts
import { AUTH_ROUTES } from './routes';
import { requestJSON } from '../utils/fetcher';
import type { LoginResponse, MeResponse } from './types';

export function login(username: string, password: string) {
  return requestJSON<LoginResponse>(AUTH_ROUTES.login, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logout(token: string) {
  return fetch(requestJSON.base(AUTH_ROUTES.logout), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function me(token: string) {
  return requestJSON<MeResponse>(AUTH_ROUTES.me, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}
```

### service-*/helpers.ts
Helpers de dominio (normalizar identificadores, mapear respuestas, componer permisos).

```ts
// service-auth/helpers.ts
export function normalizeIdentifier(identifier: string) {
  const v = identifier.trim();
  return v.includes('@') ? v.toLowerCase() : v;
}
```

### utils/fetcher.ts
Capa delgada sobre `fetch` con base URL y cabeceras por defecto. No incluir lógica de tokens aquí (eso va en provider/hook o se pasa vía opciones).

```ts
// utils/fetcher.ts
import { API_BASE } from '../config';

export function base(path: string) {
  return `${API_BASE}${path}`;
}

export async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(base(path), {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

requestJSON.base = base;
```

### utils/validators.ts
Validaciones simples reutilizables (email, longitud, etc.).

```ts
// utils/validators.ts
export const isEmail = (v: string) => /.+@.+\..+/.test(v);
export const isNonEmpty = (v: string) => v.trim().length > 0;
```

### utils/formatters.ts
Formatos reutilizables (fechas, números, máscaras) desacoplados de UI.

```ts
// utils/formatters.ts
export const formatDate = (d: Date) => d.toLocaleDateString();
```

---

## Convenciones

- Carpetas: `service-<dominio>` en kebab-case.
- Archivos: kebab-case, exportaciones nombradas.
- `api.ts` no accede a storage; usar Provider/hook para persistencia.
- Rutas viven en `routes.ts`.
- Tipos puros (sin React).
- Helpers no mutan estado global.

---

## Ejemplo de uso en UI

```ts
import { login } from '@/lib/service-auth/api';
import { normalizeIdentifier } from '@/lib/service-auth/helpers';

async function handleLogin(id: string, password: string) {
  const username = normalizeIdentifier(id);
  const res = await login(username, password);
  // setToken(res.token) en el provider/hook
}
```

---

## Checklist de calidad

- [ ] Endpoints centralizados en `routes.ts`.
- [ ] Tipos en `types.ts` y reusados por `api.ts`.
- [ ] `api.ts` usa `utils/fetcher.ts` y no accede a storage.
- [ ] Validaciones y formatos en `utils/`.
- [ ] Sin `any`, sin hooks en condicionales, sin dependencias circulares.
- [ ] Mensajes de error claros y consistentes.

---

## Notas

- Si un servicio crece, considera subcarpetas por subdominio (p. ej. `service-user/profile/...`).
- Para auth avanzada (cookies HttpOnly, refresh tokens), documenta el flujo aquí y divide responsabilidades.