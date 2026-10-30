/**
 * MÓDULO DE SIMULACIÓN DE CAJA A 24 MESES (NIVEL 3)
 * Modela con exactitud matemática el desfase de cobros y pagos,
 * capacidad técnica acumulativa, costos fijos y validación de reglas de negocio.
 */

import { CASE_DATA } from '../data/caseData.js';
import { calculateFunnel } from './funnel.js';

export function simulateMonth({
  monthIndex, // 1 a 24
  metaSpend = 4000,
  googleSpend = 4000,
  applySupuesto7 = false,
  extraTechsHiredCumulative = 0, // Técnicos contratados hasta este mes inclusive
  extraTechsActiveCapacity = 0, // Técnicos con capacidad activa (+50 visitas, desde el mes siguiente)
  prevMonthSales = CASE_DATA.cash.month0Sales,
  beginningCash = CASE_DATA.cash.initialCash,
  price = CASE_DATA.economics.installationPrice,
  costPerVisit = CASE_DATA.visits.costPerVisit,
  monthlyFixedCosts = CASE_DATA.cash.monthlyFixedCosts,
}) {
  // Capacidad de visitas del mes: 100 base + 50 por técnico capacitado
  const capacity = CASE_DATA.visits.baseMonthlyCapacity +
    (extraTechsActiveCapacity * CASE_DATA.visits.extraTechCapacityIncrement);

  // Embudo del mes
  const funnel = calculateFunnel({
    metaSpend,
    googleSpend,
    capacity,
    applySupuesto7,
  });

  const currentMonthSales = funnel.total.sales;
  const visitsDone = funnel.total.visitsDone;

  // Entradas de caja:
  // 50% de $6.500 por ventas de este mes + 50% de $6.500 por ventas del mes anterior
  const inflowCurrentSales = currentMonthSales * price * CASE_DATA.economics.clientPayAtSignPct;
  const inflowPrevSales = prevMonthSales * price * CASE_DATA.economics.clientPayAtInstallPct;
  const totalInflows = inflowCurrentSales + inflowPrevSales;

  // Salidas de caja:
  // 55% equipos sobre ventas mes actual
  const outflowEquipment = currentMonthSales * price * CASE_DATA.economics.equipmentCostPct;
  // 3% comisión asesora sobre ventas mes actual
  const outflowCommission = currentMonthSales * price * CASE_DATA.economics.salesCommissionPct;
  // 17% instalación sobre ventas mes anterior
  const outflowInstallation = prevMonthSales * price * CASE_DATA.economics.installationCostPct;
  // Costo de visitas hechas ($60 c/u)
  const outflowVisits = visitsDone * costPerVisit;
  // Inversión publicitaria
  const outflowMarketing = metaSpend + googleSpend;
  // Costos fijos
  const outflowFixed = monthlyFixedCosts;
  // Costo técnicos extra ($1.800 cada uno, se paga desde el mes que se contrata)
  const outflowExtraTechs = extraTechsHiredCumulative * CASE_DATA.visits.extraTechCostPerMonth;

  const totalOutflows = outflowEquipment +
    outflowCommission +
    outflowInstallation +
    outflowVisits +
    outflowMarketing +
    outflowFixed +
    outflowExtraTechs;

  const netCashFlow = totalInflows - totalOutflows;
  const endingCash = beginningCash + netCashFlow;
  const safetyFloorBreached = endingCash < CASE_DATA.cash.safetyFloor;

  return {
    month: monthIndex,
    metaSpend,
    googleSpend,
    totalSpend: metaSpend + googleSpend,
    leads: funnel.total.leads,
    metaLeads: funnel.meta.leads,
    googleLeads: funnel.google.leads,
    visitsRequested: funnel.total.visitsRequested,
    capacity,
    visitsDone,
    metaVisitsDone: funnel.meta.visitsDone,
    googleVisitsDone: funnel.google.visitsDone,
    sales: currentMonthSales,
    metaSales: funnel.meta.sales,
    googleSales: funnel.google.sales,
    prevMonthSales,
    extraTechsHiredCumulative,
    extraTechsActiveCapacity,
    inflows: {
      currentSales50Pct: inflowCurrentSales,
      prevSales50Pct: inflowPrevSales,
      total: totalInflows,
    },
    outflows: {
      equipment55Pct: outflowEquipment,
      commission3Pct: outflowCommission,
      installation17Pct: outflowInstallation,
      visits: outflowVisits,
      marketing: outflowMarketing,
      fixedCosts: outflowFixed,
      extraTechs: outflowExtraTechs,
      total: totalOutflows,
    },
    beginningCash,
    netCashFlow,
    endingCash,
    safetyFloorBreached,
  };
}

export function simulate24Months(plan = {}) {
  // Configuración del plan
  // plan.schedule: array de 24 objetos { metaSpend, googleSpend, hireTech: boolean, applySupuesto7: boolean }
  // O configuración global simplificada: { metaSpend, googleSpend, techHires: [month], applySupuesto7Month: number }
  const months = [];
  let prevSales = CASE_DATA.cash.month0Sales;
  let currentCash = CASE_DATA.cash.initialCash;
  let totalTechsHired = 0;

  // Seguimiento de cuándo se contratan técnicos
  const techHires = plan.techHires || []; // Array con meses de contratación p. ej. [3, 8]
  const activateSupuesto7Month = plan.activateSupuesto7Month ?? (plan.applySupuesto7 ? 1 : 999);

  for (let m = 1; m <= 24; m++) {
    // Verificar si en este mes se contrató técnico
    const monthSchedule = plan.schedule ? plan.schedule[m - 1] : null;

    let metaSpend = monthSchedule ? monthSchedule.metaSpend : (plan.metaSpend ?? 4000);
    let googleSpend = monthSchedule ? monthSchedule.googleSpend : (plan.googleSpend ?? 4000);
    let applySupuesto7 = monthSchedule
      ? !!monthSchedule.applySupuesto7
      : m >= activateSupuesto7Month;

    if (monthSchedule && monthSchedule.hireTech) {
      if (totalTechsHired < CASE_DATA.visits.maxExtraTechs) {
        totalTechsHired++;
      }
    } else if (techHires.includes(m)) {
      if (totalTechsHired < CASE_DATA.visits.maxExtraTechs) {
        totalTechsHired++;
      }
    }

    // Capacidad activa: técnicos contratados estrictamente antes de este mes
    // (el primer mes se capacitan, suman capacidad al mes siguiente)
    let techsWithActiveCapacity = 0;
    if (plan.schedule) {
      // Contar técnicos contratados hasta m - 1
      techsWithActiveCapacity = plan.schedule
        .slice(0, m - 1)
        .reduce((sum, item) => sum + (item.hireTech ? 1 : 0), 0);
    } else {
      techsWithActiveCapacity = techHires.filter(hMonth => hMonth < m).length;
    }
    techsWithActiveCapacity = Math.min(techsWithActiveCapacity, CASE_DATA.visits.maxExtraTechs);

    const monthResult = simulateMonth({
      monthIndex: m,
      metaSpend,
      googleSpend,
      applySupuesto7,
      extraTechsHiredCumulative: totalTechsHired,
      extraTechsActiveCapacity: techsWithActiveCapacity,
      prevMonthSales: prevSales,
      beginningCash: currentCash,
    });

    months.push(monthResult);
    prevSales = monthResult.sales;
    currentCash = monthResult.endingCash;
  }

  // Validación de reglas
  const validation = validatePlanRules(months);

  // Métricas agregadas
  const totalSales = months.reduce((acc, m) => acc + m.sales, 0);
  const totalLeads = months.reduce((acc, m) => acc + m.leads, 0);
  const totalVisits = months.reduce((acc, m) => acc + m.visitsDone, 0);
  const minCash = Math.min(...months.map(m => m.endingCash));
  const minCashMonth = months.find(m => m.endingCash === minCash)?.month || 1;
  const finalCash = months[23].endingCash;

  return {
    months,
    summary: {
      totalSales,
      totalLeads,
      totalVisits,
      minCash,
      minCashMonth,
      finalCash,
      valid: validation.isValid,
      validationErrors: validation.errors,
    },
  };
}

export function validatePlanRules(months) {
  const errors = [];

  // Regla 1: Caja nunca puede bajar de $5.000
  months.forEach(m => {
    if (m.endingCash < CASE_DATA.cash.safetyFloor) {
      errors.push(`Mes ${m.month}: La caja final ($${m.endingCash.toFixed(2)}) bajó del piso de seguridad de $5.000.`);
    }
  });

  // Regla 2: Desde el mes 19, la inversión total no puede bajar de un mes al siguiente
  for (let i = 18; i < 24; i++) { // Mes 19 es índice 18, comparado contra mes 18 (índice 17)
    const prevSpend = months[i - 1].totalSpend;
    const currSpend = months[i].totalSpend;
    if (currSpend < prevSpend) {
      errors.push(`Mes ${months[i].month}: La inversión total ($${currSpend}) bajó respecto al mes anterior ($${prevSpend}). Regla mes 19+ violada.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getMonth1ManualDetail() {
  const m1 = simulateMonth({
    monthIndex: 1,
    metaSpend: 4000,
    googleSpend: 4000,
    applySupuesto7: false,
    extraTechsHiredCumulative: 0,
    extraTechsActiveCapacity: 0,
    prevMonthSales: 22,
    beginningCash: 12000,
  });

  return {
    explanation: [
      '1. Venta mes 0: 22 instalaciones.',
      '2. Inversión mes 1: Meta $4.000 (500 leads), Google $4.000 (100 leads).',
      '3. Embudo Meta: 500 * 55% * 30% * 70% = 57,75 visitas pedidas.',
      '4. Embudo Google: 100 * 85% * 55% * 85% = 39,7375 visitas pedidas.',
      '5. Capacidad: 100 visitas. Se atienden 39,7375 de Google y 57,75 de Meta (Total 97,4875 visitas hechas).',
      '6. Ventas mes 1: Google (39,7375 * 30% = 11,92125) + Meta (57,75 * 18% = 10,395) = 22,31625 ventas.',
      '7. Entradas mes 1: 50% de 22,31625 ($72.527,81) + 50% de 22 del mes anterior ($71.500,00) = $144.027,81.',
      '8. Salidas mes 1: Equipos 55% ($79.780,59) + Comisión 3% ($4.351,67) + Instalación mes 0 17% ($24.310,00) + Visitas 97,4875 * $60 ($5.849,25) + Pauta ($8.000,00) + Fijos ($18.000,00) = $140.291,51.',
      '9. Flujo neto mes 1: $144.027,81 - $140.291,51 = +$3.736,30.',
      '10. Caja final mes 1: $12.000,00 + $3.736,30 = $15.736,30.',
    ],
    result: m1,
  };
}
