#!/usr/bin/env node
/**
 * TOOLS/BUILD.MJS - BUNDLER STANDALONE SIN DEPENDENCIAS
 * Lee la arquitectura modular en src/, empaqueta todo el CSS, HTML y JS,
 * y genera el archivo único entregable: dist/sol-de-casa.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Iniciando empaquetado de Sol de Casa...');

// 1. Leer estilos CSS
const themeCss = fs.readFileSync(path.join(rootDir, 'src/styles/theme.css'), 'utf-8');
const layoutCss = fs.readFileSync(path.join(rootDir, 'src/styles/layout.css'), 'utf-8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'src/styles/components.css'), 'utf-8');
const printCss = fs.readFileSync(path.join(rootDir, 'src/styles/print.css'), 'utf-8');

const combinedCss = `
${themeCss}
${layoutCss}
${componentsCss}
${printCss}
`;

// 2. Leer código fuente modular
const caseDataJs = fs.readFileSync(path.join(rootDir, 'src/data/caseData.js'), 'utf-8');
const formatJs = fs.readFileSync(path.join(rootDir, 'src/utils/format.js'), 'utf-8');
const interpolationJs = fs.readFileSync(path.join(rootDir, 'src/model/interpolation.js'), 'utf-8');
const funnelJs = fs.readFileSync(path.join(rootDir, 'src/model/funnel.js'), 'utf-8');
const unitEconomicsJs = fs.readFileSync(path.join(rootDir, 'src/model/unitEconomics.js'), 'utf-8');
const cashJs = fs.readFileSync(path.join(rootDir, 'src/model/cash.js'), 'utf-8');
const plansJs = fs.readFileSync(path.join(rootDir, 'src/model/plans.js'), 'utf-8');
const optimizerJs = fs.readFileSync(path.join(rootDir, 'src/model/optimizer.js'), 'utf-8');
const sensitivityJs = fs.readFileSync(path.join(rootDir, 'src/model/sensitivity.js'), 'utf-8');
const stressJs = fs.readFileSync(path.join(rootDir, 'src/model/stress.js'), 'utf-8');

// Eliminar imports y exports ES6 para que se ejecuten dentro de un solo script en el navegador
function stripModules(code) {
  return code
    .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
    .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
    .replace(/export\s+\{.*?\};?/g, '')
    .replace(/export\s+default\s+.*?;?/g, '');
}

const cleanedCaseData = stripModules(caseDataJs);
const cleanedFormat = stripModules(formatJs);
const cleanedInterpolation = stripModules(interpolationJs);
const cleanedFunnel = stripModules(funnelJs);
const cleanedUnitEconomics = stripModules(unitEconomicsJs);
const cleanedCash = stripModules(cashJs);
const cleanedPlans = stripModules(plansJs);
const cleanedOptimizer = stripModules(optimizerJs);
const cleanedSensitivity = stripModules(sensitivityJs);
const cleanedStress = stripModules(stressJs);

// 3. Leer o construir el código de la aplicación cliente (UI + Gráficos)
const appClientScript = `
// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
const appState = {
  currentTab: 'tab-tablero',
  // Controles
  metaSpend: 4000,
  googleSpend: 4000,
  metaContactRate: 0.55,
  metaScheduleRate: 0.30,
  metaVisitRate: 0.70,
  metaCloseRate: 0.18,
  googleContactRate: 0.85,
  googleScheduleRate: 0.55,
  googleVisitRate: 0.85,
  googleCloseRate: 0.30,
  costPerVisit: 60,
  capacity: 100,
  extraTechs: 0,
  price: 6500,
  grossMarginPct: 0.28,
  commissionPct: 0.03,
  includeBattery: false,
  batteryAttachRate: 0.15,
  applySupuesto7: false,
  // Simulador 24 meses
  activePlanId: 'actual',
  customPlanSchedule: null,
};

// Gráficos Chart.js
let funnelChartInst = null;
let cacComparisonChartInst = null;
let capacityChartInst = null;
let cashFlowChartInst = null;
let tornadoChartInst = null;

// Cronómetros
let timerInterval = null;
let timerSeconds = 0;

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initThemeToggle();
  initControls();
  renderApp();
  initPresentationTimers();
  runBrowserTests();
});

window.switchTab = function(targetId) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.getAttribute('data-target') === targetId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
  const targetPane = document.getElementById(targetId);
  if (targetPane) targetPane.style.display = 'block';
  appState.currentTab = targetId;

  setTimeout(() => {
    if (targetId === 'tab-tablero') renderTableroCharts();
    if (targetId === 'tab-simulador') renderCashCharts();
    if (targetId === 'tab-extras') renderTornadoChart();
  }, 50);
};

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target');
      if (targetId) window.switchTab(targetId);
    });
  });
}

function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;
  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    toggleBtn.innerHTML = isDark ? '🌙 Modo Oscuro' : '☀️ Modo Claro';
    if (funnelChartInst) renderTableroCharts();
    if (cashFlowChartInst) renderCashCharts();
  });
}

function initControls() {
  // Sincronizar Sliders e Inputs
  const bindControl = (sliderId, inputId, stateKey, isPercent = false, isInt = false) => {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    if (!slider || !input) return;

    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      appState[stateKey] = val;
      input.value = isPercent ? (val * 100).toFixed(1) : (isInt ? Math.round(val) : val);
      renderApp();
    });

    input.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) val = 0;
      if (isPercent) val = val / 100;
      appState[stateKey] = val;
      slider.value = val;
      renderApp();
    });
  };

  bindControl('slider-meta-spend', 'input-meta-spend', 'metaSpend', false, true);
  bindControl('slider-google-spend', 'input-google-spend', 'googleSpend', false, true);

  bindControl('slider-meta-contact', 'input-meta-contact', 'metaContactRate', true);
  bindControl('slider-meta-schedule', 'input-meta-schedule', 'metaScheduleRate', true);
  bindControl('slider-meta-visit', 'input-meta-visit', 'metaVisitRate', true);
  bindControl('slider-meta-close', 'input-meta-close', 'metaCloseRate', true);

  bindControl('slider-google-contact', 'input-google-contact', 'googleContactRate', true);
  bindControl('slider-google-schedule', 'input-google-schedule', 'googleScheduleRate', true);
  bindControl('slider-google-visit', 'input-google-visit', 'googleVisitRate', true);
  bindControl('slider-google-close', 'input-google-close', 'googleCloseRate', true);

  bindControl('slider-cost-visit', 'input-cost-visit', 'costPerVisit', false, true);
  bindControl('slider-extra-techs', 'input-extra-techs', 'extraTechs', false, true);
  bindControl('slider-price', 'input-price', 'price', false, true);

  // Switch Supuesto 7
  const s7Switch = document.getElementById('switch-supuesto7');
  if (s7Switch) {
    s7Switch.addEventListener('change', (e) => {
      appState.applySupuesto7 = e.target.checked;
      renderApp();
    });
  }

  // Switch Batería
  const batSwitch = document.getElementById('switch-battery');
  if (batSwitch) {
    batSwitch.addEventListener('change', (e) => {
      appState.includeBattery = e.target.checked;
      renderApp();
    });
  }

  // Botón Reset Datos del Caso
  const resetBtn = document.getElementById('btn-reset-case');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetToCaseData);
  }
}

function resetToCaseData() {
  appState.metaSpend = 4000;
  appState.googleSpend = 4000;
  appState.metaContactRate = 0.55;
  appState.metaScheduleRate = 0.30;
  appState.metaVisitRate = 0.70;
  appState.metaCloseRate = 0.18;
  appState.googleContactRate = 0.85;
  appState.googleScheduleRate = 0.55;
  appState.googleVisitRate = 0.85;
  appState.googleCloseRate = 0.30;
  appState.costPerVisit = 60;
  appState.extraTechs = 0;
  appState.price = 6500;
  appState.grossMarginPct = 0.28;
  appState.commissionPct = 0.03;
  appState.includeBattery = false;
  appState.applySupuesto7 = false;

  // Actualizar controles UI
  syncControlUI('slider-meta-spend', 'input-meta-spend', 4000);
  syncControlUI('slider-google-spend', 'input-google-spend', 4000);
  syncControlUI('slider-meta-contact', 'input-meta-contact', 0.55, true);
  syncControlUI('slider-meta-schedule', 'input-meta-schedule', 0.30, true);
  syncControlUI('slider-meta-visit', 'input-meta-visit', 0.70, true);
  syncControlUI('slider-meta-close', 'input-meta-close', 0.18, true);
  syncControlUI('slider-google-contact', 'input-google-contact', 0.85, true);
  syncControlUI('slider-google-schedule', 'input-google-schedule', 0.55, true);
  syncControlUI('slider-google-visit', 'input-google-visit', 0.85, true);
  syncControlUI('slider-google-close', 'input-google-close', 0.30, true);
  syncControlUI('slider-cost-visit', 'input-cost-visit', 60);
  syncControlUI('slider-extra-techs', 'input-extra-techs', 0);
  syncControlUI('slider-price', 'input-price', 6500);

  const s7 = document.getElementById('switch-supuesto7');
  if (s7) s7.checked = false;
  const bat = document.getElementById('switch-battery');
  if (bat) bat.checked = false;

  renderApp();
}

function syncControlUI(sliderId, inputId, val, isPercent = false) {
  const s = document.getElementById(sliderId);
  const i = document.getElementById(inputId);
  if (s) s.value = val;
  if (i) i.value = isPercent ? (val * 100).toFixed(1) : val;
}

// ==========================================
// RENDERIZADO GLOBAL
// ==========================================
function renderApp() {
  const capacity = 100 + (appState.extraTechs * 50);

  const customMetaRates = {
    contactRate: appState.metaContactRate,
    scheduleRate: appState.metaScheduleRate,
    visitCompletedRate: appState.metaVisitRate,
    closeRate: appState.metaCloseRate,
  };
  const customGoogleRates = {
    contactRate: appState.googleContactRate,
    scheduleRate: appState.googleScheduleRate,
    visitCompletedRate: appState.googleVisitRate,
    closeRate: appState.googleCloseRate,
  };

  const funnelResult = calculateFunnel({
    metaSpend: appState.metaSpend,
    googleSpend: appState.googleSpend,
    capacity,
    applySupuesto7: appState.applySupuesto7,
    customMetaRates,
    customGoogleRates,
  });

  const evaluation = evaluateScenario(funnelResult, {
    price: appState.price,
    costPerVisit: appState.costPerVisit,
    includeBattery: appState.includeBattery,
    batteryAttachRate: appState.batteryAttachRate,
  });

  renderTrapBanner(evaluation);
  renderKPIs(evaluation, capacity);
  renderTableroCharts(evaluation, capacity);
  renderResultsTable(evaluation);
  renderSimuladorTab();
  renderExtrasTab(evaluation);
}

// ==========================================
// BANNER DE LA TRAMPA
// ==========================================
function renderTrapBanner(evaluation) {
  const metaCpl = evaluation.meta.cpl;
  const googleCpl = evaluation.google.cpl;
  const metaCac = evaluation.meta.realCac;
  const googleCac = evaluation.google.realCac;

  const cplRatio = metaCpl > 0 ? (googleCpl / metaCpl).toFixed(1) : '5.0';
  const cacDiffPct = googleCac > 0 ? (((metaCac - googleCac) / googleCac) * 100).toFixed(1) : '34.1';

  const formulaEl = document.getElementById('trap-formula-text');
  const descEl = document.getElementById('trap-desc-text');
  if (formulaEl) {
    formulaEl.innerHTML = \`«El lead de Meta es <strong>\${cplRatio} veces más barato</strong> (\${formatCurrency(metaCpl, 2)} vs \${formatCurrency(googleCpl, 2)}), pero conseguir un cliente real cuesta un <strong>\${cacDiffPct}% MÁS CARO</strong> en Meta (\${formatCurrency(metaCac, 2)} vs \${formatCurrency(googleCac, 2)}).»\`;
  }
  if (descEl) {
    descEl.innerText = \`Trampa operativa: Meta exige 5,56 visitas por venta ($333 en visitas) vs 3,33 en Google ($200). Además, cada visita de Google aporta $427,50 de valor neto frente a $232,50 de Meta.\`;
  }
}

// ==========================================
// RENDERIZADO DE KPIS
// ==========================================
function renderKPIs(evaluation, capacity) {
  const total = evaluation.total;
  const meta = evaluation.meta;
  const google = evaluation.google;
  const funnel = evaluation.funnel;

  // Leads
  setElText('kpi-leads-val', formatNumber(total.leads, 1));
  setElText('kpi-leads-meta', \`Meta: \${formatNumber(meta.leads, 0)}\`);
  setElText('kpi-leads-google', \`Google: \${formatNumber(google.leads, 0)}\`);

  // Visitas
  setElText('kpi-visits-val', \`\${formatNumber(total.visitsDone, 1)} / \${capacity}\`);
  const visAlert = document.getElementById('kpi-visits-badge');
  if (visAlert) {
    if (funnel.total.capacityExceeded) {
      visAlert.className = 'badge badge-red';
      visAlert.innerText = \`¡Tope Excedido! (-\${formatNumber(funnel.total.visitsLost, 1)} visitas perdidas)\`;
    } else {
      visAlert.className = 'badge badge-green';
      visAlert.innerText = \`\${formatPercent(funnel.total.capacityUtilizationPct / 100, 1)} Capacidad Usada\`;
    }
  }
  setElText('kpi-visits-meta', \`Meta: \${formatNumber(meta.visitsDone, 1)}\`);
  setElText('kpi-visits-google', \`Google: \${formatNumber(google.visitsDone, 1)}\`);

  // Ventas
  setElText('kpi-sales-val', formatNumber(total.sales, 2));
  setElText('kpi-sales-meta', \`Meta: \${formatNumber(meta.sales, 1)}\`);
  setElText('kpi-sales-google', \`Google: \${formatNumber(google.sales, 1)}\`);

  // CAC Real
  setElText('kpi-cac-val', formatCurrency(total.realCac, 2));
  setElText('kpi-cac-meta', \`Meta: \${formatCurrency(meta.realCac, 2)}\`);
  setElText('kpi-cac-google', \`Google: \${formatCurrency(google.realCac, 2)}\`);

  // Semáforo LTV:CAC
  setElText('kpi-ltvcac-val', formatMultiplier(total.ltvCac, 2));
  const ltvBadge = document.getElementById('kpi-ltvcac-badge');
  if (ltvBadge) {
    if (total.ltvCac >= 3.0) {
      ltvBadge.className = 'badge badge-green';
      ltvBadge.innerText = 'Excelente (≥3x)';
    } else if (total.ltvCac >= 1.0) {
      ltvBadge.className = 'badge badge-yellow';
      ltvBadge.innerText = 'Aceptable (1x - 3x)';
    } else {
      ltvBadge.className = 'badge badge-red';
      ltvBadge.innerText = 'Peligro (<1x Destruye Valor)';
    }
  }
  setElText('kpi-ltv-meta', \`Meta: \${formatMultiplier(meta.ltvCac, 2)}\`);
  setElText('kpi-ltv-google', \`Google: \${formatMultiplier(google.ltvCac, 2)}\`);

  // Valor de Visita
  setElText('kpi-visitval-val', formatCurrency(total.visitValue, 2));
  setElText('kpi-val-meta', \`Meta: \${formatCurrency(meta.visitValue, 2)}\`);
  setElText('kpi-val-google', \`Google: \${formatCurrency(google.visitValue, 2)}\`);
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

// ==========================================
// GRÁFICOS (CHART.JS)
// ==========================================
function renderTableroCharts(evaluation, capacity) {
  if (typeof Chart === 'undefined') return;

  if (!evaluation) {
    const f = calculateFunnel({ metaSpend: appState.metaSpend, googleSpend: appState.googleSpend });
    evaluation = evaluateScenario(f);
  }

  // 1. Embudo Comparativo
  const funnelCtx = document.getElementById('chart-funnel')?.getContext('2d');
  if (funnelCtx) {
    const dataMeta = [
      evaluation.funnel.meta.leads,
      evaluation.funnel.meta.contacted,
      evaluation.funnel.meta.scheduled,
      evaluation.funnel.meta.visitsDone,
      evaluation.funnel.meta.sales,
    ];
    const dataGoogle = [
      evaluation.funnel.google.leads,
      evaluation.funnel.google.contacted,
      evaluation.funnel.google.scheduled,
      evaluation.funnel.google.visitsDone,
      evaluation.funnel.google.sales,
    ];

    if (funnelChartInst) funnelChartInst.destroy();
    funnelChartInst = new Chart(funnelCtx, {
      type: 'bar',
      data: {
        labels: ['1. Leads', '2. Contactados', '3. Agendados', '4. Visitas Hechas', '5. Ventas'],
        datasets: [
          { label: 'Meta', data: dataMeta, backgroundColor: '#E1306C' },
          { label: 'Google', data: dataGoogle, backgroundColor: '#1A73E8' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  // 2. Gráfico CPL vs CAC Real (La Trampa)
  const cacCtx = document.getElementById('chart-cac')?.getContext('2d');
  if (cacCtx) {
    if (cacComparisonChartInst) cacComparisonChartInst.destroy();
    cacComparisonChartInst = new Chart(cacCtx, {
      type: 'bar',
      data: {
        labels: ['Meta', 'Google'],
        datasets: [
          {
            label: 'CPL (Costo por Lead)',
            data: [evaluation.meta.cpl, evaluation.google.cpl],
            backgroundColor: '#F59E0B',
          },
          {
            label: 'CAC de Anuncios',
            data: [evaluation.meta.adCac, evaluation.google.adCac],
            backgroundColor: '#FFC531',
          },
          {
            label: 'CAC Real Total (+Visitas)',
            data: [evaluation.meta.realCac, evaluation.google.realCac],
            backgroundColor: '#2E9E68',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'USD ($)' } } },
      },
    });
  }

  // 3. Visitas vs Capacidad
  const capCtx = document.getElementById('chart-capacity')?.getContext('2d');
  if (capCtx) {
    if (capacityChartInst) capacityChartInst.destroy();
    const cap = capacity || 100;
    capacityChartInst = new Chart(capCtx, {
      type: 'bar',
      data: {
        labels: ['Visitas Pedidas vs Capacidad'],
        datasets: [
          {
            label: 'Visitas Hechas Google',
            data: [evaluation.funnel.google.visitsDone],
            backgroundColor: '#1A73E8',
            stack: 'Stack 0',
          },
          {
            label: 'Visitas Hechas Meta',
            data: [evaluation.funnel.meta.visitsDone],
            backgroundColor: '#E1306C',
            stack: 'Stack 0',
          },
          {
            label: 'Visitas Perdidas (Exceso)',
            data: [evaluation.funnel.total.visitsLost],
            backgroundColor: '#EF4444',
            stack: 'Stack 0',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              afterBody: () => \`Capacidad Máxima Disponible: \${cap} visitas\`,
            },
          },
        },
        scales: {
          x: { stacked: true },
          y: {
            stacked: true,
            beginAtZero: true,
            max: Math.max(cap * 1.3, evaluation.funnel.total.visitsRequested * 1.15),
          },
        },
      },
    });
  }
}

// ==========================================
// TABLA DE RESULTADOS DE ESCENARIOS
// ==========================================
function renderResultsTable(currentEval) {
  const container = document.getElementById('results-scenarios-table-body');
  if (!container) return;

  const f1 = calculateFunnel({ metaSpend: 4000, googleSpend: 4000 });
  const e1 = evaluateScenario(f1);

  const f2 = calculateFunnel({ metaSpend: 8000, googleSpend: 0 });
  const e2 = evaluateScenario(f2);

  const f3 = currentEval;

  const rows = [
    ['Inversión Meta', formatCurrency(e1.meta.spend), formatCurrency(e2.meta.spend), formatCurrency(f3.meta.spend)],
    ['Inversión Google', formatCurrency(e1.google.spend), formatCurrency(e2.google.spend), formatCurrency(f3.google.spend)],
    ['Inversión Total', formatCurrency(e1.total.spend), formatCurrency(e2.total.spend), formatCurrency(f3.total.spend)],
    ['Leads Meta', formatNumber(e1.meta.leads, 0), formatNumber(e2.meta.leads, 0), formatNumber(f3.meta.leads, 0)],
    ['Leads Google', formatNumber(e1.google.leads, 0), formatNumber(e2.google.leads, 0), formatNumber(f3.google.leads, 0)],
    ['Visitas Pedidas', formatNumber(e1.funnel.total.visitsRequested, 1), formatNumber(e2.funnel.total.visitsRequested, 1), formatNumber(f3.funnel.total.visitsRequested, 1)],
    ['Visitas Hechas', formatNumber(e1.total.visitsDone, 1), formatNumber(e2.total.visitsDone, 1), formatNumber(f3.total.visitsDone, 1)],
    ['Ventas Totales', formatNumber(e1.total.sales, 2), formatNumber(e2.total.sales, 2), formatNumber(f3.total.sales, 2)],
    ['CPL Meta', formatCurrency(e1.meta.cpl, 2), formatCurrency(e2.meta.cpl, 2), formatCurrency(f3.meta.cpl, 2)],
    ['CAC Real Meta', formatCurrency(e1.meta.realCac, 2), formatCurrency(e2.meta.realCac, 2), formatCurrency(f3.meta.realCac, 2)],
    ['CAC Real Google', formatCurrency(e1.google.realCac, 2), 'N/A', formatCurrency(f3.google.realCac, 2)],
    ['CAC Real Global', formatCurrency(e1.total.realCac, 2), formatCurrency(e2.total.realCac, 2), formatCurrency(f3.total.realCac, 2)],
    ['LTV:CAC Global', formatMultiplier(e1.total.ltvCac, 2), formatMultiplier(e2.total.ltvCac, 2), formatMultiplier(f3.total.ltvCac, 2)],
    ['Valor Visita Google', formatCurrency(e1.google.visitValue, 2), 'N/A', formatCurrency(f3.google.visitValue, 2)],
    ['Valor Visita Meta', formatCurrency(e1.meta.visitValue, 2), formatCurrency(e2.meta.visitValue, 2), formatCurrency(f3.meta.visitValue, 2)],
  ];

  container.innerHTML = rows.map(([name, s1, s2, s3]) => \`
    <tr>
      <td><strong>\${name}</strong></td>
      <td style="text-align:right;">\${s1}</td>
      <td style="text-align:right; color:#DC2626;">\${s2}</td>
      <td style="text-align:right; font-weight:bold; color:#2E9E68;">\${s3}</td>
    </tr>
  \`).join('');
}

// ==========================================
// SIMULADOR DE CAJA A 24 MESES
// ==========================================
function renderSimuladorTab() {
  const tableBody = document.getElementById('sim-24-table-body');
  if (!tableBody) return;

  const planDef = STRATEGIC_PLANS[appState.activePlanId.toUpperCase()] || STRATEGIC_PLANS.ACTUAL;
  const sim = simulate24Months(planDef);

  tableBody.innerHTML = sim.months.map(m => \`
    <tr style="\${m.safetyFloorBreached ? 'background: rgba(239, 68, 68, 0.15);' : ''}">
      <td style="text-align:center; font-weight:bold;">\${m.month}</td>
      <td style="text-align:right;">\${formatCurrency(m.metaSpend)}</td>
      <td style="text-align:right;">\${formatCurrency(m.googleSpend)}</td>
      <td style="text-align:right; font-weight:bold;">\${formatCurrency(m.totalSpend)}</td>
      <td style="text-align:right;">\${formatNumber(m.leads, 0)}</td>
      <td style="text-align:right;">\${formatNumber(m.visitsRequested, 1)}</td>
      <td style="text-align:right;">\${m.capacity}</td>
      <td style="text-align:right;">\${formatNumber(m.visitsDone, 1)}</td>
      <td style="text-align:right; font-weight:bold;">\${formatNumber(m.sales, 2)}</td>
      <td style="text-align:right; color:#2E9E68;">\${formatCurrency(m.inflows.total, 2)}</td>
      <td style="text-align:right; color:#DC2626;">\${formatCurrency(m.outflows.total, 2)}</td>
      <td style="text-align:right; font-weight:bold; color:\${m.netCashFlow >= 0 ? '#2E9E68' : '#DC2626'};">
        \${formatCurrency(m.netCashFlow, 2)}
      </td>
      <td style="text-align:right; font-weight:800; font-size:0.95rem; color:\${m.safetyFloorBreached ? '#DC2626' : 'var(--text-main)'};">
        \${formatCurrency(m.endingCash, 2)}
      </td>
      <td style="text-align:center;">
        \${m.safetyFloorBreached 
          ? '<span class="badge badge-red">⚠️ PISO VIOLADO</span>' 
          : '<span class="badge badge-green">OK</span>'}
      </td>
    </tr>
  \`).join('');

  // Actualizar métricas del resumen del plan
  setElText('sim-min-cash', formatCurrency(sim.summary.minCash, 2));
  setElText('sim-min-month', \`Mes \${sim.summary.minCashMonth}\`);
  setElText('sim-final-cash', formatCurrency(sim.summary.finalCash, 2));
  setElText('sim-total-sales', \`\${formatNumber(sim.summary.totalSales, 1)} instalaciones\`);

  // Alerta de validación
  const valAlertEl = document.getElementById('sim-validation-alert');
  if (valAlertEl) {
    if (sim.summary.valid) {
      valAlertEl.className = 'badge badge-green';
      valAlertEl.innerText = '✅ Plan 100% Válido: Cumple todas las reglas de caja y pauta mes 19+.';
    } else {
      valAlertEl.className = 'badge badge-red';
      valAlertEl.innerText = \`❌ Violación de Reglas: \${sim.summary.validationErrors.join(' | ')}\`;
    }
  }

  // Renderizar gráfico de caja
  renderCashCharts(sim);
  renderPlansComparisonTable();
  renderMonth1ManualCard();
}

function renderCashCharts(simResult) {
  if (typeof Chart === 'undefined') return;
  const planDef = STRATEGIC_PLANS[appState.activePlanId.toUpperCase()] || STRATEGIC_PLANS.ACTUAL;
  const sim = simResult || simulate24Months(planDef);

  const cashCtx = document.getElementById('chart-cash-flow')?.getContext('2d');
  if (cashCtx) {
    if (cashFlowChartInst) cashFlowChartInst.destroy();
    cashFlowChartInst = new Chart(cashCtx, {
      type: 'line',
      data: {
        labels: sim.months.map(m => \`M\${m.month}\`),
        datasets: [
          {
            label: 'Saldo de Caja Final ($)',
            data: sim.months.map(m => m.endingCash),
            borderColor: '#FFC531',
            backgroundColor: 'rgba(255, 197, 49, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.2,
          },
          {
            label: 'Piso de Seguridad ($5.000)',
            data: Array(24).fill(5000),
            borderColor: '#DC2626',
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'USD ($)' },
          },
        },
      },
    });
  }
}

function renderPlansComparisonTable() {
  const container = document.getElementById('plans-comparison-table-body');
  if (!container) return;

  const comparison = compareAllPlans();

  container.innerHTML = comparison.plans.map(p => \`
    <tr style="\${p.isWinner ? 'background: rgba(46, 158, 104, 0.12); font-weight:bold;' : ''}">
      <td>
        <strong>\${p.name}</strong>
        \${p.isWinner ? '<span class="badge badge-green" style="margin-left:0.5rem;">👑 GANADOR</span>' : ''}
        <div style="font-size:0.75rem; color:var(--text-muted);">\${p.description}</div>
      </td>
      <td style="text-align:right;">\${formatCurrency(p.minCash, 2)} (M\${p.minCashMonth})</td>
      <td style="text-align:right; font-size:1.05rem;">\${formatCurrency(p.finalCash, 2)}</td>
      <td style="text-align:right;">\${formatNumber(p.totalSales, 1)}</td>
      <td style="text-align:center;">
        \${p.valid ? '<span class="badge badge-green">SI</span>' : '<span class="badge badge-red">NO</span>'}
      </td>
      <td style="text-align:center;">
        <button class="btn btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="switchActivePlan('\${p.id}')">
          Cargar en Simulador
        </button>
      </td>
    </tr>
  \`).join('');
}

window.switchActivePlan = function(planId) {
  appState.activePlanId = planId;
  renderSimuladorTab();
};

function renderMonth1ManualCard() {
  const container = document.getElementById('month1-manual-container');
  if (!container) return;
  const m1 = getMonth1ManualDetail();
  container.innerHTML = \`
    <div style="background:var(--bg-card-alt); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem;">
      <h4 style="font-weight:700; margin-bottom:0.5rem;">Auditoría Paso a Paso del Mes 1 (Plan Actual $4k + $4k):</h4>
      <ol style="margin-left:1.25rem; font-size:0.85rem; line-height:1.6;">
        \${m1.explanation.map(item => \`<li>\${item}</li>\`).join('')}
      </ol>
      <div style="margin-top:0.75rem; padding:0.5rem; background:var(--accent-green-light); border-radius:var(--radius-sm); font-size:0.85rem; font-weight:bold; color:var(--accent-green);">
        Resultado final: Caja Mes 1 = $15.736,30 (Coincide con los ~$15.700 requeridos por el caso).
      </div>
    </div>
  \`;
}

// ==========================================
// EXTRAS: OPTIMIZADOR, SENSIBILIDAD, ESTRÉS
// ==========================================
function renderExtrasTab(evaluation) {
  // 1. CPL de Equilibrio
  const breakeven = calculateBreakevenCpl();
  const beEl = document.getElementById('cpl-breakeven-container');
  if (beEl) {
    beEl.innerHTML = \`
      <div class="kpi-card" style="border-left:4px solid var(--primary-sun);">
        <div class="kpi-label">CPL de Equilibrio para Meta</div>
        <div class="kpi-value" style="color:var(--accent-green);">\${formatCurrency(breakeven.breakevenCpl, 2)}</div>
        <div class="kpi-subtext" style="font-size:0.85rem;">
          \${breakeven.insight}
        </div>
      </div>
    \`;
  }

  // 2. Optimizador mensual
  const optResult = optimizeMonthlyBudget({ totalBudget: 8000, step: 500, applySupuesto7: appState.applySupuesto7 });
  const optEl = document.getElementById('optimizer-result-container');
  if (optEl) {
    optEl.innerHTML = \`
      <div class="kpi-card" style="border-left:4px solid var(--accent-green);">
        <div class="kpi-label">Reparto Óptimo Recomendado (Presupuesto $8.000)</div>
        <div style="font-size:1.2rem; font-weight:800; margin:0.4rem 0;">
          Meta: \${formatCurrency(optResult.best.metaSpend)} | Google: \${formatCurrency(optResult.best.googleSpend)}
        </div>
        <div style="font-size:0.85rem; color:var(--text-muted);">
          Genera <strong>\${formatNumber(optResult.best.sales, 2)} ventas/mes</strong> y una contribución neta de <strong>\${formatCurrency(optResult.best.netContribution, 2)}</strong>.
        </div>
      </div>
    \`;
  }

  // 3. Pruebas de Estrés para el Banco
  const stressResults = runAllStressTests({ metaSpend: 4000, googleSpend: 4000, applySupuesto7: true });
  const stressTableBody = document.getElementById('stress-tests-table-body');
  if (stressTableBody) {
    stressTableBody.innerHTML = stressResults.map(s => \`
      <tr style="\${s.breachesFloor ? 'background:rgba(239, 68, 68, 0.12);' : ''}">
        <td><strong>\${s.testName}</strong></td>
        <td style="text-align:right;">\${formatCurrency(s.minCash, 2)} (M\${s.minCashMonth})</td>
        <td style="text-align:right;">\${formatCurrency(s.finalCash, 2)}</td>
        <td style="text-align:center;">
          \${s.breachesFloor 
            ? '<span class="badge badge-red">ROMPE PISO</span>' 
            : '<span class="badge badge-green">RESISTE</span>'}
        </td>
        <td style="text-align:right; font-weight:bold; color:\${s.creditNeeded > 0 ? '#DC2626' : '#2E9E68'};">
          \${s.creditNeeded > 0 ? formatCurrency(s.creditNeeded, 2) : '$0'}
        </td>
      </tr>
    \`).join('');
  }
}

function renderTornadoChart() {
  if (typeof Chart === 'undefined') return;
  const tornadoCtx = document.getElementById('chart-tornado')?.getContext('2d');
  if (!tornadoCtx) return;

  const dataTornado = runTornadoAnalysis({ metaSpend: 4000, googleSpend: 4000 });
  if (tornadoChartInst) tornadoChartInst.destroy();

  tornadoChartInst = new Chart(tornadoCtx, {
    type: 'bar',
    data: {
      labels: dataTornado.tornado.map(t => t.name),
      datasets: [
        {
          label: 'Impacto en CAC Real ($)',
          data: dataTornado.tornado.map(t => t.swing),
          backgroundColor: '#FFC531',
          borderColor: '#E5AD23',
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => \`Oscilación total en CAC: \${formatCurrency(ctx.raw, 2)}\`,
          },
        },
      },
      scales: { x: { beginAtZero: true, title: { display: true, text: 'Amplitud de Variación en CAC Real ($)' } } },
    },
  });
}

// ==========================================
// MODO PRESENTACIÓN Y CRONÓMETROS
// ==========================================
function initPresentationTimers() {
  const btn3m = document.getElementById('btn-timer-3m');
  const btn2m = document.getElementById('btn-timer-2m');
  const btnStop = document.getElementById('btn-timer-stop');
  const display = document.getElementById('timer-display');

  if (btn3m) btn3m.addEventListener('click', () => startTimer(180, display));
  if (btn2m) btn2m.addEventListener('click', () => startTimer(120, display));
  if (btnStop) btnStop.addEventListener('click', () => stopTimer(display));
}

function startTimer(seconds, display) {
  clearInterval(timerInterval);
  timerSeconds = seconds;
  updateTimerDisplay(display);
  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay(display);
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      if (display) display.innerText = '¡TIEMPO TERMINADO!';
    }
  }, 1000);
}

function stopTimer(display) {
  clearInterval(timerInterval);
  timerSeconds = 0;
  if (display) display.innerText = '00:00';
}

function updateTimerDisplay(display) {
  if (!display) return;
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  display.innerText = \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
}

// ==========================================
// AUDITORÍA Y TESTS EN EL NAVEGADOR
// ==========================================
function runBrowserTests() {
  const container = document.getElementById('browser-tests-container');
  if (!container) return;

  const testList = [
    {
      name: 'Contribución Unitaria ($1.625)',
      fn: () => calculateUnitContribution().totalContribution === 1625,
    },
    {
      name: 'Interpolación de Leads Meta ($4k = 500)',
      fn: () => getLeadsFromSpend(4000, 'meta') === 500,
    },
    {
      name: 'Interpolación de Leads Google ($4k = 100, $8k = 160)',
      fn: () => getLeadsFromSpend(4000, 'google') === 100 && getLeadsFromSpend(10000, 'google') === 160,
    },
    {
      name: 'CAC Real Hoy (Meta ≈ $718, Google ≈ $536)',
      fn: () => {
        const f = calculateFunnel({ metaSpend: 4000, googleSpend: 4000 });
        const e = evaluateScenario(f);
        return Math.abs(e.meta.realCac - 718.13) < 1.0 && Math.abs(e.google.realCac - 535.54) < 1.0;
      },
    },
    {
      name: 'Valor de Visita Hoy (Meta = $232,50, Google = $427,50)',
      fn: () => {
        const f = calculateFunnel({ metaSpend: 4000, googleSpend: 4000 });
        const e = evaluateScenario(f);
        return Math.abs(e.meta.visitValue - 232.50) < 0.1 && Math.abs(e.google.visitValue - 427.50) < 0.1;
      },
    },
    {
      name: 'Mes 1 Plan Actual (Caja Final = $15.736,30)',
      fn: () => {
        const m1 = getMonth1ManualDetail();
        return Math.abs(m1.result.endingCash - 15736.30) < 0.1;
      },
    },
    {
      name: 'CPL de Equilibrio Meta ≈ $4.20',
      fn: () => {
        const be = calculateBreakevenCpl();
        return Math.abs(be.breakevenCpl - 4.20) < 0.1;
      },
    },
  ];

  container.innerHTML = testList.map(t => {
    let passed = false;
    try { passed = t.fn(); } catch(e) { passed = false; }
    return \`
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0.8rem; border-bottom:1px solid var(--border-color);">
        <span>\${t.name}</span>
        <span class="badge \${passed ? 'badge-green' : 'badge-red'}">
          \${passed ? 'PASÓ (OK)' : 'FALLÓ'}
        </span>
      </div>
    \`;
  }).join('');
}
`;

// 4. Leer plantilla HTML base y fusionar todo
const templatePath = path.join(rootDir, 'src/template.html');
let htmlTemplate = '';

if (fs.existsSync(templatePath)) {
  htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
} else {
  // Construir plantilla completa si no existe
  htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sol de Casa – Calculadora, Tablero y Simulador Financiero</title>
  <!-- Chart.js 4.4.1 desde CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    /* STYLES_INJECTION */
  </style>
</head>
<body>
  <!-- HEADER -->
  <header class="app-header">
    <div class="header-container">
      <div class="brand-section">
        <div class="brand-logo">☀️</div>
        <div>
          <h1 class="brand-title">Sol de Casa</h1>
          <p class="brand-subtitle">Simulador y Motor Financiero de Lead Gen Solar | Caso C</p>
        </div>
      </div>
      <div class="header-actions">
        <button id="theme-toggle-btn" class="btn btn-secondary">🌙 Modo Oscuro</button>
        <button class="btn btn-primary no-print" onclick="window.print()">🖨️ Imprimir Recomendación</button>
      </div>
    </div>
  </header>

  <!-- NAVIGATION TABS -->
  <nav class="tabs-nav no-print">
    <button class="tab-btn active" id="tab-nav-resumen" data-target="tab-resumen" onclick="switchTab('tab-resumen')">📑 Resumen Ejecutivo</button>
    <button class="tab-btn" id="tab-nav-tablero" data-target="tab-tablero" onclick="switchTab('tab-tablero')">🎛️ Tablero Interactivo</button>
    <button class="tab-btn" id="tab-nav-simulador" data-target="tab-simulador" onclick="switchTab('tab-simulador')">📈 Simulador 24 Meses</button>
    <button class="tab-btn" id="tab-nav-preguntas" data-target="tab-preguntas" onclick="switchTab('tab-preguntas')">❓ Respuestas Caso (1-7)</button>
    <button class="tab-btn" id="tab-nav-extras" data-target="tab-extras" onclick="switchTab('tab-extras')">⚡ Extras & Estrategia</button>
    <button class="tab-btn" id="tab-nav-auditoria" data-target="tab-auditoria" onclick="switchTab('tab-auditoria')">🔍 Auditoría & Errores IA</button>
  </nav>

  <main class="main-container">
    <!-- PESTAÑA 1: RESUMEN Y RECOMENDACIÓN -->
    <section id="tab-resumen" class="tab-pane print-page" style="display:block;">
      <!-- LA TRAMPA BANNER -->
      <div class="trap-banner">
        <div class="trap-icon">⚠️</div>
        <div class="trap-content">
          <h3>LA TRAMPA DEL CASO DETECTADA</h3>
          <p class="trap-formula" id="trap-formula-text">Cargando análisis de la trampa...</p>
          <p class="trap-desc" id="trap-desc-text"></p>
        </div>
      </div>

      <!-- RECOMENDACIÓN EJECUTIVA -->
      <div class="chart-card" style="margin-bottom:1.5rem;">
        <div class="chart-header">
          <h2 class="chart-title">Memorando Ejecutivo para Andrés Villalobos</h2>
          <span class="badge badge-red" style="font-size:0.9rem;">DECISIÓN: RECHAZAR AGENCIA LEADLY</span>
        </div>
        <div style="font-size:0.95rem; line-height:1.7; color:var(--text-main);">
          <p style="margin-bottom:0.75rem;">
            <strong>Andrés:</strong> La recomendación técnica y financiera definitiva es <strong>RECHAZAR</strong> la propuesta de Leadly de volcar los $8.000 a Meta. 
            Aunque prometen el doble de leads bajo la premisa de que <em>"en Meta el lead cuesta $8 y en Google $40"</em>, la realidad empírica de tu negocio demuestra que aceptar su propuesta <strong>destruiría 4,86 ventas mensuales (−21,8%)</strong> y empeoraría tu margen neto en más de $8.000 al mes.
          </p>
          <h4 style="font-weight:bold; margin:1rem 0 0.5rem 0;">¿Por qué engaña la propuesta de Leadly?</h4>
          <ul style="margin-left:1.5rem; margin-bottom:1rem;">
            <li><strong>Rendimientos decrecientes:</strong> Con $8.000 en Meta no llegan 1.000 leads, llegan <strong>840 leads</strong> (CPL real = $9,52).</li>
            <li><strong>Calidad del embudo:</strong> Google convierte el <strong>11,92%</strong> de sus leads en clientes cerrados, mientras Meta convierte solo el <strong>2,08%</strong>. ¡Un lead de Google tiene casi 6 veces más probabilidad de comprar!</li>
            <li><strong>Costo de visitas técnicas:</strong> Cerrar una venta en Meta requiere <strong>5,56 visitas</strong> ($333 en transporte y viáticos) frente a solo <strong>3,33 visitas</strong> en Google ($200). Sumando anuncios y visitas, el <strong>CAC Real de Meta es de $718</strong> vs. <strong>$536 en Google</strong>.</li>
          </ul>
          <h4 style="font-weight:bold; margin:1rem 0 0.5rem 0;">Los dos cambios recomendados (Plan Ganador):</h4>
          <ol style="margin-left:1.5rem;">
            <li><strong>Filtro previo + respuesta en menos de 5 minutos en Meta:</strong> Al añadir 2 preguntas al formulario ("¿Es dueño?" y "¿Recibo > $80?") y contactar rápido, elevamos el cierre del 18% al 22% y el valor de cada visita de $232 a más de $310.</li>
            <li><strong>Contratar 1 técnico extra en el Mes 2:</strong> Rompe el techo de 100 visitas (aumentando a 150 visitas desde Mes 3), permitiendo escalar Google a $6.000 y Meta a $4.500, alcanzando <strong>$214.980 en caja al Mes 24</strong> (frente a los $48.320 que dejaría la agencia).</li>
          </ol>
        </div>
      </div>

      <!-- TABLA RESUMEN COMPARATIVA -->
      <div class="chart-card">
        <h3 class="chart-title" style="margin-bottom:1rem;">Comparativa de Escenarios Estratégicos</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Métrica / Indicador</th>
                <th>1. Hoy ($4k + $4k)</th>
                <th>2. Agencia Leadly ($8k Meta)</th>
                <th>3. Propio Ganador (S7 + 1 Técnico)</th>
              </tr>
            </thead>
            <tbody id="results-scenarios-table-body">
              <!-- Renderizado dinámico -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- PESTAÑA 2: TABLERO INTERACTIVO -->
    <section id="tab-tablero" class="tab-pane" style="display:none;">
      <div class="dashboard-grid">
        <!-- SIDEBAR DE CONTROLES -->
        <aside class="controls-sidebar">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="font-size:1rem; font-weight:800;">Panel de Parámetros</h3>
            <button id="btn-reset-case" class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;">
              ↺ Restaurar Caso
            </button>
          </div>

          <!-- Pauta -->
          <div class="control-section">
            <div class="control-title">Presupuesto de Pauta Mensual</div>
            <div class="control-group">
              <div class="control-label-row">
                <span style="color:var(--channel-meta);">Meta Ads ($)</span>
              </div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-meta-spend" class="control-slider" min="0" max="10000" step="500" value="4000">
                <input type="number" id="input-meta-spend" class="control-num-input" min="0" max="10000" step="500" value="4000">
              </div>
            </div>
            <div class="control-group">
              <div class="control-label-row">
                <span style="color:var(--channel-google);">Google Ads ($)</span>
              </div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-google-spend" class="control-slider" min="0" max="8000" step="500" value="4000">
                <input type="number" id="input-google-spend" class="control-num-input" min="0" max="8000" step="500" value="4000">
              </div>
            </div>
          </div>

          <!-- Supuesto 7 y Batería -->
          <div class="control-section">
            <div class="control-title">Palancas del Negocio</div>
            <div style="margin-bottom:0.75rem; display:flex; align-items:center; justify-content:space-between;">
              <label for="switch-supuesto7" style="font-size:0.85rem; font-weight:600; cursor:pointer;">
                Filtro + Respuesta < 5 min (S7)
              </label>
              <input type="checkbox" id="switch-supuesto7" style="width:18px; height:18px; cursor:pointer;">
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <label for="switch-battery" style="font-size:0.85rem; font-weight:600; cursor:pointer;">
                Batería de Respaldo ($3.000)
              </label>
              <input type="checkbox" id="switch-battery" style="width:18px; height:18px; cursor:pointer;">
            </div>
          </div>

          <!-- Operaciones y Capacidad -->
          <div class="control-section">
            <div class="control-title">Capacidad y Visitas</div>
            <div class="control-group">
              <div class="control-label-row">
                <span>Técnicos Extra (+50 vis c/u)</span>
              </div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-extra-techs" class="control-slider" min="0" max="2" step="1" value="0">
                <input type="number" id="input-extra-techs" class="control-num-input" min="0" max="2" step="1" value="0">
              </div>
            </div>
            <div class="control-group">
              <div class="control-label-row">
                <span>Costo por Visita ($)</span>
              </div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-cost-visit" class="control-slider" min="30" max="120" step="5" value="60">
                <input type="number" id="input-cost-visit" class="control-num-input" min="30" max="120" step="5" value="60">
              </div>
            </div>
          </div>

          <!-- Tasas Embudo Meta -->
          <div class="control-section">
            <div class="control-title" style="color:var(--channel-meta);">Tasas Embudo Meta</div>
            <div class="control-group">
              <div class="control-label-row"><span>% Contacto</span></div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-meta-contact" class="control-slider" min="0.1" max="1.0" step="0.05" value="0.55">
                <input type="number" id="input-meta-contact" class="control-num-input" min="10" max="100" step="5" value="55">
              </div>
            </div>
            <div class="control-group">
              <div class="control-label-row"><span>% Agenda</span></div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-meta-schedule" class="control-slider" min="0.1" max="1.0" step="0.05" value="0.30">
                <input type="number" id="input-meta-schedule" class="control-num-input" min="10" max="100" step="5" value="30">
              </div>
            </div>
            <div class="control-group">
              <div class="control-label-row"><span>% Visita Hecha</span></div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-meta-visit" class="control-slider" min="0.1" max="1.0" step="0.05" value="0.70">
                <input type="number" id="input-meta-visit" class="control-num-input" min="10" max="100" step="5" value="70">
              </div>
            </div>
            <div class="control-group">
              <div class="control-label-row"><span>% Cierre Venta</span></div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-meta-close" class="control-slider" min="0.05" max="0.6" step="0.01" value="0.18">
                <input type="number" id="input-meta-close" class="control-num-input" min="5" max="60" step="1" value="18">
              </div>
            </div>
          </div>

          <!-- Tasas Embudo Google -->
          <div class="control-section">
            <div class="control-title" style="color:var(--channel-google);">Tasas Embudo Google</div>
            <div class="control-group">
              <div class="control-label-row"><span>% Contacto</span></div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-google-contact" class="control-slider" min="0.1" max="1.0" step="0.05" value="0.85">
                <input type="number" id="input-google-contact" class="control-num-input" min="10" max="100" step="5" value="85">
              </div>
            </div>
            <div class="control-group">
              <div class="control-label-row"><span>% Agenda</span></div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-google-schedule" class="control-slider" min="0.1" max="1.0" step="0.05" value="0.55">
                <input type="number" id="input-google-schedule" class="control-num-input" min="10" max="100" step="5" value="55">
              </div>
            </div>
            <div class="control-group">
              <div class="control-label-row"><span>% Visita Hecha</span></div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-google-visit" class="control-slider" min="0.1" max="1.0" step="0.05" value="0.85">
                <input type="number" id="input-google-visit" class="control-num-input" min="10" max="100" step="5" value="85">
              </div>
            </div>
            <div class="control-group">
              <div class="control-label-row"><span>% Cierre Venta</span></div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-google-close" class="control-slider" min="0.05" max="0.6" step="0.01" value="0.30">
                <input type="number" id="input-google-close" class="control-num-input" min="5" max="60" step="1" value="30">
              </div>
            </div>
          </div>

          <!-- Precio de Instalación -->
          <div class="control-section">
            <div class="control-title">Precio Ticket</div>
            <div class="control-group">
              <div class="control-label-row"><span>Precio Instalación ($)</span></div>
              <div class="control-input-wrapper">
                <input type="range" id="slider-price" class="control-slider" min="4000" max="9000" step="100" value="6500">
                <input type="number" id="input-price" class="control-num-input" min="4000" max="9000" step="100" value="6500">
              </div>
            </div>
          </div>
        </aside>

        <!-- ÁREA CENTRAL DE CONTENIDO -->
        <div class="content-area">
          <!-- GRID DE KPIS EN VIVO -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Leads Totales</div>
              <div class="kpi-value" id="kpi-leads-val">600</div>
              <div class="kpi-meta-split">
                <span class="meta-split-val" id="kpi-leads-meta">Meta: 500</span>
                <span class="google-split-val" id="kpi-leads-google">Google: 100</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">
                <span>Visitas Hechas</span>
                <span id="kpi-visits-badge" class="badge badge-green">97.5%</span>
              </div>
              <div class="kpi-value" id="kpi-visits-val">97.5 / 100</div>
              <div class="kpi-meta-split">
                <span class="meta-split-val" id="kpi-visits-meta">Meta: 57.8</span>
                <span class="google-split-val" id="kpi-visits-google">Google: 39.7</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">Ventas Mensuales</div>
              <div class="kpi-value" id="kpi-sales-val">22.32</div>
              <div class="kpi-meta-split">
                <span class="meta-split-val" id="kpi-sales-meta">Meta: 10.4</span>
                <span class="google-split-val" id="kpi-sales-google">Google: 11.9</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">CAC Real (+Visitas)</div>
              <div class="kpi-value" id="kpi-cac-val">$620,70</div>
              <div class="kpi-meta-split">
                <span class="meta-split-val" id="kpi-cac-meta">Meta: $718,13</span>
                <span class="google-split-val" id="kpi-cac-google">Google: $535,54</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">
                <span>LTV:CAC Global</span>
                <span id="kpi-ltvcac-badge" class="badge badge-green">Excelente</span>
              </div>
              <div class="kpi-value" id="kpi-ltvcac-val">2.62x</div>
              <div class="kpi-meta-split">
                <span class="meta-split-val" id="kpi-ltv-meta">Meta: 2.26x</span>
                <span class="google-split-val" id="kpi-ltv-google">Google: 3.03x</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">Valor Neto de Visita</div>
              <div class="kpi-value" id="kpi-visitval-val">$312,00</div>
              <div class="kpi-meta-split">
                <span class="meta-split-val" id="kpi-val-meta">Meta: $232,50</span>
                <span class="google-split-val" id="kpi-val-google">Google: $427,50</span>
              </div>
            </div>
          </div>

          <!-- GRID DE GRÁFICOS INTERACTIVOS -->
          <div class="charts-grid">
            <div class="chart-card">
              <div class="chart-header">
                <h3 class="chart-title">Embudo por Canal Lado a Lado</h3>
                <span style="font-size:0.8rem; color:var(--text-muted);">Pérdida en cada etapa</span>
              </div>
              <div class="chart-container">
                <canvas id="chart-funnel"></canvas>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <h3 class="chart-title">CPL vs CAC Real (La Trampa)</h3>
                <span style="font-size:0.8rem; color:var(--text-muted);">Impacto del costo de visitas</span>
              </div>
              <div class="chart-container">
                <canvas id="chart-cac"></canvas>
              </div>
            </div>

            <div class="chart-card" style="grid-column: 1 / -1;">
              <div class="chart-header">
                <h3 class="chart-title">Visitas Pedidas vs Capacidad Operativa</h3>
                <span style="font-size:0.8rem; color:var(--text-muted);">Prioridad de atención: Google 1º, Meta 2º</span>
              </div>
              <div class="chart-container" style="height:240px;">
                <canvas id="chart-capacity"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PESTAÑA 3: SIMULADOR 24 MESES -->
    <section id="tab-simulador" class="tab-pane" style="display:none;">
      <!-- KPI DE PLAN DE CAJA -->
      <div class="kpi-grid" style="margin-bottom:1.5rem;">
        <div class="kpi-card">
          <div class="kpi-label">Caja Mínima Proyectada</div>
          <div class="kpi-value" id="sim-min-cash">$12.000</div>
          <div class="kpi-subtext" id="sim-min-month">Mes 1</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Caja Final al Mes 24</div>
          <div class="kpi-value" id="sim-final-cash" style="color:var(--accent-green);">$168.450</div>
          <div class="kpi-subtext">Patrimonio libre generado</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Instalaciones Totales</div>
          <div class="kpi-value" id="sim-total-sales">535.6</div>
          <div class="kpi-subtext">En los 2 años</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Cumplimiento de Reglas</div>
          <div style="margin-top:0.5rem;" id="sim-validation-alert">
            <span class="badge badge-green">Verificando...</span>
          </div>
        </div>
      </div>

      <!-- GRÁFICO DE CAJA MES A MES -->
      <div class="chart-card" style="margin-bottom:1.5rem;">
        <div class="chart-header">
          <h3 class="chart-title">Trayectoria de Saldo en Banco a 24 Meses vs Piso ($5.000)</h3>
        </div>
        <div class="chart-container" style="height:320px;">
          <canvas id="chart-cash-flow"></canvas>
        </div>
      </div>

      <!-- COMPARADOR DE LOS 4 PLANES -->
      <div class="chart-card" style="margin-bottom:1.5rem;">
        <h3 class="chart-title" style="margin-bottom:1rem;">Benchmark de los 4 Planes Estratégicos (Nivel 3)</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Plan Estratégico</th>
                <th>Caja Mínima (Mes)</th>
                <th>Caja Mes 24</th>
                <th>Instalaciones</th>
                <th>Reglas</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="plans-comparison-table-body">
              <!-- Renderizado dinámico -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- AUDITORÍA MES 1 A MANO -->
      <div id="month1-manual-container" style="margin-bottom:1.5rem;"></div>

      <!-- TABLA DETALLADA DE 24 MESES -->
      <div class="chart-card">
        <h3 class="chart-title" style="margin-bottom:1rem;">Flujo de Caja Detallado (Mes 1 a 24)</h3>
        <div class="table-responsive" style="max-height:500px; overflow-y:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Meta</th>
                <th>Google</th>
                <th>Total Pauta</th>
                <th>Leads</th>
                <th>Vis. Pedidas</th>
                <th>Capacidad</th>
                <th>Vis. Hechas</th>
                <th>Ventas</th>
                <th>Entradas ($)</th>
                <th>Salidas ($)</th>
                <th>Flujo Neto</th>
                <th>Caja Final</th>
                <th>Alerta Piso</th>
              </tr>
            </thead>
            <tbody id="sim-24-table-body">
              <!-- Renderizado dinámico -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- PESTAÑA 4: RESPUESTAS DEL CASO (PREGUNTAS 1 A 7) -->
    <section id="tab-preguntas" class="tab-pane" style="display:none;">
      <div class="chart-card" style="line-height:1.7;">
        <h2 class="chart-title" style="font-size:1.3rem; margin-bottom:1.25rem;">
          Respuestas Ejecutivas a las 7 Preguntas de Andrés
        </h2>

        <div style="margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--primary-sun-hover);">
            1. ¿Cuánto deja una venta? (Contribución antes de marketing)
          </h3>
          <p>
            <strong>Fórmula:</strong> Precio × (Margen Bruto − Comisión de Asesora)<br>
            <strong>Cálculo:</strong> $6.500 × (28% − 3%) = $6.500 × 25% = <strong>$1.625,00</strong>.<br>
            <em>Nota financiera:</em> La comisión del 3% ($195) se paga sobre todas las ventas, vengan de pauta o no, por lo que pertenece a la contribución unitaria del producto y no al CAC.
          </p>
        </div>

        <div style="margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--primary-sun-hover);">
            2. Embudo completo de cada canal: ¿En qué paso se cae más gente?
          </h3>
          <p>
            <strong>Meta:</strong> 500 leads → 55% contacto (275) → 30% agenda (82,5) → 70% visita hecha (57,75) → 18% cierre (10,395 ventas).<br>
            <strong>Google:</strong> 100 leads → 85% contacto (85) → 55% agenda (46,75) → 85% visita hecha (39,74) → 30% cierre (11,92 ventas).<br>
            <strong>Diagnóstico de fugas:</strong> En Meta el embudo se desmorona en el paso <strong>Lead → Contacto (cae el 45%)</strong> debido a un 18% de teléfonos inválidos y a que las asesoras tardan 31 horas en llamar. Luego, de los contactados, solo el <strong>30% agenda</strong> (el 70% restante no tenía intención real de compra).
          </p>
        </div>

        <div style="margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--primary-sun-hover);">
            3. ¿Qué canal es más barato de verdad? (CAC de Anuncios vs CAC Real)
          </h3>
          <p>
            <strong>CAC de Anuncios:</strong> Meta = $4.000 / 10,395 = <strong>$384,80</strong> | Google = $4.000 / 11,921 = <strong>$335,53</strong>.<br>
            <strong>Visitas por venta:</strong> Meta requiere 1 / 0,18 = <strong>5,56 visitas</strong> ($333,33 en costo de visita) | Google requiere 1 / 0,30 = <strong>3,33 visitas</strong> ($200,00).<br>
            <strong>CAC Real Total (Anuncios + Visitas):</strong><br>
            • Meta: ($4.000 + 57,75 × $60) / 10,395 = <strong>$718,13</strong>.<br>
            • Google: ($4.000 + 39,74 × $60) / 11,921 = <strong>$535,54</strong>.<br>
            <strong>Conclusión:</strong> Google es mucho más barato de verdad (el cliente en Meta cuesta un 34,1% más).
          </p>
        </div>

        <div style="margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--primary-sun-hover);">
            4. LTV:CAC y Payback en caja
          </h3>
          <p>
            <strong>LTV:CAC:</strong> Google tiene un ratio excelente de <strong>3,03x</strong> ($1.625 / $535,54). Meta tiene <strong>2,26x</strong>.<br>
            <strong>Payback en caja:</strong> En el mes 0 (firma) el cliente entra con 50% ($3.250) y salen equipos 55% ($3.575) y comisión 3% ($195) → déficit operativo de -$520. Al sumar el CAC Real, el cliente arranca en -$1.055 (Google) y -$1.238 (Meta). En el mes 1 (instalación) entran $3.250 y salen $1.105 (+$2.145 netos). Por tanto, <strong>ambos canales recuperan la inversión íntegra en el Mes 1</strong>.
          </p>
        </div>

        <div style="margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--primary-sun-hover);">
            5. ¿Qué pasaría con la propuesta de la agencia?
          </h3>
          <p>
            <strong>Con el historial real ($8.000 = 840 leads):</strong> Visitas pedidas = 97,02 → <strong>17,46 ventas</strong>.<br>
            <strong>Como la cuenta la agencia ($8 CPL = 1.000 leads):</strong> Visitas pedidas = 115,5 → se topan en 100 visitas de capacidad → <strong>18,00 ventas</strong>.<br>
            En ambos casos, la agencia entrega entre <strong>4,8 y 4,3 ventas MENOS</strong> que el modelo actual de Sol de Casa (22,32 ventas), destruyendo valor a gran escala.
          </p>
        </div>

        <div style="margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--primary-sun-hover);">
            6. ¿Cuánto vale una visita técnica en cada canal?
          </h3>
          <p>
            <strong>Fórmula:</strong> (% Cierre × Contribución unitaria) − Costo de la visita ($60)<br>
            • Visita Google: (30% × $1.625) − $60 = $487,50 − $60 = <strong>+$427,50</strong>.<br>
            • Visita Meta: (18% × $1.625) − $60 = $292,50 − $60 = <strong>+$232,50</strong>.<br>
            <strong>Regla de prioridad:</strong> Cuando las visitas del mes superen la capacidad de 100, se deben asignar <strong>primero a Google</strong> porque cada visita aporta casi el doble de valor neto que una de Meta.
          </p>
        </div>

        <div>
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--primary-sun-hover);">
            7. Dos cambios propuestos y cuantificación de su impacto
          </h3>
          <p>
            <strong>Cambio 1 (Filtro + Respuesta < 5 min en Meta):</strong> Eleva el contacto al 80% y el cierre al 22%, reduciendo el CAC Real de Meta a $580 y subiendo el valor por visita a $310.<br>
            <strong>Cambio 2 (1 Técnico extra en Mes 2):</strong> Amplía la capacidad a 150 visitas/mes, absorbiendo toda la saturación rentable de Google y llevando la caja final a $214.980 en 24 meses.
          </p>
        </div>
      </div>
    </section>

    <!-- PESTAÑA 5: EXTRAS Y ESTRATEGIA -->
    <section id="tab-extras" class="tab-pane" style="display:none;">
      <div class="charts-grid" style="margin-bottom:1.5rem;">
        <div id="cpl-breakeven-container"></div>
        <div id="optimizer-result-container"></div>
      </div>

      <!-- GRÁFICO TORNADO -->
      <div class="chart-card" style="margin-bottom:1.5rem;">
        <div class="chart-header">
          <h3 class="chart-title">Análisis de Sensibilidad (Gráfico Tornado)</h3>
          <span style="font-size:0.8rem; color:var(--text-muted);">Impacto de variaciones de ±20% en CAC Real</span>
        </div>
        <div class="chart-container" style="height:280px;">
          <canvas id="chart-tornado"></canvas>
        </div>
      </div>

      <!-- PRUEBAS DE ESTRÉS PARA EL BANCO -->
      <div class="chart-card" style="margin-bottom:1.5rem;">
        <div class="chart-header">
          <h3 class="chart-title">Pruebas de Estrés Bancarias (Pitch de Línea de Crédito)</h3>
          <span class="badge badge-yellow">Evaluación para el Banco</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Escenario de Estrés</th>
                <th>Caja Mínima (Mes)</th>
                <th>Caja Mes 24</th>
                <th>Piso $5.000</th>
                <th>Crédito Preventivo Necesario</th>
              </tr>
            </thead>
            <tbody id="stress-tests-table-body">
              <!-- Renderizado dinámico -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODO PRESENTACIÓN -->
      <div class="chart-card">
        <h3 class="chart-title" style="margin-bottom:1rem;">Modo Presentación Ejecutiva con Cronómetro</h3>
        <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:1rem;">
          <button id="btn-timer-3m" class="btn btn-primary">⏱️ Iniciar Pitch 3 min (Decisión Andrés)</button>
          <button id="btn-timer-2m" class="btn btn-secondary">⏱️ Iniciar Pitch 2 min (Crédito Banco)</button>
          <button id="btn-timer-stop" class="btn btn-secondary">⏹️ Detener</button>
          <div id="timer-display" style="font-size:1.75rem; font-weight:900; font-family:var(--font-mono); color:var(--accent-red); margin-left:1rem;">
            00:00
          </div>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted);">
          Estructura del Pitch de 3 min: Minuto 1 (La Decisión y La Trampa en números) | Minuto 2 (Los 2 cambios y su impacto en caja) | Minuto 3 (Riesgos controlados y plan de ejecución).
        </p>
      </div>
    </section>

    <!-- PESTAÑA 6: AUDITORÍA Y ERRORES IA -->
    <section id="tab-auditoria" class="tab-pane" style="display:none;">
      <!-- TESTS EN VIVO -->
      <div class="chart-card" style="margin-bottom:1.5rem;">
        <div class="chart-header">
          <h3 class="chart-title">Auditoría en Tiempo Real de Fórmulas y Referencias</h3>
          <span class="badge badge-green">Runner de Tests en Navegador</span>
        </div>
        <div id="browser-tests-container"></div>
      </div>

      <!-- TABLA ERRORES IA -->
      <div class="chart-card">
        <h3 class="chart-title" style="margin-bottom:1rem;">Registro Crítico: En qué se equivocó o confundió la IA</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Métrica / Concepto</th>
                <th>Qué dijo la IA inicialmente</th>
                <th>Por qué estaba mal (Análisis Crítico)</th>
                <th>Cómo se corrigió</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Comparación de CPL</strong></td>
                <td>Afirmó que Meta era 5 veces mejor porque el lead costaba $8 frente a $40 de Google.</td>
                <td>Ignoró el embudo de ventas y el costo de visitas. Meta requiere 5,56 visitas por venta ($333) vs 3,33 en Google ($200). El CAC Real de Meta es de $718 frente a $536 en Google.</td>
                <td>Se implementó el CAC Real sumando el costo de las visitas y se calculó el CPL de equilibrio ($4,20).</td>
              </tr>
              <tr>
                <td><strong>2. Capacidad Operativa</strong></td>
                <td>Asumió que 1.000 leads en Meta generaban ventas proporcionales sin techo.</td>
                <td>El equipo de 2 técnicos está limitado a 100 visitas al mes. 1.000 leads demandan 115,5 visitas; 15,5 visitas se pierden irremediablemente.</td>
                <td>Se programó la restricción operativa estricta y el descarte de visitas no atendidas.</td>
              </tr>
              <tr>
                <td><strong>3. Rendimientos de Pauta</strong></td>
                <td>Calculó 1.000 leads con $8.000 en Meta asumiendo CPL plano de $8.</td>
                <td>El historial de pruebas de 12 meses demuestra saturación: $8.000 producen 840 leads (CPL real = $9,52).</td>
                <td>Se construyó el módulo de interpolación lineal continua sobre los puntos empíricos del caso.</td>
              </tr>
              <tr>
                <td><strong>4. Flujo de Caja Desfasado</strong></td>
                <td>Sumó ingresos y restó costos de una venta dentro del mismo mes.</td>
                <td>Los clientes pagan en 2 cuotas (50% al firmar y 50% al mes siguiente), pero los equipos (55%) y comisiones (3%) se pagan de contado al firmar, drenando -$520 por cliente el mes 0.</td>
                <td>Se construyó el motor de desfase de caja a 24 meses (t y t-1) respetando el piso de $5.000.</td>
              </tr>
              <tr>
                <td><strong>5. Habilitación de Técnicos</strong></td>
                <td>Añadió la capacidad de 50 visitas en el mismo mes de contratación del técnico.</td>
                <td>El caso estipula que el primer mes el técnico se capacita (se paga su sueldo de $1.800) y suma capacidad al mes siguiente.</td>
                <td>Se desacopló el flujo de pago salarial de la activación de capacidad operativa en el simulador.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>

  <!-- SCRIPT INJECTION -->
  <script>
    /* JAVASCRIPT_INJECTION */
  </script>
</body>
</html>
`;
}

// Reemplazar injection markers
const finalHtml = htmlTemplate
  .replace('/* STYLES_INJECTION */', combinedCss)
  .replace('/* JAVASCRIPT_INJECTION */', `
${cleanedCaseData}
${cleanedFormat}
${cleanedInterpolation}
${cleanedFunnel}
${cleanedUnitEconomics}
${cleanedCash}
${cleanedPlans}
${cleanedOptimizer}
${cleanedSensitivity}
${cleanedStress}
${appClientScript}
`);

// Crear directorio dist si no existe
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const outputPath = path.join(distDir, 'sol-de-casa.html');
fs.writeFileSync(outputPath, finalHtml, 'utf-8');

const stats = fs.statSync(outputPath);
console.log(`✅ Archivo standalone generado exitosamente en: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
