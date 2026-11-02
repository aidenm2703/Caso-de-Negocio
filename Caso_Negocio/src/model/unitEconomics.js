/**
 * MÓDULO DE ECONOMÍA UNITARIA (UNIT ECONOMICS)
 * Calcula contribución, CPL, CAC de anuncios, CAC real, LTV:CAC,
 * visitas por venta, valor neto de visita y payback en caja por cliente.
 */

import { CASE_DATA } from '../data/caseData.js';

export function calculateUnitContribution({
  price = CASE_DATA.economics.installationPrice,
  grossMarginPct = CASE_DATA.economics.grossMarginPct,
  commissionPct = CASE_DATA.economics.salesCommissionPct,
  includeBattery = false,
  batteryAttachRate = CASE_DATA.battery.adoptionRate,
  batteryContribution = CASE_DATA.battery.unitContribution,
} = {}) {
  const baseContribution = price * (grossMarginPct - commissionPct);
  const batteryIncrement = includeBattery ? batteryContribution * batteryAttachRate : 0;
  return {
    baseContribution,
    batteryIncrement,
    totalContribution: baseContribution + batteryIncrement,
  };
}

export function calculateChannelEconomics({
  spend,
  leads,
  visitsDone,
  sales,
  closeRate,
  unitContribution = CASE_DATA.economics.unitContribution,
  costPerVisit = CASE_DATA.visits.costPerVisit,
}) {
  const cpl = leads > 0 ? spend / leads : 0;
  const adCac = sales > 0 ? spend / sales : 0;
  const visitsCost = visitsDone * costPerVisit;
  const realCac = sales > 0 ? (spend + visitsCost) / sales : 0;
  const ltvCac = realCac > 0 ? unitContribution / realCac : 0;
  const visitsPerSale = closeRate > 0 ? 1 / closeRate : 0;

  // Valor neto de una visita = (% cierre * contribución unitaria) - costo de la visita
  const visitValue = (closeRate * unitContribution) - costPerVisit;

  // Payback en caja por cliente individual:
  // Mes de firma (Mes 0): cobra 50% ($3.250), paga equipos 55% ($3.575) y comisión 3% ($195)
  // Flujo operativo mes 0 = $3.250 - $3.575 - $195 = -$520
  // Posición de caja mes 0 = -CAC_Real - $520
  // Mes siguiente (Mes 1): cobra 50% ($3.250), paga instalación 17% ($1.105)
  // Flujo operativo mes 1 = +$2.145
  // Posición de caja mes 1 = (Posición mes 0) + $2.145
  const clientFlowMonth0 = (0.50 - 0.55 - 0.03) * CASE_DATA.economics.installationPrice; // -$520
  const clientFlowMonth1 = (0.50 - 0.17) * CASE_DATA.economics.installationPrice; // +$2.145

  const paybackMonth0 = -realCac + clientFlowMonth0;
  const paybackMonth1 = paybackMonth0 + clientFlowMonth1;
  const recoveredInMonth1 = paybackMonth1 >= 0;

  return {
    spend,
    leads,
    visitsDone,
    sales,
    cpl,
    adCac,
    visitsCost,
    realCac,
    ltvCac,
    visitsPerSale,
    visitValue,
    payback: {
      clientFlowMonth0,
      clientFlowMonth1,
      paybackMonth0,
      paybackMonth1,
      recoveredInMonth1,
      recoveryMonth: recoveredInMonth1 ? 1 : 2,
    },
  };
}

export function evaluateScenario(funnelResult, options = {}) {
  const { totalContribution } = calculateUnitContribution(options);
  const costPerVisit = options.costPerVisit || CASE_DATA.visits.costPerVisit;

  const metaEco = calculateChannelEconomics({
    spend: funnelResult.meta.spend,
    leads: funnelResult.meta.leads,
    visitsDone: funnelResult.meta.visitsDone,
    sales: funnelResult.meta.sales,
    closeRate: funnelResult.meta.rates.closeRate,
    unitContribution: totalContribution,
    costPerVisit,
  });

  const googleEco = calculateChannelEconomics({
    spend: funnelResult.google.spend,
    leads: funnelResult.google.leads,
    visitsDone: funnelResult.google.visitsDone,
    sales: funnelResult.google.sales,
    closeRate: funnelResult.google.rates.closeRate,
    unitContribution: totalContribution,
    costPerVisit,
  });

  const totalSpend = funnelResult.total.spend;
  const totalLeads = funnelResult.total.leads;
  const totalVisitsDone = funnelResult.total.visitsDone;
  const totalSales = funnelResult.total.sales;
  const totalVisitsCost = totalVisitsDone * costPerVisit;
  const totalCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const totalAdCac = totalSales > 0 ? totalSpend / totalSales : 0;
  const totalRealCac = totalSales > 0 ? (totalSpend + totalVisitsCost) / totalSales : 0;
  const totalLtvCac = totalRealCac > 0 ? totalContribution / totalRealCac : 0;
  const totalVisitsPerSale = totalSales > 0 ? totalVisitsDone / totalSales : 0;
  const weightedCloseRate = totalVisitsDone > 0 ? totalSales / totalVisitsDone : 0;
  const totalVisitValue = (weightedCloseRate * totalContribution) - costPerVisit;

  return {
    meta: metaEco,
    google: googleEco,
    total: {
      spend: totalSpend,
      leads: totalLeads,
      visitsDone: totalVisitsDone,
      sales: totalSales,
      cpl: totalCpl,
      adCac: totalAdCac,
      visitsCost: totalVisitsCost,
      realCac: totalRealCac,
      ltvCac: totalLtvCac,
      visitsPerSale: totalVisitsPerSale,
      visitValue: totalVisitValue,
      unitContribution: totalContribution,
    },
    funnel: funnelResult,
  };
}
