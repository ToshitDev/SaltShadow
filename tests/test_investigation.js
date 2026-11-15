import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendInvestigation } from '../investigation.js';
import { loadCase, syntheticMeasurement } from './fixtures.js';

test('connection investigation separates documented facts from a possible explanation', () => {
  const report = recommendInvestigation(loadCase(), 'hypothesis-runoff-001');
  assert.equal(report.observed.length, 1); assert.equal(report.observed[0].status, 'MAPPED');
  assert.equal(report.possibleExplanations[0].label, 'HYPOTHESIS');
  assert.ok(report.notEstablished.some(text => text.includes('drainage')));
  assert.equal(report.relatedFeatures[0].id, 'candidate-link-001');
});
test('next actions vary by the selected claim and evidence gaps', () => {
  const data = loadCase(); const runoff = recommendInvestigation(data, data.claims[0].id);
  const station = recommendInvestigation(data, data.claims[1].id); const scenario = recommendInvestigation(data, data.claims[3].id);
  assert.ok(runoff.recommendedNextEvidence.some(item => item.code === 'connectivity'));
  assert.ok(!station.recommendedNextEvidence.some(item => item.code === 'connectivity'));
  assert.ok(scenario.recommendedNextEvidence.some(item => item.code === 'safety'));
  assert.deepEqual(station.possibleExplanations, []);
});
test('no observations means a monitoring gap, never zero chloride', () => {
  const data = loadCase(); const report = recommendInvestigation(data, 'chloride-gap-001');
  assert.equal(data.observations.length, 0); assert.equal(report.chlorideData.state, 'GAP'); assert.equal(report.chlorideData.count, 0);
  assert.match(report.chlorideData.explanation, /not zero/);
  assert.ok(report.recommendedNextEvidence.some(item => item.code === 'method'));
});
test('raw unverified observation imports cannot close the chloride gap', () => {
  const data = loadCase(); data.observations.push(syntheticMeasurement());
  assert.equal(recommendInvestigation(data, data.claims[0].id).chlorideData.state, 'GAP');
});
test('audited event- and station-matched measurement adjusts the collection recommendation', () => {
  const data = loadCase(); data.claims.push(syntheticMeasurement());
  const report = recommendInvestigation(data, data.claims[0].id);
  assert.equal(report.chlorideData.state, 'AVAILABLE'); assert.equal(report.chlorideData.count, 1);
  assert.ok(!report.recommendedNextEvidence.some(item => item.code === 'chloride'));
  assert.ok(report.recommendedNextEvidence.some(item => item.code === 'connectivity'));
  assert.match(report.chlorideData.explanation, /causation remains/);
});
test('wrong station, property, date or invalid method do not establish event-matched chloride', () => {
  for (const change of [{ stationId: 'USGS-OTHER' }, { observedAt: '2025-01-25' }, { observedAt: '2026-01-27' }, { observedProperty: 'discharge' }, { method: null }, { verified: false }]) {
    const data = loadCase(); data.claims.push(syntheticMeasurement(change));
    assert.equal(recommendInvestigation(data, data.claims[0].id).chlorideData.state, 'GAP');
  }
});
test('missing selected claim has an actionable fallback', () => {
  const report = recommendInvestigation(loadCase(), 'unknown');
  assert.equal(report.observed.length, 0); assert.ok(report.recommendedNextEvidence.length);
  assert.deepEqual(report.possibleExplanations, []);
});
test('recommendations are deterministic and inputs remain unchanged', () => {
  const data = loadCase(); const before = structuredClone(data);
  assert.deepEqual(recommendInvestigation(data, data.claims[0].id), recommendInvestigation(data, data.claims[0].id));
  assert.deepEqual(data, before);
  const report = recommendInvestigation(data, data.claims[0].id);
  report.relatedFeatures[0].id = 'caller-edit'; assert.deepEqual(data, before);
});

test('sample matching respects the investigation timezone at UTC day boundaries', () => {
  const data = loadCase();
  // Jan 27 UTC is still Jan 26 in Princeton, inside the selected window.
  data.claims.push(syntheticMeasurement({ observedAt: '2026-01-27T01:00:00Z' }));
  assert.equal(recommendInvestigation(data, data.claims[0].id).chlorideData.state, 'AVAILABLE');
  // Jan 25 UTC is still Jan 24 in Princeton, outside the selected window.
  data.claims[data.claims.length - 1].observedAt = '2026-01-25T01:00:00Z';
  assert.equal(recommendInvestigation(data, data.claims[0].id).chlorideData.state, 'GAP');
});
