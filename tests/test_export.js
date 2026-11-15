import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEvidenceBrief } from '../prove-it.js';
import { loadCase } from './fixtures.js';

test('export preserves claims, source URLs, uncertainty and honest audit results', () => {
  const data = loadCase(); const brief = buildEvidenceBrief(data, { selectedClaimId: data.claims[0].id, mode: 'documented', challenged: true });
  const parsed = JSON.parse(JSON.stringify(brief));
  assert.equal(parsed.caseId, data.caseId); assert.equal(parsed.claims[0].evaluation.result, 'NOT PROVEN');
  assert.equal(parsed.claims[1].sourceUrl, data.site.sourceUrl); assert.equal(parsed.claims[1].uncertainty, data.claims[1].uncertainty);
  assert.deepEqual(parsed.observations, []); assert.equal(parsed.investigation.chlorideData.state, 'GAP');
  assert.deepEqual(parsed.visibleFeatureIds, ['station-01401000']); assert.equal(parsed.challenged, true);
  assert.equal(parsed.scenario.state, 'NOT_INTEGRATED');
});
test('export adapter preserves teammate scenario output without calculating competing values', () => {
  const scenario = { status: 'ASSUMED', saltNotAppliedLb: 300, materialSavingsUSD: 15.75, units: 'lb and USD', source: 'teammate engine' };
  const brief = buildEvidenceBrief(loadCase(), { scenario }); assert.deepEqual(brief.scenario, scenario);
  brief.scenario.saltNotAppliedLb = 999; assert.equal(scenario.saltNotAppliedLb, 300);
});
