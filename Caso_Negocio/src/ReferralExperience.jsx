import { useEffect, useState } from 'react';
import { estimateSavings, readDemo, referralEconomics, buildShareUrl, transitionLead } from './model/referrals.js';

const FAMILY = 'familia-sol-001';
const money = value => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD' }).format(value);
const numbers = referralEconomics();
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];

export default function ReferralExperience({ page, referrer }) {
  const [demo, setDemo] = useState(readDemo);
  const [bill, setBill] = useState('110');
  const [message, setMessage] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [consent, setConsent] = useState(false);
  const [month, setMonth] = useState(5);
  const [trackedBill, setTrackedBill] = useState('');
  useEffect(() => {
    try { localStorage.setItem('sdc_referrals_v1', JSON.stringify(demo)); }
    catch { /* The visible warning also explains that this is a local demo. */ }
  }, [demo]);
  const log = (type, extra = {}) => setDemo(previous => ({ ...previous, events: [...previous.events, { type, at: new Date().toISOString(), ...extra }] }));
  const savings = estimateSavings(Number(bill));
  const familyLeads = demo.leads.filter(lead => lead.referrer === FAMILY);
  const signed = familyLeads.filter(lead => lead.status === 'firmado').length;
  const shareUrl = buildShareUrl(window.location.origin, window.location.pathname, FAMILY);
  const shareText = `Mi casa ahorra $77 al mes con paneles solares (ejemplo simulado). Vea cuánto podría ahorrar la suya: ${shareUrl}`;
  async function share(method) {
    try {
      if (method === 'copy') {
        await navigator.clipboard.writeText(shareText);
        log('copiado', { referrer: FAMILY });
        setMessage('Mensaje y enlace copiados. Esto registra una copia, no un envío confirmado.');
      } else if (method === 'native' && navigator.share) {
        await navigator.share({ title: 'El ahorro que se comparte · simulado', text: shareText, url: shareUrl });
        log('compartido', { referrer: FAMILY });
        setMessage('Acción de compartir completada por el dispositivo.');
      } else {
        log('whatsapp', { referrer: FAMILY });
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        setMessage('Se abrió WhatsApp. El prototipo registra la intención, no confirma el envío.');
      }
    } catch (error) { setMessage(error.name === 'AbortError' ? 'Puede compartir cuando usted quiera.' : 'No se pudo compartir automáticamente. Copie el mensaje del cuadro de abajo.'); }
  }
  function downloadCard() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="1080" height="1080" rx="45" fill="#F4F2EE"/><circle cx="900" cy="180" r="270" fill="#FFC32E"/><g font-family="Georgia" fill="#161616"><text x="80" y="150" font-size="48">Sol de Casa</text><text x="80" y="380" font-size="65">Un ahorro para compartir.</text><text x="80" y="550" font-size="110">$77 al mes</text><text x="80" y="650" font-size="40">70 % de un recibo de $110</text><text x="80" y="780" font-size="30">Familia Sol · ejemplo simulado</text><text x="80" y="870" font-size="28">Calcule su ahorro con el enlace del mensaje.</text></g></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'ahorro-sol-de-casa-simulado.svg'; anchor.click(); URL.revokeObjectURL(url);
    log('descargado', { referrer: FAMILY }); setMessage('Tarjeta descargada. Acompáñela con su enlace personal al publicarla.');
  }
  function schedule(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!savings || !consent) return;
    const lead = { id: crypto.randomUUID(), name: form.get('name').trim(), phone: form.get('phone').trim(), slot: form.get('slot'), bill: Number(bill), referrer: referrer || null, status: 'agendado', createdAt: new Date().toISOString() };
    if (!lead.name || !lead.phone) return;
    setDemo(previous => ({ ...previous, leads: [...previous.leads, lead], events: [...previous.events, { type: 'agendado', referrer: lead.referrer, at: lead.createdAt }] }));
    setConfirmation(lead);
  }
  function updateLead(id, status) {
    setDemo(previous => ({ ...previous, leads: previous.leads.map(lead => lead.id === id ? transitionLead(lead, status) : lead) }));
  }
  const counts = Object.fromEntries(['copiado', 'whatsapp', 'compartido', 'calculado', 'descargado'].map(type => [type, demo.events.filter(event => event.type === type).length]));
  const visited = demo.leads.filter(lead => lead.visitCompleted || ['visitado', 'firmado'].includes(lead.status)).length;
  const sales = demo.leads.filter(lead => lead.status === 'firmado').length;
  const referredSales = demo.leads.filter(lead => lead.referrer && lead.status === 'firmado').length;
  const referredVisits = demo.leads.filter(lead => lead.referrer && (lead.visitCompleted || ['visitado', 'firmado'].includes(lead.status))).length;
  const observedCac = referredSales ? (referredVisits * 60 + referredSales * 120) / referredSales : null;
  return <section className="sdc-workspace">
    <p className="sdc-eyebrow">EL AHORRO QUE SE COMPARTE</p>
    <nav className="sdc-subnav" aria-label="Experiencia de demostración"><a href="#familia" aria-current={page === 'familia' ? 'page' : undefined}>Mi ahorro</a><a href="#calcular" aria-current={page === 'calcular' ? 'page' : undefined}>Soy vecino</a><a href="#panel" aria-current={page === 'panel' ? 'page' : undefined}>Panel de Andrés</a><a href="#growth" aria-current={page === 'growth' ? 'page' : undefined}>Ficha de growth</a></nav>
    <p className="sdc-demo">Prototipo simulado, sin autenticación ni servicios reales. Los datos se guardan solo en este navegador si permite almacenamiento. Use nombres y teléfonos ficticios; no se envían mensajes ni se reserva una visita real. Los enlaces compartidos conservan el referente; los registros de otros dispositivos no se sincronizan.</p>
    {page === 'familia' && <>
      <h1>Su ahorro tiene buenas noticias.</h1><p>Familia Sol · simulado. Su recibo de referencia: $110 al mes. Datos mensuales simulados al 70 %.</p>
      <label htmlFor="sdc-month">Mes del ejemplo simulado (2026)</label><select id="sdc-month" value={month} onChange={event => setMonth(Number(event.target.value))}>{monthNames.map((name, i) => <option key={name} value={i}>{name}</option>)}</select>
      <div className="sdc-grid"><article className="sdc-card"><p>Ahorro en {monthNames[month]} · simulado</p><strong className="sdc-big">$77</strong><p>Su recibo estimado con paneles: $33.</p></article><article className="sdc-card"><p>Desde la instalación · simulado</p><strong className="sdc-big">{money(77 * (month + 1))}</strong><p>Instalación de ejemplo: enero de 2026. {month + 1} meses de ahorro constante.</p></article></div>
      <article className="sdc-card sdc-share-card"><p className="sdc-eyebrow">SU TARJETA PARA COMPARTIR · SIMULADO</p><h2>Mi casa ahorra $77 al mes.</h2><p>¿Y la suya? Calcule su ahorro con Sol de Casa.</p><p>Familia Sol · simulado</p><a className="sdc-link sdc-break" href={shareUrl}>{shareUrl}</a></article>
      <div className="sdc-actions"><button className="sdc-button" onClick={() => share('whatsapp')}>Compartir por WhatsApp</button><button className="sdc-button sdc-secondary" onClick={() => share('copy')}>Copiar mensaje y enlace</button>{typeof navigator.share === 'function' && <button className="sdc-button sdc-secondary" onClick={() => share('native')}>Compartir en mi dispositivo</button>}<button className="sdc-button sdc-secondary" onClick={downloadCard}>Descargar tarjeta</button></div>
      <label htmlFor="sdc-share-text">Mensaje listo para copiar o publicar con su tarjeta</label><textarea id="sdc-share-text" readOnly value={shareText} rows={4}/><p role="status">{message}</p>
      <article className="sdc-card"><h2>Su próximo logro</h2><p>Cuando su vecino agenda, usted recibe un reconocimiento sin costo. Cuando firma, gana una limpieza de $60 y un descuento de $60 en mantenimiento: $120 de recompensa por venta.</p><label htmlFor="sdc-progress">{signed > 0 ? `${signed} venta(s) referida(s) · recompensa acumulada: ${money(signed * 120)}` : 'Comparta → su vecino agenda → recibe la visita → firma → usted gana'}</label><progress id="sdc-progress" max="3" value={signed ? 3 : familyLeads.some(lead => lead.status === 'visitado') ? 2 : familyLeads.length ? 1 : 0}/><p>Costo promedio con visitas: {money(numbers.total)} por venta, debajo del máximo de $300. No hay pagos por agendar ni por compartir.</p></article>
      <h2>Sus vecinos · simulado</h2>{familyLeads.length ? familyLeads.map(lead => <p key={lead.id}>{lead.name} · simulado · {lead.status} · {lead.slot}</p>) : <p>Todavía no hay vecinos registrados. <a className="sdc-link" href={shareUrl}>Pruebe el recorrido como vecino</a>.</p>}
    </>}
    {page === 'calcular' && <>
      <h1>Vea cuánto podría ahorrar.</h1><p>{referrer === FAMILY ? 'La Familia Sol (simulado) le compartió su ahorro de $77 al mes. Calcule ahora el suyo.' : referrer ? 'Llegó con un enlace de referido. Su código se conservará al agendar.' : 'Paneles solares para su casa. Empiece con el monto mensual de su recibo.'}</p>
      {referrer && <p className="sdc-demo">Referente registrado: <strong>{referrer}</strong> · simulado.</p>}
      <form onSubmit={event => { event.preventDefault(); if (savings && trackedBill !== bill) { log('calculado', { referrer: referrer || null }); setTrackedBill(bill); } }}><label htmlFor="sdc-bill">¿Cuánto paga de luz al mes, en dólares?</label><input id="sdc-bill" type="number" min="0.01" step="0.01" required value={bill} onChange={event => setBill(event.target.value)} aria-describedby="sdc-estimate"/><button className="sdc-button" type="submit">Ver mi ahorro</button></form>
      <div id="sdc-estimate" className="sdc-card sdc-result" aria-live="polite">{savings ? <><p>Ahorro mensual estimado</p><strong className="sdc-big">{money(savings.monthly)}</strong><p>{money(savings.annual)} al año · recuperación simple en {savings.years.toLocaleString('es-CR', { maximumFractionDigits: 1 })} años.</p></> : <p>Ingrese un monto mayor que cero para ver su estimación.</p>}</div>
      <p className="sdc-note">Estimación simulada. Datos del caso: 70 % de ahorro e instalación promedio de $6.500. Supuesto del prototipo: ahorro constante; recuperación simple sin financiamiento, mantenimiento ni cambios de tarifa. No es una cotización.</p>
      {confirmation ? <article className="sdc-card" role="status"><h2>Su visita de prueba quedó registrada.</h2><p>{confirmation.name} · simulado · {confirmation.slot} · referencia: {confirmation.referrer || 'sin referido'}.</p><p>Este es un horario simulado; no recibirá llamadas ni visitas reales. El siguiente paso del servicio sería medir su techo y confirmar una cotización.</p><a className="sdc-button" href="#panel">Ver el registro en el panel</a></article> : <form className="sdc-card sdc-form" onSubmit={schedule}><h2>Agende una visita técnica gratuita.</h2><p>Elija un horario de demostración ahora, sin esperar una llamada. Para usted no tiene costo; a la empresa le cuesta $60 por visita realizada.</p><label htmlFor="sdc-name">Nombre ficticio (simulado)</label><input id="sdc-name" name="name" required maxLength={60} autoComplete="off"/><label htmlFor="sdc-phone">Teléfono ficticio (simulado)</label><input id="sdc-phone" name="phone" type="tel" pattern="[0-9+ ()-]{8,20}" required maxLength={20} autoComplete="off"/><label htmlFor="sdc-slot">Horario de prueba (simulado)</label><select id="sdc-slot" name="slot" required><option value="">Seleccione un horario</option><option>Próximo lunes · 9:00 a. m. (simulado)</option><option>Próximo martes · 2:00 p. m. (simulado)</option><option>Próximo jueves · 10:00 a. m. (simulado)</option></select><label className="sdc-check"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required/>Entiendo que es una demostración y usaré datos ficticios.</label><button className="sdc-button" disabled={!savings || !consent}>Confirmar visita simulada</button></form>}
    </>}
    {page === 'panel' && <>
      <h1>El ahorro que trae vecinos.</h1><p>Panel de Andrés · simulado. Actividad de este navegador, desde que empezó la demostración.</p>
      <div className="sdc-grid">{[['Copias de tarjeta y enlace', counts.copiado], ['Aperturas de WhatsApp', counts.whatsapp], ['Compartidos nativos completados', counts.compartido], ['Tarjetas descargadas', counts.descargado], ['Cálculos confirmados (no usuarios únicos)', counts.calculado], ['Visitas agendadas', demo.leads.length], ['Visitas realizadas', visited], ['Firmas', sales]].map(([label, value]) => <article className="sdc-card" key={label}><p>{label} · simulado</p><strong className="sdc-big">{value}</strong></article>)}</div>
      <p>Copiar o abrir WhatsApp no prueba un envío. Un nuevo cálculo con un monto distinto cuenta otra acción. Estas métricas son eventos, no conversiones de personas únicas.</p>
      <article className="sdc-card"><h2>Ejemplo de embudo completo · simulado</h2><p>25 familias invitadas → 10 comparten → 8 vecinos calculan → 5 agendan → 4 reciben visita → 2 firman.</p><p>Supuesto ilustrativo del equipo para explicar el panel; no son resultados del piloto ni se suman a la actividad anterior.</p></article>
      <h2>Familias, referidos y recompensas · simulado</h2><p>Familia Sol · {familyLeads.length} agendas · {signed} firmas · {money(signed * 120)} en recompensas.</p>
      {demo.leads.length ? <div className="sdc-table-wrap"><table><caption>Registros locales de demostración</caption><thead><tr><th>Vecino (simulado)</th><th>Referente</th><th>Horario</th><th>Estado simulado</th><th>Recompensa</th></tr></thead><tbody>{demo.leads.map(lead => <tr key={lead.id}><td>{lead.name}</td><td>{lead.referrer || 'Sin referido'}</td><td>{lead.slot}</td><td><select aria-label={`Estado de ${lead.name}`} value={lead.status} disabled={lead.status === "firmado"} onChange={event => updateLead(lead.id, event.target.value)}><option value="agendado">Agendado</option><option value="visitado">Visita realizada</option><option value="firmado">Firmado (incluye visita)</option><option value="cancelado">Cancelado</option></select></td><td>{lead.referrer && lead.status === 'firmado' ? '$120 · simulado' : '$0'}</td></tr>)}</tbody></table></div> : <p>No hay agendas todavía. <a className="sdc-link" href={`#calcular?ref=${FAMILY}`}>Registre su primer vecino de prueba</a>.</p>}
      <article className="sdc-card"><h2>Plata y capacidad</h2><p>Visitas registradas × $60: {money(visited * 60)}. Recompensas referidas por firmas: {money(demo.leads.filter(lead => lead.referrer && lead.status === 'firmado').length * 120)}.</p><p>Modelo esperado por venta referida: $133,33 en visitas + $120 en recompensas = $253,33. El costo observado del piloto puede superar el modelo si cae el cierre; no escalar si excede $300.</p><p>Capacidad del caso: 100 visitas/mes, casi llena por anuncios. Un técnico adicional añade 50; la tabla demo no reserva capacidad real.</p></article>
      <article className="sdc-card"><h2>CAC referido observado · simulado</h2><p>{observedCac === null ? 'Pendiente de una firma; acumule los costos ya incurridos antes de evaluar.' : money(observedCac)}</p>{observedCac > 300 && <p role="alert">Límite de $300 excedido: detener expansión y revisar premios y conversión.</p>}</article>
      <a className="sdc-button" href="#growth">Revisar experimento y ficha</a>
    </>}
    {page === 'growth' && <GrowthSheet/>}
  </section>;
}

function GrowthSheet() {
  return <article className="sdc-growth"><div className="sdc-actions"><h1>Ficha de growth</h1><a className="sdc-button" href="./ficha-growth.html" target="_blank" rel="noreferrer">Ficha resumida · una página</a><button className="sdc-button sdc-secondary" onClick={() => window.print()}>Imprimir detalle</button></div><p>Sol de Casa · Parte 2 · propuesta del equipo. Todas las metas son supuestos de diseño, no resultados observados.</p>
    <h2>El ciclo y la fuga que atacamos</h2><p className="sdc-cycle">Familia instalada → ve su ahorro → comparte su tarjeta → vecino calcula → agenda → recibe visita → firma → nueva familia instalada → vuelve a compartir.</p><p>Web actual: 100 visitas → 14 abren formulario → 6 dejan datos. Fuga mayor: 86 % antes del formulario; después se pierde 8/14 = 57,14 %. El nuevo recorrido muestra ahorro de inmediato con un campo y ofrece horario sin esperar las 31 horas de una llamada.</p>
    <h2>Retener es activar a quien ya tiene paneles</h2><p>Métrica semanal: porcentaje de familias elegibles que ven su ahorro y completan una acción de compartir esa semana. Contar personas únicas con consentimiento en el piloto real. Hoy no se mide; instrumentar una semana de base, sin inventar un 0 %. Medir además conocimiento del ahorro: 25 % → 60 % en encuesta a 30 días (meta supuesta).</p>
    <h2>Economía y recompensas</h2><table><thead><tr><th>Hito</th><th>Costo por evento</th><th>Regla</th></tr></thead><tbody><tr><td>Compartir / agendar</td><td>$0</td><td>Reconocimiento digital sin premio monetario</td></tr><tr><td>Venta referida firmada</td><td>$60 limpieza + $60 descuento</td><td>$120 total, una vez por venta validada</td></tr></tbody></table><p>Visitas por venta = 1/0,45 = 2,2222. Costo actual referido = $60/0,45 = $133,33 (solo visitas, sin recompensas ni otros costos no dados). Presupuesto máximo de premios = $166,67. Propuesta: $133,33 + $120 = $253,33 ≤ $300; holgura $46,67. No duplicar el descuento con otros incentivos. Política propuesta: una limpieza por firma y crédito de $60 de mantenimiento; se contabiliza todo el valor aunque no se use.</p><p>Parte 1, sin mejoras: CAC real Meta ≈ $718,13; Google ≈ $535,54. Modelo referido propuesto: $253,33 (no incluye costos de plataforma o personal que el caso no cuantifica). Contribución de venta antes de adquisición $1.625 → después de este CAC $1.371,67. Cierre mínimo para sostener $120 de premios: $60/($300−$120) = 33,33 %.</p>
    <h2>Capacidad: 50 visitas adicionales por mes</h2><p>Leads requeridos = 50/(0,95×0,85×0,90) = 68,80 → 69. Rendimiento supuesto igual al letrero: 6/(20×2) = 0,15 leads/familia/mes. Familias = 68,80/0,15 = 458,66 → 459 (460 si primero se redondean los leads a 69). Supera las 420 familias: no prometer llenar al técnico con ese rendimiento. Las 420 producirían 45,79 visitas; 50 participantes producirían 5,45. Son proyecciones, no metas de ventas garantizadas.</p>
    <h2>Matriz de canales a 90 días</h2><table><thead><tr><th>Canal</th><th>Cuadrante: costo marginal / confianza</th><th>Plan</th></tr></thead><tbody><tr><td>Referidos digitales</td><td>Bajo / alta (hipótesis)</td><td>Días 1–30 piloto; 31–60 ajustar; 61–90 ampliar solo si CAC y capacidad cumplen</td></tr><tr><td>Anuncios</td><td>Alto / por construir (hipótesis)</td><td>Conservar presupuesto actual; medir ventas incrementales; no aumentar demanda sin capacidad</td></tr><tr><td>Letreros</td><td>Bajo / alta local (hipótesis)</td><td>Complementar en las 20 casas, atribuir con enlace; costo no informado</td></tr><tr><td>Contenido público</td><td>Bajo por visita / por construir (hipótesis)</td><td>Explicar ahorro y condiciones; costo de producción no informado</td></tr></tbody></table><p>Ejes y ubicación cualitativa propuestos por el equipo; no se dispone del costo de todos los canales.</p>
    <h2>Experimento de 50 clientes · 30 días</h2><p>Asignar al azar 25 tratamiento y 25 control, equilibrando antigüedad y ahorro. Control: atención actual. Tratamiento: ahorro visible, tarjeta, agenda y recompensas. Si hacemos este cambio, el conocimiento de ahorro pasa del 25 % histórico al 60 % en tratamiento (meta), sin caída frente al control. Para activación semanal medir base la primera semana y buscar +20 puntos porcentuales frente al control (meta supuesta). Referidos anuales del 8 % no equivalen a un 8 % mensual.</p><p>Resultado secundario: leads referidos y visitas por familia asignada, deduplicados. Contramétricas: CAC referido total ≤ $300, visitas dentro de capacidad disponible, cierre ≥33,33 %, ninguna queja de mensajes sin consentimiento. Las 25 familias tratadas solo producirían 2,73 visitas/mes al rendimiento del letrero: muestra exploratoria, insuficiente para demostrar un efecto sobre ventas con certeza. Extender seguimiento para firmas y costos antes de escalar.</p><p>Si falla: entrevistar a quienes no comparten o abandonan; ajustar mensaje y agenda, detener nuevos premios si el CAC excede el límite, mantener los ya comprometidos, y repetir el piloto sin aumentar anuncios.</p>
    <h2>Las cuatro preguntas, desde ambos lados</h2><table><thead><tr><th>Pregunta</th><th>Familia</th><th>Vecino</th></tr></thead><tbody><tr><td>¿Es para mí?</td><td>Hogar ya instalado y ahorro propio</td><td>Recibo de luz y casa</td></tr><tr><td>¿Hace lo que quiero?</td><td>Mes y acumulado en dólares</td><td>Ahorro y recuperación inmediatos</td></tr><tr><td>¿Me importa ahora?</td><td>Ahorro del mes listo para compartir</td><td>Puede elegir horario ahora</td></tr><tr><td>¿Sé cómo lograrlo?</td><td>Compartir, enlace y progreso</td><td>Un monto, contacto mínimo, confirmación</td></tr></tbody></table>
    <h2>En qué se equivocó o nos confundió la IA</h2><p>El primer prototipo público incluía una calculadora pero no agenda ni referente: parecía cubrir la Parte 2 sin completar el ciclo. Se corrigió conectando el enlace personal, el registro de visita y la firma simulada en el panel. También se evita contar abrir WhatsApp como envío confirmado. Error aritmético a evitar: olvidar que los 6 leads de 20 letreros corresponden a dos meses duplica artificialmente el rendimiento mensual.</p>
    <h2>Demostración de 3 minutos y pendientes reales</h2><p>0:00–0:30: mostrar fuga y ahorro. 0:30–1:15: familia comparte y vecino calcula. 1:15–2:00: vecino agenda y Andrés simula visita/firma. 2:00–3:00: recompensa, CAC, experimento y qué hacer si falla. Pendientes fuera del prototipo: integración del inversor, autenticación, almacenamiento compartido, consentimiento de contacto real, agenda con capacidad y verificación de firmas. La revisión por otro equipo y la lectura/diseño sin IA requieren evidencia humana; no se declaran realizados.</p>
  </article>;
}
