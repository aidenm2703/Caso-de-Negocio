import { CASE_DATA } from '../data/caseData.js';
import { calculateFunnel } from '../model/funnel.js';
import { evaluateScenario } from '../model/unitEconomics.js';

export function analyzeDashboardState(state) {
  const capacity = CASE_DATA.visits.baseMonthlyCapacity + (state.extraTechs * CASE_DATA.visits.extraTechCapacityIncrement);
  const funnelResult = calculateFunnel({
    metaSpend: state.metaSpend,
    googleSpend: state.googleSpend,
    capacity,
    applySupuesto7: state.applySupuesto7,
    customMetaRates: {
      contactRate: state.metaContactRate,
      scheduleRate: state.metaScheduleRate,
      visitCompletedRate: state.metaVisitRate,
      closeRate: state.metaCloseRate,
    },
    customGoogleRates: {
      contactRate: state.googleContactRate,
      scheduleRate: state.googleScheduleRate,
      visitCompletedRate: state.googleVisitRate,
      closeRate: state.googleCloseRate,
    },
  });
  const evaluation = evaluateScenario(funnelResult, {
    price: state.price,
    grossMarginPct: state.grossMarginPct,
    commissionPct: state.commissionPct,
    costPerVisit: state.costPerVisit,
    includeBattery: state.includeBattery,
    batteryAttachRate: state.batteryAttachRate,
  });
  return { capacity, funnelResult, evaluation };
}
