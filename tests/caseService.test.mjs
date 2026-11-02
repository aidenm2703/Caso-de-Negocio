import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCase, createReferenceCase, saveCase, deleteCase } from '../src/services/caseService.js';
import { analyzeDashboardState } from '../src/services/dashboardService.js';
import { APP_ROUTES, routeForTab } from '../src/routes/routes.js';

test('la ficha de Sol de Casa reproduce las referencias conocidas del embudo', () => {
  const result = analyzeCase(createReferenceCase());
  assert.equal(result.valid, true);
  assert.ok(Math.abs(result.channel.meta.visitsDone - 57.75) < 0.01);
  assert.ok(Math.abs(result.channel.google.visitsDone - 39.7375) < 0.01);
  assert.ok(Math.abs(result.channel.meta.realCac - 718.13) < 0.02);
  assert.ok(Math.abs(result.channel.google.realCac - 535.54) < 0.02);
});

test('el servicio del tablero actualiza el resultado al cambiar supuestos', () => {
  const state = {
    metaSpend: 4000, googleSpend: 4000, extraTechs: 0, applySupuesto7: false,
    metaContactRate: .55, metaScheduleRate: .30, metaVisitRate: .70, metaCloseRate: .18,
    googleContactRate: .85, googleScheduleRate: .55, googleVisitRate: .85, googleCloseRate: .30,
    price: 6500, grossMarginPct: .28, commissionPct: .03, costPerVisit: 60,
    includeBattery: false, batteryAttachRate: .15,
  };
  const base = analyzeDashboardState(state);
  const changed = analyzeDashboardState({ ...state, metaContactRate: .8 });
  assert.ok(Math.abs(base.evaluation.meta.realCac - 718.13) < .02);
  assert.notEqual(changed.evaluation.meta.sales, base.evaluation.meta.sales);
});

test('la ficha exige fuente y todos los datos de conversión y capacidad', () => {
  const result = analyzeCase({ name: 'Caso incompleto', source: '', meta: {}, google: {} });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 10);
});

test('la prioridad de capacidad se aplica por caso y los valores no se cruzan', () => {
  const base = createReferenceCase();
  const googleFirst = analyzeCase({ ...base, capacity: 70 });
  const metaFirst = analyzeCase({ ...base, capacity: 70, capacityPriority: 'meta' });
  assert.ok(metaFirst.channel.meta.visitsDone > googleFirst.channel.meta.visitsDone);
  assert.ok(metaFirst.channel.google.visitsDone < googleFirst.channel.google.visitsDone);
  assert.equal(metaFirst.input.meta.leads, googleFirst.input.meta.leads);
});

test('guardar y borrar casos actualiza el contexto y solicita persistencia', () => {
  const context = { cases: [], persisted: 0, persistCases() { this.persisted += 1; } };
  const saved = saveCase(createReferenceCase(), context);
  assert.equal(saved.valid, true);
  assert.equal(context.cases.length, 1);
  assert.equal(context.persisted, 1);
  deleteCase(saved.record.id, context);
  assert.equal(context.cases.length, 0);
  assert.equal(context.persisted, 2);
});

test('cada vista del portal tiene una ruta estable', () => {
  assert.equal(APP_ROUTES.length, 7);
  assert.equal(routeForTab('tab-casos').path, '/casos');
  assert.equal(routeForTab('tab-auditoria').path, '/auditoria');
});
