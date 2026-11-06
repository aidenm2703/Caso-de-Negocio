import { useState } from 'react';

export default function SolarPhoto({ src, alt, priority = false }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="sdc-photo-fallback" role="img" aria-label={alt}><svg viewBox="0 0 160 100" aria-hidden="true"><rect x="15" y="15" width="130" height="70" rx="4" fill="#163b49"/><path d="M47 15v70m33-70v70m33-70v70M15 38h130M15 61h130" stroke="#c9e3ec" strokeWidth="2"/></svg><span>Paneles solares para su hogar</span></div> : <img className="sdc-photo" src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" width="1600" height="1067" onError={() => setFailed(true)}/>;
}
