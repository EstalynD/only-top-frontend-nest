export const SISTEMA_ROUTES = {
  currencies: '/sistema/currencies',
  updateCurrency: (code: string) => `/sistema/currencies/${code}`,
  timezonesAvailable: '/sistema/timezones/available',
  timezonesSelected: '/sistema/timezones/selected',
  updateTimezone: '/sistema/timezones',
  trm: '/sistema/trm',
  trmCurrent: '/sistema/trm/current',
} as const;
