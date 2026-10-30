/**
 * MÓDULO DE EMBUDO Y CAPACIDAD OPERATIVA
 * Modela el flujo completo desde el lead hasta la venta y gestiona
 * el cuello de botella de visitas según la prioridad oficial:
 * 1º Google (mayor tasa de cierre)
 * 2º Meta (saldo de capacidad)
 */

import { CASE_DATA } from '../data/caseData.js';
import { getLeadsFromSpend } from './interpolation.js';

export function calculateFunnel({
  metaSpend = 4000,
  googleSpend = 4000,
  capacity = CASE_DATA.visits.baseMonthlyCapacity,
  applySupuesto7 = false,
  agencyModeConstantCpl = false,
  customMetaRates = null,
  customGoogleRates = null,
} = {}) {
  // 1. Leads de cada canal
  let metaLeads = 0;
  if (agencyModeConstantCpl) {
    // "Como la cuenta la agencia": $8 fijo por lead
    metaLeads = metaSpend > 0 ? metaSpend / 8 : 0;
  } else {
    metaLeads = getLeadsFromSpend(metaSpend, 'meta');
    if (applySupuesto7) {
      // Supuesto 7: baja 20% los leads de Meta (queda en 80%)
      metaLeads *= CASE_DATA.supuesto7.leadReductionFactor;
    }
  }

  const googleLeads = getLeadsFromSpend(googleSpend, 'google');

  // 2. Tasas de conversión del embudo
  let metaRates = applySupuesto7
    ? { ...CASE_DATA.supuesto7 }
    : { ...CASE_DATA.funnelRates.meta };

  if (customMetaRates) {
    metaRates = { ...metaRates, ...customMetaRates };
  }

  let googleRates = { ...CASE_DATA.funnelRates.google };
  if (customGoogleRates) {
    googleRates = { ...googleRates, ...customGoogleRates };
  }

  // 3. Progresión del embudo Meta
  const metaContacted = metaLeads * metaRates.contactRate;
  const metaScheduled = metaContacted * metaRates.scheduleRate;
  const metaVisitsRequested = metaScheduled * metaRates.visitCompletedRate;

  // 4. Progresión del embudo Google
  const googleContacted = googleLeads * googleRates.contactRate;
  const googleScheduled = googleContacted * googleRates.scheduleRate;
  const googleVisitsRequested = googleScheduled * googleRates.visitCompletedRate;

  const totalVisitsRequested = metaVisitsRequested + googleVisitsRequested;

  // 5. Aplicación de capacidad (Supuesto 4: primero Google, luego Meta)
  const googleVisitsDone = Math.min(googleVisitsRequested, capacity);
  const remainingCapacity = Math.max(0, capacity - googleVisitsDone);
  const metaVisitsDone = Math.min(metaVisitsRequested, remainingCapacity);

  const totalVisitsDone = googleVisitsDone + metaVisitsDone;
  const capacityUtilizationPct = capacity > 0 ? (totalVisitsDone / capacity) * 100 : 0;
  const visitsLost = Math.max(0, totalVisitsRequested - capacity);
  const capacityExceeded = totalVisitsRequested > capacity;

  // 6. Ventas finales
  const metaSales = metaVisitsDone * metaRates.closeRate;
  const googleSales = googleVisitsDone * googleRates.closeRate;
  const totalSales = metaSales + googleSales;

  // Tasa de conversión global lead a venta
  const metaLeadToSaleRate = metaLeads > 0 ? (metaSales / metaLeads) * 100 : 0;
  const googleLeadToSaleRate = googleLeads > 0 ? (googleSales / googleLeads) * 100 : 0;

  return {
    meta: {
      spend: metaSpend,
      leads: metaLeads,
      contacted: metaContacted,
      scheduled: metaScheduled,
      visitsRequested: metaVisitsRequested,
      visitsDone: metaVisitsDone,
      sales: metaSales,
      rates: metaRates,
      leadToSaleRatePct: metaLeadToSaleRate,
    },
    google: {
      spend: googleSpend,
      leads: googleLeads,
      contacted: googleContacted,
      scheduled: googleScheduled,
      visitsRequested: googleVisitsRequested,
      visitsDone: googleVisitsDone,
      sales: googleSales,
      rates: googleRates,
      leadToSaleRatePct: googleLeadToSaleRate,
    },
    total: {
      spend: metaSpend + googleSpend,
      leads: metaLeads + googleLeads,
      contacted: metaContacted + googleContacted,
      scheduled: metaScheduled + googleScheduled,
      visitsRequested: totalVisitsRequested,
      visitsDone: totalVisitsDone,
      sales: totalSales,
      capacity,
      capacityUtilizationPct,
      visitsLost,
      capacityExceeded,
    },
  };
}
