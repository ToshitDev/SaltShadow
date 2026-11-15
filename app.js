/* global L, SaltEngine */
(function () {
  'use strict';

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
  let map;

  function numberFormat(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }

  function updateScenario() {
    const values = ['lane-miles', 'application-rate', 'reduction-percent', 'price-per-ton'].map((id) => Number($(id).value));
    $('reduction-output').textContent = values[2] + '%';
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
    $('timeline-step').textContent = String(replayIndex).padStart(2, '0');
    $('timeline-title').textContent = stage[0];
    $('timeline-description').textContent = stage[1];
    $('timeline-progress').style.width = (replayIndex / (REPLAY_STAGES.length - 1)) * 100 + '%';
    [...$('timeline-labels').children].forEach((node, index) => node.classList.toggle('active', index === replayIndex));
  }

  function advanceReplay() {
    replayIndex = replayIndex === REPLAY_STAGES.length - 1 ? 0 : replayIndex + 1;
    renderReplay();
  }

  function startReplay() {
    if (replayTimer) return;
    replayTimer = window.setInterval(advanceReplay, 1300);
    $('play-button').textContent = 'Playing…';
  }

  function pauseReplay() {
    window.clearInterval(replayTimer);
    replayTimer = null;
    $('play-button').textContent = 'Play';
  }

  function initTimeline() {
    REPLAY_STAGES.forEach((stage, index) => {
      const label = document.createElement('button');
      label.type = 'button'; label.className = 'timeline-label'; label.textContent = String(index + 1).padStart(2, '0');
      label.setAttribute('aria-label', 'Show ' + stage[0]);
      label.addEventListener('click', () => { replayIndex = index; renderReplay(); });
      $('timeline-labels').append(label);
    });
    $('play-button').addEventListener('click', startReplay);
    $('pause-button').addEventListener('click', pauseReplay);
    $('reset-button').addEventListener('click', () => { pauseReplay(); replayIndex = 0; renderReplay(); });
    renderReplay();
  }

  function initMap() {
    if (!window.L) {
      $('map-fallback').hidden = false;
      return;
    }
    map = L.map('map', { zoomControl: false, scrollWheelZoom: false }).setView([40.3431, -74.6551], 13);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    let tileFailed = false;
    tiles.on('tileerror', () => {
      if (!tileFailed) { tileFailed = true; $('map-fallback').hidden = false; }
    });
  }

  async function loadCaseStudy() {
    try {
      const response = await fetch('data/case_study.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('No case study file');
      const data = await response.json();
      if (!data || !data.event || !Array.isArray(data.claims)) throw new Error('Invalid case study structure');
      $('case-name').textContent = data.event.name || 'Loaded case study';
      $('case-state').textContent = data.event.recordType || 'Case study record loaded';
      $('claims-integration').innerHTML = '<strong>Claims integration point</strong><span>' + data.claims.length + ' shared claim(s) loaded. Prove It rendering remains owned by the evidence module.</span>';
    } catch (_) {
      // Missing data is an expected and explicitly communicated state in the starter.
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
    try { result = SaltEngine.calculate(Number(inputs.laneMiles), Number(inputs.rateLbPerLaneMile), Number(inputs.reductionPercent), Number(inputs.priceUsdPerShortTon)); }
    catch (error) { window.alert('Correct the scenario inputs before exporting: ' + error.message); return; }
    const lines = [
      'SALTSHADOW — DECISION BRIEF',
      'Generated: ' + new Date().toLocaleString(), '',
      'Selected demonstration event',
      $('case-name').textContent,
      'Status: ILLUSTRATIVE DEMONSTRATION. No verified historical weather observations are represented by the replay.', '',
      'Location and data availability',
      'Princeton-area map center only. Verified station coordinates and event-matched chloride data have not been loaded.', '',
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
      'A shared claims[] array and verified sources may be integrated later by the evidence and data owners.', '',
      'Sources',
      'OpenStreetMap map data: https://www.openstreetmap.org/copyright',
      'No event, station, or chloride citation is included because none is loaded and verified in this starter.'
    ];
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'saltshadow-decision-brief.txt';
    document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
  }

  function init() {
    document.querySelectorAll('#scenario-form input').forEach((input) => input.addEventListener('input', updateScenario));
    $('scenario-form').addEventListener('submit', (event) => event.preventDefault());
    $('export-button').addEventListener('click', buildBrief);
    updateScenario(); initTimeline(); initMap(); loadCaseStudy();
  }
  document.addEventListener('DOMContentLoaded', init);
}());
