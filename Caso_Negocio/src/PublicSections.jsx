import { useEffect, useRef, useState } from 'react';
import SolarPhoto from './SolarPhoto.jsx';

function CountUp({ value, prefix = '', suffix = '' }) {
  const element = useRef(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    let frame;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = now => {
        const progress = Math.min((now - start) / 750, 1);
        setDisplay(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <strong ref={element} className="sdc-big" aria-label={`${prefix}${value}${suffix}`}><span aria-hidden="true">{prefix}{display.toLocaleString('es-CR')}{suffix}</span></strong>;
}

export default function PublicSections() {
  return <>
    <section id="servicios" className="sdc-section"><p className="sdc-eyebrow">DE SU TECHO A SU DÍA A DÍA</p><h2>Energía para vivir mejor.</h2><div className="sdc-grid">{[['☀', 'Paneles solares para casas', 'Instalación promedio de $6.500 según el caso. Una visita permite evaluar su techo antes de cotizar.'], ['↻', 'Cuidamos su inversión', 'Plan de mantenimiento de $12 al mes, con limpieza y revisión anual.'], ['⌂', 'Conozca su techo', 'Visita técnica gratuita para usted. El costo para Sol de Casa es de $60 por visita realizada.']].map(([icon, title, text]) => <article key={title} className="sdc-card"><span className="sdc-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="como-funciona" className="sdc-section sdc-tint"><p className="sdc-eyebrow">UN CAMINO CLARO</p><h2>Del primer cálculo a compartir su ahorro.</h2><div className="sdc-grid">{[['01', 'Visita y medición', 'Calcule el ahorro estimado y elija una visita para evaluar su techo.'], ['02', 'Instalación', 'Revise la cotización y las condiciones antes de decidir.'], ['03', 'Ahorro cada mes', 'Vea su ahorro mensual y cuánto lleva acumulado.'], ['04', 'Comparta y gane', 'Invite a sus vecinos con su enlace; una venta firmada activa su recompensa.']].map(([step, title, text]) => <article className="sdc-card" key={step}><strong className="sdc-step">{step}</strong><h3>{title}</h3><p>{text}</p></article>)}</div><a className="sdc-button" href="#calcular">Calcular mi ahorro</a></section>
    <section className="sdc-section"><p className="sdc-eyebrow">LOS NÚMEROS DEL CASO</p><h2>Un cambio que se puede medir.</h2><div className="sdc-grid">{[[110, '$', '', 'Recibo mensual promedio antes de instalar'], [70, '', ' %', 'Ahorro promedio sobre el recibo'], [420, '', '', 'Familias con paneles instalados'], [6500, '$', '', 'Costo promedio de instalación']].map(([number, prefix, suffix, label]) => <article key={number} className="sdc-card"><CountUp value={number} prefix={prefix} suffix={suffix}/><p>{label}</p></article>)}</div><p>Son datos del caso educativo ficticio Sol de Casa. El ahorro de una casa concreta necesita evaluación técnica.</p></section>
    <section id="galeria" className="sdc-section"><p className="sdc-eyebrow">ENERGÍA SOLAR, EN CASAS REALES</p><h2>Un techo. Muchas posibilidades.</h2><p>Fotografías reales de referencia. Muestran aplicaciones de energía solar; no son instalaciones ni clientes de Sol de Casa.</p><div className="sdc-photo-gallery">{[['solar-home.jpg', 'Una casa que aprovecha el sol', 'Casa con paneles solares en un techo de tejas y vegetación alrededor', 'Robert So', 'https://www.pexels.com/photo/a-house-with-solar-panel-on-the-roof-12243093/'], ['solar-roofs.jpg', 'El cambio empieza en el vecindario', 'Vista aérea de casas con paneles fotovoltaicos instalados en sus techos', '8 K', 'https://www.pexels.com/photo/solar-panels-on-tiled-roofs-of-a-house-8457868/'], ['solar-modern-home.jpg', 'Tecnología que se integra a su hogar', 'Detalle de paneles solares instalados en el techo de una vivienda', 'Stefan de Vries', 'https://www.pexels.com/photo/modern-home-with-rooftop-solar-panels-29206495/']].map(([file, title, alt, author, url]) => <figure key={file} className="sdc-photo-story"><SolarPhoto src={`./images/${file}`} alt={alt}/><figcaption><h3>{title}</h3><a href={url} target="_blank" rel="noreferrer">{author} / Pexels ↗</a></figcaption></figure>)}</div></section>
    <section id="testimonios" className="sdc-section sdc-tint"><p className="sdc-eyebrow">HISTORIAS DE DEMOSTRACIÓN</p><h2>El ahorro se cuenta entre vecinos.</h2><div className="sdc-grid"><blockquote className="sdc-card"><p>«Ahora puedo ver cuánto ahorré y compartirlo sin buscar recibos.»</p><cite>Familia Sol · testimonio simulado</cite></blockquote><blockquote className="sdc-card"><p>«Puse el monto de mi recibo y pude entender la estimación antes de agendar.»</p><cite>Familia Horizonte · testimonio simulado</cite></blockquote></div><p>El caso no tiene testimonios reales. Estas frases fueron creadas para demostrar la experiencia.</p></section>
    <section id="programa" className="sdc-section sdc-program"><p className="sdc-eyebrow">EL AHORRO QUE SE COMPARTE</p><h2>Su buena noticia puede ser el comienzo de otra.</h2><p>Vea su ahorro, comparta una tarjeta con su enlace personal y siga el avance de sus vecinos. Por cada venta referida firmada: una limpieza de $60 y $60 de descuento en mantenimiento, según la propuesta del prototipo.</p><div className="sdc-actions"><a className="sdc-button" href="#familia">Ver mi ahorro · demo</a><a className="sdc-button sdc-secondary" href="#calcular">Calcular mi ahorro</a><a className="sdc-link" href="#acceder">Acceder al portal financiero</a></div><p className="sdc-note">Programa y premios simulados; no constituyen una oferta comercial real.</p></section>
    <section id="preguntas" className="sdc-section"><p className="sdc-eyebrow">ANTES DE DAR EL PASO</p><h2>Sus preguntas tienen espacio aquí.</h2>{[
      ['¿Cuánto cuesta instalar paneles?', 'El caso establece una instalación promedio de $6.500. La cotización de una casa requiere evaluar el techo y el consumo; el prototipo no emite cotizaciones reales.'],
      ['¿Cuánto tarda en recuperarse la instalación?', 'Con un recibo de $110 y ahorro del 70 %, ahorra $77 al mes: recuperación simple aproximada de 7 años ($6.500 / $924 anuales). Supuesto: ahorro constante, sin financiamiento, mantenimiento ni cambios de tarifa.'],
      ['¿Qué pasa si llueve?', 'El caso no cuantifica producción por clima. La calculadora usa el 70 % de ahorro promedio del caso, sin prometer un rendimiento diario. En una visita real se deben validar las condiciones de su vivienda.'],
      ['¿Qué incluye el mantenimiento?', 'El plan cuesta $12 al mes e incluye limpieza y revisión anual, según los datos del caso.'],
      ['¿Cómo funciona El ahorro que se comparte?', 'La familia ve su ahorro y comparte un enlace. Su vecino calcula y agenda con ese referente registrado. En este prototipo, Andrés puede simular la visita y firma para mostrar la recompensa de $120 por venta referida.']
    ].map(([question, answer]) => <details className="sdc-faq" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
  </>;
}
