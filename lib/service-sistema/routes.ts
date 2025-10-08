export const SISTEMA_ROUTES = {
  currencies: '/sistema/currencies',
  updateCurrency: (code: string) => `/sistema/currencies/${code}`,
  timezonesAvailable: '/sistema/timezones/available',
  timezonesSelected: '/sistema/timezones/selected',
  updateTimezone: '/sistema/timezones',
  timeFormatsAvailable: '/sistema/time-formats/available',
  timeFormatsSelected: '/sistema/time-formats/selected',
  updateTimeFormat: '/sistema/time-formats',
  trm: '/sistema/trm',
  trmCurrent: '/sistema/trm/current',
} as const;
