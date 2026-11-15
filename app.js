/* global L, SaltEngine, SaltGuidance */
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
  let currentScenarioResult = null;
  let exportStatusTimer = null;
  let mapLoadTimer = null;

  function numberFormat(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }

  function currencyFormat(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }

  function updateComparison(values) {
    document.querySelectorAll('.scenario-preset').forEach((card) => {
      const reduction = Number(card.dataset.reduction);
      card.setAttribute('aria-pressed', String(reduction === values[2]));
      let result = null;
      try {
        result = SaltEngine.calculate(values[0], values[1], reduction, values[3]);
      } catch (_) { /* Invalid baseline inputs must not leave stale comparisons. */ }
      card.querySelectorAll('[data-metric]').forEach((metric) => {
        const key = metric.dataset.metric;
        metric.textContent = !result ? '—' : key === 'costSavedUsd'
          ? currencyFormat(result[key]) : numberFormat(result[key]) + ' lb';
      });
    });
  }

  function updateGuidance() {
    const guidance = SaltGuidance.getGuidance(readInputNumber('pavement-temperature'), $('road-condition').value);
    $('guidance-result').textContent = guidance.message;
    $('guidance-source').href = guidance.sourceUrl;
    $('guidance-source').textContent = guidance.sourceLabel;
  }

  function readInputNumber(id) {
    const value = $(id).value.trim();
    return value === '' ? NaN : Number(value);
  }

  function updateScenario() {
    const values = ['lane-miles', 'application-rate', 'reduction-percent', 'price-per-ton'].map(readInputNumber);
    $('reduction-output').textContent = Number.isFinite(values[2]) ? values[2] + '%' : '—';
    updateComparison(values);
    try {
      const result = SaltEngine.calculate(...values);
      $('baseline-result').textContent = numberFormat(result.baselineSaltLb);
      $('scenario-result').textContent = numberFormat(result.scenarioSaltLb);
      $('saved-result').textContent = numberFormat(result.saltSavedLb);
      $('cost-result').textContent = currencyFormat(result.costSavedUsd);
      $('scenario-summary').textContent = 'At ' + values[2] + '% reduction, this illustrative scenario calculates ' + numberFormat(result.saltSavedLb) + ' lb not applied and ' + currencyFormat(result.costSavedUsd) + ' in material-only difference.';
      $('scenario-error').textContent = '';
      // Shared read-only handoff for the evidence brief. These remain
      // hypothetical material calculations, not environmental observations.
      currentScenarioResult = {
        state: 'HYPOTHETICAL_SCENARIO',
        inputs: {
          laneMiles: values[0],
          applicationRateLbPerLaneMile: values[1],
          reductionPercent: values[2],
          priceUsdPerShortTon: values[3]
        },
        baselineSaltLb: result.baselineSaltLb,
        scenarioSaltLb: result.scenarioSaltLb,
        saltNotAppliedLb: result.saltSavedLb,
        materialOnlyCostDifferenceUsd: result.costSavedUsd,
        limitation: 'Illustrative scenario, not actual municipal treatment data. Road safety and stream chloride impacts are not modeled.'
      };
    } catch (error) {
      ['baseline-result', 'scenario-result', 'saved-result', 'cost-result'].forEach((id) => { $(id).textContent = '—'; });
      $('scenario-error').textContent = error.message;
      $('scenario-summary').textContent = 'Enter valid non-negative assumptions to calculate material quantities and cost difference.';
      currentScenarioResult = null;
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

  function selectReplayStage(index) {
    pauseReplay();
    replayIndex = Math.max(0, Math.min(REPLAY_STAGES.length - 1, index));
    renderReplay();
  }

  function initTimeline() {
    REPLAY_STAGES.forEach((stage, index) => {
      const label = document.createElement('button');
      label.type = 'button';
      label.className = 'timeline-label';
      label.textContent = String(index + 1).padStart(2, '0');
      label.setAttribute('aria-label', 'Show replay stage ' + (index + 1) + ': ' + stage[0]);
      label.addEventListener('click', () => selectReplayStage(index));
      $('timeline-labels').append(label);
    });
    $('play-button').addEventListener('click', startReplay);
    $('pause-button').addEventListener('click', pauseReplay);
    $('step-button').addEventListener('click', () => { pauseReplay(); advanceReplay(); });
    $('reset-button').addEventListener('click', () => { pauseReplay(); replayIndex = 0; renderReplay(); });
    $('timeline-labels').addEventListener('keydown', (event) => {
      if (!event.target.classList.contains('timeline-label') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(REPLAY_STAGES.length - 1, replayIndex + direction));
      selectReplayStage(nextIndex);
      [...$('timeline-labels').querySelectorAll('.timeline-label')][nextIndex].focus();
    });
    $('rewind').addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && replayTimer !== null) {
        event.preventDefault();
        pauseReplay();
        $('pause-button').focus();
      }
    });
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

  function setMapEvidenceLayer(label, stateClass) {
    const layer = $('map-evidence-layer');
    const dot = document.createElement('i');
    dot.className = 'map-key-dot ' + stateClass;
    dot.setAttribute('aria-hidden', 'true');
    layer.replaceChildren(dot, document.createTextNode(label));
  }

  function setMapNetworkNotice(title, detail, visible) {
    $('map-network-title').textContent = title;
    $('map-network-detail').textContent = detail;
    $('map-slow-message').hidden = !visible;
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
    });
    let successfulTiles = 0;
    let failedTiles = 0;
    const hasRenderedTiles = () => {
      const tileContainer = tiles.getContainer();
      return Boolean(tileContainer && tileContainer.querySelector('.leaflet-tile.leaflet-tile-loaded'));
    };
    const startTileLoadCycle = () => {
      successfulTiles = 0;
      failedTiles = 0;
      window.clearTimeout(mapLoadTimer);
      setMapNetworkNotice('', '', false);
      updateMapStatus('MAP LOADING');
      mapLoadTimer = window.setTimeout(() => {
        setMapNetworkNotice('Map tiles are delayed', 'The Princeton-area reference remains available; site and evidence status are unchanged.', true);
        updateMapStatus('MAP DELAYED');
      }, 4500);
    };
    tiles.on('loading', startTileLoadCycle);
    tiles.on('tileload', () => { successfulTiles += 1; });
    tiles.on('tileerror', () => { failedTiles += 1; });
    tiles.on('load', () => {
      window.clearTimeout(mapLoadTimer);
      setMapNetworkNotice('', '', false);
      if (successfulTiles > 0) {
        $('map-fallback').hidden = true;
        updateMapStatus(selectedSite ? 'SITE SELECTED' : 'AWAITING SITE');
      } else if (failedTiles > 0 && !hasRenderedTiles()) {
        $('map-fallback').hidden = false;
        updateMapStatus('MAP OFFLINE');
      } else if (failedTiles > 0) {
        $('map-fallback').hidden = true;
        setMapNetworkNotice('Some tiles could not refresh', 'The existing base map is still visible. New map coverage may be incomplete until connectivity improves.', true);
        updateMapStatus('MAP PARTIAL');
      } else if (hasRenderedTiles()) {
        // A cached or previously rendered base map is usable even when this
        // cycle produced no new tile events. Clear only a stale outage banner.
        $('map-fallback').hidden = true;
        updateMapStatus(selectedSite ? 'SITE SELECTED' : 'AWAITING SITE');
      }
    });
    tiles.addTo(map);
    document.dispatchEvent(new CustomEvent('saltshadow:map-ready', { detail: { map } }));
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
    const claims = Array.isArray(data.claims) ? data.claims : [];
    const features = Array.isArray(data.mapFeatures) ? data.mapFeatures : [];
    return candidates.flatMap((site) => {
      if (!site || typeof site.name !== 'string' || !site.name.trim()) return [];
      if (site.verified === true && coordinateFor(site)) return [site];
      // Hemanth's record documents verification on the MAPPED claim and its
      // GeoJSON feature, rather than duplicating it on site. Only accept that
      // exact, reciprocal relationship; no other coordinate is inferred here.
      const claim = claims.find((item) => item && item.stationId === site.stationId && item.status === 'MAPPED' && item.verified === true && Array.isArray(item.featureIds));
      const feature = claim && features.find((item) => item && item.claimId === claim.id && item.status === 'MAPPED' && item.showAsVerified === true && claim.featureIds.includes(item.id) && item.geometry && item.geometry.type === 'Point' && Array.isArray(item.geometry.coordinates));
      const coordinates = feature && feature.geometry.coordinates;
      const longitude = coordinates && Number(coordinates[0]);
      const latitude = coordinates && Number(coordinates[1]);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return [];
      return [{ ...site, verified: true, latitude, longitude }];
    });
  }

  function safeHttpUrl(value) {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch (_) {
      return null;
    }
  }

  function renderMonitoringInfo(site) {
    const sourceLink = $('monitoring-source');
    if (!site) {
      $('monitoring-name').textContent = 'No verified monitoring location loaded';
      $('monitoring-details').textContent = 'Load a source-audited case study to inspect a mapped monitoring location. No chloride measurement is implied by this state.';
      sourceLink.hidden = true;
      sourceLink.removeAttribute('href');
      return;
    }
    const stationId = typeof site.stationId === 'string' && site.stationId ? ' Station ID: ' + site.stationId + '.' : '';
    $('monitoring-name').textContent = site.name;
    $('monitoring-details').textContent = 'This is a verified mapped location from the supplied case study.' + stationId + ' Its presence does not establish event-matched chloride data, drainage connectivity, or source responsibility.';
    const sourceUrl = safeHttpUrl(site.sourceUrl);
    sourceLink.hidden = !sourceUrl;
    if (sourceUrl) sourceLink.href = sourceUrl;
    else sourceLink.removeAttribute('href');
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
      setMapEvidenceLayer('No verified evidence layer loaded', 'no-evidence');
      renderMonitoringInfo(null);
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
    setMapEvidenceLayer('Verified mapped location only — no flow path', 'mapped-evidence');
    renderMonitoringInfo(site);
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

  function setCaseCardState(state, name, description) {
    $('case-card').dataset.state = state;
    $('case-name').textContent = name;
    $('case-state').textContent = description;
  }

  async function loadCaseStudy() {
    setCaseCardState('loading', 'Checking case-study availability', 'Loading the shared record. The illustrated replay remains available without environmental measurements.');
    setIntegrationMessage('Claims integration point', 'Loading the shared case-study record. No evidence claims are displayed while availability is checked.');
    try {
      const response = await fetch('data/case_study.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Case-study file unavailable');
      const data = await response.json();
      if (!data || !data.event || !Array.isArray(data.claims)) throw new Error('Case-study record does not match the shared contract');
      activeCase = data;
      setCaseCardState('loaded', data.event.name || 'Loaded case study', data.event.recordType || 'Case study loaded; source review status not supplied.');
      applyScenarioDefaults(data.scenarioDefaults);
      configureMonitoringSites(collectVerifiedSites(data));
      setIntegrationMessage('Claims integration point', data.claims.length + ' shared claim(s) loaded. Rithvik’s Prove It renderer remains responsible for reviewing and displaying claim evidence.');
      document.dispatchEvent(new CustomEvent('saltshadow:case-study-loaded', { detail: { caseStudy: data } }));
    } catch (error) {
      activeCase = null;
      setCaseCardState('unavailable', 'Princeton-area winter storm replay', 'Data unavailable — no compatible verified case-study record loaded. The replay and calculator remain illustrative.');
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

  function setExportStatus(message, isError) {
    const status = $('export-status');
    window.clearTimeout(exportStatusTimer);
    status.textContent = message;
    status.dataset.error = String(Boolean(isError));
    if (!isError) {
      exportStatusTimer = window.setTimeout(() => {
        status.textContent = '';
        status.dataset.error = 'false';
      }, 3500);
    }
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
      result = SaltEngine.calculate(...['lane-miles', 'application-rate', 'reduction-percent', 'price-per-ton'].map(readInputNumber));
    } catch (error) {
      setExportStatus('Cannot export: ' + error.message, true);
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
      'Baseline salt: ' + numberFormat(result.baselineSaltLb) + ' lb',
      'Scenario salt: ' + numberFormat(result.scenarioSaltLb) + ' lb',
      'Salt not applied: ' + numberFormat(result.saltSavedLb) + ' lb',
      'Estimated material-only cost difference: ' + currencyFormat(result.costSavedUsd), '',
      'Evidence limitations',
      'Scenario inputs are ASSUMED, not actual municipal treatment data.',
      'Road safety and stream chloride impacts are not modeled.',
      'No road-to-stream pollution path or specific road responsibility is established.',
      'For claim verification and documented-only filtering, export the separate Prove It evidence brief from the Prove It panel.', '',
      'Sources', ...caseStudySources()
    ];
    try {
      const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'saltshadow-decision-brief.txt';
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      setExportStatus('Decision brief downloaded with current limitations and assumptions.', false);
    } catch (_) {
      setExportStatus('Unable to create the decision brief in this browser.', true);
    }
  }

  function init() {
    document.querySelectorAll('#scenario-form input').forEach((input) => input.addEventListener('input', updateScenario));
    $('scenario-form').addEventListener('submit', (event) => event.preventDefault());
    document.querySelectorAll('.scenario-preset').forEach((card) => card.addEventListener('click', () => {
      $('reduction-percent').value = card.dataset.reduction;
      updateScenario();
    }));
    $('pavement-temperature').addEventListener('input', updateGuidance);
    $('road-condition').addEventListener('change', updateGuidance);
    $('monitoring-site-select').addEventListener('change', (event) => selectMonitoringSite(verifiedSites[Number(event.target.value)]));
    $('export-button').addEventListener('click', buildBrief);
    // This browser-only bridge lets separately loaded ES modules consume
    // snapshots without turning the existing calculator into a module.
    window.SaltShadowIntegration = Object.freeze({
      getMap: () => map,
      getSelectedSiteMarker: () => siteMarker,
      getScenario: () => currentScenarioResult ? structuredClone(currentScenarioResult) : null,
      getCaseStudy: () => activeCase ? structuredClone(activeCase) : null
    });
    updateScenario();
    updateGuidance();
    initTimeline();
    initStageNavigation();
    initMap();
    loadCaseStudy();
  }
  document.addEventListener('DOMContentLoaded', init);
}());
