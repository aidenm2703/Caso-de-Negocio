/**
 * MÓDULO DE INTERPOLACIÓN LINEAL DE LEADS
 * Cumple con el Supuesto 5 del caso:
 * - Inversión $0 -> 0 leads.
 * - Entre $0 y $2.000: recta desde cero.
 * - Entre puntos del historial: interpolación lineal.
 * - Google satura en 160 leads arriba de $8.000.
 */

import { CASE_DATA } from '../data/caseData.js';

export function getLeadsFromSpend(spend, channel = 'meta') {
  const numSpend = Number(spend) || 0;
  if (numSpend <= 0) return 0;

  const history = CASE_DATA.history;
  const isGoogle = channel.toLowerCase() === 'google';

  // Regla especial de Google: tope de 160 leads
  if (isGoogle && numSpend >= 8000) {
    return CASE_DATA.googleLeadCap;
  }

  // Si está exactamente en un punto conocido
  const exactPoint = history.find(p => p.spend === numSpend);
  if (exactPoint) {
    return isGoogle ? exactPoint.googleLeads : exactPoint.metaLeads;
  }

  // Buscar el segmento [x0, x1]
  for (let i = 0; i < history.length - 1; i++) {
    const p0 = history[i];
    const p1 = history[i + 1];

    if (numSpend >= p0.spend && numSpend <= p1.spend) {
      const y0 = isGoogle ? p0.googleLeads : p0.metaLeads;
      const y1 = isGoogle ? p1.googleLeads : p1.metaLeads;
      const ratio = (numSpend - p0.spend) / (p1.spend - p0.spend);
      return y0 + (y1 - y0) * ratio;
    }
  }

  // Si la inversión en Meta supera los $10.000, proyectar con la última pendiente
  const lastP = history[history.length - 1];
  const prevP = history[history.length - 2];
  if (isGoogle) return CASE_DATA.googleLeadCap;

  const yLast = lastP.metaLeads;
  const yPrev = prevP.metaLeads;
  const slope = (yLast - yPrev) / (lastP.spend - prevP.spend); // (960 - 840) / 2000 = 0.06 leads / $
  return yLast + (numSpend - lastP.spend) * slope;
}
