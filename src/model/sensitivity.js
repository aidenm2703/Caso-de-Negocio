/**
 * MÓDULO DE ANÁLISIS DE SENSIBILIDAD (GRÁFICO TORNADO) (EXTRA 3)
 * Mide el impacto de variaciones del ±15% y ±20% en parámetros clave
 * sobre el CAC Real y la Caja al Mes 24.
 */

import { CASE_DATA } from '../data/caseData.js';
import { calculateFunnel } from './funnel.js';
import { evaluateScenario } from './unitEconomics.js';
import { simulate24Months } from './cash.js';

export function runTornadoAnalysis(basePlan = { metaSpend: 4000, googleSpend: 4000 }) {
  const baseFunnel = calculateFunnel(basePlan);
  const baseEval = evaluateScenario(baseFunnel);
  const baseSim = simulate24Months(basePlan);

  const baseCacReal = baseEval.total.realCac;
  const baseFinalCash = baseSim.summary.finalCash;

  const variablesToTest = [
    {
      key: 'googleCloseRate',
      name: 'Tasa de Cierre Google',
      baseValue: 0.30,
      deltaPct: 0.20, // ±20%
      apply: (factor) => {
        const customRates = { closeRate: 0.30 * factor };
        const f = calculateFunnel({ ...basePlan, customGoogleRates: customRates });
        return evaluateScenario(f);
      },
    },
    {
      key: 'metaCloseRate',
      name: 'Tasa de Cierre Meta',
      baseValue: 0.18,
      deltaPct: 0.20,
      apply: (factor) => {
        const customRates = { closeRate: 0.18 * factor };
        const f = calculateFunnel({ ...basePlan, customMetaRates: customRates });
        return evaluateScenario(f);
      },
    },
    {
      key: 'visitCost',
      name: 'Costo por Visita ($60)',
      baseValue: 60,
      deltaPct: 0.20,
      apply: (factor) => {
        const f = calculateFunnel(basePlan);
        return evaluateScenario(f, { costPerVisit: 60 * factor });
      },
    },
    {
      key: 'contactRateGoogle',
      name: 'Tasa de Contacto Google',
      baseValue: 0.85,
      deltaPct: 0.15,
      apply: (factor) => {
        const customRates = { contactRate: Math.min(1.0, 0.85 * factor) };
        const f = calculateFunnel({ ...basePlan, customGoogleRates: customRates });
        return evaluateScenario(f);
      },
    },
    {
      key: 'contactRateMeta',
      name: 'Tasa de Contacto Meta',
      baseValue: 0.55,
      deltaPct: 0.15,
      apply: (factor) => {
        const customRates = { contactRate: 0.55 * factor };
        const f = calculateFunnel({ ...basePlan, customMetaRates: customRates });
        return evaluateScenario(f);
      },
    },
  ];

  const results = variablesToTest.map(v => {
    const lowEval = v.apply(1 - v.deltaPct);
    const highEval = v.apply(1 + v.deltaPct);

    const lowCac = lowEval.total.realCac;
    const highCac = highEval.total.realCac;
    const swingCac = Math.abs(highCac - lowCac);

    return {
      key: v.key,
      name: v.name,
      baseValue: v.baseValue,
      deltaPct: v.deltaPct,
      lowResult: lowCac,
      highResult: highCac,
      swing: swingCac,
    };
  });

  // Ordenar por amplitud del swing (el factor más crítico arriba en el tornado)
  results.sort((a, b) => b.swing - a.swing);

  return {
    baseCacReal,
    baseFinalCash,
    tornado: results,
  };
}
