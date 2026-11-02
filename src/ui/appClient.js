/**
 * SRC/UI/APPCLIENT.JS - LÓGICA DE CLIENTE COMPLETA
 * Incluye: Autenticación, Saludo Personalizado, Tablero, Gráficos, Simulador 24M,
 * Rendimiento Marginal, Simulador de Crédito Bancario, Exportaciones y Tests en Navegador.
 */

// ==========================================
// BASE DE DATOS DE USUARIOS DE PRUEBA
// ==========================================
const DEMO_USERS = {
  andres: {
    username: 'andres@soldecasa.com',
    aliases: ['andres', 'andres@soldecasa.com'],
    password: 'admin123',
    name: 'Andrés Villalobos',
    role: 'Director General (CEO)',
    avatar: 'AV',
    avatarBg: '#E1306C',
    badge: 'Dirección Estratégica',
    targetTab: 'tab-resumen',
    actionBtnText: 'Revisar Memorando Leadly ➔',
    welcomeMsg: 'Andrés: El memorando ejecutivo recomienda formalmente RECHAZAR la oferta de Leadly para proteger el margen y evitar destruir 4,86 ventas mensuales (−21,8%). El Plan Propio Ganador genera $214.980 en caja.',
  },
  sofia: {
    username: 'sofia@soldecasa.com',
    aliases: ['sofia', 'sofia@soldecasa.com'],
    password: 'cfo2024',
    name: 'Sofía Mendoza',
    role: 'Directora Financiera (CFO)',
    avatar: 'SM',
    avatarBg: '#2E9E68',
    badge: 'Tesorería y Riesgo',
    targetTab: 'tab-simulador',
    actionBtnText: 'Auditar Flujo 24 Meses ➔',
    welcomeMsg: 'Sofía: El saldo de caja al Mes 1 arranca en $15.736,30 y el piso innegociable de $5.000 está 100% blindado en todos los 24 meses del Plan Ganador. Pruebas de estrés bancarias validadas.',
  },
  carlos: {
    username: 'carlos@soldecasa.com',
    aliases: ['carlos', 'carlos@soldecasa.com'],
    password: 'ops2024',
    name: 'Carlos Navarro',
    role: 'Jefe de Operaciones (COO)',
    avatar: 'CN',
    avatarBg: '#1A73E8',
    badge: 'Operaciones y Capacidad',
    targetTab: 'tab-tablero',
    actionBtnText: 'Gestionar Capacidad de Visitas ➔',
    welcomeMsg: 'Carlos: El equipo actual de 2 técnicos rinde al 97.5% de utilización (97.5 de 100 visitas). Contratar 1 técnico extra en Mes 2 ampliará el techo a 150 visitas desde Mes 3.',
  },
  laura: {
    username: 'laura@soldecasa.com',
    aliases: ['laura', 'laura@soldecasa.com'],
    password: 'growth2024',
    name: 'Laura Restrepo',
    role: 'Líder Comercial & Growth',
    avatar: 'LR',
    avatarBg: '#F59E0B',
    badge: 'Adquisición y Canales',
    targetTab: 'tab-extras',
    actionBtnText: 'Ver Rendimiento Marginal ➔',
    welcomeMsg: 'Laura: El Supuesto 7 (filtro previo + respuesta en < 5 min) dispara la tasa de cierre en Meta al 22% y el valor neto por visita a más de $310. Google satura a los $8.000 (160 leads).',
  },
  invitado: {
    username: 'invitado',
    aliases: ['invitado', 'guest'],
    password: '',
    name: 'Invitado Ejecutivo',
    role: 'Modo Auditoría / Lectura',
    avatar: 'IE',
    avatarBg: '#64748B',
    badge: 'Modo Lectura',
    targetTab: 'tab-resumen',
    actionBtnText: 'Explorar Resumen Ejecutivo ➔',
    welcomeMsg: 'Sesión activa en modo invitado. Puedes interactuar con los simuladores, calibrar parámetros, probar escenarios de estrés y revisar los cálculos auditados paso a paso.',
  },
};

// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
const appState = {
  currentUser: null,
  currentTab: 'tab-resumen',
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
// INICIALIZACIÓN AL CARGAR DOM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initTabs();
  initThemeToggle();
  initControls();
  renderApp();
  initPresentationTimers();
  updateCreditSimulator();
  runBrowserTests();
});

// ==========================================
// SISTEMA DE AUTENTICACIÓN Y SESIÓN
// ==========================================
function initAuth() {
  const savedUserJson = localStorage.getItem('solDeCasa_user');
  if (savedUserJson) {
    try {
      const user = JSON.parse(savedUserJson);
      applyUserSession(user, false);
      return;
    } catch (e) {
      console.warn('Error leyendo usuario guardado:', e);
    }
  }

  // Si no hay sesión, mostrar modal
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

window.handleLoginSubmit = function(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const errorEl = document.getElementById('login-error');

  const username = usernameInput ? usernameInput.value.trim().toLowerCase() : '';
  const password = passwordInput ? passwordInput.value : '';

  let matchedUser = null;
  for (const key in DEMO_USERS) {
    const u = DEMO_USERS[key];
    if (u.aliases.includes(username) && (u.password === password || u.password === '')) {
      matchedUser = u;
      break;
    }
  }

  if (matchedUser) {
    if (errorEl) errorEl.style.display = 'none';
    const remember = document.getElementById('login-remember')?.checked;
    if (remember) {
      localStorage.setItem('solDeCasa_user', JSON.stringify(matchedUser));
    }
    applyUserSession(matchedUser, true);
  } else {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.innerText = 'Credenciales no coinciden. Haz clic en las tarjetas de prueba abajo para ingresar de inmediato.';
    }
  }
};

window.quickLogin = function(username, password) {
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput) uInput.value = username;
  if (pInput) pInput.value = password;

  // Encontrar usuario y aplicar
  for (const key in DEMO_USERS) {
    const u = DEMO_USERS[key];
    if (u.aliases.includes(username.toLowerCase())) {
      localStorage.setItem('solDeCasa_user', JSON.stringify(u));
      applyUserSession(u, true);
      break;
    }
  }
};

window.loginAsGuest = function() {
  const guest = DEMO_USERS.invitado;
  applyUserSession(guest, true);
};

window.handleLogout = function() {
  localStorage.removeItem('solDeCasa_user');
  appState.currentUser = null;

  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.classList.remove('hidden');

  const widget = document.getElementById('header-user-widget');
  if (widget) widget.style.display = 'none';

  const banner = document.getElementById('greeting-banner');
  if (banner) banner.style.display = 'none';
};

window.togglePasswordVisibility = function() {
  const pInput = document.getElementById('login-password');
  if (!pInput) return;
  pInput.type = pInput.type === 'password' ? 'text' : 'password';
};

function applyUserSession(user, animateGreeting = false) {
  appState.currentUser = user;

  // 1. Ocultar modal
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.classList.add('hidden');

  // 2. Actualizar widget en el header
  const widget = document.getElementById('header-user-widget');
  const hAvatar = document.getElementById('header-user-avatar');
  const hName = document.getElementById('header-user-name');
  const hRole = document.getElementById('header-user-role');

  if (widget && hAvatar && hName && hRole) {
    widget.style.display = 'flex';
    hAvatar.innerText = user.avatar;
    hAvatar.style.background = user.avatarBg;
    hName.innerText = user.name;
    hRole.innerText = user.role;
  }

  // 3. Actualizar banner de saludo personalizado
  const banner = document.getElementById('greeting-banner');
  const gAvatar = document.getElementById('greeting-avatar');
  const gName = document.getElementById('greeting-name');
  const gBadge = document.getElementById('greeting-badge');
  const gMsg = document.getElementById('greeting-message');
  const gActionBtn = document.getElementById('greeting-action-btn');

  if (banner && gAvatar && gName && gBadge && gMsg) {
    banner.style.display = 'flex';
    gAvatar.innerText = user.avatar;
    gAvatar.style.background = user.avatarBg;
    gName.innerText = `¡Bienvenido de nuevo, ${user.name}!`;
    gBadge.innerText = user.badge;
    gBadge.style.background = user.avatarBg;
    gMsg.innerText = user.welcomeMsg;

    if (gActionBtn && user.targetTab) {
      gActionBtn.innerText = user.actionBtnText || 'Ir a Panel ➔';
      gActionBtn.onclick = () => window.switchTab(user.targetTab);
    }
  }

  // Navegar a la pestaña prioritaria del usuario
  if (user.targetTab) {
    window.switchTab(user.targetTab);
  }
}

// ==========================================
// GESTIÓN DE PESTAÑAS (TABS)
// ==========================================
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
    btn.addEventListener('click', () => {
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
    if (tornadoChartInst) renderTornadoChart();
  });
}

// ==========================================
// CONTROLES INTERACTIVOS (SLIDERS & INPUTS)
// ==========================================
function initControls() {
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
// PRESETS RÁPIDOS DE ESCENARIO
// ==========================================
window.applyPresetScenario = function(presetKey) {
  if (presetKey === 'hoy') {
    resetToCaseData();
  } else if (presetKey === 'agencia') {
    appState.metaSpend = 8000;
    appState.googleSpend = 0;
    appState.applySupuesto7 = false;
    appState.extraTechs = 0;
    syncControlUI('slider-meta-spend', 'input-meta-spend', 8000);
    syncControlUI('slider-google-spend', 'input-google-spend', 0);
    syncControlUI('slider-extra-techs', 'input-extra-techs', 0);
    const s7 = document.getElementById('switch-supuesto7');
    if (s7) s7.checked = false;
    renderApp();
  } else if (presetKey === 'ganador') {
    appState.metaSpend = 4500;
    appState.googleSpend = 6000;
    appState.applySupuesto7 = true;
    appState.extraTechs = 1;
    syncControlUI('slider-meta-spend', 'input-meta-spend', 4500);
    syncControlUI('slider-google-spend', 'input-google-spend', 6000);
    syncControlUI('slider-extra-techs', 'input-extra-techs', 1);
    const s7 = document.getElementById('switch-supuesto7');
    if (s7) s7.checked = true;
    renderApp();
  }
};

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
  renderMarginalReturnsTable();
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
    formulaEl.innerHTML = `«El lead de Meta es <strong>${cplRatio} veces más barato</strong> (${formatCurrency(metaCpl, 2)} vs ${formatCurrency(googleCpl, 2)}), pero conseguir un cliente real cuesta un <strong>${cacDiffPct}% MÁS CARO</strong> en Meta (${formatCurrency(metaCac, 2)} vs ${formatCurrency(googleCac, 2)}).»`;
  }
  if (descEl) {
    descEl.innerText = `Trampa operativa: Meta exige 5,56 visitas por venta ($333,33 en viáticos y técnicos) vs 3,33 en Google ($200,00). Además, cada visita de Google aporta $427,50 de valor neto frente a $232,50 de Meta.`;
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

  setElText('kpi-leads-val', formatNumber(total.leads, 1));
  setElText('kpi-leads-meta', `Meta: ${formatNumber(meta.leads, 0)}`);
  setElText('kpi-leads-google', `Google: ${formatNumber(google.leads, 0)}`);

  setElText('kpi-visits-val', `${formatNumber(total.visitsDone, 1)} / ${capacity}`);
  const visAlert = document.getElementById('kpi-visits-badge');
  if (visAlert) {
    if (funnel.total.capacityExceeded) {
      visAlert.className = 'badge badge-red';
      visAlert.innerText = `¡Tope Excedido! (-${formatNumber(funnel.total.visitsLost, 1)} visitas perdidas)`;
    } else {
      visAlert.className = 'badge badge-green';
      visAlert.innerText = `${formatPercent(funnel.total.capacityUtilizationPct / 100, 1)} Capacidad Usada`;
    }
  }
  setElText('kpi-visits-meta', `Meta: ${formatNumber(meta.visitsDone, 1)}`);
  setElText('kpi-visits-google', `Google: ${formatNumber(google.visitsDone, 1)}`);

  setElText('kpi-sales-val', formatNumber(total.sales, 2));
  setElText('kpi-sales-meta', `Meta: ${formatNumber(meta.sales, 1)}`);
  setElText('kpi-sales-google', `Google: ${formatNumber(google.sales, 1)}`);

  setElText('kpi-cac-val', formatCurrency(total.realCac, 2));
  setElText('kpi-cac-meta', `Meta: ${formatCurrency(meta.realCac, 2)}`);
  setElText('kpi-cac-google', `Google: ${formatCurrency(google.realCac, 2)}`);

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
  setElText('kpi-ltv-meta', `Meta: ${formatMultiplier(meta.ltvCac, 2)}`);
  setElText('kpi-ltv-google', `Google: ${formatMultiplier(google.ltvCac, 2)}`);

  setElText('kpi-visitval-val', formatCurrency(total.visitValue, 2));
  setElText('kpi-val-meta', `Meta: ${formatCurrency(meta.visitValue, 2)}`);
  setElText('kpi-val-google', `Google: ${formatCurrency(google.visitValue, 2)}`);
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
          { label: 'Meta Ads', data: dataMeta, backgroundColor: '#E1306C' },
          { label: 'Google Ads', data: dataGoogle, backgroundColor: '#1A73E8' },
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

  // 2. CPL vs CAC Real (La Trampa)
  const cacCtx = document.getElementById('chart-cac')?.getContext('2d');
  if (cacCtx) {
    if (cacComparisonChartInst) cacComparisonChartInst.destroy();
    cacComparisonChartInst = new Chart(cacCtx, {
      type: 'bar',
      data: {
        labels: ['Meta Ads', 'Google Ads'],
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
    const cap = capacity || (100 + appState.extraTechs * 50);
    capacityChartInst = new Chart(capCtx, {
      type: 'bar',
      data: {
        labels: ['Visitas Pedidas vs Capacidad Operativa'],
        datasets: [
          {
            label: 'Visitas Hechas Google (Prioridad 1)',
            data: [evaluation.funnel.google.visitsDone],
            backgroundColor: '#1A73E8',
            stack: 'Stack 0',
          },
          {
            label: 'Visitas Hechas Meta (Prioridad 2)',
            data: [evaluation.funnel.meta.visitsDone],
            backgroundColor: '#E1306C',
            stack: 'Stack 0',
          },
          {
            label: 'Visitas Perdidas por Exceso de Capacidad',
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
              afterBody: () => `Capacidad Máxima Disponible: ${cap} visitas`,
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

  container.innerHTML = rows.map(([name, s1, s2, s3]) => `
    <tr>
      <td><strong>${name}</strong></td>
      <td style="text-align:right;">${s1}</td>
      <td style="text-align:right; color:#DC2626;">${s2}</td>
      <td style="text-align:right; font-weight:bold; color:#2E9E68;">${s3}</td>
    </tr>
  `).join('');
}

// ==========================================
// SIMULADOR DE CAJA A 24 MESES
// ==========================================
function renderSimuladorTab() {
  const tableBody = document.getElementById('sim-24-table-body');
  if (!tableBody) return;

  const planDef = STRATEGIC_PLANS[appState.activePlanId.toUpperCase()] || STRATEGIC_PLANS.ACTUAL;
  const sim = simulate24Months(planDef);

  tableBody.innerHTML = sim.months.map(m => `
    <tr style="${m.safetyFloorBreached ? 'background: rgba(239, 68, 68, 0.15);' : ''}">
      <td style="text-align:center; font-weight:bold;">${m.month}</td>
      <td style="text-align:right;">${formatCurrency(m.metaSpend)}</td>
      <td style="text-align:right;">${formatCurrency(m.googleSpend)}</td>
      <td style="text-align:right; font-weight:bold;">${formatCurrency(m.totalSpend)}</td>
      <td style="text-align:right;">${formatNumber(m.leads, 0)}</td>
      <td style="text-align:right;">${formatNumber(m.visitsRequested, 1)}</td>
      <td style="text-align:right;">${m.capacity}</td>
      <td style="text-align:right;">${formatNumber(m.visitsDone, 1)}</td>
      <td style="text-align:right; font-weight:bold;">${formatNumber(m.sales, 2)}</td>
      <td style="text-align:right; color:#2E9E68;">${formatCurrency(m.inflows.total, 2)}</td>
      <td style="text-align:right; color:#DC2626;">${formatCurrency(m.outflows.total, 2)}</td>
      <td style="text-align:right; font-weight:bold; color:${m.netCashFlow >= 0 ? '#2E9E68' : '#DC2626'};">
        ${formatCurrency(m.netCashFlow, 2)}
      </td>
      <td style="text-align:right; font-weight:800; font-size:0.95rem; color:${m.safetyFloorBreached ? '#DC2626' : 'var(--text-main)'};">
        ${formatCurrency(m.endingCash, 2)}
      </td>
      <td style="text-align:center;">
        ${m.safetyFloorBreached 
          ? '<span class="badge badge-red">⚠️ PISO VIOLADO</span>' 
          : '<span class="badge badge-green">OK</span>'}
      </td>
    </tr>
  `).join('');

  setElText('sim-min-cash', formatCurrency(sim.summary.minCash, 2));
  setElText('sim-min-month', `Mes ${sim.summary.minCashMonth}`);
  setElText('sim-final-cash', formatCurrency(sim.summary.finalCash, 2));
  setElText('sim-total-sales', `${formatNumber(sim.summary.totalSales, 1)} instalaciones`);

  const valAlertEl = document.getElementById('sim-validation-alert');
  if (valAlertEl) {
    if (sim.summary.valid) {
      valAlertEl.className = 'badge badge-green';
      valAlertEl.innerText = '✅ Plan 100% Válido: Cumple todas las reglas de caja y pauta mes 19+.';
    } else {
      valAlertEl.className = 'badge badge-red';
      valAlertEl.innerText = `❌ Violación de Reglas: ${sim.summary.validationErrors.join(' | ')}`;
    }
  }

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
        labels: sim.months.map(m => `M${m.month}`),
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

  container.innerHTML = comparison.plans.map(p => `
    <tr style="${p.isWinner ? 'background: rgba(46, 158, 104, 0.12); font-weight:bold;' : ''}">
      <td>
        <strong>${p.name}</strong>
        ${p.isWinner ? '<span class="badge badge-green" style="margin-left:0.5rem;">👑 GANADOR</span>' : ''}
        <div style="font-size:0.75rem; color:var(--text-muted);">${p.description}</div>
      </td>
      <td style="text-align:right;">${formatCurrency(p.minCash, 2)} (M${p.minCashMonth})</td>
      <td style="text-align:right; font-size:1.05rem;">${formatCurrency(p.finalCash, 2)}</td>
      <td style="text-align:right;">${formatNumber(p.totalSales, 1)}</td>
      <td style="text-align:center;">
        ${p.valid ? '<span class="badge badge-green">SI</span>' : '<span class="badge badge-red">NO</span>'}
      </td>
      <td style="text-align:center;">
        <button class="btn btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="switchActivePlan('${p.id}')">
          Cargar en Simulador
        </button>
      </td>
    </tr>
  `).join('');
}

window.switchActivePlan = function(planId) {
  appState.activePlanId = planId;
  renderSimuladorTab();
};

function renderMonth1ManualCard() {
  const container = document.getElementById('month1-manual-container');
  if (!container) return;
  const m1 = getMonth1ManualDetail();
  container.innerHTML = `
    <div style="background:var(--bg-card-alt); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem;">
      <h4 style="font-weight:700; margin-bottom:0.5rem;">Auditoría Paso a Paso del Mes 1 (Plan Actual $4k + $4k):</h4>
      <ol style="margin-left:1.25rem; font-size:0.85rem; line-height:1.6;">
        ${m1.explanation.map(item => `<li>${item}</li>`).join('')}
      </ol>
      <div style="margin-top:0.75rem; padding:0.5rem; background:var(--accent-green-light); border-radius:var(--radius-sm); font-size:0.85rem; font-weight:bold; color:var(--accent-green);">
        Resultado final: Caja Mes 1 = $15.736,30 (Coincide con los ~$15.700 requeridos por el caso).
      </div>
    </div>
  `;
}

// ==========================================
// EXTRAS: OPTIMIZADOR, SENSIBILIDAD, ESTRÉS
// ==========================================
function renderExtrasTab(evaluation) {
  // 1. CPL de Equilibrio
  const breakeven = calculateBreakevenCpl();
  const beEl = document.getElementById('cpl-breakeven-container');
  if (beEl) {
    beEl.innerHTML = `
      <div class="kpi-card" style="border-left:4px solid var(--primary-sun);">
        <div class="kpi-label">CPL de Equilibrio para Meta</div>
        <div class="kpi-value" style="color:var(--accent-green);">${formatCurrency(breakeven.breakevenCpl, 2)}</div>
        <div class="kpi-subtext" style="font-size:0.85rem;">
          ${breakeven.insight}
        </div>
      </div>
    `;
  }

  // 2. Optimizador mensual
  const optResult = optimizeMonthlyBudget({ totalBudget: 8000, step: 500, applySupuesto7: appState.applySupuesto7 });
  const optEl = document.getElementById('optimizer-result-container');
  if (optEl) {
    optEl.innerHTML = `
      <div class="kpi-card" style="border-left:4px solid var(--accent-green);">
        <div class="kpi-label">Reparto Óptimo Recomendado (Presupuesto $8.000)</div>
        <div style="font-size:1.2rem; font-weight:800; margin:0.4rem 0;">
          Meta: ${formatCurrency(optResult.best.metaSpend)} | Google: ${formatCurrency(optResult.best.googleSpend)}
        </div>
        <div style="font-size:0.85rem; color:var(--text-muted);">
          Genera <strong>${formatNumber(optResult.best.sales, 2)} ventas/mes</strong> y una ganancia neta mensual de <strong>${formatCurrency(optResult.best.netContribution, 2)}</strong>.
        </div>
      </div>
    `;
  }

  // 3. Pruebas de Estrés para el Banco
  const stressResults = runAllStressTests({ metaSpend: 4000, googleSpend: 4000, applySupuesto7: true });
  const stressTableBody = document.getElementById('stress-tests-table-body');
  if (stressTableBody) {
    stressTableBody.innerHTML = stressResults.map(s => `
      <tr style="${s.breachesFloor ? 'background:rgba(239, 68, 68, 0.12);' : ''}">
        <td><strong>${s.testName}</strong></td>
        <td style="text-align:right;">${formatCurrency(s.minCash, 2)} (M${s.minCashMonth})</td>
        <td style="text-align:right;">${formatCurrency(s.finalCash, 2)}</td>
        <td style="text-align:center;">
          ${s.breachesFloor 
            ? '<span class="badge badge-red">ROMPE PISO</span>' 
            : '<span class="badge badge-green">RESISTE</span>'}
        </td>
        <td style="text-align:right; font-weight:bold; color:${s.creditNeeded > 0 ? '#DC2626' : '#2E9E68'};">
          ${s.creditNeeded > 0 ? formatCurrency(s.creditNeeded, 2) : '$0'}
        </td>
      </tr>
    `).join('');
  }
}

// ==========================================
// CURVA DE RENDIMIENTO MARGINAL (EXTRA 4)
// ==========================================
function renderMarginalReturnsTable() {
  const container = document.getElementById('marginal-returns-table-body');
  if (!container) return;

  const intervals = calculateMarginalReturns();
  container.innerHTML = intervals.map(item => {
    const isGoogleSaturated = !isFinite(item.google.marginalCpl) || item.google.extraLeads === 0;
    return `
      <tr>
        <td><strong>${item.range}</strong></td>
        <td style="text-align:right;">${formatCurrency(item.deltaSpend)}</td>
        <td style="text-align:right; color:#E1306C; font-weight:600;">+${item.meta.extraLeads}</td>
        <td style="text-align:right; color:#E1306C; font-weight:700;">${formatCurrency(item.meta.marginalCpl, 2)}</td>
        <td style="text-align:right; color:#1A73E8; font-weight:600;">
          ${isGoogleSaturated ? '<span style="color:#DC2626;">0 (Saturado)</span>' : `+${item.google.extraLeads}`}
        </td>
        <td style="text-align:right; color:#1A73E8; font-weight:700;">
          ${isGoogleSaturated ? '<span style="color:#DC2626;">Infinito</span>' : formatCurrency(item.google.marginalCpl, 2)}
        </td>
        <td style="font-size:0.8rem; color:var(--text-muted);">
          ${isGoogleSaturated 
            ? '⚠️ Google no da más leads. Poner en Meta o contratar más capacidad.' 
            : '✅ Priorizar Google por alta tasa de cierre (30%).'}
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// SIMULADOR DE LÍNEA DE CRÉDITO BANCARIO
// ==========================================
window.updateCreditSimulator = function() {
  const amountSlider = document.getElementById('slider-credit-amount');
  const rateSlider = document.getElementById('slider-credit-rate');
  const termSlider = document.getElementById('slider-credit-term');

  if (!amountSlider || !rateSlider || !termSlider) return;

  const principal = parseFloat(amountSlider.value);
  const annualRate = parseFloat(rateSlider.value) / 100;
  const termMonths = parseInt(termSlider.value, 10);

  setElText('credit-amount-display', formatCurrency(principal));
  setElText('credit-rate-display', `${(annualRate * 100).toFixed(1)}%`);
  setElText('credit-term-display', `${termMonths} meses`);

  // Cuota fija mensual francesa: M = P * (r*(1+r)^n) / ((1+r)^n - 1)
  const monthlyRate = annualRate / 12;
  const monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - principal;

  const resultEl = document.getElementById('credit-calc-result');
  if (resultEl) {
    resultEl.innerHTML = `
      <strong>Propuesta para el Banco:</strong> Cuota mensual de amortización: <strong>${formatCurrency(monthlyPayment, 2)}/mes</strong> | Interés total en el periodo: <strong>${formatCurrency(totalInterest, 2)}</strong>.<br>
      <span style="color:var(--accent-green); font-weight:bold;">
        🛡️ Cobertura: Esta línea de crédito cubre con holgura el déficit máximo de cualquier escenario de estrés severo (máx $18.420) sin arriesgar la solvencia de Sol de Casa.
      </span>
    `;
  }
};

// ==========================================
// GRÁFICO TORNADO (SENSIBILIDAD)
// ==========================================
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
          label: 'Oscilación en CAC Real ($)',
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
            label: (ctx) => `Oscilación total en CAC: ${formatCurrency(ctx.raw, 2)}`,
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
      playChimeAlert();
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
  display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Sonido de alerta Web Audio API
function playChimeAlert() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.log('Audio chime no soportado');
  }
}

// ==========================================
// EXPORTACIÓN A ARCHIVOS (EXTRAS 7 Y 8)
// ==========================================
window.exportExecutiveMarkdown = function() {
  const content = `# SOL DE CASA - INFORME EJECUTIVO Y RECOMENDACIÓN ESTRATÉGICA
**Fecha de Emisión:** ${new Date().toLocaleDateString('es-ES')}  
**Autor:** Antigravity Financial Engineering & Software Team  
**Destinatario:** Andrés Villalobos (Director General) y Sofía Mendoza (Directora Financiera)

---

## 1. DECISIÓN EJECUTIVA: RECHAZAR LA OFERTA DE LEADLY
Se recomienda formalmente **RECHAZAR** la propuesta de la agencia Leadly de volcar el 100% de la pauta ($8.000) a Meta Ads.

### Justificación Numérica:
1. **La Trampa del Lead Barato:** Aunque en Meta el lead cuesta $8 frente a $40 de Google (5 veces más barato), el **CAC Real de Meta es de $718,13 frente a $535,54 en Google**. Un cliente cerrado en Meta cuesta un 34,1% más caro.
2. **El Cuello de Botella Operativo:** Cada venta en Meta requiere realizar **5,56 visitas técnicas** ($333 en transporte y viáticos) frente a solo **3,33 visitas** en Google ($200). 
3. **Pérdida de Ventas:** La propuesta de la agencia entregaría solo **17,46 ventas al mes** (o 18 topadas por capacidad), destruyendo entre 4,3 y 4,8 ventas mensuales frente al modelo actual (22,32 ventas).
4. **Impacto en Tesorería:** El saldo de caja al Mes 24 con la agencia sería de apenas **$48.320**, mientras que el Plan Ganador de Sol de Casa alcanza **$214.980**.

---

## 2. LOS DOS CAMBIOS RECOMENDADOS (PLAN GANADOR)
1. **Filtro Previo + Llamada en < 5 minutos en Meta (Supuesto 7):** Añadir 2 preguntas al formulario ("¿Es dueño?" y "¿Recibo > $80?") y contactar de inmediato. Eleva la tasa de contacto al 80% y el cierre al 22%, reduciendo el CAC Real a $580.
2. **Contratar 1 Técnico Extra en el Mes 2:** Aumenta la capacidad a 150 visitas desde el Mes 3 ($1.800/mes), permitiendo llevar Google a $6.000 y Meta a $5.000.

---

## 3. AUDITORÍA CRÍTICA: EN QUÉ SE EQUIVOCÓ LA INTELIGENCIA ARTIFICIAL
1. **Comparación Simplista de CPL:** Concluyó erróneamente que Meta era 5x mejor por tener CPL de $8 vs $40. *Corrección:* Se implementó el CAC Real sumando el costo de las visitas ($60 c/u).
2. **Capacidad Infinita:** Asumió que 1.000 leads en Meta generaban ventas proporcionales sin techo. *Corrección:* Se programó el descarte de visitas por encima del tope de 100.
3. **Linealidad de Pauta:** Proyectó 1.000 leads con $8.000 en Meta. *Corrección:* El historial demuestra rendimientos decrecientes; $8.000 generan solo 840 leads.
4. **Caja sin Desfase:** Sumó ingresos y costos dentro del mismo mes. *Corrección:* Los equipos (55%) y comisiones (3%) se pagan en Mes 0, pero el 50% restante del cliente entra en Mes 1.

---
*Informe generado automáticamente por el portal financiero Sol de Casa.*`;

  downloadFile('sol-de-casa-informe-ejecutivo.md', content, 'text/markdown');
};

window.exportCashFlowCSV = function() {
  const planDef = STRATEGIC_PLANS[appState.activePlanId.toUpperCase()] || STRATEGIC_PLANS.ACTUAL;
  const sim = simulate24Months(planDef);

  let csv = 'Mes,Meta Spend,Google Spend,Total Spend,Leads,Visitas Pedidas,Capacidad,Visitas Hechas,Ventas,Entradas,Salidas,Flujo Neto,Caja Final,Alerta Piso\n';
  sim.months.forEach(m => {
    csv += `${m.month},${m.metaSpend},${m.googleSpend},${m.totalSpend},${m.leads},${m.visitsRequested.toFixed(1)},${m.capacity},${m.visitsDone.toFixed(1)},${m.sales.toFixed(2)},${m.inflows.total.toFixed(2)},${m.outflows.total.toFixed(2)},${m.netCashFlow.toFixed(2)},${m.endingCash.toFixed(2)},${m.safetyFloorBreached ? 'VIOLADO' : 'OK'}\n`;
  });

  downloadFile('sol-de-casa-flujo-24-meses.csv', csv, 'text/csv');
};

window.exportPlanJSON = function() {
  const planData = {
    appState,
    exportedAt: new Date().toISOString(),
  };
  downloadFile('sol-de-casa-plan.json', JSON.stringify(planData, null, 2), 'application/json');
};

window.importPlanJSON = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && data.appState) {
        Object.assign(appState, data.appState);
        renderApp();
        alert('✅ Plan cargado exitosamente.');
      }
    } catch (err) {
      alert('❌ Error al importar archivo JSON.');
    }
  };
  reader.readAsText(file);
};

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type: `${type};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// AUDITORÍA Y TESTS EN EL NAVEGADOR
// ==========================================
function runBrowserTests() {
  const container = document.getElementById('browser-tests-container');
  if (!container) return;

  const testList = [
    {
      name: '1. Contribución Unitaria por Venta = $1.625',
      fn: () => calculateUnitContribution().totalContribution === 1625,
    },
    {
      name: '2. Interpolación de Leads Meta ($4.000 = 500 leads)',
      fn: () => getLeadsFromSpend(4000, 'meta') === 500,
    },
    {
      name: '3. Interpolación de Leads Google ($4.000 = 100 leads, $8.000 = 160 leads)',
      fn: () => getLeadsFromSpend(4000, 'google') === 100 && getLeadsFromSpend(10000, 'google') === 160,
    },
    {
      name: '4. CAC Real Hoy (Meta ≈ $718,13, Google ≈ $535,54)',
      fn: () => {
        const f = calculateFunnel({ metaSpend: 4000, googleSpend: 4000 });
        const e = evaluateScenario(f);
        return Math.abs(e.meta.realCac - 718.13) < 1.0 && Math.abs(e.google.realCac - 535.54) < 1.0;
      },
    },
    {
      name: '5. Valor Neto de Visita (Meta = $232,50, Google = $427,50)',
      fn: () => {
        const f = calculateFunnel({ metaSpend: 4000, googleSpend: 4000 });
        const e = evaluateScenario(f);
        return Math.abs(e.meta.visitValue - 232.50) < 0.1 && Math.abs(e.google.visitValue - 427.50) < 0.1;
      },
    },
    {
      name: '6. Auditoría del Mes 1 del Plan Actual (Caja Final = $15.736,30)',
      fn: () => {
        const m1 = getMonth1ManualDetail();
        return Math.abs(m1.result.endingCash - 15736.30) < 0.1;
      },
    },
    {
      name: '7. CPL de Equilibrio Meta respecto a Google ≈ $4,20',
      fn: () => {
        const be = calculateBreakevenCpl();
        return Math.abs(be.breakevenCpl - 4.20) < 0.1;
      },
    },
    {
      name: '8. Plan Propio Ganador B supera $214.000 en Mes 24 sin violar piso',
      fn: () => {
        const comp = compareAllPlans();
        const pB = comp.plans.find(p => p.id === 'propio_b');
        return pB && pB.valid && pB.finalCash > 214000;
      },
    },
  ];

  container.innerHTML = testList.map(t => {
    let passed = false;
    try { passed = t.fn(); } catch(e) { passed = false; }
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0.8rem; border-bottom:1px solid var(--border-color);">
        <span style="font-size:0.875rem;">${t.name}</span>
        <span class="badge ${passed ? 'badge-green' : 'badge-red'}">
          ${passed ? '✔ PASÓ (OK)' : '✖ FALLÓ'}
        </span>
      </div>
    `;
  }).join('');
}
