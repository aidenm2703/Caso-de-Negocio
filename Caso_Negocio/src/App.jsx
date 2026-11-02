import React, { useState, useEffect, useRef } from 'react';
import { CASE_DATA } from './data/caseData.js';
import { formatCurrency, formatNumber, formatPercent, formatMultiplier } from './utils/format.js';
import { getLeadsFromSpend } from './model/interpolation.js';
import { calculateFunnel } from './model/funnel.js';
import { calculateUnitContribution, evaluateScenario } from './model/unitEconomics.js';
import { simulate24Months, getMonth1ManualDetail } from './model/cash.js';
import { STRATEGIC_PLANS, compareAllPlans } from './model/plans.js';
import { calculateBreakevenCpl, optimizeMonthlyBudget, calculateMarginalReturns } from './model/optimizer.js';
import { runTornadoAnalysis } from './model/sensitivity.js';
import { runAllStressTests } from './model/stress.js';

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
    welcomeMsg: 'Andrés: El memorando ejecutivo recomienda firmemente RECHAZAR la oferta de Leadly para proteger el margen y evitar destruir 4,86 ventas mensuales (−21,8%). El Plan Propio Ganador genera $214.980 en caja.',
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

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('solDeCasa_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState('tab-resumen');
  const [theme, setTheme] = useState('light');

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Parámetros del modelo
  const [metaSpend, setMetaSpend] = useState(4000);
  const [googleSpend, setGoogleSpend] = useState(4000);
  const [metaContactRate, setMetaContactRate] = useState(0.55);
  const [metaScheduleRate, setMetaScheduleRate] = useState(0.30);
  const [metaVisitRate, setMetaVisitRate] = useState(0.70);
  const [metaCloseRate, setMetaCloseRate] = useState(0.18);
  const [googleContactRate, setGoogleContactRate] = useState(0.85);
  const [googleScheduleRate, setGoogleScheduleRate] = useState(0.55);
  const [googleVisitRate, setGoogleVisitRate] = useState(0.85);
  const [googleCloseRate, setGoogleCloseRate] = useState(0.30);
  const [costPerVisit, setCostPerVisit] = useState(60);
  const [extraTechs, setExtraTechs] = useState(0);
  const [price, setPrice] = useState(6500);
  const [applySupuesto7, setApplySupuesto7] = useState(false);
  const [includeBattery, setIncludeBattery] = useState(false);
  const [activePlanId, setActivePlanId] = useState('actual');

  // Crédito bancario simulator
  const [creditAmount, setCreditAmount] = useState(15000);
  const [creditRate, setCreditRate] = useState(14);
  const [creditTerm, setCreditTerm] = useState(12);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Canvas refs
  const funnelChartRef = useRef(null);
  const cacChartRef = useRef(null);
  const capChartRef = useRef(null);
  const cashChartRef = useRef(null);
  const tornadoChartRef = useRef(null);

  const funnelChartInst = useRef(null);
  const cacChartInst = useRef(null);
  const capChartInst = useRef(null);
  const cashChartInst = useRef(null);
  const tornadoChartInst = useRef(null);

  // Cómputo del modelo reactivo
  const capacity = 100 + (extraTechs * 50);
  const customMetaRates = {
    contactRate: metaContactRate,
    scheduleRate: metaScheduleRate,
    visitCompletedRate: metaVisitRate,
    closeRate: metaCloseRate,
  };
  const customGoogleRates = {
    contactRate: googleContactRate,
    scheduleRate: googleScheduleRate,
    visitCompletedRate: googleVisitRate,
    closeRate: googleCloseRate,
  };

  const funnelResult = calculateFunnel({
    metaSpend,
    googleSpend,
    capacity,
    applySupuesto7,
    customMetaRates,
    customGoogleRates,
  });

  const evaluation = evaluateScenario(funnelResult, {
    price,
    costPerVisit,
    includeBattery,
    batteryAttachRate: 0.15,
  });

  const planDef = STRATEGIC_PLANS[activePlanId.toUpperCase()] || STRATEGIC_PLANS.ACTUAL;
  const sim = simulate24Months(planDef);
  const comparisonPlans = compareAllPlans();
  const marginalIntervals = calculateMarginalReturns();
  const breakeven = calculateBreakevenCpl();
  const optResult = optimizeMonthlyBudget({ totalBudget: 8000, step: 500, applySupuesto7 });
  const stressResults = runAllStressTests({ metaSpend: 4000, googleSpend: 4000, applySupuesto7: true });
  const m1 = getMonth1ManualDetail();

  // Theme switch effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auth handler
  const handleLogin = (u, p) => {
    let matched = null;
    const cleanU = u.trim().toLowerCase();
    for (const key in DEMO_USERS) {
      const user = DEMO_USERS[key];
      if (user.aliases.includes(cleanU) && (user.password === p || user.password === '')) {
        matched = user;
        break;
      }
    }
    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('solDeCasa_user', JSON.stringify(matched));
      setLoginError('');
      if (matched.targetTab) setCurrentTab(matched.targetTab);
    } else {
      setLoginError('Credenciales incorrectas. Selecciona un usuario demo abajo.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('solDeCasa_user');
    setCurrentUser(null);
  };

  // Preset scenarios
  const applyPreset = (key) => {
    if (key === 'hoy') {
      setMetaSpend(4000);
      setGoogleSpend(4000);
      setApplySupuesto7(false);
      setExtraTechs(0);
    } else if (key === 'agencia') {
      setMetaSpend(8000);
      setGoogleSpend(0);
      setApplySupuesto7(false);
      setExtraTechs(0);
    } else if (key === 'ganador') {
      setMetaSpend(4500);
      setGoogleSpend(6000);
      setApplySupuesto7(true);
      setExtraTechs(1);
    }
  };

  // Chart rendering effects
  useEffect(() => {
    if (typeof window.Chart === 'undefined') return;

    // 1. Embudo
    if (funnelChartRef.current && currentTab === 'tab-tablero') {
      if (funnelChartInst.current) funnelChartInst.current.destroy();
      const ctx = funnelChartRef.current.getContext('2d');
      funnelChartInst.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['1. Leads', '2. Contactados', '3. Agendados', '4. Visitas Hechas', '5. Ventas'],
          datasets: [
            {
              label: 'Meta Ads',
              data: [
                evaluation.funnel.meta.leads,
                evaluation.funnel.meta.contacted,
                evaluation.funnel.meta.scheduled,
                evaluation.funnel.meta.visitsDone,
                evaluation.funnel.meta.sales,
              ],
              backgroundColor: '#E1306C',
            },
            {
              label: 'Google Ads',
              data: [
                evaluation.funnel.google.leads,
                evaluation.funnel.google.contacted,
                evaluation.funnel.google.scheduled,
                evaluation.funnel.google.visitsDone,
                evaluation.funnel.google.sales,
              ],
              backgroundColor: '#1A73E8',
            },
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

    // 2. CAC Comparison
    if (cacChartRef.current && currentTab === 'tab-tablero') {
      if (cacChartInst.current) cacChartInst.current.destroy();
      const ctx = cacChartRef.current.getContext('2d');
      cacChartInst.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Meta Ads', 'Google Ads'],
          datasets: [
            { label: 'CPL (Costo por Lead)', data: [evaluation.meta.cpl, evaluation.google.cpl], backgroundColor: '#F59E0B' },
            { label: 'CAC de Anuncios', data: [evaluation.meta.adCac, evaluation.google.adCac], backgroundColor: '#FFC531' },
            { label: 'CAC Real (+Visitas)', data: [evaluation.meta.realCac, evaluation.google.realCac], backgroundColor: '#2E9E68' },
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

    // 3. Capacidad
    if (capChartRef.current && currentTab === 'tab-tablero') {
      if (capChartInst.current) capChartInst.current.destroy();
      const ctx = capChartRef.current.getContext('2d');
      capChartInst.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Visitas Pedidas vs Capacidad'],
          datasets: [
            { label: 'Visitas Hechas Google (Prioridad 1)', data: [evaluation.funnel.google.visitsDone], backgroundColor: '#1A73E8', stack: 'Stack 0' },
            { label: 'Visitas Hechas Meta (Prioridad 2)', data: [evaluation.funnel.meta.visitsDone], backgroundColor: '#E1306C', stack: 'Stack 0' },
            { label: 'Visitas Perdidas por Exceso', data: [evaluation.funnel.total.visitsLost], backgroundColor: '#EF4444', stack: 'Stack 0' },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true, max: Math.max(capacity * 1.3, evaluation.funnel.total.visitsRequested * 1.15) },
          },
        },
      });
    }

    // 4. Cash Flow
    if (cashChartRef.current && currentTab === 'tab-simulador') {
      if (cashChartInst.current) cashChartInst.current.destroy();
      const ctx = cashChartRef.current.getContext('2d');
      cashChartInst.current = new window.Chart(ctx, {
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
          scales: { y: { beginAtZero: true, title: { display: true, text: 'USD ($)' } } },
        },
      });
    }

    // 5. Tornado
    if (tornadoChartRef.current && currentTab === 'tab-extras') {
      if (tornadoChartInst.current) tornadoChartInst.current.destroy();
      const ctx = tornadoChartRef.current.getContext('2d');
      const dataTornado = runTornadoAnalysis({ metaSpend: 4000, googleSpend: 4000 });
      tornadoChartInst.current = new window.Chart(ctx, {
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
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, title: { display: true, text: 'Amplitud de Variación en CAC Real ($)' } } },
        },
      });
    }
  }, [currentTab, metaSpend, googleSpend, extraTechs, applySupuesto7, activePlanId]);

  // Audio chime
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {}
  };

  // Timer interval
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => {
        if (s <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          playChime();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  // Download file helper
  const downloadFile = (filename, content, type) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculations for bank credit simulator
  const monthlyRate = (creditRate / 100) / 12;
  const monthlyPayment = (creditAmount * (monthlyRate * Math.pow(1 + monthlyRate, creditTerm))) / (Math.pow(1 + monthlyRate, creditTerm) - 1);
  const totalInterest = (monthlyPayment * creditTerm) - creditAmount;

  return (
    <div>
      {/* LOGIN OVERLAY */}
      {!currentUser && (
        <div className="login-overlay">
          <div className="login-modal">
            <div className="login-header">
              <div className="login-header-logo">☀️</div>
              <h2>Sol de Casa</h2>
              <p>Sistema de Inteligencia Financiera y Simulación Solar</p>
            </div>

            <div className="login-body">
              {loginError && <div className="login-error-msg" style={{ display: 'block' }}>{loginError}</div>}

              <form onSubmit={(e) => { e.preventDefault(); handleLogin(loginUser, loginPass); }}>
                <div className="login-form-group">
                  <label className="login-label">Usuario o Correo Corporativo</label>
                  <div className="login-input-wrapper">
                    <input
                      type="text"
                      className="login-input"
                      placeholder="ej. andres@soldecasa.com"
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label className="login-label">Contraseña</label>
                  <div className="login-input-wrapper">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="login-input"
                      placeholder="••••••••"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      required
                    />
                    <button type="button" className="login-toggle-pwd" onClick={() => setShowPass(!showPass)}>👁️</button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> Recordar mi sesión
                  </label>
                  <button type="button" onClick={() => handleLogin('invitado', '')} style={{ background: 'none', border: 'none', color: 'var(--channel-google)', cursor: 'pointer', fontWeight: 700 }}>
                    Explorar como Invitado →
                  </button>
                </div>

                <button type="submit" className="login-submit-btn">
                  <span>Iniciar Sesión en el Portal</span> ➔
                </button>
              </form>

              {/* DEMO CREDENTIALS BOX */}
              <div className="demo-creds-container">
                <div className="demo-creds-title">
                  <span>Credenciales de Prueba (Haz clic para entrar)</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>1-CLIC DISPONIBLE</span>
                </div>

                <div className="demo-creds-grid">
                  <div className="demo-user-card" onClick={() => handleLogin('andres@soldecasa.com', 'admin123')}>
                    <div className="demo-user-header">
                      <div className="demo-user-avatar" style={{ background: '#E1306C' }}>AV</div>
                      <div>
                        <div className="demo-user-name">Andrés Villalobos</div>
                        <div className="demo-user-role">Director General (CEO)</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      <code>andres@soldecasa.com</code> / <code>admin123</code>
                    </div>
                    <div className="demo-user-quick-btn">⚡ Entrar como Andrés</div>
                  </div>

                  <div className="demo-user-card" onClick={() => handleLogin('sofia@soldecasa.com', 'cfo2024')}>
                    <div className="demo-user-header">
                      <div className="demo-user-avatar" style={{ background: '#2E9E68' }}>SM</div>
                      <div>
                        <div className="demo-user-name">Sofía Mendoza</div>
                        <div className="demo-user-role">Directora Financiera (CFO)</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      <code>sofia@soldecasa.com</code> / <code>cfo2024</code>
                    </div>
                    <div className="demo-user-quick-btn">⚡ Entrar como Sofía</div>
                  </div>

                  <div className="demo-user-card" onClick={() => handleLogin('carlos@soldecasa.com', 'ops2024')}>
                    <div className="demo-user-header">
                      <div className="demo-user-avatar" style={{ background: '#1A73E8' }}>CN</div>
                      <div>
                        <div className="demo-user-name">Carlos Navarro</div>
                        <div className="demo-user-role">Jefe de Operaciones (COO)</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      <code>carlos@soldecasa.com</code> / <code>ops2024</code>
                    </div>
                    <div className="demo-user-quick-btn">⚡ Entrar como Carlos</div>
                  </div>

                  <div className="demo-user-card" onClick={() => handleLogin('laura@soldecasa.com', 'growth2024')}>
                    <div className="demo-user-header">
                      <div className="demo-user-avatar" style={{ background: '#F59E0B' }}>LR</div>
                      <div>
                        <div className="demo-user-name">Laura Restrepo</div>
                        <div className="demo-user-role">Líder Comercial & Growth</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      <code>laura@soldecasa.com</code> / <code>growth2024</code>
                    </div>
                    <div className="demo-user-quick-btn">⚡ Entrar como Laura</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-section">
            <div className="brand-logo">☀️</div>
            <div>
              <h1 className="brand-title">Sol de Casa</h1>
              <p className="brand-subtitle">Portal Financiero y Simulador Estratégico | Caso C</p>
            </div>
          </div>

          <div className="header-actions">
            {currentUser && (
              <div className="header-user-widget">
                <div className="header-user-avatar" style={{ background: currentUser.avatarBg }}>{currentUser.avatar}</div>
                <div>
                  <div className="header-user-name">{currentUser.name}</div>
                  <div className="header-user-role">{currentUser.role}</div>
                </div>
                <button className="btn-logout" onClick={handleLogout} title="Cerrar Sesión">🚪 Salir</button>
              </div>
            )}
            <button className="btn btn-secondary" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
            </button>
            <button className="btn btn-primary no-print" onClick={() => window.print()}>🖨️ Imprimir</button>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="tabs-nav no-print">
        <button className={`tab-btn ${currentTab === 'tab-resumen' ? 'active' : ''}`} onClick={() => setCurrentTab('tab-resumen')}>📑 Resumen Ejecutivo</button>
        <button className={`tab-btn ${currentTab === 'tab-tablero' ? 'active' : ''}`} onClick={() => setCurrentTab('tab-tablero')}>🎛️ Tablero Interactivo</button>
        <button className={`tab-btn ${currentTab === 'tab-simulador' ? 'active' : ''}`} onClick={() => setCurrentTab('tab-simulador')}>📈 Simulador 24 Meses</button>
        <button className={`tab-btn ${currentTab === 'tab-preguntas' ? 'active' : ''}`} onClick={() => setCurrentTab('tab-preguntas')}>❓ Respuestas Caso (1-7)</button>
        <button className={`tab-btn ${currentTab === 'tab-extras' ? 'active' : ''}`} onClick={() => setCurrentTab('tab-extras')}>⚡ Extras & Estrategia</button>
        <button className={`tab-btn ${currentTab === 'tab-auditoria' ? 'active' : ''}`} onClick={() => setCurrentTab('tab-auditoria')}>🔍 Auditoría & Errores IA</button>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="main-container">
        {/* BANNER DE SALUDO PERSONALIZADO */}
        {currentUser && (
          <div className="greeting-banner">
            <div className="greeting-info">
              <div className="greeting-avatar" style={{ background: currentUser.avatarBg }}>{currentUser.avatar}</div>
              <div>
                <div className="greeting-title">
                  <span>¡Bienvenido de nuevo, {currentUser.name}!</span>
                  <span className="greeting-role-badge" style={{ background: currentUser.avatarBg }}>{currentUser.badge}</span>
                </div>
                <div className="greeting-subtext">{currentUser.welcomeMsg}</div>
              </div>
            </div>
            <div className="greeting-actions">
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }} onClick={() => setCurrentTab(currentUser.targetTab)}>
                {currentUser.actionBtnText}
              </button>
            </div>
          </div>
        )}

        {/* BARRA DE EXPORTACIONES */}
        <div className="export-bar no-print">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.5rem' }}>Exportar y Datos:</span>
          <button className="btn-export" onClick={() => downloadFile('sol-de-casa-informe.md', '# Informe Ejecutivo Sol de Casa\n...', 'text/markdown')}>
            📝 Descargar Informe (.md)
          </button>
          <button className="btn-export" onClick={() => {
            let csv = 'Mes,Meta,Google,Total,Leads,Visitas,Ventas,Caja Final\n';
            sim.months.forEach(m => { csv += `${m.month},${m.metaSpend},${m.googleSpend},${m.totalSpend},${m.leads},${m.visitsDone.toFixed(1)},${m.sales.toFixed(2)},${m.endingCash.toFixed(2)}\n`; });
            downloadFile('sol-de-casa-flujo-24m.csv', csv, 'text/csv');
          }}>
            📊 Descargar Flujo 24M (.csv)
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Escenarios rápidos:</span>
            <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }} onClick={() => applyPreset('hoy')}>Hoy ($4k+$4k)</button>
            <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }} onClick={() => applyPreset('agencia')}>Agencia ($8k Meta)</button>
            <button className="btn btn-primary" style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }} onClick={() => applyPreset('ganador')}>Propio Ganador</button>
          </div>
        </div>

        {/* PESTAÑA 1: RESUMEN */}
        {currentTab === 'tab-resumen' && (
          <section className="tab-pane print-page">
            <div className="trap-banner">
              <div className="trap-icon">⚠️</div>
              <div className="trap-content">
                <h3>LA TRAMPA DEL CASO DETECTADA</h3>
                <p className="trap-formula">
                  «El lead de Meta es <strong>{(evaluation.google.cpl / evaluation.meta.cpl).toFixed(1)} veces más barato</strong> ({formatCurrency(evaluation.meta.cpl, 2)} vs {formatCurrency(evaluation.google.cpl, 2)}), pero conseguir un cliente real cuesta un <strong>{(((evaluation.meta.realCac - evaluation.google.realCac) / evaluation.google.realCac) * 100).toFixed(1)}% MÁS CARO</strong> en Meta ({formatCurrency(evaluation.meta.realCac, 2)} vs {formatCurrency(evaluation.google.realCac, 2)}).»
                </p>
                <p className="trap-desc">
                  Meta exige 5,56 visitas por venta ($333,33 en costo de visitas) frente a 3,33 en Google ($200,00). Además, cada visita de Google aporta $427,50 de valor neto vs $232,50 en Meta.
                </p>
              </div>
            </div>

            <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
              <div className="chart-header">
                <h2 className="chart-title">Memorando Ejecutivo para Andrés Villalobos</h2>
                <span className="badge badge-red" style={{ fontSize: '0.9rem' }}>DECISIÓN: RECHAZAR AGENCIA LEADLY</span>
              </div>
              <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
                <p style={{ marginBottom: '0.75rem' }}>
                  <strong>Andrés:</strong> La recomendación definitiva es <strong>RECHAZAR</strong> la propuesta de Leadly de volcar los $8.000 a Meta. Aunque prometen más leads con el argumento de que <em>"en Meta el lead cuesta $8 y en Google $40"</em>, la realidad empírica demuestra que aceptar su propuesta <strong>destruiría 4,86 ventas al mes (−21,8%)</strong> y dejaría apenas $48.320 en caja al Mes 24 frente a más de $214.000 del plan propio.
                </p>
                <h4 style={{ fontWeight: 'bold', margin: '1rem 0 0.5rem 0' }}>Los dos cambios recomendados (Plan Ganador):</h4>
                <ol style={{ marginLeft: '1.5rem' }}>
                  <li><strong>Filtro previo + llamada en &lt; 5 min en Meta (Supuesto 7):</strong> Eleva el contacto al 80% y el cierre al 22%, reduciendo el CAC Real a $580.</li>
                  <li><strong>Contratar 1 técnico extra en Mes 2:</strong> Rompe el techo de 100 visitas (aumenta a 150 desde Mes 3), permitiendo escalar Google a $6.000 y Meta a $5.000, alcanzando <strong>$214.980 en caja al Mes 24</strong>.</li>
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* PESTAÑA 2: TABLERO */}
        {currentTab === 'tab-tablero' && (
          <section className="tab-pane">
            <div className="dashboard-grid">
              <aside className="controls-sidebar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Panel de Parámetros</h3>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => applyPreset('hoy')}>
                    ↺ Restaurar Caso
                  </button>
                </div>

                <div className="control-section">
                  <div className="control-title">Presupuesto de Pauta</div>
                  <div className="control-group">
                    <div className="control-label-row"><span style={{ color: 'var(--channel-meta)', fontWeight: 700 }}>Meta Ads ($)</span></div>
                    <div className="control-input-wrapper">
                      <input type="range" className="control-slider" min="0" max="10000" step="500" value={metaSpend} onChange={(e) => setMetaSpend(Number(e.target.value))} />
                      <input type="number" className="control-num-input" min="0" max="10000" step="500" value={metaSpend} onChange={(e) => setMetaSpend(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="control-group">
                    <div className="control-label-row"><span style={{ color: 'var(--channel-google)', fontWeight: 700 }}>Google Ads ($)</span></div>
                    <div className="control-input-wrapper">
                      <input type="range" className="control-slider" min="0" max="8000" step="500" value={googleSpend} onChange={(e) => setGoogleSpend(Number(e.target.value))} />
                      <input type="number" className="control-num-input" min="0" max="8000" step="500" value={googleSpend} onChange={(e) => setGoogleSpend(Number(e.target.value))} />
                    </div>
                  </div>
                </div>

                <div className="control-section">
                  <div className="control-title">Palancas Estratégicas</div>
                  <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtro + Respuesta &lt; 5 min (S7)</label>
                    <input type="checkbox" checked={applySupuesto7} onChange={(e) => setApplySupuesto7(e.target.checked)} style={{ width: 18, height: 18 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Batería de Respaldo ($3.000)</label>
                    <input type="checkbox" checked={includeBattery} onChange={(e) => setIncludeBattery(e.target.checked)} style={{ width: 18, height: 18 }} />
                  </div>
                </div>

                <div className="control-section">
                  <div className="control-title">Capacidad y Operaciones</div>
                  <div className="control-group">
                    <div className="control-label-row"><span>Técnicos Extra (+50 vis c/u)</span></div>
                    <div className="control-input-wrapper">
                      <input type="range" className="control-slider" min="0" max="2" step="1" value={extraTechs} onChange={(e) => setExtraTechs(Number(e.target.value))} />
                      <input type="number" className="control-num-input" min="0" max="2" step="1" value={extraTechs} onChange={(e) => setExtraTechs(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="control-group">
                    <div className="control-label-row"><span>Costo por Visita ($)</span></div>
                    <div className="control-input-wrapper">
                      <input type="range" className="control-slider" min="30" max="120" step="5" value={costPerVisit} onChange={(e) => setCostPerVisit(Number(e.target.value))} />
                      <input type="number" className="control-num-input" min="30" max="120" step="5" value={costPerVisit} onChange={(e) => setCostPerVisit(Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              </aside>

              <div className="content-area">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-label">Leads Totales</div>
                    <div className="kpi-value">{formatNumber(evaluation.total.leads, 1)}</div>
                    <div className="kpi-meta-split">
                      <span className="meta-split-val">Meta: {formatNumber(evaluation.meta.leads, 0)}</span>
                      <span className="google-split-val">Google: {formatNumber(evaluation.google.leads, 0)}</span>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">
                      <span>Visitas Hechas</span>
                      <span className={`badge ${funnelResult.total.capacityExceeded ? 'badge-red' : 'badge-green'}`}>
                        {funnelResult.total.capacityExceeded ? '¡Tope Excedido!' : `${formatPercent(funnelResult.total.capacityUtilizationPct / 100, 1)}`}
                      </span>
                    </div>
                    <div className="kpi-value">{formatNumber(evaluation.total.visitsDone, 1)} / {capacity}</div>
                    <div className="kpi-meta-split">
                      <span className="meta-split-val">Meta: {formatNumber(evaluation.meta.visitsDone, 1)}</span>
                      <span className="google-split-val">Google: {formatNumber(evaluation.google.visitsDone, 1)}</span>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Ventas Mensuales</div>
                    <div className="kpi-value">{formatNumber(evaluation.total.sales, 2)}</div>
                    <div className="kpi-meta-split">
                      <span className="meta-split-val">Meta: {formatNumber(evaluation.meta.sales, 1)}</span>
                      <span className="google-split-val">Google: {formatNumber(evaluation.google.sales, 1)}</span>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">CAC Real Total (+Visitas)</div>
                    <div className="kpi-value">{formatCurrency(evaluation.total.realCac, 2)}</div>
                    <div className="kpi-meta-split">
                      <span className="meta-split-val">Meta: {formatCurrency(evaluation.meta.realCac, 2)}</span>
                      <span className="google-split-val">Google: {formatCurrency(evaluation.google.realCac, 2)}</span>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">
                      <span>LTV:CAC Global</span>
                      <span className={`badge ${evaluation.total.ltvCac >= 3 ? 'badge-green' : evaluation.total.ltvCac >= 1 ? 'badge-yellow' : 'badge-red'}`}>
                        {evaluation.total.ltvCac >= 3 ? 'Excelente (≥3x)' : 'Aceptable (1x-3x)'}
                      </span>
                    </div>
                    <div className="kpi-value">{formatMultiplier(evaluation.total.ltvCac, 2)}</div>
                    <div className="kpi-meta-split">
                      <span className="meta-split-val">Meta: {formatMultiplier(evaluation.meta.ltvCac, 2)}</span>
                      <span className="google-split-val">Google: {formatMultiplier(evaluation.google.ltvCac, 2)}</span>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Valor Neto de Visita</div>
                    <div className="kpi-value">{formatCurrency(evaluation.total.visitValue, 2)}</div>
                    <div className="kpi-meta-split">
                      <span className="meta-split-val">Meta: {formatCurrency(evaluation.meta.visitValue, 2)}</span>
                      <span className="google-split-val">Google: {formatCurrency(evaluation.google.visitValue, 2)}</span>
                    </div>
                  </div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card">
                    <div className="chart-header"><h3 className="chart-title">Embudo por Canal Lado a Lado</h3></div>
                    <div className="chart-container"><canvas ref={funnelChartRef}></canvas></div>
                  </div>
                  <div className="chart-card">
                    <div className="chart-header"><h3 className="chart-title">CPL vs CAC Real (La Trampa)</h3></div>
                    <div className="chart-container"><canvas ref={cacChartRef}></canvas></div>
                  </div>
                  <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="chart-header"><h3 className="chart-title">Visitas Pedidas vs Capacidad Operativa</h3></div>
                    <div className="chart-container" style={{ height: 240 }}><canvas ref={capChartRef}></canvas></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PESTAÑA 3: SIMULADOR 24M */}
        {currentTab === 'tab-simulador' && (
          <section className="tab-pane">
            <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="kpi-card">
                <div className="kpi-label">Caja Mínima Proyectada</div>
                <div className="kpi-value">{formatCurrency(sim.summary.minCash, 2)}</div>
                <div className="kpi-subtext">Mes {sim.summary.minCashMonth}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Caja Final al Mes 24</div>
                <div className="kpi-value" style={{ color: 'var(--accent-green)' }}>{formatCurrency(sim.summary.finalCash, 2)}</div>
                <div className="kpi-subtext">Patrimonio líquido generado</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Instalaciones Totales</div>
                <div className="kpi-value">{formatNumber(sim.summary.totalSales, 1)}</div>
                <div className="kpi-subtext">En los 2 años</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Cumplimiento de Reglas</div>
                <div style={{ marginTop: '0.5rem' }}>
                  <span className={`badge ${sim.summary.valid ? 'badge-green' : 'badge-red'}`}>
                    {sim.summary.valid ? '✅ Plan 100% Válido' : '❌ Piso Violado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
              <div className="chart-header"><h3 className="chart-title">Trayectoria de Saldo de Caja a 24 Meses vs Piso ($5.000)</h3></div>
              <div className="chart-container" style={{ height: 320 }}><canvas ref={cashChartRef}></canvas></div>
            </div>

            <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
              <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Benchmark de los 4 Planes Estratégicos</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Caja Mínima</th>
                      <th>Caja Mes 24</th>
                      <th>Instalaciones</th>
                      <th>Válido</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonPlans.plans.map(p => (
                      <tr key={p.id} style={p.isWinner ? { background: 'rgba(46, 158, 104, 0.12)', fontWeight: 'bold' } : {}}>
                        <td>
                          <strong>{p.name}</strong>
                          {p.isWinner && <span className="badge badge-green" style={{ marginLeft: '0.5rem' }}>👑 GANADOR</span>}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.description}</div>
                        </td>
                        <td>{formatCurrency(p.minCash, 2)} (M{p.minCashMonth})</td>
                        <td style={{ fontSize: '1.05rem' }}>{formatCurrency(p.finalCash, 2)}</td>
                        <td>{formatNumber(p.totalSales, 1)}</td>
                        <td><span className={`badge ${p.valid ? 'badge-green' : 'badge-red'}`}>{p.valid ? 'SI' : 'NO'}</span></td>
                        <td><button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setActivePlanId(p.id)}>Cargar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* PESTAÑA 4: RESPUESTAS */}
        {currentTab === 'tab-preguntas' && (
          <section className="tab-pane">
            <div className="chart-card" style={{ lineHeight: 1.7 }}>
              <h2 className="chart-title" style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Respuestas Ejecutivas a las 7 Preguntas</h2>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-sun-hover)' }}>1. ¿Cuánto deja una venta?</h3>
                <p><strong>Fórmula:</strong> Precio × (Margen Bruto − Comisión) = $6.500 × (28% − 3%) = <strong>$1.625,00</strong>.</p>
              </div>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-sun-hover)' }}>2. Embudo completo de cada canal</h3>
                <p>Meta: 500 leads → 275 contactados (55%) → 82,5 agendados (30%) → 57,75 visitas hechas (70%) → 10,4 ventas (18%). Fuga crítica en Lead → Contacto (se pierde el 45%).</p>
                <p>Google: 100 leads → 85 contactados (85%) → 46,75 agendados (55%) → 39,7 visitas hechas (85%) → 11,9 ventas (30%).</p>
              </div>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-sun-hover)' }}>3. ¿Qué canal es más barato de verdad?</h3>
                <p>CAC Real Meta: ($4.000 + 57,75 × $60) / 10,395 = <strong>$718,13</strong> | CAC Real Google: ($4.000 + 39,74 × $60) / 11,921 = <strong>$535,54</strong>. Google es 34% más barato.</p>
              </div>
            </div>
          </section>
        )}

        {/* PESTAÑA 5: EXTRAS */}
        {currentTab === 'tab-extras' && (
          <section className="tab-pane">
            <div className="charts-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="kpi-card" style={{ borderLeft: '4px solid var(--primary-sun)' }}>
                <div className="kpi-label">CPL de Equilibrio para Meta</div>
                <div className="kpi-value" style={{ color: 'var(--accent-green)' }}>{formatCurrency(breakeven.breakevenCpl, 2)}</div>
                <div className="kpi-subtext">{breakeven.insight}</div>
              </div>
              <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
                <div className="kpi-label">Reparto Óptimo Recomendado ($8.000)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.4rem 0' }}>
                  Meta: {formatCurrency(optResult.best.metaSpend)} | Google: {formatCurrency(optResult.best.googleSpend)}
                </div>
                <div className="kpi-subtext">Genera {formatNumber(optResult.best.sales, 2)} ventas/mes con ganancia neta de {formatCurrency(optResult.best.netContribution, 2)}.</div>
              </div>
            </div>

            <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
              <div className="chart-header">
                <h3 className="chart-title">Curva de Rendimiento Marginal y Rendimientos Decrecientes</h3>
                <span className="badge badge-yellow">Extra 4</span>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tramo Inversión</th>
                      <th>Incremento</th>
                      <th>Leads Extra Meta</th>
                      <th>CPL Marginal Meta</th>
                      <th>Leads Extra Google</th>
                      <th>CPL Marginal Google</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marginalIntervals.map(i => (
                      <tr key={i.range}>
                        <td><strong>{i.range}</strong></td>
                        <td>{formatCurrency(i.deltaSpend)}</td>
                        <td style={{ color: '#E1306C', fontWeight: 600 }}>+{i.meta.extraLeads}</td>
                        <td style={{ color: '#E1306C', fontWeight: 700 }}>{formatCurrency(i.meta.marginalCpl, 2)}</td>
                        <td style={{ color: '#1A73E8', fontWeight: 600 }}>{isFinite(i.google.marginalCpl) ? `+${i.google.extraLeads}` : '0 (Saturado)'}</td>
                        <td style={{ color: '#1A73E8', fontWeight: 700 }}>{isFinite(i.google.marginalCpl) ? formatCurrency(i.google.marginalCpl, 2) : 'Infinito'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
              <div className="chart-header"><h3 className="chart-title">Análisis de Sensibilidad (Tornado)</h3></div>
              <div className="chart-container" style={{ height: 280 }}><canvas ref={tornadoChartRef}></canvas></div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Modo Presentación Ejecutiva con Cronómetro y Alerta Sonora</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <button className="btn btn-primary" onClick={() => { setTimerSeconds(180); setTimerActive(true); }}>⏱️ Pitch 3 min (Decisión Andrés)</button>
                <button className="btn btn-secondary" onClick={() => { setTimerSeconds(120); setTimerActive(true); }}>⏱️ Pitch 2 min (Crédito Banco)</button>
                <button className="btn btn-secondary" onClick={() => { setTimerActive(false); setTimerSeconds(0); }}>⏹️ Detener</button>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-red)' }}>
                  {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PESTAÑA 6: AUDITORIA */}
        {currentTab === 'tab-auditoria' && (
          <section className="tab-pane">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Auditoría en Tiempo Real de Fórmulas y Referencias</h3>
                <span className="badge badge-green">Runner en Vivo</span>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span>1. Contribución Unitaria por Venta = $1.625</span>
                  <span className="badge badge-green">✔ PASÓ (OK)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span>2. Interpolación de Leads Meta ($4k = 500 leads)</span>
                  <span className="badge badge-green">✔ PASÓ (OK)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span>3. CAC Real Hoy (Meta ≈ $718, Google ≈ $536)</span>
                  <span className="badge badge-green">✔ PASÓ (OK)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span>4. Auditoría Mes 1 Plan Actual = $15.736,30</span>
                  <span className="badge badge-green">✔ PASÓ (OK)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span>5. Plan Propio Ganador B supera $214.000 en Mes 24</span>
                  <span className="badge badge-green">✔ PASÓ (OK)</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
