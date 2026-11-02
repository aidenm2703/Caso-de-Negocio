/**
 * MÓDULO DE OPTIMIZACIÓN Y CPL DE EQUILIBRIO (EXTRAS 1 Y 2)
 * 1. CPL de equilibrio: calcula a qué costo por lead Meta iguala el CAC real de Google.
 * 2. Optimizador por rejilla (Grid Search): encuentra el reparto óptimo de pauta mensual
 *    y la mejor estrategia a 24 meses.
 */

import { CASE_DATA } from '../data/caseData.js';
import { calculateFunnel } from './funnel.js';
import { evaluateScenario } from './unitEconomics.js';
import { simulate24Months } from './cash.js';

/**
 * Calcula el CPL de equilibrio para Meta respecto al CAC real objetivo de Google.
 * Fórmula analítica exacta:
 * CAC_Real = (CPL + k_visit * costPerVisit) / k_sale
 * => CPL_equilibrio = (CAC_Objetivo * k_sale) - (k_visit * costPerVisit)
 */
export function calculateBreakevenCpl({
  targetRealCac = null,
  applySupuesto7 = false,
  costPerVisit = CASE_DATA.visits.costPerVisit,
  unitContribution = CASE_DATA.economics.unitContribution,
} = {}) {
  // Si no se pasa targetRealCac, calcular el CAC real de Google con $4k
  let googleTargetCac = targetRealCac;
  if (!googleTargetCac) {
    const baseFunnel = calculateFunnel({ metaSpend: 4000, googleSpend: 4000 });
    const baseEval = evaluateScenario(baseFunnel);
    googleTargetCac = baseEval.google.realCac; // ~$535.54
  }

  const rates = applySupuesto7 ? CASE_DATA.supuesto7 : CASE_DATA.funnelRates.meta;
  const kVisit = rates.contactRate * rates.scheduleRate * rates.visitCompletedRate;
  const kSale = kVisit * rates.closeRate;
  const visitCostPerLead = kVisit * costPerVisit;

  const breakevenCpl = (googleTargetCac * kSale) - visitCostPerLead;

  return {
    targetGoogleRealCac: googleTargetCac,
    kVisit,
    kSale,
    visitCostPerLead,
    breakevenCpl,
    actualCplBase: 8.00,
    differenceDollar: 8.00 - breakevenCpl,
    insight: `Para que Meta iguale la eficiencia de cliente de Google ($${googleTargetCac.toFixed(2)}), el lead de Meta tendría que costar $${breakevenCpl.toFixed(2)} (en vez de $8,00).`,
  };
}

/**
 * Optimizador de reparto mensual mediante búsqueda por rejilla (Grid Search)
 * Evalúa combinaciones de inversión total dada (p. ej. $8.000) variando pasos de $500
 */
export function optimizeMonthlyBudget({
  totalBudget = 8000,
  step = 500,
  capacity = 100,
  applySupuesto7 = false,
} = {}) {
  const options = [];

  for (let googleSpend = 0; googleSpend <= Math.min(totalBudget, 8000); googleSpend += step) {
    const metaSpend = totalBudget - googleSpend;
    if (metaSpend < 0 || metaSpend > 10000) continue;

    const funnel = calculateFunnel({ metaSpend, googleSpend, capacity, applySupuesto7 });
    const evaluation = evaluateScenario(funnel);

    options.push({
      metaSpend,
      googleSpend,
      totalSpend: totalBudget,
      sales: evaluation.total.sales,
      leads: evaluation.total.leads,
      visitsDone: evaluation.total.visitsDone,
      capacityUtilizationPct: funnel.total.capacityUtilizationPct,
      realCac: evaluation.total.realCac,
      netContribution: (evaluation.total.sales * evaluation.total.unitContribution) -
        (evaluation.total.visitsDone * CASE_DATA.visits.costPerVisit) - totalBudget,
    });
  }

  // Ordenar por mayor contribución neta (ganancia después de pauta y visitas)
  options.sort((a, b) => b.netContribution - a.netContribution);

  return {
    best: options[0],
    allOptions: options,
  };
}

/**
 * Curva de rendimiento marginal: leads extra y costo del siguiente tramo de inversión ($2.000)
 */
export function calculateMarginalReturns() {
  const history = CASE_DATA.history;
  const intervals = [];

  for (let i = 0; i < history.length - 1; i++) {
    const p0 = history[i];
    const p1 = history[i + 1];
    const deltaSpend = p1.spend - p0.spend;
    const deltaMetaLeads = p1.metaLeads - p0.metaLeads;
    const deltaGoogleLeads = p1.googleLeads - p0.googleLeads;

    intervals.push({
      range: `$${p0.spend} -> $${p1.spend}`,
      deltaSpend,
      meta: {
        extraLeads: deltaMetaLeads,
        marginalCpl: deltaMetaLeads > 0 ? deltaSpend / deltaMetaLeads : Infinity,
      },
      google: {
        extraLeads: deltaGoogleLeads,
        marginalCpl: deltaGoogleLeads > 0 ? deltaSpend / deltaGoogleLeads : Infinity,
      },
    });
  }

  return intervals;
}
