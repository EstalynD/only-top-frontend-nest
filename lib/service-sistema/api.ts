import { SISTEMA_ROUTES } from './routes';
import { requestJSON } from '../utils/fetcher';
import type { 
  CurrencyFormatSpec, 
  Timezone, 
  TrmEntry, 
  CreateTrmRequest, 
  CreateTrmResponse, 
  ListTrmQuery,
  UpdateCurrencyRequest,
  UpdateTimezoneRequest,
  CurrencyCode
} from './types';

export function getCurrencies(token: string) {
  return requestJSON<CurrencyFormatSpec[]>(SISTEMA_ROUTES.currencies, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateCurrency(token: string, code: CurrencyCode, body: UpdateCurrencyRequest) {
  return requestJSON<CurrencyFormatSpec>(SISTEMA_ROUTES.updateCurrency(code), {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getAvailableTimezones(token: string) {
  return requestJSON<Timezone[]>(SISTEMA_ROUTES.timezonesAvailable, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getSelectedTimezone(token: string) {
  return requestJSON<Timezone>(SISTEMA_ROUTES.timezonesSelected, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function updateTimezone(token: string, body: UpdateTimezoneRequest) {
  return requestJSON<Timezone>(SISTEMA_ROUTES.updateTimezone, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function createTrm(token: string, body: CreateTrmRequest) {
  return requestJSON<CreateTrmResponse>(SISTEMA_ROUTES.trm, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getCurrentTrm(token: string, at?: string) {
  const url = at 
    ? `${SISTEMA_ROUTES.trmCurrent}?at=${encodeURIComponent(at)}`
    : SISTEMA_ROUTES.trmCurrent;
  return requestJSON<TrmEntry | null>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function listTrm(token: string, query: ListTrmQuery = {}) {
  const params = new URLSearchParams();
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  if (query.limit) params.set('limit', query.limit.toString());
  
  const url = params.toString() 
    ? `${SISTEMA_ROUTES.trm}?${params.toString()}`
    : SISTEMA_ROUTES.trm;
    
  return requestJSON<TrmEntry[]>(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}
