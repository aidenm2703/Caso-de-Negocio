/**
 * MÓDULO DE PLANES ESTRATÉGICOS (NIVEL 3)
 * Define y compara los 4 planes obligatorios del caso:
 * 1. Plan Actual ($4k Meta + $4k Google, 0 técnicos)
 * 2. Plan Agencia ($8k Meta + $0 Google, 0 técnicos)
 * 3. Plan Propio A (Optimización sin técnicos extra, activa Supuesto 7)
 * 4. Plan Propio B (Expansión con 1 técnico extra + Supuesto 7)
 */

import { simulate24Months } from './cash.js';

export const STRATEGIC_PLANS = {
  ACTUAL: {
    id: 'actual',
    name: 'Plan Actual (Línea Base)',
    description: '$4.000 en Meta y $4.000 en Google constantes, 100 visitas de capacidad, sin Supuesto 7.',
    metaSpend: 4000,
    googleSpend: 4000,
    techHires: [],
    applySupuesto7: false,
  },
  AGENCIA: {
    id: 'agencia',
    name: 'Plan Agencia Leadly',
    description: '$8.000 en Meta y $0 en Google, evaluado con la saturación real del historial (840 leads).',
    metaSpend: 8000,
    googleSpend: 0,
    techHires: [],
    applySupuesto7: false,
  },
  PROPIO_A: {
    id: 'propio_a',
    name: 'Plan Propio A (Optimizado sin Técnicos)',
    description: 'Reparto óptimo ($3.000 Meta + $5.000 Google) con Supuesto 7 (filtro + respuesta rápida) activo desde Mes 1.',
    metaSpend: 3000,
    googleSpend: 5000,
    techHires: [],
    applySupuesto7: true,
    activateSupuesto7Month: 1,
  },
  PROPIO_B: {
    id: 'propio_b',
    name: 'Plan Propio B (Crecimiento con 1 Técnico Extra)',
    description: 'Contrata 1 técnico extra en Mes 2 (150 visitas desde Mes 3), pauta $4.500 Meta + $6.000 Google y Supuesto 7.',
    schedule: Array.from({ length: 24 }, (_, i) => {
      const month = i + 1;
      // Contratar en Mes 2 (capacita en mes 2, activo desde mes 3)
      const hireTech = month === 2;
      // Desde mes 3 ampliamos inversión para aprovechar las 150 visitas
      const metaSpend = month <= 2 ? 4000 : 5000;
      const googleSpend = month <= 2 ? 4000 : 6000;
      return {
        month,
        metaSpend,
        googleSpend,
        hireTech,
        applySupuesto7: true,
      };
    }),
  },
};

export function compareAllPlans(customPlans = null) {
  const plans = customPlans || STRATEGIC_PLANS;
  const results = [];

  for (const [key, planDef] of Object.entries(plans)) {
    const sim = simulate24Months(planDef);
    results.push({
      id: planDef.id || key,
      name: planDef.name,
      description: planDef.description,
      minCash: sim.summary.minCash,
      minCashMonth: sim.summary.minCashMonth,
      finalCash: sim.summary.finalCash,
      totalSales: sim.summary.totalSales,
      totalLeads: sim.summary.totalLeads,
      totalVisits: sim.summary.totalVisits,
      valid: sim.summary.valid,
      validationErrors: sim.summary.validationErrors,
      rawSimulation: sim,
    });
  }

  // Criterio de desempate y ganador:
  // "Gana el plan que termina con más caja en el mes 24 sin romper ninguna regla,
  // y si hay empate, el que hizo más instalaciones en total."
  const validPlans = results.filter(r => r.valid);
  validPlans.sort((a, b) => {
    if (Math.abs(b.finalCash - a.finalCash) > 0.01) {
      return b.finalCash - a.finalCash;
    }
    return b.totalSales - a.totalSales;
  });

  const winnerId = validPlans.length > 0 ? validPlans[0].id : null;

  return {
    plans: results.map(p => ({
      ...p,
      isWinner: p.id === winnerId,
    })),
    winnerId,
  };
}
