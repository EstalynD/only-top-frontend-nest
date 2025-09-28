Evitar pérdida de Content-Type al fusionar headers: construir fetch con `...init` primero y luego `headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }`.
Así Authorization u otros headers no sobreescriben Content-Type y el backend parsea JSON bien.
Aplicado en `lib/utils/fetcher.ts::requestJSON`.
