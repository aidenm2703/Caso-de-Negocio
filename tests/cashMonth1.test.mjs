/**
 * VERIFICACIÓN EXHAUSTIVA DE MES 1 A MANO
 * Comprueba cada cuenta del Mes 1 del plan actual ($4.000 Meta + $4.000 Google)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { getMonth1ManualDetail } from '../src/model/cash.js';

test('Verificación exhaustiva paso a paso del Mes 1', () => {
  const { result } = getMonth1ManualDetail();

  // 1. Leads
  assert.equal(result.metaLeads, 500);
  assert.equal(result.googleLeads, 100);
  assert.equal(result.leads, 600);

  // 2. Visitas hechas
  assert.ok(Math.abs(result.metaVisitsDone - 57.75) < 0.001);
  assert.ok(Math.abs(result.googleVisitsDone - 39.7375) < 0.001);
  assert.ok(Math.abs(result.visitsDone - 97.4875) < 0.001);

  // 3. Ventas
  assert.ok(Math.abs(result.metaSales - 10.395) < 0.001);
  assert.ok(Math.abs(result.googleSales - 11.92125) < 0.001);
  assert.ok(Math.abs(result.sales - 22.31625) < 0.001);

  // 4. Entradas
  // 50% mes actual: 22.31625 * $3.250 = $72.527,8125
  assert.ok(Math.abs(result.inflows.currentSales50Pct - 72527.8125) < 0.01);
  // 50% mes anterior (22 ventas): 22 * $3.250 = $71.500
  assert.equal(result.inflows.prevSales50Pct, 71500);
  // Total entradas: $144.027,81
  assert.ok(Math.abs(result.inflows.total - 144027.8125) < 0.01);

  // 5. Salidas
  // Equipos (55% de $6.500 = $3.575): 22.31625 * 3575 = $79.780,59375
  assert.ok(Math.abs(result.outflows.equipment55Pct - 79780.59375) < 0.01);
  // Comisión (3% de $6.500 = $195): 22.31625 * 195 = $4.351,66875
  assert.ok(Math.abs(result.outflows.commission3Pct - 4351.66875) < 0.01);
  // Instalación mes anterior (17% de $6.500 = $1.105): 22 * 1105 = $24.310
  assert.equal(result.outflows.installation17Pct, 24310);
  // Visitas ($60 * 97.4875): $5.849,25
  assert.equal(result.outflows.visits, 5849.25);
  // Marketing: $8.000
  assert.equal(result.outflows.marketing, 8000);
  // Costos fijos: $18.000
  assert.equal(result.outflows.fixedCosts, 18000);
  // Técnicos extra: $0
  assert.equal(result.outflows.extraTechs, 0);
  // Total salidas: $140.291,5125
  assert.ok(Math.abs(result.outflows.total - 140291.5125) < 0.01);

  // 6. Flujo neto y caja final
  // Flujo neto: +$3.736,30
  assert.ok(Math.abs(result.netCashFlow - 3736.30) < 0.01);
  // Caja inicial: $12.000
  assert.equal(result.beginningCash, 12000);
  // Caja final: $15.736,30
  assert.ok(Math.abs(result.endingCash - 15736.30) < 0.01);
});
