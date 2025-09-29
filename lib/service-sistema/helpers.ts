import type { CurrencyFormatSpec } from './types';

export function formatCurrency(amount: number, spec: CurrencyFormatSpec): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: spec.minimumFractionDigits,
    maximumFractionDigits: spec.maximumFractionDigits,
  });
  return `${spec.code} ${spec.symbol}${formatted}`;
}

export function formatDate(dateString: string, timezone = 'America/Bogota'): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function normalizeEffectiveDate(date: Date): string {
  // Normalizar a inicio del día en UTC para TRM
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized.toISOString();
}

export function validateTrmAmount(amount: number): string | null {
  if (isNaN(amount) || amount <= 0) {
    return 'El TRM debe ser un número mayor a 0';
  }
  if (amount < 1000 || amount > 10000) {
    return 'El TRM debe estar entre 1,000 y 10,000 COP por USD';
  }
  return null;
}
