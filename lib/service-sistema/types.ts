export type CurrencyCode = 'USD' | 'COP';
export type DisplayFormat = 'CODE_SYMBOL' | 'SYMBOL_ONLY';

export type CurrencyFormatSpec = {
  code: CurrencyCode;
  symbol: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
  displayFormat: DisplayFormat;
  isActive: boolean;
  sample: string;
};

export type UpdateCurrencyRequest = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  displayFormat?: DisplayFormat;
  isActive?: boolean;
};

export type UpdateTimezoneRequest = {
  timezone: 'Colombia' | 'Peru';
};

export type TimeFormat = '12h' | '24h';

export type TimeFormatOption = {
  format: TimeFormat;
  label: string;
  description: string;
};

export type UpdateTimeFormatRequest = {
  format: TimeFormat;
};

export type Timezone = {
  country: string;
  code: string;
  utcOffset: string;
  iana: string;
};

export type TrmEntry = {
  _id: string;
  effectiveAt: string;
  copPerUsd: number;
  meta?: Record<string, unknown> & { note?: string };
  createdAt: string;
  updatedAt: string;
};

export type CreateTrmRequest = {
  effectiveAt: string;
  copPerUsd: number;
  meta?: Record<string, unknown> & { note?: string };
};

export type ListTrmQuery = {
  from?: string;
  to?: string;
  limit?: number;
};

export type CreateTrmResponse = {
  id: string;
  effectiveAt: string;
  copPerUsd: number;
  createdAt: string;
};
