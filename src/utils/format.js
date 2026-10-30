/**
 * UTILIDADES DE FORMATEO (ESPAÑOL LATAM / INTERNACIONAL)
 * Formatos consistentes con las convenciones del caso:
 * Moneda: "$12.000" o "$718,13"
 * Porcentaje: "28,0%" o "18%"
 * Números y unidades
 */

export function formatCurrency(amount, decimals = 0) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  const num = Number(amount);
  const parts = num.toFixed(decimals).split('.');
  // Separador de miles: punto (.)
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (decimals > 0 && parts[1]) {
    // Separador decimal: coma (,)
    return `$${integerPart},${parts[1]}`;
  }
  return `$${integerPart}`;
}

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0,0%';
  const num = Number(value) * 100;
  return `${num.toFixed(decimals).replace('.', ',')}%`;
}

export function formatNumber(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  const num = Number(val);
  const parts = num.toFixed(decimals).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (decimals > 0 && parts[1]) {
    return `${integerPart},${parts[1]}`;
  }
  return integerPart;
}

export function formatMultiplier(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return '0,0x';
  return `${Number(val).toFixed(decimals).replace('.', ',')}x`;
}
