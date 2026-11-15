/* global L, SaltEngine */
(function () {
  'use strict';

  // These stages intentionally describe UI states, not historic weather observations.
  const REPLAY_STAGES = [
    ['Before the event', 'Set the investigation context before weather records are loaded.'],
    ['Conditions begin', 'Illustrative timing marker only — no measured weather observation is implied.'],
    ['Treatment window', 'Potential treatment activity is not documented in this starter.'],
    ['Field review', 'Compare available records and identify what still needs to be measured.'],
    ['Evidence handoff', 'Export assumptions, gaps, and the calculation for transparent review.']
  ];
  const $ = (id) => document.getElementById(id);
  let replayIndex = 0;
  let replayTimer = null;
  let map = null;
  let siteMarker = null;
  let activeCase = null;
  let verifiedSites = [];
  let selectedSite = null;

  function numberFormat(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }

  function readInputNumber(id) {
    const value = $(id).value.trim();
    return value === '' ? NaN : Number(value);
  }

  function updateScenario() {
    const values = ['lane-miles', 'application-rate', 'reduction-percent', 'price-per-ton'].map(readInputNumber);
    $('reduction-output').textContent = Number.isFinite(values[2]) ? values[2] + '%' : '—';
    try {
      const result = SaltEngine.calculate(...values);
      $('baseline-result').textContent = numberFormat(result.baselineSaltLb);
      $('scenario-result').textContent = numberFormat(result.scenarioSaltLb);
      $('saved-result').textContent = numberFormat(result.saltSavedLb);
      $('cost-result').textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.costSavedUsd);
      $('scenario-error').textContent = '';
    } catch (error) {
      ['baseline-result', 'scenario-result', 'saved-result', 'cost-result'].forEach((id) => { $(id).textContent = '—'; });
      $('scenario-error').textContent = error.message;
    }
  }

  function renderReplay() {
    const stage = REPLAY_STAGES[replayIndex];
    const playing = replayTimer !== null;
    const complete = !playing && replayIndex === REPLAY_STAGES.length - 1;
    $('timeline-step').textContent = String(replayIndex + 1).padStart(2, '0');
    $('timeline-title').textContent = stage[0];
    $('timeline-description').textContent = stage[1];
    $('timeline-state').textContent = playing
      ? 'Playing illustrative replay.'
      : complete ? 'Illustrative replay complete. Reset to begin again.' : 'Paused at this illustrative stage.';
    $('timeline-progress').style.width = (replayIndex / (REPLAY_STAGES.length - 1)) * 100 + '%';
    $('replay-status').textContent = playing ? 'PLAYING' : complete ? 'COMPLETE' : 'PAUSED';
    $('play-button').textContent = playing ? 'Playing…' : complete ? 'Replay' : 'Play';
    $('play-button').setAttribute('aria-pressed', String(playing));
    $('play-button').disabled = playing;
    $('pause-button').disabled = !playing;
    $('step-button').disabled = playing || complete;
    [...$('timeline-labels').children].forEach((node, index) => {
      node.classList.toggle('active', index === replayIndex);
      if (index === replayIndex) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });
  }

  function pauseReplay() {
    if (replayTimer !== null) window.clearInterval(replayTimer);
    replayTimer = null;
    renderReplay();
  }

  function advanceReplay() {
    if (replayIndex >= REPLAY_STAGES.length - 1) {
      pauseReplay();
      return;
    }
    replayIndex += 1;
    renderReplay();
  }

  function startReplay() {
    if (replayTimer !== null) return;
    if (replayIndex === REPLAY_STAGES.length - 1) replayIndex = 0;
    replayTimer = window.setInterval(advanceReplay, 1300);
    renderReplay();
  }

  function initTimeline() {
    REPLAY_STAGES.forEach((stage, index) => {
      const label = document.createElement('button');
      label.type = 'button';
      label.className = 'timeline-label';
      label.textContent = String(index + 1).padStart(2, '0');
      label.setAttribute('aria-label', 'Show replay stage ' + (index + 1) + ': ' + stage[0]);
      label.addEventListener('click', () => { pauseReplay(); replayIndex = index; renderReplay(); });
      $('timeline-labels').append(label);
    });
    $('play-button').addEventListener('click', startReplay);
    $('pause-button').addEventListener('click', pauseReplay);
    $('step-button').addEventListener('click', () => { pauseReplay(); advanceReplay(); });
    $('reset-button').addEventListener('click', () => { pauseReplay(); replayIndex = 0; renderReplay(); });
    renderReplay();
  }

  function initStageNavigation() {
    const links = [...document.querySelectorAll('.flow-nav a')];
    const panels = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const setActiveStage = (id) => links.forEach((link) => {
      const active = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    links.forEach((link) => link.addEventListener('click', () => setActiveStage(link.hash.slice(1))));
    if (!('IntersectionObserver' in window)) {
      setActiveStage('rewind');
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveStage(visible.target.id);
    }, { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.4, 0.7] });
    panels.forEach((panel) => observer.observe(panel));
    setActiveStage('rewind');
  }

  function setMapMessage(title, message) {
    const strong = document.createElement('strong');
    const span = document.createElement('span');
    strong.textContent = title;
    span.textContent = message;
    $('map-message').replaceChildren(strong, span);
  }

  function updateMapStatus(text) {
    $('map-status').textContent = text;
  }

  function initMap() {
    if (!window.L) {
      $('map-fallback').hidden = false;
      updateMapStatus('MAP OFFLINE');
      return;
    }
    map = L.map('map', { zoomControl: false, scrollWheelZoom: false }).setView([40.3431, -74.6551], 13);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    updateMapStatus('MAP LOADING');
    let tileFailed = false;
    tiles.once('load', () => updateMapStatus(selectedSite ? 'SITE SELECTED' : 'AWAITING SITE'));
    tiles.on('tileerror', () => {
      if (!tileFailed) {
        tileFailed = true;
        $('map-fallback').hidden = false;
        updateMapStatus('MAP OFFLINE');
      }
    });
  }

  function coordinateFor(site) {
    const latitude = Number(site.latitude ?? site.lat ?? (site.coordinates && site.coordinates.latitude));
    const longitude = Number(site.longitude ?? site.lng ?? (site.coordinates && site.coordinates.longitude));
    return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
      ? { latitude, longitude } : null;
  }

  function collectVerifiedSites(data) {
    const candidates = Array.isArray(data.monitoringSites) ? data.monitoringSites
      : Array.isArray(data.sites) ? data.sites : data.site ? [data.site] : [];
    return candidates.filter((site) => site && site.verified === true && typeof site.name === 'string' && site.name.trim() && coordinateFor(site));
  }

  function configureMonitoringSites(sites) {
    const select = $('monitoring-site-select');
    verifiedSites = sites;
    selectedSite = null;
    select.replaceChildren();
    if (!sites.length) {
      select.add(new Option('No verified monitoring site loaded', ''));
      select.disabled = true;
      setMapMessage('Monitoring location pending verification', 'Verified station coordinates still need to be loaded. No site or pollution path is shown.');
      updateMapStatus(map ? 'AWAITING SITE' : 'MAP OFFLINE');
      return;
    }
    select.disabled = false;
    sites.forEach((site, index) => select.add(new Option(site.name, String(index))));
    select.value = '0';
    selectMonitoringSite(sites[0]);
  }

  function selectMonitoringSite(site) {
    const coordinates = site && coordinateFor(site);
    if (!coordinates) return;
    selectedSite = site;
    setMapMessage('Selected verified monitoring location', site.name + '. Mapping a station location does not establish chloride data, drainage connectivity, or source responsibility.');
    if (map && window.L) {
      if (siteMarker) map.removeLayer(siteMarker);
      siteMarker = L.marker([coordinates.latitude, coordinates.longitude]).addTo(map).bindPopup(site.name);
      map.flyTo([coordinates.latitude, coordinates.longitude], 14, { animate: true, duration: 0.65 });
      updateMapStatus('SITE SELECTED');
    }
    document.dispatchEvent(new CustomEvent('saltshadow:monitoring-site-selected', { detail: { site } }));
  }

  function applyScenarioDefaults(defaults) {
    if (!defaults || typeof defaults !== 'object') return;
    const fields = [
      ['lane-miles', defaults.laneMiles],
      ['application-rate', defaults.rateLbPerLaneMile],
      ['reduction-percent', defaults.reductionPct],
      ['price-per-ton', defaults.priceUsdPerShortTon]
    ];
    if (fields.every(([, value]) => Number.isFinite(Number(value)))) {
      fields.forEach(([id, value]) => { $(id).value = String(value); });
      updateScenario();
    }
  }

  function setIntegrationMessage(title, message) {
    const strong = document.createElement('strong');
    const span = document.createElement('span');
    strong.textContent = title;
    span.textContent = message;
    $('claims-integration').replaceChildren(strong, span);
  }

  async function loadCaseStudy() {
    try {
      const response = await fetch('data/case_study.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Case-study file unavailable');
      const data = await response.json();
      if (!data || !data.event || !Array.isArray(data.claims)) throw new Error('Case-study record does not match the shared contract');
      activeCase = data;
      $('case-name').textContent = data.event.name || 'Loaded case study';
      $('case-state').textContent = data.event.recordType || 'Case study loaded; source review status not supplied.';
      applyScenarioDefaults(data.scenarioDefaults);
      configureMonitoringSites(collectVerifiedSites(data));
      setIntegrationMessage('Claims integration point', data.claims.length + ' shared claim(s) loaded. Rithvik’s Prove It renderer remains responsible for reviewing and displaying claim evidence.');
      document.dispatchEvent(new CustomEvent('saltshadow:case-study-loaded', { detail: { caseStudy: data } }));
    } catch (error) {
      activeCase = null;
      $('case-name').textContent = 'Princeton-area winter storm replay';
      $('case-state').textContent = 'Data unavailable — no compatible verified case-study record loaded.';
      configureMonitoringSites([]);
      setIntegrationMessage('Claims integration point', 'Data unavailable: awaiting data/case_study.json and Rithvik’s shared claims[] module. No evidence claims are displayed.');
      document.dispatchEvent(new CustomEvent('saltshadow:case-study-unavailable', { detail: { reason: error.message } }));
    }
  }

  function caseStudySources() {
    const sources = ['OpenStreetMap map data: https://www.openstreetmap.org/copyright'];
    if (activeCase && activeCase.event && typeof activeCase.event.sourceUrl === 'string' && activeCase.event.sourceUrl) sources.push('Case event source: ' + activeCase.event.sourceUrl);
    if (selectedSite && typeof selectedSite.sourceUrl === 'string' && selectedSite.sourceUrl) sources.push('Selected site source: ' + selectedSite.sourceUrl);
    return sources;
  }

  function buildBrief() {
    const inputs = {
      laneMiles: $('lane-miles').value,
      rateLbPerLaneMile: $('application-rate').value,
      reductionPercent: $('reduction-percent').value,
      priceUsdPerShortTon: $('price-per-ton').value
    };
    let result;
    try {
      result = SaltEngine.calculate(Number(inputs.laneMiles), Number(inputs.rateLbPerLaneMile), Number(inputs.reductionPercent), Number(inputs.priceUsdPerShortTon));
    } catch (error) {
      window.alert('Correct the scenario inputs before exporting: ' + error.message);
      return;
    }
    const dataAvailability = selectedSite
      ? 'Selected verified monitoring location: ' + selectedSite.name + '. Mapping the location does not establish event-matched chloride data or a pollution path.'
      : 'No verified monitoring location is loaded. The map remains centered on the Princeton area only.';
    const eventStatus = activeCase && activeCase.event && activeCase.event.recordType
      ? activeCase.event.recordType : 'ILLUSTRATIVE DEMONSTRATION — no verified historical weather observations are represented by the replay.';
    const lines = [
      'SALTSHADOW — DECISION BRIEF',
      'Generated: ' + new Date().toLocaleString(), '',
      'Selected demonstration event',
      $('case-name').textContent,
      'Status: ' + eventStatus, '',
      'Location and data availability', dataAvailability, '',
      'Hypothetical salt-use inputs',
      'Treated lane miles: ' + inputs.laneMiles,
      'Salt application rate: ' + inputs.rateLbPerLaneMile + ' lb/lane-mile',
      'Hypothetical reduction: ' + inputs.reductionPercent + '%',
      'Salt price: $' + inputs.priceUsdPerShortTon + ' per US short ton', '',
      'Calculated material-only outputs',
      'Baseline salt: ' + result.baselineSaltLb + ' lb',
      'Scenario salt: ' + result.scenarioSaltLb + ' lb',
      'Salt not applied: ' + result.saltSavedLb + ' lb',
      'Estimated material-only cost difference: $' + result.costSavedUsd.toFixed(2), '',
      'Evidence limitations',
      'Scenario inputs are ASSUMED, not actual municipal treatment data.',
      'Road safety and stream chloride impacts are not modeled.',
      'No road-to-stream pollution path or specific road responsibility is established.',
      'Prove It claim review and documented-only filtering are not included in this frontend integration point yet.', '',
      'Sources', ...caseStudySources()
    ];
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'saltshadow-decision-brief.txt';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function init() {
    document.querySelectorAll('#scenario-form input').forEach((input) => input.addEventListener('input', updateScenario));
    $('scenario-form').addEventListener('submit', (event) => event.preventDefault());
    $('monitoring-site-select').addEventListener('change', (event) => selectMonitoringSite(verifiedSites[Number(event.target.value)]));
    $('export-button').addEventListener('click', buildBrief);
    updateScenario();
    initTimeline();
    initStageNavigation();
    initMap();
    loadCaseStudy();
  }
  document.addEventListener('DOMContentLoaded', init);
}());
