import { useEffect, useState } from 'react';
import App from './App.jsx';
import ReferralExperience from './ReferralExperience.jsx';
import PublicSections from './PublicSections.jsx';
import SolarPhoto from './SolarPhoto.jsx';
import './publicSite.css';

export default function PublicSite() {
  const [route, setRoute] = useState(() => window.location.hash);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const navigate = () => {
      setRoute(window.location.hash); setMenuOpen(false);
      requestAnimationFrame(() => {
        const target = document.getElementById(window.location.hash.slice(1));
        if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);
      });
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  if (route === '#acceder') return <App />;
  const [page, query = ''] = route.slice(1).split('?');
  const referrer = new URLSearchParams(query).get('ref')?.slice(0, 100) || null;
  const experience = ['familia', 'calcular', 'panel', 'growth'].includes(page);
  return <div className="sdc-site">
    <a className="sdc-skip" href="#sdc-content" onClick={event => { event.preventDefault(); document.getElementById('sdc-content')?.focus(); }}>Saltar al contenido</a>
    <header className="sdc-header">
      <a href="#inicio" className="sdc-brand" aria-label="Sol de Casa, inicio"><svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true"><circle cx="20" cy="20" r="9" fill="currentColor"/><path d="M20 1v6m0 26v6M1 20h6m26 0h6M6 6l5 5m18 18 5 5M6 34l5-5m18-18 5-5" stroke="currentColor" strokeWidth="3"/></svg><span>Sol de Casa</span></a>
      <button className="sdc-menu" aria-label="Abrir menú" aria-expanded={menuOpen} aria-controls="sdc-nav" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <nav id="sdc-nav" className={`sdc-nav ${menuOpen ? 'sdc-nav-open' : ''}`} aria-label="Navegación principal"><a href="#servicios">Servicios</a><a href="#programa">Programa</a><a href="#familia">Mi ahorro</a><a href="#calcular">Calcular mi ahorro</a><a className="sdc-button" href="#acceder">Acceder <span aria-hidden="true">↗</span></a></nav>
    </header>
    <main id="sdc-content" tabIndex={-1}>
      {experience ? <ReferralExperience key={page + (referrer || "")} page={page} referrer={referrer}/> : <section className="sdc-hero">
        <div className="sdc-copy"><p className="sdc-eyebrow"><span /> ENERGÍA SOLAR PARA SU HOGAR</p><h1>Su casa ya ahorra.<br/><em>Compártalo</em> con sus vecinos.</h1><p className="sdc-intro">Instalamos paneles solares para casas. Descubra el ahorro que puede generar su techo y comparta una buena noticia con quienes tiene cerca.</p><div className="sdc-actions"><a className="sdc-button" href="#calcular">Calcular mi ahorro <span aria-hidden="true">↗</span></a><a className="sdc-button sdc-secondary" href="#acceder">Acceder</a></div><p className="sdc-note">¿Ya tiene paneles? Vea su ahorro y compártalo desde la experiencia de familias. «Acceder» abre el portal financiero actual.</p><a className="sdc-link" href="#familia">Ver mi ahorro y mis recompensas · demo →</a><div className="sdc-facts"><div><strong>420</strong><span>familias con paneles</span></div><div><strong>70 %</strong><span>ahorro promedio del caso</span></div></div></div>
        <div className="sdc-visual"><figure className="sdc-hero-photo"><SolarPhoto src="./images/solar-home.jpg" alt="Fotografía de una casa con paneles solares sobre un techo de tejas, rodeada de árboles" priority/><figcaption>Fotografía de referencia · Robert So / Pexels. No es un proyecto de Sol de Casa.</figcaption></figure><div className="sdc-photo-label">ENERGÍA QUE NACE EN SU TECHO</div><div className="sdc-savings"><span>Un ahorro que se siente</span><strong>$77 / mes</strong><small>Ejemplo simulado: 70 % de un recibo de $110.</small></div></div>
      </section>}
      {!experience && <PublicSections/>}
    </main>
    <footer className="sdc-footer"><div><a className="sdc-brand" href="#inicio">☀ Sol de Casa</a><p>Energía para su hogar. Ahorro para compartir.</p><p>Contacto simulado: contacto@soldecasa.example · +506 0000-0000.</p><p>Instagram: @soldecasa_demo · simulado. Facebook: Sol de Casa Demo · simulado. Perfiles de demostración, sin cuentas reales vinculadas.</p></div><nav aria-label="Enlaces del pie"><a href="#acceder">Acceder</a><a href="#familia">Familias · demo</a><a href="#panel">Panel de Andrés · demo</a><a href="#growth">Ficha de growth</a></nav><p>Caso ficticio educativo. No representa una empresa ni ofertas comerciales reales.</p></footer>
  </div>;
}
