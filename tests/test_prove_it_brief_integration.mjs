import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const file = (relativePath) => new URL(relativePath, import.meta.url);
const source = (relativePath) => readFileSync(file(relativePath), 'utf8');
const dataModule = (code) => 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');

// The project intentionally leaves package.json in CommonJS mode for the
// calculator tests. These data URLs let Node exercise the browser ES modules
// without changing that project-wide setting.
const evidenceUrl = dataModule(source('../evidence.js'));
const investigationUrl = dataModule(source('../investigation.js').replace("'./evidence.js'", `'${evidenceUrl}'`));
const proveItUrl = dataModule(source('../prove-it.js')
  .replace("'./evidence.js'", `'${evidenceUrl}'`)
  .replace("'./investigation.js'", `'${investigationUrl}'`));
const adapterUrl = dataModule(source('../case-study-evidence-adapter.mjs').replace("'./evidence.js'", `'${evidenceUrl}'`));
const { adaptCaseStudyForEvidence } = await import(adapterUrl);
const { createEvidenceEngine } = await import(evidenceUrl);
const { buildEvidenceBrief } = await import(proveItUrl);
const rawCase = JSON.parse(readFileSync(file('../data/case_study.json'), 'utf8'));

test('Prove It brief preserves calculator output and keeps the runoff hypothesis not proven', () => {
  const adapted = adaptCaseStudyForEvidence(rawCase);
  const engine = createEvidenceEngine(adapted);
  const scenario = {
    state: 'HYPOTHETICAL_SCENARIO',
    baselineSaltLb: 1500,
    scenarioSaltLb: 1200,
    saltNotAppliedLb: 300,
    materialOnlyCostDifferenceUsd: 15.75
  };
  const brief = buildEvidenceBrief(adapted, {
    selectedClaimId: 'hypothesis-runoff-001',
    mode: 'documented',
    challenged: true,
    scenario
  });

  assert.deepEqual(engine.getVisibleFeatures('documented').map((feature) => feature.id), ['station-01401000']);
  assert.equal(engine.evaluateClaim('hypothesis-runoff-001').result, 'NOT PROVEN');
  assert.equal(engine.getClaimById('scenario-assumption-001').status, 'ASSUMED');
  assert.deepEqual(brief.visibleFeatureIds, ['station-01401000']);
  assert.equal(brief.investigation.chlorideData.state, 'GAP');
  assert.deepEqual(brief.scenario, scenario);
  assert.equal(brief.challenged, true);
});
