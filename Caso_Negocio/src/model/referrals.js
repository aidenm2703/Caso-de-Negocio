export const REFERRAL_RULES = Object.freeze({ contact: .95, schedule: .85, visit: .9, close: .45, visitCost: 60, cap: 300, saleReward: 120 });
export function estimateSavings(bill) {
  if (!Number.isFinite(bill) || bill <= 0) return null;
  return { monthly: bill * .7, annual: bill * .7 * 12, years: 6500 / (bill * .7 * 12) };
}
export function referralEconomics() {
  const r = REFERRAL_RULES;
  const visitsPerSale = 1 / r.close;
  const visitCost = r.visitCost * visitsPerSale;
  return { visitsPerSale, visitCost, rewardBudget: r.cap - visitCost, total: visitCost + r.saleReward,
    leadsFor50: Math.ceil(50 / (r.contact * r.schedule * r.visit)),
    familiesFor50: Math.ceil(50 / (r.contact * r.schedule * r.visit) / (6 / 20 / 2)) };
}
export function readDemo() {
  try {
    const saved = JSON.parse(localStorage.getItem('sdc_referrals_v1'));
    if (saved && Array.isArray(saved.leads) && Array.isArray(saved.events)) return saved;
  } catch { /* A blocked or empty store starts a new demo. */ }
  return { leads: [], events: [] };
}
export function buildShareUrl(origin, path, family) {
  return `${origin}${path}#calcular?ref=${encodeURIComponent(family)}`;
}
export function transitionLead(lead, status) {
  if (lead.status === 'firmado') return lead;
  if (!['agendado', 'visitado', 'firmado', 'cancelado'].includes(status)) return lead;
  return { ...lead, status, visitCompleted: Boolean(lead.visitCompleted || ['visitado', 'firmado'].includes(lead.status) || ['visitado', 'firmado'].includes(status)) };
}
