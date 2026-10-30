/**
 * TESTS DE REFERENCIA DEL MODELO (VALORES CALCULADOS A MANO)
 * Ejecución con el test runner nativo de Node: node --test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { CASE_DATA } from '../src/data/caseData.js';
import { getLeadsFromSpend } from '../src/model/interpolation.js';
import { calculateFunnel } from '../src/model/funnel.js';
import { calculateUnitContribution, evaluateScenario } from '../src/model/unitEconomics.js';
import { simulateMonth, simulate24Months, getMonth1ManualDetail, validatePlanRules } from '../src/model/cash.js';
import { compareAllPlans, STRATEGIC_PLANS } from '../src/model/plans.js';
import { calculateBreakevenCpl, optimizeMonthlyBudget } from '../src/model/optimizer.js';

test('1. Contribución unitaria por venta antes de marketing es $1.625', () => {
  const { totalContribution } = calculateUnitContribution();
  // $6.500 * (28% - 3%) = $6.500 * 25% = $1.625
  assert.equal(totalContribution, 1625);
});

test('2. Interpolación lineal de leads en Meta y Google', () => {
  // Puntos exactos
  assert.equal(getLeadsFromSpend(0, 'meta'), 0);
  assert.equal(getLeadsFromSpend(0, 'google'), 0);
  assert.equal(getLeadsFromSpend(2000, 'meta'), 280);
  assert.equal(getLeadsFromSpend(4000, 'meta'), 500);
  assert.equal(getLeadsFromSpend(4000, 'google'), 100);
  assert.equal(getLeadsFromSpend(8000, 'meta'), 840);
  assert.equal(getLeadsFromSpend(8000, 'google'), 160);
  assert.equal(getLeadsFromSpend(10000, 'google'), 160); // Saturación en 160

  // Punto intermedio ($3.000)
  // Meta: 280 + (500 - 280) * 0.5 = 390
  assert.equal(getLeadsFromSpend(3000, 'meta'), 390);
  // Google: 55 + (100 - 55) * 0.5 = 77.5
  assert.equal(getLeadsFromSpend(3000, 'google'), 77.5);
});

test('3. Escenario Hoy ($4.000 Meta + $4.000 Google) coincide con valores de referencia', () => {
  const funnel = calculateFunnel({ metaSpend: 4000, googleSpend: 4000 });
  const evalResult = evaluateScenario(funnel);

  // Leads
  assert.equal(funnel.meta.leads, 500);
  assert.equal(funnel.google.leads, 100);

  // Visitas pedidas
  // Meta: 500 * 0.55 * 0.30 * 0.70 = 57.75
  assert.ok(Math.abs(funnel.meta.visitsRequested - 57.75) < 0.001);
  // Google: 100 * 0.85 * 0.55 * 0.85 = 39.7375 (~39.7)
  assert.ok(Math.abs(funnel.google.visitsRequested - 39.7375) < 0.001);
  // Total visitas pedidas: ~97.4875 (< 100 capacidad)
  assert.ok(Math.abs(funnel.total.visitsDone - 97.4875) < 0.001);

  // Ventas
  // Meta: 57.75 * 0.18 = 10.395 (~10.4)
  assert.ok(Math.abs(funnel.meta.sales - 10.395) < 0.001);
  // Google: 39.7375 * 0.30 = 11.92125 (~11.9)
  assert.ok(Math.abs(funnel.google.sales - 11.92125) < 0.001);
  // Total ventas: ~22.31625 (~22.3)
  assert.ok(Math.abs(funnel.total.sales - 22.31625) < 0.001);

  // CAC de anuncios
  // Meta: $4.000 / 10.395 ≈ $384.80 (~$385)
  assert.ok(Math.abs(evalResult.meta.adCac - 384.80) < 1.0);
  // Google: $4.000 / 11.92125 ≈ $335.53 (~$336)
  assert.ok(Math.abs(evalResult.google.adCac - 335.53) < 1.0);

  // CAC real: (Inversión + Visitas * $60) / Ventas
  // Meta: ($4.000 + 57.75 * 60) / 10.395 = $7.465 / 10.395 ≈ $718.13 (~$718)
  assert.ok(Math.abs(evalResult.meta.realCac - 718.13) < 0.5);
  // Google: ($4.000 + 39.7375 * 60) / 11.92125 = $6.384.25 / 11.92125 ≈ $535.54 (~$536)
  assert.ok(Math.abs(evalResult.google.realCac - 535.54) < 0.5);

  // LTV:CAC
  // Meta: 1625 / 718.13 ≈ 2.26 (~2.3)
  assert.ok(Math.abs(evalResult.meta.ltvCac - 2.26) < 0.05);
  // Google: 1625 / 535.54 ≈ 3.03 (~3.0)
  assert.ok(Math.abs(evalResult.google.ltvCac - 3.03) < 0.05);

  // Valor de una visita
  // Meta: 18% * 1625 - 60 = 292.5 - 60 = $232.50
  assert.ok(Math.abs(evalResult.meta.visitValue - 232.50) < 0.001);
  // Google: 30% * 1625 - 60 = 487.5 - 60 = $427.50
  assert.ok(Math.abs(evalResult.google.visitValue - 427.50) < 0.001);
});

test('4. Propuesta de la agencia con el historial real ($8.000 Meta)', () => {
  const funnel = calculateFunnel({ metaSpend: 8000, googleSpend: 0 });
  // 840 leads según historial
  assert.equal(funnel.meta.leads, 840);
  // Visitas pedidas: 840 * 0.55 * 0.30 * 0.70 = 97.02 (~97 visitas)
  assert.ok(Math.abs(funnel.meta.visitsRequested - 97.02) < 0.01);
  // Ventas: 97.02 * 0.18 = 17.4636 (~17.5 ventas)
  assert.ok(Math.abs(funnel.meta.sales - 17.46) < 0.1);
  // Comprobación de la pérdida: 17.46 es mucho peor que las 22.32 de hoy
  assert.ok(funnel.meta.sales < 22.3);
});

test('5. Propuesta "como la cuenta la agencia" ($8 constante = 1.000 leads)', () => {
  const funnel = calculateFunnel({
    metaSpend: 8000,
    googleSpend: 0,
    agencyModeConstantCpl: true,
  });
  // 1.000 leads teóricos
  assert.equal(funnel.meta.leads, 1000);
  // Visitas pedidas: 1000 * 0.55 * 0.30 * 0.70 = 115.5 visitas
  assert.ok(Math.abs(funnel.meta.visitsRequested - 115.5) < 0.001);
  // Se topan en 100 de capacidad
  assert.equal(funnel.meta.visitsDone, 100);
  // Ventas resultantes: 100 * 0.18 = 18 ventas (aun con 1.000 leads, pierde contra hoy)
  assert.equal(funnel.meta.sales, 18);
});

test('6. Verificación matemática exacta del Mes 1 del plan actual', () => {
  const { result } = getMonth1ManualDetail();
  // Ventas mes 1: 22.31625
  assert.ok(Math.abs(result.sales - 22.31625) < 0.001);
  // Entradas: $144.027,81
  assert.ok(Math.abs(result.inflows.total - 144027.81) < 0.1);
  // Salidas: $140.291,51
  assert.ok(Math.abs(result.outflows.total - 140291.51) < 0.1);
  // Flujo neto: +$3.736,30
  assert.ok(Math.abs(result.netCashFlow - 3736.30) < 0.1);
  // Caja final mes 1: $12.000 + $3.736,30 = $15.736,30 (~$15.700)
  assert.ok(Math.abs(result.endingCash - 15736.30) < 0.1);
  assert.ok(!result.safetyFloorBreached);
});

test('7. CPL de equilibrio para Meta respecto al CAC real de Google', () => {
  const breakeven = calculateBreakevenCpl();
  // El CPL de equilibrio debe ser de aprox. $4.20
  assert.ok(Math.abs(breakeven.breakevenCpl - 4.20) < 0.05);
});

test('8. Comparación de los 4 planes estratégicos a 24 meses', () => {
  const comparison = compareAllPlans();
  assert.equal(comparison.plans.length, 4);

  const actual = comparison.plans.find(p => p.id === 'actual');
  const agencia = comparison.plans.find(p => p.id === 'agencia');

  // El plan actual debe ser válido (no rompe el piso de $5.000)
  assert.ok(actual.valid);
  assert.ok(actual.minCash >= 5000);

  // La agencia genera mucho menos ventas que el plan actual
  assert.ok(agencia.totalSales < actual.totalSales);

  // Debe haber un plan ganador identificado
  assert.ok(comparison.winnerId !== null);
});
