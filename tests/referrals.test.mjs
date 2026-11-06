import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateSavings, referralEconomics, buildShareUrl, transitionLead } from '../Caso_Negocio/src/model/referrals.js';

test('case savings and simple recovery, with invalid bills rejected', () => {
  const result = estimateSavings(110);
  assert.equal(result.monthly, 77);
  assert.equal(result.annual, 924);
  assert.ok(Math.abs(result.years - 6500 / 924) < 1e-10);
  for (const invalid of [0, -1, NaN, Infinity]) assert.equal(estimateSavings(invalid), null);
});
test('referral rewards include visits for unsuccessful sales and stay below cap', () => {
  const result = referralEconomics();
  assert.ok(Math.abs(result.visitCost - 133.3333333333) < 1e-6);
  assert.ok(Math.abs(result.rewardBudget - 166.6666666667) < 1e-6);
  assert.ok(result.total < 300);
  assert.equal(result.leadsFor50, 69);
  assert.equal(result.familiesFor50, 459);
});
test('share URLs preserve attribution on a deployed subpath', () => {
  const url = new URL(buildShareUrl('https://example.org', '/demo/', 'familia + sol'));
  const [route, query] = url.hash.split('?');
  assert.equal(route, '#calcular');
  assert.equal(url.pathname, '/demo/');
  assert.equal(new URLSearchParams(query).get('ref'), 'familia + sol');
});
test('cancellation after a visit keeps incurred costs and signed rewards cannot be revoked', () => {
  const original = { id: 'demo', referrer: 'familia-sol-001', status: 'agendado' };
  const visited = transitionLead(original, 'visitado');
  assert.equal(visited.visitCompleted, true);
  const cancelled = transitionLead(visited, 'cancelado');
  assert.equal(cancelled.visitCompleted, true);
  const signed = transitionLead(original, 'firmado');
  assert.equal(signed.visitCompleted, true);
  assert.equal(transitionLead(signed, 'cancelado'), signed);
  assert.equal(transitionLead(original, 'unknown'), original);
  assert.equal(original.status, 'agendado');
});
