/*
 * Dashboard adapter for the source-audited case record and Prove It modules.
 * This deliberately does not use mountProveIt(): that helper owns a separate
 * standalone demo DOM. The pure APIs below keep this dashboard's existing UI,
 * Leaflet map, replay, and calculator independent.
 */
import { adaptCaseStudyForEvidence } from './case-study-evidence-adapter.mjs';
import { createEvidenceEngine, safeSourceUrl, validateCaseStudy } from './evidence.js';
import { recommendInvestigation } from './investigation.js';
import { buildEvidenceBrief } from './prove-it.js';

const $ = (id) => document.getElementById(id);
const state = {
  caseStudy: null,
  engine: null,
  selectedClaimId: null,
  mode: 'hypotheses',
  challenged: false,
  map: null,
  leaflet: null,
  featureLayers: new Map()
};

function bridge() {
  return window.SaltShadowIntegration || null;
}

function add(parent, tagName, text, className) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  parent.append(node);
  return node;
}

function addList(parent, values, className) {
  const list = add(parent, 'ul', null, className);
  values.forEach((value) => add(list, 'li', value));
  return list;
}

function setIntegrationMessage(title, message, stateName) {
  const slot = $('claims-integration');
  slot.dataset.state = stateName || '';
  slot.replaceChildren();
  add(slot, 'strong', title);
  add(slot, 'span', message);
}

function setExportStatus(message, isError) {
  const status = $('evidence-export-status');
  status.dataset.error = String(Boolean(isError));
  status.textContent = message;
}

function setDashboardAvailable(available) {
  $('prove-it-dashboard').setAttribute('aria-busy', String(!available));
  $('documented-only').disabled = !available;
  $('evidence-export').disabled = !available;
}

function claimLabel(claim) {
  return claim.shortLabel || claim.text || claim.id;
}

function sourceLink(parent, claim) {
  const url = safeSourceUrl(claim.sourceUrl);
  if (!url) {
    add(parent, 'p', 'No direct source establishes this claim.', 'source-empty');
    return;
  }
  const link = add(parent, 'a', (claim.sourceName || 'Open source record') + ' ↗', 'source-link');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
}

function renderClaimList() {
  const list = $('prove-claim-list');
  list.replaceChildren();
  if (!state.engine) return;
  const claims = state.engine.getClaims(state.mode);
  if (!claims.length) {
    add(list, 'p', 'No claims meet the documented-evidence filter.', 'claim-list-empty');
    return;
  }
  claims.forEach((claim) => {
    const button = add(list, 'button', null, 'prove-claim-row');
    button.type = 'button';
    button.dataset.claimId = claim.id;
    button.setAttribute('aria-pressed', String(claim.id === state.selectedClaimId));
    add(button, 'span', claim.status, 'evidence-badge ' + claim.status.toLowerCase());
    add(button, 'strong', claimLabel(claim));
    add(button, 'small', claim.verified ? 'Verified narrow statement' : 'Not verified');
  });
}

function renderInspector() {
  const inspector = $('prove-inspector');
  inspector.replaceChildren();
  add(inspector, 'h3', 'Evidence inspector');
  if (!state.engine || !state.selectedClaimId) {
    add(inspector, 'p', 'Validated claims will appear here when the case record is available.');
    return;
  }
  const claim = state.engine.getClaimById(state.selectedClaimId);
  const evaluation = state.engine.evaluateClaim(state.selectedClaimId);
  const investigation = recommendInvestigation(state.caseStudy, state.selectedClaimId);
  if (!claim) {
    add(inspector, 'p', 'The selected claim is unavailable in this validated record.');
    return;
  }

  const heading = add(inspector, 'div', null, 'inspector-heading');
  add(heading, 'span', claim.status, 'evidence-badge ' + claim.status.toLowerCase());
  add(heading, 'span', claim.verified ? 'VERIFIED' : 'NOT VERIFIED', claim.verified ? 'verification verified' : 'verification unverified');
  add(inspector, 'p', claimLabel(claim), 'claim-statement');
  add(inspector, 'p', claim.id + ' · ' + claim.claimType, 'claim-id');

  const audit = add(inspector, 'section', null, 'inspector-section');
  add(audit, 'h4', 'Classification and verification');
  add(audit, 'p', evaluation.result + ' — ' + evaluation.explanation);

  const source = add(inspector, 'section', null, 'inspector-section');
  add(source, 'h4', 'Source and uncertainty');
  sourceLink(source, claim);
  add(source, 'p', claim.uncertainty, 'uncertainty-copy');

  const supports = add(inspector, 'section', null, 'inspector-section');
  add(supports, 'h4', 'What the record supports');
  addList(supports, claim.supports, 'evidence-list supports-list');

  const limits = add(inspector, 'section', null, 'inspector-section');
  add(limits, 'h4', 'What it does not establish');
  addList(limits, claim.doesNotEstablish, 'evidence-list limitations-list');

  if (claim.id === 'hypothesis-runoff-001') {
    const challenge = add(inspector, 'button', state.challenged ? 'Runoff hypothesis challenged — see audit' : 'Challenge runoff hypothesis', 'button challenge-button');
    challenge.type = 'button';
    challenge.addEventListener('click', () => {
      state.challenged = true;
      renderAll();
      $('prove-inspector').focus({ preventScroll: true });
    });
    if (state.challenged) {
      const result = add(inspector, 'section', null, 'challenge-result');
      add(result, 'strong', 'NOT PROVEN');
      add(result, 'p', 'The available record does not establish a road-to-stream connection, salt application history, or event-matched chloride response. Challenging the hypothesis does not prove it false.');
    }
  }

  const next = add(inspector, 'section', null, 'inspector-section next-evidence');
  add(next, 'h4', 'Recommended next investigation steps');
  addList(next, investigation.recommendedNextEvidence.map((item) => item.action), 'evidence-list next-evidence-list');
  const gap = add(inspector, 'p', investigation.chlorideData.explanation, 'chloride-gap-note');
  gap.dataset.state = investigation.chlorideData.state;
}

function validPoint(feature) {
  const coordinates = feature?.geometry?.type === 'Point' ? feature.geometry.coordinates : null;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    ? { latitude, longitude } : null;
}

function sameLocation(marker, point) {
  if (!marker || typeof marker.getLatLng !== 'function') return false;
  const location = marker.getLatLng();
  return Math.abs(location.lat - point.latitude) < 0.0000001 && Math.abs(location.lng - point.longitude) < 0.0000001;
}

function createFeatureLayer(feature) {
  const point = validPoint(feature);
  if (!point || !state.leaflet || !state.map) return null;
  const popup = document.createElement('div');
  add(popup, 'strong', 'Verified mapped monitoring location');
  add(popup, 'span', state.caseStudy.site?.name || 'Monitoring location');
  add(popup, 'small', 'Location only; no event-matched chloride result or flow path is established.');
  const existingMarker = bridge()?.getSelectedSiteMarker?.();
  if (sameLocation(existingMarker, point)) {
    existingMarker.bindPopup(popup);
    return existingMarker;
  }
  const marker = state.leaflet.circleMarker([point.latitude, point.longitude], {
    radius: 8,
    color: '#153e33',
    weight: 2,
    fillColor: '#b7db5c',
    fillOpacity: 0.95
  });
  marker.bindPopup(popup);
  return marker;
}

function setMapEvidenceCopy(label) {
  const layer = $('map-evidence-layer');
  if (!layer) return;
  const dot = document.createElement('i');
  dot.className = 'map-key-dot mapped-evidence';
  dot.setAttribute('aria-hidden', 'true');
  layer.replaceChildren(dot, document.createTextNode(label));
}

function syncMapFeatures() {
  state.map = bridge()?.getMap?.() || state.map;
  state.leaflet = window.L || state.leaflet;
  if (!state.engine || !state.map || !state.leaflet) return;
  const visible = state.engine.getVisibleFeatures(state.mode);
  const visibleIds = new Set(visible.map((feature) => feature.id));
  visible.forEach((feature) => {
    // Null geometry is intentionally non-drawable. In particular, do not
    // transform candidate-link-001 into a presumed drainage route.
    if (!validPoint(feature)) return;
    let layer = state.featureLayers.get(feature.id);
    if (!layer) {
      layer = createFeatureLayer(feature);
      if (layer) state.featureLayers.set(feature.id, layer);
    }
    if (layer && !state.map.hasLayer(layer)) layer.addTo(state.map);
  });
  state.featureLayers.forEach((layer, id) => {
    if (!visibleIds.has(id) && state.map.hasLayer(layer)) state.map.removeLayer(layer);
  });
  const drawableCount = visible.filter(validPoint).length;
  setMapEvidenceCopy(drawableCount
    ? 'Verified mapped location shown — no flow path or chloride result'
    : 'No supported geographic evidence is visible in this mode');
}

function announceEvidenceChange() {
  if (!state.engine || !state.selectedClaimId) return;
  const evaluation = state.engine.evaluateClaim(state.selectedClaimId);
  const investigation = recommendInvestigation(state.caseStudy, state.selectedClaimId);
  document.dispatchEvent(new CustomEvent('saltshadow:evidence-change', {
    detail: {
      selectedClaimId: state.selectedClaimId,
      mode: state.mode,
      visibleFeatureIds: state.engine.getVisibleFeatures(state.mode).map((feature) => feature.id),
      evaluation,
      investigation
    }
  }));
}

function renderModeStatus() {
  const visible = state.engine.getVisibleFeatures(state.mode);
  const drawableCount = visible.filter(validPoint).length;
  $('evidence-mode-status').textContent = state.mode === 'documented'
    ? 'Documented evidence only: ' + drawableCount + ' verified map point; inferred connection hidden.'
    : 'Claims and hypotheses: ' + drawableCount + ' drawable verified map point; no hypothetical route is drawn.';
}

function renderAll() {
  renderClaimList();
  renderInspector();
  renderModeStatus();
  syncMapFeatures();
  announceEvidenceChange();
}

function selectClaim(id) {
  if (!state.engine?.getClaimById(id)) return;
  state.selectedClaimId = id;
  state.challenged = false;
  renderAll();
  $('prove-inspector').focus({ preventScroll: true });
}

function setMode(mode) {
  if (!['documented', 'hypotheses'].includes(mode) || !state.engine) return;
  state.engine.getVisibleFeatures(mode); // validate before changing UI state
  state.mode = mode;
  $('documented-only').checked = mode === 'documented';
  renderAll();
}

function downloadEvidenceBrief() {
  if (!state.caseStudy || !state.selectedClaimId) return;
  try {
    const scenario = bridge()?.getScenario?.() || null;
    const brief = buildEvidenceBrief(state.caseStudy, {
      selectedClaimId: state.selectedClaimId,
      mode: state.mode,
      challenged: state.challenged,
      scenario
    });
    const blob = new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'saltshadow-evidence-brief.json';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportStatus('Evidence brief downloaded. Scenario values, when present, remain hypothetical.', false);
  } catch (error) {
    setExportStatus('Unable to create the evidence brief: ' + error.message, true);
  }
}

function initialize(caseStudy) {
  try {
    const adapted = adaptCaseStudyForEvidence(caseStudy);
    const validation = validateCaseStudy(adapted);
    if (!validation.valid) throw new TypeError(validation.errors.join(' '));
    state.caseStudy = adapted;
    state.engine = createEvidenceEngine(adapted);
    state.selectedClaimId = adapted.claims[0]?.id || null;
    state.mode = 'hypotheses';
    state.challenged = false;
    setDashboardAvailable(true);
    setIntegrationMessage('Validated Prove It record loaded', adapted.claims.length + ' claims are available for inspection. MAPPED does not establish chloride data or causation.', 'loaded');
    renderAll();
  } catch (error) {
    state.caseStudy = null;
    state.engine = null;
    state.selectedClaimId = null;
    setDashboardAvailable(false);
    setIntegrationMessage('Evidence record unavailable', 'The shared case record could not be validated for Prove It. No claims or geographic features are presented as verified. ' + error.message, 'unavailable');
    renderInspector();
    $('prove-claim-list').replaceChildren();
    $('evidence-mode-status').textContent = 'Evidence review unavailable.';
  }
}

function setup() {
  $('prove-claim-list').addEventListener('click', (event) => {
    const button = event.target.closest('[data-claim-id]');
    if (button) selectClaim(button.dataset.claimId);
  });
  $('documented-only').addEventListener('change', (event) => setMode(event.target.checked ? 'documented' : 'hypotheses'));
  $('evidence-export').addEventListener('click', downloadEvidenceBrief);
  document.addEventListener('saltshadow:case-study-loaded', (event) => initialize(event.detail?.caseStudy));
  document.addEventListener('saltshadow:case-study-unavailable', () => initialize(null));
  document.addEventListener('saltshadow:map-ready', (event) => {
    state.map = event.detail?.map || null;
    state.leaflet = window.L || null;
    if (state.engine) syncMapFeatures();
  });
  const existingCase = bridge()?.getCaseStudy?.();
  if (existingCase) initialize(existingCase);
}

setup();
