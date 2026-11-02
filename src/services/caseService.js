import { CASE_DATA } from '../data/caseData.js';
import { getLeadsFromSpend } from '../model/interpolation.js';

const RATE_KEYS = ['contactRate', 'scheduleRate', 'visitRate', 'closeRate'];

export function validateCase(input) {
  const errors = [];
  if (!input?.name?.trim()) errors.push('Escribe el nombre del caso.');
  if (!input?.source?.trim()) errors.push('Indica la fuente de los datos.');
  if (!['google', 'meta'].includes(input?.capacityPriority)) errors.push('Selecciona qué canal tiene prioridad para usar la capacidad.');
  for (const channel of ['meta', 'google']) {
    for (const key of ['spend', 'leads']) {
      const value = Number(input?.[channel]?.[key]);
      if (!Number.isFinite(value) || value < 0) {
        errors.push(`${channel === 'meta' ? 'Meta' : 'Google'}: ${key === 'spend' ? 'inversión' : 'leads proyectados'} debe ser un número igual o mayor que cero.`);
      }
    }
    for (const rateKey of RATE_KEYS) {
      const rate = Number(input?.[channel]?.[rateKey]);
      if (!Number.isFinite(rate) || rate < 0 || rate > 1) errors.push(`${channel === 'meta' ? 'Meta' : 'Google'}: las tasas deben estar entre 0% y 100%.`);
    }
  }
  const numericRules = [
    ['capacity', 'capacidad de visitas', 0, 100000],
    ['costPerVisit', 'costo por visita', 0, 100000000],
    ['price', 'precio promedio', 0, 100000000],
    ['grossMarginPct', 'margen bruto', 0, 1],
    ['commissionPct', 'comisión', 0, 1],
    ['monthlyFixedCosts', 'costos fijos mensuales', 0, 100000000],
  ];
  for (const [key, label, min, max] of numericRules) {
    const value = Number(input?.[key]);
    if (!Number.isFinite(value) || value < min || value > max) errors.push(`${label}: valor fuera del rango permitido.`);
  }
  return errors;
}

export function analyzeCase(input) {
  const errors = validateCase(input);
  if (errors.length) return { valid: false, errors, input };

  const channel = {};
  for (const key of ['google', 'meta']) {
    const data = input[key];
    const contacted = data.leads * data.contactRate;
    const scheduled = contacted * data.scheduleRate;
    channel[key] = {
      ...data,
      contacted,
      scheduled,
      visitsRequested: scheduled * data.visitRate,
    };
  }

  const firstChannel = input.capacityPriority;
  const secondChannel = firstChannel === 'google' ? 'meta' : 'google';
  channel[firstChannel].visitsDone = Math.min(channel[firstChannel].visitsRequested, input.capacity);
  channel[secondChannel].visitsDone = Math.min(channel[secondChannel].visitsRequested, Math.max(0, input.capacity - channel[firstChannel].visitsDone));
  for (const key of ['google', 'meta']) {
    channel[key].sales = channel[key].visitsDone * channel[key].closeRate;
    channel[key].cpl = channel[key].leads > 0 ? channel[key].spend / channel[key].leads : 0;
    channel[key].realCac = channel[key].sales > 0 ? (channel[key].spend + channel[key].visitsDone * input.costPerVisit) / channel[key].sales : 0;
  }

  const total = ['meta', 'google'].reduce((sum, key) => ({
    spend: sum.spend + channel[key].spend,
    leads: sum.leads + channel[key].leads,
    visitsRequested: sum.visitsRequested + channel[key].visitsRequested,
    visitsDone: sum.visitsDone + channel[key].visitsDone,
    sales: sum.sales + channel[key].sales,
  }), { spend: 0, leads: 0, visitsRequested: 0, visitsDone: 0, sales: 0 });
  const unitContribution = input.price * (input.grossMarginPct - input.commissionPct);
  total.realCac = total.sales > 0 ? (total.spend + total.visitsDone * input.costPerVisit) / total.sales : 0;
  total.ltvCac = total.realCac > 0 ? unitContribution / total.realCac : 0;
  total.operatingResult = total.sales * unitContribution - total.spend - total.visitsDone * input.costPerVisit - input.monthlyFixedCosts;
  total.capacityUtilization = input.capacity > 0 ? total.visitsDone / input.capacity : 0;

  return { valid: true, input, channel, total, unitContribution, analyzedAt: new Date().toISOString() };
}

export function createReferenceCase() {
  const data = CASE_DATA;
  return {
    name: 'Sol de Casa · Caso C',
    source: 'Datos de referencia de src/data/caseData.js; CASO.md no está incluido en el workspace.',
    meta: { spend: 4000, leads: getLeadsFromSpend(4000, 'meta'), ...data.funnelRates.meta, visitRate: data.funnelRates.meta.visitCompletedRate },
    google: { spend: 4000, leads: getLeadsFromSpend(4000, 'google'), ...data.funnelRates.google, visitRate: data.funnelRates.google.visitCompletedRate },
    capacity: data.visits.baseMonthlyCapacity,
    costPerVisit: data.visits.costPerVisit,
    price: data.economics.installationPrice,
    grossMarginPct: data.economics.grossMarginPct,
    commissionPct: data.economics.salesCommissionPct,
    monthlyFixedCosts: data.cash.monthlyFixedCosts,
    capacityPriority: 'google',
  };
}

export function createCaseRecord(input) {
  const result = analyzeCase(input);
  if (!result.valid) return result;
  return { valid: true, record: { id: globalThis.crypto?.randomUUID?.() || `case-${Date.now()}-${Math.random().toString(16).slice(2)}`, ...input, createdAt: new Date().toISOString() } };
}

export function saveCase(input, context) {
  const result = createCaseRecord(input);
  if (!result.valid) return result;
  context.cases.unshift(result.record);
  context.persistenceWarning = !context.persistCases();
  return result;
}

export function deleteCase(caseId, context) {
  context.cases = context.cases.filter(record => record.id !== caseId);
  context.persistenceWarning = !context.persistCases();
  return context.cases;
}
