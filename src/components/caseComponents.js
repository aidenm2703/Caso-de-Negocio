function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function caseField(label, name, { value = '', min = '0', max, step = 'any', unit = '', required = true, type = 'number' } = {}) {
  const inputType = name === 'name' ? 'text' : type;
  return `<label class="case-field"><span>${label}${unit ? ` <small>${unit}</small>` : ''}</span><input name="${name}" type="${inputType}" value="${value}" ${inputType === 'number' ? `min="${min}" ${max ? `max="${max}"` : ''} step="${step}" inputmode="decimal"` : ''} ${required ? 'required' : ''}></label>`;
}

function caseMetric(label, value, footnote = '') {
  return `<article class="case-metric"><span>${label}</span><strong>${value}</strong>${footnote ? `<small>${footnote}</small>` : ''}</article>`;
}

function renderCaseResult(result) {
  if (!result?.valid) return '<div class="case-empty-state"><strong>Completa los campos para ver el análisis.</strong><span>Los resultados se actualizan al escribir y usan exclusivamente los datos ingresados.</span></div>';
  const t = result.total;
  const channelCard = (key, name) => {
    const item = result.channel[key];
    return `<article class="case-channel-result ${key}"><header><span>${name}</span><b>${formatNumber(item.sales, 2)} ventas</b></header><p>${formatNumber(item.leads, 0)} leads · ${formatNumber(item.visitsDone, 1)} visitas · ${formatCurrency(item.spend, 0)} inversión</p><small>CAC real ${item.sales > 0 ? formatCurrency(item.realCac, 2) : 'sin ventas calculables'}</small></article>`;
  };
  return `<div class="case-metrics-grid">${caseMetric('Ventas proyectadas / mes', formatNumber(t.sales, 2), `${formatNumber(t.visitsDone, 1)} visitas usadas de ${formatNumber(result.input.capacity, 0)}`)}${caseMetric('CAC real combinado', t.sales > 0 ? formatCurrency(t.realCac, 2) : 'Sin ventas', 'Inversión + costo de visitas / ventas')}${caseMetric('LTV:CAC estimado', t.sales > 0 ? formatMultiplier(t.ltvCac, 2) : 'No calculable', 'Contribución unitaria / CAC real')}${caseMetric('Resultado operativo / mes', formatCurrency(t.operatingResult, 2), 'Después de marketing, visitas y costos fijos')}</div><div class="case-channel-results">${channelCard('meta', 'Meta')}${channelCard('google', 'Google')}</div><div class="case-analysis-note">${t.visitsRequested > result.input.capacity ? `La demanda supera la capacidad en ${formatNumber(t.visitsRequested - result.input.capacity, 1)} visitas. La prioridad seleccionada es ${result.input.capacityPriority}.` : `La capacidad cubre la demanda proyectada (${formatPercent(t.capacityUtilization, 1)} utilizada).`}<br>Contribución por venta: ${formatCurrency(result.unitContribution, 2)}.</div>`;
}

function renderSavedCaseCard(record, index) {
  const result = analyzeCase(record);
  if (!result.valid) return '';
  return `<article class="case-saved-card"><div class="case-card-top"><div><span class="case-index">CASO ${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(record.name)}</h3><p>${escapeHtml(record.source)}</p></div><button type="button" class="case-delete-btn" data-delete-case="${escapeHtml(record.id)}" aria-label="Eliminar ${escapeHtml(record.name)}">Eliminar</button></div><div class="case-card-stats"><span><small>Ventas / mes</small><strong>${formatNumber(result.total.sales, 2)}</strong></span><span><small>CAC real</small><strong>${formatCurrency(result.total.realCac, 0)}</strong></span><span><small>LTV:CAC</small><strong>${formatMultiplier(result.total.ltvCac, 2)}</strong></span><span><small>Resultado / mes</small><strong>${formatCurrency(result.total.operatingResult, 0)}</strong></span></div></article>`;
}
