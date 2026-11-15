import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const caseStudyPath = new URL('../data/case_study.json', import.meta.url);
const moduleUrl = (fileUrl) => `data:text/javascript;base64,${Buffer.from(readFileSync(fileUrl, 'utf8')).toString('base64')}`;
const evidenceUrl = moduleUrl(new URL('../evidence.js', import.meta.url));
const adapterSource = readFileSync(new URL('../case-study-evidence-adapter.mjs', import.meta.url), 'utf8')
  .replace("'./evidence.js'", `'${evidenceUrl}'`);
const { adaptCaseStudyForEvidence } = await import(`data:text/javascript;base64,${Buffer.from(adapterSource).toString('base64')}`);
const { createEvidenceEngine, validateCaseStudy } = await import(evidenceUrl);

function loadAuthoritativeCase() {
  return JSON.parse(readFileSync(caseStudyPath, 'utf8'));
}

test('adapter deep-clones the already-valid four-claim authoritative case without mutation', () => {
  const originalText = readFileSync(caseStudyPath, 'utf8');
  const authoritativeCase = JSON.parse(originalText);
  const originalSnapshot = structuredClone(authoritativeCase);
  const adapted = adaptCaseStudyForEvidence(authoritativeCase);

  assert.deepEqual(validateCaseStudy(authoritativeCase), { valid: true, errors: [] });
  assert.deepEqual(validateCaseStudy(adapted), { valid: true, errors: [] });
  assert.deepEqual(adapted, authoritativeCase);
  assert.notStrictEqual(adapted, authoritativeCase);
  assert.notStrictEqual(adapted.claims, authoritativeCase.claims);
  assert.deepEqual(authoritativeCase, originalSnapshot);
  assert.equal(readFileSync(caseStudyPath, 'utf8'), originalText);

  const station = adapted.claims.find((claim) => claim.id === 'station-location-001');
  const runoff = adapted.claims.find((claim) => claim.id === 'hypothesis-runoff-001');
  const chlorideGap = adapted.claims.find((claim) => claim.id === 'chloride-gap-001');
  const scenario = adapted.claims.find((claim) => claim.id === 'scenario-assumption-001');
  assert.equal(station.claimType, 'LOCATION');
  assert.equal(runoff.claimType, 'CONNECTION');
  assert.equal(chlorideGap.claimType, 'DATA_GAP');
  assert.equal(scenario.claimType, 'SCENARIO');
  assert.equal(scenario.status, 'ASSUMED');
  assert.equal(scenario.verified, false);
  assert.equal(adapted.observations.length, 0);
  assert.equal(adapted.mapFeatures.find((feature) => feature.id === 'candidate-link-001').geometry, null);
});

test('adapted evidence preserves documented-only visibility and the unresolved runoff hypothesis', () => {
  const engine = createEvidenceEngine(adaptCaseStudyForEvidence(loadAuthoritativeCase()));
  assert.deepEqual(engine.getVisibleFeatures('documented').map((feature) => feature.id), ['station-01401000']);
  assert.ok(!engine.getVisibleFeatures('documented').some((feature) => feature.id === 'candidate-link-001'));
  assert.equal(engine.evaluateClaim('hypothesis-runoff-001').result, 'NOT PROVEN');
  assert.equal(engine.evaluateClaim('hypothesis-runoff-001').supported, false);
});

test('adapter fails closed when a claim violates the evidence schema', () => {
  const malformed = loadAuthoritativeCase();
  malformed.claims.find((claim) => claim.id === 'hypothesis-runoff-001').verified = true;
  assert.throws(() => adaptCaseStudyForEvidence(malformed), /failed evidence validation/i);
});
