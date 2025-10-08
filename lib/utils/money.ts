/**
 * Money Utilities - Frontend
 * 
 * Utilidades para manejo de monedas en el cliente.
 * Complementa MoneyService del backend.
 * 
 * Reglas:
 * - Backend almacena: bigint escalado (5 decimales)
 * - API recibe/devuelve: number (decimal normal)
 * - Usuario ve: string formateado (2 decimales)
 */

export enum CurrencyCode {
  USD = 'USD',
  COP = 'COP',
}

export type DisplayFormat = 'SYMBOL_ONLY' | 'CODE_SYMBOL' | 'CODE_ONLY';

export interface MoneyFormatConfig {
  decimalSeparator: string;
  thousandsSeparator: string;
  symbolPosition: 'before' | 'after';
  symbol: string;
  showCode: boolean;
}

const CURRENCY_CONFIGS: Record<CurrencyCode, MoneyFormatConfig> = {
  [CurrencyCode.USD]: {
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    symbol: '$',
    showCode: false,
  },
  [CurrencyCode.COP]: {
    decimalSeparator: ',',
    thousandsSeparator: '.',
    symbolPosition: 'before',
    symbol: '$',
    showCode: true,
  },
};

/**
 * Formatea un monto para mostrar al usuario
 * 
 * @param amount - Valor decimal (ej: 3000000.25)
 * @param currency - Código de moneda
 * @param format - Formato de visualización
 * @returns String formateado (ej: "$ 3.000.000,25 COP")
 * 
 * @example
 * formatMoney(3000000.25, CurrencyCode.COP)
 * // => "$ 3.000.000,25 COP"
 * 
 * formatMoney(3000000.25, CurrencyCode.USD)
 * // => "$3,000,000.25"
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = CurrencyCode.COP,
  format: DisplayFormat = 'CODE_SYMBOL',
): string {
  const config = CURRENCY_CONFIGS[currency];
  
  // Redondear a 2 decimales
  const rounded = Math.round(amount * 100) / 100;
  
  // Separar parte entera y decimal
  const [integerPart, decimalPart = '00'] = rounded.toFixed(2).split('.');
  
  // Formatear parte entera con separadores de miles
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    config.thousandsSeparator
  );
  
  // Construir número formateado
  const formattedNumber = `${formattedInteger}${config.decimalSeparator}${decimalPart.padEnd(2, '0')}`;
  
  // Aplicar formato según tipo
  switch (format) {
    case 'SYMBOL_ONLY':
      return config.symbolPosition === 'before'
        ? `${config.symbol}${formattedNumber}`
        : `${formattedNumber}${config.symbol}`;
    
    case 'CODE_ONLY':
      return `${currency} ${formattedNumber}`;
    
    case 'CODE_SYMBOL':
    default:
      const withSymbol = config.symbolPosition === 'before'
        ? `${config.symbol} ${formattedNumber}`
        : `${formattedNumber} ${config.symbol}`;
      return config.showCode ? `${withSymbol} ${currency}` : withSymbol;
  }
}

/**
 * Parsea un string formateado a número decimal
 * 
 * @param formatted - String formateado (ej: "$ 3.000.000,25 COP")
 * @param currency - Código de moneda
 * @returns Número decimal (ej: 3000000.25)
 * 
 * @example
 * parseMoney("$ 3.000.000,25 COP", CurrencyCode.COP)
 * // => 3000000.25
 * 
 * parseMoney("$3,000,000.25", CurrencyCode.USD)
 * // => 3000000.25
 */
export function parseMoney(formatted: string, currency: CurrencyCode = CurrencyCode.COP): number {
  const config = CURRENCY_CONFIGS[currency];
  
  // Remover símbolos y códigos
  let cleaned = formatted.replace(/[A-Z]/g, '').replace(/\$/g, '').trim();
  
  // Reemplazar separadores según la moneda
  if (currency === CurrencyCode.COP) {
    // COP: punto = miles, coma = decimal
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // USD: coma = miles, punto = decimal
    cleaned = cleaned.replace(/,/g, '');
  }
  
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

/**
 * Valida que un monto sea positivo
 */
export function validatePositiveMoney(amount: number): boolean {
  return amount >= 0 && isFinite(amount);
}

/**
 * Valida que un monto esté dentro de un rango
 */
export function validateMoneyRange(amount: number, min: number, max: number): boolean {
  return amount >= min && amount <= max && isFinite(amount);
}

/**
 * Suma dos montos con precisión
 */
export function addMoney(a: number, b: number): number {
  return Math.round((a + b) * 100) / 100;
}

/**
 * Resta dos montos con precisión
 */
export function subtractMoney(a: number, b: number): number {
  return Math.round((a - b) * 100) / 100;
}

/**
 * Multiplica un monto por un factor
 */
export function multiplyMoney(amount: number, factor: number): number {
  return Math.round(amount * factor * 100) / 100;
}

/**
 * Divide un monto por un divisor
 */
export function divideMoney(amount: number, divisor: number): number {
  if (divisor === 0) throw new Error('División por cero');
  return Math.round((amount / divisor) * 100) / 100;
}

/**
 * Compara dos montos (útil para ordenamiento)
 * @returns -1 si a < b, 0 si a === b, 1 si a > b
 */
export function compareMoney(a: number, b: number): -1 | 0 | 1 {
  const diff = a - b;
  if (Math.abs(diff) < 0.01) return 0; // Tolerancia de 1 centavo
  return diff < 0 ? -1 : 1;
}

/**
 * Obtiene el símbolo de una moneda
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_CONFIGS[currency].symbol;
}

/**
 * Obtiene configuración de formato para una moneda
 */
export function getCurrencyConfig(currency: CurrencyCode): MoneyFormatConfig {
  return CURRENCY_CONFIGS[currency];
}
