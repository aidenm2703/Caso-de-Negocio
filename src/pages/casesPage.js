function renderCasesPage() {
  const host = document.getElementById('case-analysis-workspace');
  if (!host) return;
  const reference = analyzeCase(createReferenceCase());
  const records = appContext.cases.map(renderSavedCaseCard).join('');
  host.innerHTML = `<section class="cases-page"><header class="cases-hero"><div><span class="eyebrow">PORTAFOLIO DE ANÁLISIS</span><h1>Compara decisiones con sus propios datos</h1><p>Agrega casos distintos, documenta su fuente y observa el efecto de cada supuesto en tiempo real.</p></div><div class="hero-mark" aria-hidden="true"><span>SC</span><i></i></div></header><div class="reference-case-strip"><div><span class="eyebrow">REFERENCIA ACTUAL</span><h2>Sol de Casa · Caso C</h2><p>Modelo conocido del caso cargado en el sistema.</p></div><div class="reference-highlights"><span>${formatNumber(reference.total.sales, 1)}<small>ventas / mes</small></span><span>${formatCurrency(reference.total.realCac, 0)}<small>CAC real</small></span><span>${formatCurrency(reference.total.operatingResult, 0)}<small>resultado operativo</small></span></div></div><div class="cases-layout"><section class="case-editor-panel"><div class="case-section-heading"><div><span class="eyebrow">NUEVO ANÁLISIS</span><h2>Describe el caso</h2></div><button type="button" id="load-reference-case" class="text-action">Cargar datos Sol de Casa</button></div><form id="case-analysis-form" novalidate><div class="case-meta-grid">${caseField('Nombre del negocio / caso', 'name', { required: false })}<label class="case-field"><span>Fuente o documento de origen</span><input name="source" type="text" placeholder="Ej. Caso.pdf, sección 3 o CRM de enero" maxlength="180"></label></div><div class="case-channel-grid"><fieldset class="case-channel-group meta-channel"><legend><span class="channel-dot"></span> Meta</legend>${caseField('Inversión mensual', 'meta.spend', { unit: 'USD', step: '100' })}${caseField('Leads proyectados', 'meta.leads', { unit: 'leads', step: '1' })}<div class="case-rates-grid">${caseField('Contacto', 'meta.contactRate', { unit: '%', max: '100', step: '0.1' })}${caseField('Agenda', 'meta.scheduleRate', { unit: '%', max: '100', step: '0.1' })}${caseField('Visita hecha', 'meta.visitRate', { unit: '%', max: '100', step: '0.1' })}${caseField('Cierre', 'meta.closeRate', { unit: '%', max: '100', step: '0.1' })}</div></fieldset><fieldset class="case-channel-group google-channel"><legend><span class="channel-dot"></span> Google</legend>${caseField('Inversión mensual', 'google.spend', { unit: 'USD', step: '100' })}${caseField('Leads proyectados', 'google.leads', { unit: 'leads', step: '1' })}<div class="case-rates-grid">${caseField('Contacto', 'google.contactRate', { unit: '%', max: '100', step: '0.1' })}${caseField('Agenda', 'google.scheduleRate', { unit: '%', max: '100', step: '0.1' })}${caseField('Visita hecha', 'google.visitRate', { unit: '%', max: '100', step: '0.1' })}${caseField('Cierre', 'google.closeRate', { unit: '%', max: '100', step: '0.1' })}</div></fieldset></div><div class="case-section-heading compact-heading"><div><span class="eyebrow">OPERACIÓN Y ECONOMÍA UNITARIA</span><h2>Completa los supuestos</h2></div></div><div class="case-economics-grid">${caseField('Capacidad mensual', 'capacity', { unit: 'visitas', step: '1' })}${caseField('Costo por visita', 'costPerVisit', { unit: 'USD', step: '1' })}${caseField('Precio promedio', 'price', { unit: 'USD', step: '1' })}${caseField('Margen bruto', 'grossMarginPct', { unit: '%', max: '100', step: '0.1' })}${caseField('Comisión', 'commissionPct', { unit: '%', max: '100', step: '0.1' })}${caseField('Costos fijos mensuales', 'monthlyFixedCosts', { unit: 'USD', step: '100' })}</div><label class="case-field priority-field"><span>Prioridad para asignar las visitas disponibles</span><select name="capacityPriority" required><option value="">Selecciona el canal prioritario</option><option value="google">Google primero</option><option value="meta">Meta primero</option></select><small>Para Sol de Casa, el caso indica prioridad Google. En otros casos, sigue el documento fuente.</small></label><div id="case-validation-errors" class="case-validation-errors" role="alert" hidden></div><div class="case-form-actions"><span>El cálculo se actualiza mientras editas.</span><button type="submit" class="btn btn-primary">Guardar caso y comparar</button></div></form></section><aside class="case-live-panel"><div class="live-panel-heading"><span class="live-indicator"></span><div><span class="eyebrow">MOTOR EN VIVO</span><h2>Vista previa</h2></div></div><div id="case-live-results">${renderCaseResult(null)}</div><p class="case-method-note">Modelo mensual simplificado. Las tasas, leads y fuentes son datos ingresados para cada caso; no se completan desde Sol de Casa.</p></aside></div><section class="saved-cases-section"><div class="case-section-heading"><div><span class="eyebrow">COMPARACIÓN</span><h2>Casos guardados <span class="case-count">${appContext.cases.length}</span></h2></div><span class="saved-case-caption">Cada caso conserva su propia fuente y supuestos.</span></div><div id="saved-cases-list" class="saved-cases-list">${records || '<div class="case-empty-list">Aún no guardas otros casos. Completa un caso arriba para iniciar tu portafolio.</div>'}</div></section></section>`;
  const caption = host.querySelector('.saved-case-caption');
  if (caption && appContext.persistenceWarning) caption.textContent = 'No se pudo guardar en este navegador; los casos quedarán disponibles solo en esta sesión.';
  bindCasePage();
}

function readCaseForm(form) {
  const formData = new FormData(form);
  const val = key => Number(formData.get(key));
  return {
    name: String(formData.get('name') || '').trim(),
    source: String(formData.get('source') || '').trim(),
    meta: { spend: val('meta.spend'), leads: val('meta.leads'), contactRate: val('meta.contactRate') / 100, scheduleRate: val('meta.scheduleRate') / 100, visitRate: val('meta.visitRate') / 100, closeRate: val('meta.closeRate') / 100 },
    google: { spend: val('google.spend'), leads: val('google.leads'), contactRate: val('google.contactRate') / 100, scheduleRate: val('google.scheduleRate') / 100, visitRate: val('google.visitRate') / 100, closeRate: val('google.closeRate') / 100 },
    capacity: val('capacity'), costPerVisit: val('costPerVisit'), price: val('price'), grossMarginPct: val('grossMarginPct') / 100, commissionPct: val('commissionPct') / 100, monthlyFixedCosts: val('monthlyFixedCosts'), capacityPriority: String(formData.get('capacityPriority') || ''),
  };
}

function fillCaseForm(form, data) {
  for (const [name, value] of Object.entries({
    name: data.name, source: data.source,
    'meta.spend': data.meta.spend, 'meta.leads': data.meta.leads, 'meta.contactRate': data.meta.contactRate * 100, 'meta.scheduleRate': data.meta.scheduleRate * 100, 'meta.visitRate': data.meta.visitRate * 100, 'meta.closeRate': data.meta.closeRate * 100,
    'google.spend': data.google.spend, 'google.leads': data.google.leads, 'google.contactRate': data.google.contactRate * 100, 'google.scheduleRate': data.google.scheduleRate * 100, 'google.visitRate': data.google.visitRate * 100, 'google.closeRate': data.google.closeRate * 100,
    capacity: data.capacity, costPerVisit: data.costPerVisit, price: data.price, grossMarginPct: data.grossMarginPct * 100, commissionPct: data.commissionPct * 100, monthlyFixedCosts: data.monthlyFixedCosts, capacityPriority: data.capacityPriority,
  })) {
    const field = form.elements.namedItem(name);
    if (field) field.value = value;
  }
}

function bindCasePage() {
  const form = document.getElementById('case-analysis-form');
  const preview = document.getElementById('case-live-results');
  const errorsEl = document.getElementById('case-validation-errors');
  if (!form || !preview) return;
  const updatePreview = () => {
    const raw = readCaseForm(form);
    const hasEmptyInput = [...form.querySelectorAll('input[required]')].some(field => field.value.trim() === '') || !form.elements.namedItem('capacityPriority')?.value;
    const result = hasEmptyInput ? { valid: false } : analyzeCase(raw);
    preview.innerHTML = renderCaseResult(result.valid ? result : null);
    errorsEl.hidden = true;
  };
  form.addEventListener('input', updatePreview);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const raw = readCaseForm(form);
    const emptyFields = [...form.querySelectorAll('input[required]')].filter(field => field.value.trim() === '');
    if (!form.elements.namedItem('capacityPriority')?.value) emptyFields.push(form.elements.namedItem('capacityPriority'));
    const result = emptyFields.length ? { valid: false, errors: ['Completa todos los datos obligatorios.'] } : saveCase(raw, appContext);
    if (!result.valid) {
      errorsEl.innerHTML = result.errors.map(error => `<span>${escapeHtml(error)}</span>`).join('');
      errorsEl.hidden = false;
      return;
    }
    renderCasesPage();
  });
  document.getElementById('load-reference-case')?.addEventListener('click', () => {
    fillCaseForm(form, createReferenceCase());
    updatePreview();
  });
  document.getElementById('saved-cases-list')?.addEventListener('click', event => {
    const button = event.target.closest('[data-delete-case]');
    if (!button) return;
    deleteCase(button.dataset.deleteCase, appContext);
    renderCasesPage();
  });
}
