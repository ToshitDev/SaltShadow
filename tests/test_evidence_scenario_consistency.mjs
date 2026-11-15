
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const SaltEngine = require('../engine.js');

const file = path => new URL(path, import.meta.url);
const source = path => readFileSync(file(path), 'utf8');
const dataModule = code =>
  'data:text/javascript;base64,' +
  Buffer.from(code).toString('base64');

// Load the actual evidence modules.
const evidenceUrl = dataModule(source('../evidence.js'));

const investigationUrl = dataModule(
  source('../investigation.js')
    .replace("'./evidence.js'", `'${evidenceUrl}'`)
);

const proveItUrl = dataModule(
  source('../prove-it.js')
    .replace("'./evidence.js'", `'${evidenceUrl}'`)
    .replace("'./investigation.js'", `'${investigationUrl}'`)
);

const { buildEvidenceBrief } = await import(proveItUrl);

// Read the real case-study defaults.
const caseStudy = JSON.parse(source('../data/case_study.json'));
const defaults = caseStudy.scenarioDefaults;

// Build a scenario with the real calculator.
function makeScenario(reduction) {
  const result = SaltEngine.calculate(
    defaults.laneMiles,
    defaults.rateLbPerLaneMile,
    reduction,
    defaults.priceUsdPerShortTon
  );

  return {
    state: 'HYPOTHETICAL_SCENARIO',
    inputs: {
      laneMiles: defaults.laneMiles,
      applicationRateLbPerLaneMile: defaults.rateLbPerLaneMile,
      reductionPercent: reduction,
      priceUsdPerShortTon: defaults.priceUsdPerShortTon
    },
    baselineSaltLb: result.baselineSaltLb,
    scenarioSaltLb: result.scenarioSaltLb,
    saltNotAppliedLb: result.saltSavedLb,
    materialOnlyCostDifferenceUsd: result.costSavedUsd,
    limitation: 'Hypothetical material calculation only.'
  };
}

// Test several reductions and their exported values.
test('evidence export preserves live calculator results', () => {
  assert.equal(defaults.status, 'ASSUMED');

  for (const reduction of [0, 20, 50, 100]) {
    const scenario = makeScenario(reduction);

    const brief = buildEvidenceBrief(caseStudy, {
      selectedClaimId: 'hypothesis-runoff-001',
      mode: 'documented',
      challenged: true,
      scenario
    });

    assert.deepEqual(brief.scenario, scenario);
    assert.equal(brief.scenario.inputs.reductionPercent, reduction);
    assert.equal(brief.scenario.state, 'HYPOTHETICAL_SCENARIO');

    assert.equal(
      brief.scenario.baselineSaltLb,
      brief.scenario.scenarioSaltLb +
        brief.scenario.saltNotAppliedLb
    );

    assert.equal(
      brief.scenario.materialOnlyCostDifferenceUsd,
      brief.scenario.saltNotAppliedLb / 2000 *
        defaults.priceUsdPerShortTon
    );
  }
});

// Unsupported connections must remain unverified.
test('documented mode excludes inferred connections', () => {
  const brief = buildEvidenceBrief(caseStudy, {
    selectedClaimId: 'hypothesis-runoff-001',
    mode: 'documented',
    challenged: true,
    scenario: makeScenario(20)
  });

  assert.deepEqual(
    brief.visibleFeatureIds,
    ['station-01401000']
  );

  assert.ok(
    !brief.visibleFeatureIds.includes('candidate-link-001')
  );

  const runoff = brief.claims.find(
    claim => claim.id === 'hypothesis-runoff-001'
  );

  assert.equal(runoff.status, 'INFERRED');
  assert.equal(runoff.verified, false);
  assert.equal(runoff.evaluation.result, 'NOT PROVEN');

  assert.equal(brief.investigation.chlorideData.state, 'GAP');
  assert.equal(brief.challenged, true);
  assert.ok(brief.limitations.some(
    limitation => /road-safety/i.test(limitation)
  ));
});

// Missing calculator output must not be fabricated.
test('missing scenario uses the not-integrated state', () => {
  const brief = buildEvidenceBrief(caseStudy, {
    selectedClaimId: 'hypothesis-runoff-001',
    mode: 'documented'
  });

  assert.equal(brief.scenario.state, 'NOT_INTEGRATED');
  assert.deepEqual(brief.scenario.assumptions, defaults);
  assert.deepEqual(brief.observations, []);
});

console.log('Evidence scenario consistency tests passed.');
