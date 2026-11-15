import { createEvidenceEngine, validateCaseStudy, safeSourceUrl } from './evidence.js';
import { recommendInvestigation } from './investigation.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>`;
const link = (url, label) => safeSourceUrl(url) ? `<a class="source-link" target="_blank" rel="noopener noreferrer" href="${escape(safeSourceUrl(url))}">${escape(label)} ↗</a>` : '';

/** Export adapter: scenario is an optional already-calculated teammate output, never recomputed here. */
export function buildEvidenceBrief(caseStudy, { selectedClaimId, mode = 'hypotheses', challenged = false, scenario = null } = {}) {
  const engine = createEvidenceEngine(caseStudy);
  const id = selectedClaimId ?? caseStudy.claims[0]?.id;
  return structuredClone({ ...engine.exportEvidence(), event: caseStudy.event, site: caseStudy.site,
    observations: caseStudy.observations, sourceAudit: caseStudy.sourceAudit,
    selectedClaimId: id, mode, challenged, visibleFeatureIds: engine.getVisibleFeatures(mode).map(feature => feature.id),
    investigation: recommendInvestigation(caseStudy, id),
    scenario: scenario ?? { state: 'NOT_INTEGRATED', assumptions: caseStudy.scenarioDefaults },
    limitations: ['NOT PROVEN means insufficient evidence, not a disproven hypothesis.', 'The connection is a conceptual schematic, not mapped infrastructure.', 'No validated stream-response or road-safety model is included.']
  });
}

/** Bind the demo markup. Teammate map adapters listen for saltshadow:evidence-change. */
export function mountProveIt(root, caseStudy, { getScenario = () => null } = {}) {
  caseStudy = structuredClone(caseStudy);
  const validation = validateCaseStudy(caseStudy);
  if (!validation.valid) throw new TypeError(validation.errors.join(' '));
  const engine = createEvidenceEngine(caseStudy);
  let selectedClaimId = caseStudy.claims[0].id;
  let mode = 'hypotheses';
  const challenged = new Set();
  const byId = id => root.querySelector(`#${id}`);
  const eventSource = byId('event-source');
  const eventUrl = safeSourceUrl(caseStudy.event.sourceUrl);
  if (eventUrl) { eventSource.href = eventUrl; eventSource.textContent = `${caseStudy.event.sourceName} ↗`; }
  else { eventSource.removeAttribute('href'); eventSource.textContent = 'Event source awaiting audit'; }

  function render() {
    const claim = engine.getClaimById(selectedClaimId);
    const evaluation = engine.evaluateClaim(selectedClaimId);
    const investigation = recommendInvestigation(caseStudy, selectedClaimId);
    const visible = engine.getVisibleFeatures(mode).map(feature => feature.id);
    for (const element of root.querySelectorAll('[data-feature-id]')) {
      const shown = visible.includes(element.dataset.featureId);
      element.hidden = !shown;
      // SVG visibility must remove the element itself, not merely recolor it.
      element.style.display = shown ? '' : 'none';
    }
    const connectionVisible = visible.includes('candidate-link-001');
    byId('select-connection').hidden = !connectionVisible;
    byId('hidden-message').hidden = connectionVisible;
    byId('mode-label').textContent = mode === 'documented' ? 'Documented Only' : 'Show Hypotheses';
    byId('feature-count').textContent = `${visible.length} / ${caseStudy.mapFeatures.length} features visible`;
    byId('scene').classList.toggle('challenged', selectedClaimId === 'hypothesis-runoff-001' && challenged.has(selectedClaimId));
    byId('claim-list').innerHTML = engine.getClaims().map((item, index) => `<button class="claim-row" data-claim-id="${escape(item.id)}" aria-pressed="${item.id === selectedClaimId}"><span class="claim-number">0${index + 1}</span><span class="claim-row-label">${escape(item.shortLabel ?? item.text)}</span><span class="badge ${escape(item.status)}">${escape(item.status)}</span><span class="claim-arrow" aria-hidden="true">↗</span></button>`).join('');
    const result = challenged.has(selectedClaimId) ? `<section class="result ${evaluation.supported ? 'supported' : ''}" role="status"><p class="eyebrow">EVIDENCE AUDIT / ${evaluation.supported ? 'DOCUMENTED' : 'INSUFFICIENT EVIDENCE'}</p><strong>${evaluation.result}</strong><p>${escape(evaluation.explanation)}</p>${evaluation.missingEvidence.length ? list(evaluation.missingEvidence) : ''}</section>` : '';
    const metadata = [['Station', claim.stationId], ['Observed at', claim.observedAt], ['Method', claim.method], ['Observed property', claim.observedProperty], ['Observed value', claim.value == null ? null : `${claim.value} ${claim.units ?? ''}`]].filter(([, value]) => value != null);
    byId('claim-detail').innerHTML = `<div class="claim-heading"><span class="badge ${escape(claim.status)}">${escape(claim.status)}</span><span class="claim-id">${escape(claim.id)}</span></div>
      <p class="claim-text">${escape(claim.text)}</p><p class="uncertainty">${escape(claim.uncertainty)}</p>
      <button class="challenge" id="challenge">Challenge This Connection <span aria-hidden="true">↗</span></button>${result}
      <section class="detail-section"><h3>Supporting evidence</h3>${investigation.observed.map(fact => `<div class="observed-fact"><p>${escape(fact.text)}</p>${link(fact.sourceUrl, fact.sourceName)}</div>`).join('')}${claim.sourceUrl ? (investigation.observed.some(fact => fact.claimId === claim.id) ? '' : link(claim.sourceUrl, claim.sourceName)) : `<p class="source-empty">No direct source establishes this claim.</p>`}${claim.id === 'hypothesis-runoff-001' ? `<p>Regional winter-event context only:</p>${link(caseStudy.event.sourceUrl, caseStudy.event.sourceName)}` : ''}${metadata.length ? `<dl class="record-metadata">${metadata.map(([label, value]) => `<dt>${escape(label)}</dt><dd>${escape(value)}</dd>`).join('')}</dl>` : ''}</section>
      <section class="detail-section"><h3>What the evidence establishes</h3>${list(claim.supports)}</section>
      <section class="detail-section"><h3>What remains unproven</h3>${list(claim.doesNotEstablish)}</section>
      ${investigation.possibleExplanations.length ? `<section class="detail-section"><h3>Possible explanations</h3><p class="possible-explanation">HYPOTHESIS · ${escape(investigation.possibleExplanations[0].text)}</p></section>` : ''}
      <div class="data-gap"><span aria-hidden="true">◌</span><div><strong>${investigation.chlorideData.state === 'GAP' ? 'Chloride monitoring gap' : 'Audited chloride observations available'}</strong><p>${escape(investigation.chlorideData.explanation)}</p></div></div>
      <section class="next-evidence"><h3>NEXT EVIDENCE NEEDED</h3><ol>${investigation.recommendedNextEvidence.map(item => `<li>${escape(item.action)}</li>`).join('')}</ol></section>`;
    byId('challenge').addEventListener('click', () => {
      challenged.add(selectedClaimId); render();
      byId('challenge').focus({ preventScroll: true });
      root.querySelector('.result').scrollIntoView({ block: 'nearest', behavior: 'auto' });
    });
    root.dispatchEvent(new CustomEvent('saltshadow:evidence-change', { detail: { selectedClaimId, mode, visibleFeatureIds: visible, evaluation, investigation }, bubbles: true }));
  }
  function selectClaim(id) {
    if (!engine.getClaimById(id)) return false;
    selectedClaimId = id; render(); return true;
  }
  function setMode(nextMode) {
    engine.getVisibleFeatures(nextMode); // Validate before mutating state.
    mode = nextMode; byId('documented-only').checked = mode === 'documented'; render();
  }
  byId('claim-list').addEventListener('click', event => {
    const button = event.target.closest('[data-claim-id]');
    if (button) { selectClaim(button.dataset.claimId); byId('inspector').focus({ preventScroll: true }); }
  });
  byId('select-connection').addEventListener('click', () => { selectClaim('hypothesis-runoff-001'); byId('inspector').focus({ preventScroll: true }); });
  byId('select-station').addEventListener('click', () => { selectClaim('station-location-001'); byId('inspector').focus({ preventScroll: true }); });
  byId('documented-only').addEventListener('change', event => setMode(event.target.checked ? 'documented' : 'hypotheses'));
  function exportBrief() { return buildEvidenceBrief(caseStudy, { selectedClaimId, mode, challenged: challenged.has(selectedClaimId), scenario: getScenario() }); }
  byId('export').disabled = false;
  byId('export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(exportBrief(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const anchor = root.createElement('a');
    anchor.href = url; anchor.download = 'saltshadow-evidence-brief.json'; root.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  render();
  return Object.freeze({ engine, selectClaim, setMode, exportBrief });
}
