/**
 * MÓDULO DE PRUEBAS DE ESTRÉS PARA EL BANCO (EXTRA 5)
 * Simula escenarios adversos solicitados:
 * 1. Contacto -10%
 * 2. CPL +20% (leads rinden 20% menos)
 * 3. Cierre -15%
 * 4. Cobro retrasado (segunda mitad se retrasa 1 mes más)
 * 5. Escenario Combinado de Estrés Severo ("Tormenta Perfecta")
 * Calcula si se rompe el piso de $5.000 y el monto exacto de línea de crédito necesaria.
 */

import { CASE_DATA } from '../data/caseData.js';
import { calculateFunnel } from './funnel.js';

export function runStressSimulation({
  plan = { metaSpend: 4000, googleSpend: 4000, applySupuesto7: true },
  contactPenaltyPct = 0, // e.g. 0.10 para -10%
  leadPenaltyPct = 0, // e.g. 0.20 para leads / 1.20
  closePenaltyPct = 0, // e.g. 0.15 para -15%
  delayedCollectionMonths = 0, // 0 = normal (mes t-1), 1 = retraso adicional
}) {
  const months = [];
  let prevSales = [CASE_DATA.cash.month0Sales]; // Historial de ventas para retrasos
  let currentCash = CASE_DATA.cash.initialCash;

  for (let m = 1; m <= 24; m++) {
    const metaSpend = plan.metaSpend ?? 4000;
    const googleSpend = plan.googleSpend ?? 4000;

    // Calcular embudo con penalizaciones
    const customMetaRates = {
      contactRate: (plan.applySupuesto7 ? CASE_DATA.supuesto7.contactRate : CASE_DATA.funnelRates.meta.contactRate) * (1 - contactPenaltyPct),
      closeRate: (plan.applySupuesto7 ? CASE_DATA.supuesto7.closeRate : CASE_DATA.funnelRates.meta.closeRate) * (1 - closePenaltyPct),
    };
    const customGoogleRates = {
      contactRate: CASE_DATA.funnelRates.google.contactRate * (1 - contactPenaltyPct),
      closeRate: CASE_DATA.funnelRates.google.closeRate * (1 - closePenaltyPct),
    };

    const funnel = calculateFunnel({
      metaSpend,
      googleSpend,
      applySupuesto7: plan.applySupuesto7,
      customMetaRates,
      customGoogleRates,
    });

    // Ajuste de penalización de CPL (+20% CPL equivale a leads / 1.20)
    let currentMonthSales = funnel.total.sales;
    let visitsDone = funnel.total.visitsDone;
    if (leadPenaltyPct > 0) {
      currentMonthSales = currentMonthSales / (1 + leadPenaltyPct);
      visitsDone = visitsDone / (1 + leadPenaltyPct);
    }

    prevSales.push(currentMonthSales);

    // Entradas:
    // Cobro de firma: 50% de ventas actuales
    const inflowSigning = currentMonthSales * CASE_DATA.economics.installationPrice * 0.50;

    // Cobro de instalación: si delayedCollectionMonths === 1, se cobra 2 meses después
    let inflowInstallation = 0;
    const targetHistoryIndex = prevSales.length - 2 - delayedCollectionMonths;
    if (targetHistoryIndex >= 0) {
      inflowInstallation = prevSales[targetHistoryIndex] * CASE_DATA.economics.installationPrice * 0.50;
    }

    const totalInflows = inflowSigning + inflowInstallation;

    // Salidas estándar
    const outflowEquipment = currentMonthSales * CASE_DATA.economics.installationPrice * 0.55;
    const outflowCommission = currentMonthSales * CASE_DATA.economics.installationPrice * 0.03;
    const outflowInstallation = (prevSales[prevSales.length - 2] || 0) * CASE_DATA.economics.installationPrice * 0.17;
    const outflowVisits = visitsDone * CASE_DATA.visits.costPerVisit;
    const outflowMarketing = metaSpend + googleSpend;
    const outflowFixed = CASE_DATA.cash.monthlyFixedCosts;

    const totalOutflows = outflowEquipment + outflowCommission + outflowInstallation +
      outflowVisits + outflowMarketing + outflowFixed;

    const netCash = totalInflows - totalOutflows;
    currentCash += netCash;

    months.push({
      month: m,
      sales: currentMonthSales,
      endingCash: currentCash,
      inflows: totalInflows,
      outflows: totalOutflows,
    });
  }

  const minCash = Math.min(...months.map(m => m.endingCash));
  const minCashMonth = months.find(m => m.endingCash === minCash)?.month || 1;
  const breachesFloor = minCash < CASE_DATA.cash.safetyFloor;
  const creditNeeded = breachesFloor ? CASE_DATA.cash.safetyFloor - minCash : 0;

  return {
    minCash,
    minCashMonth,
    finalCash: months[23].endingCash,
    breachesFloor,
    creditNeeded,
    months,
  };
}

export function runAllStressTests(basePlan) {
  const tests = [
    {
      name: 'Base (Plan sin estrés)',
      params: {},
    },
    {
      name: 'Estrés 1: Contacto −10%',
      params: { contactPenaltyPct: 0.10 },
    },
    {
      name: 'Estrés 2: CPL +20% (menos leads)',
      params: { leadPenaltyPct: 0.20 },
    },
    {
      name: 'Estrés 3: Cierre −15%',
      params: { closePenaltyPct: 0.15 },
    },
    {
      name: 'Estrés 4: Cobro retrasado (30 días extra)',
      params: { delayedCollectionMonths: 1 },
    },
    {
      name: 'Estrés Severo: Tormenta Perfecta (todos juntos)',
      params: {
        contactPenaltyPct: 0.10,
        leadPenaltyPct: 0.20,
        closePenaltyPct: 0.15,
        delayedCollectionMonths: 1,
      },
    },
  ];

  return tests.map(t => {
    const res = runStressSimulation({ plan: basePlan, ...t.params });
    return {
      testName: t.name,
      minCash: res.minCash,
      minCashMonth: res.minCashMonth,
      finalCash: res.finalCash,
      breachesFloor: res.breachesFloor,
      creditNeeded: res.creditNeeded,
    };
  });
}
