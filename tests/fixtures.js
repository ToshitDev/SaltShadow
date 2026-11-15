import { readFileSync } from 'node:fs';
export const loadCase = () => JSON.parse(readFileSync(new URL('../data/case_study.json', import.meta.url), 'utf8'));
// SYNTHETIC UNIT-TEST FIXTURE ONLY. Never loaded by the demo or real case data.
export function syntheticMeasurement(overrides = {}) {
  return { id: 'synthetic-chloride', text: 'SYNTHETIC TEST observation.', claimType: 'OBSERVATION', status: 'MEASURED', verified: true,
    sourceName: 'SYNTHETIC TEST source', sourceUrl: 'https://example.org/synthetic-test', observedAt: '2026-01-25T17:00:00-05:00', stationId: 'USGS-01401000',
    units: 'mg/L', method: 'SYNTHETIC TEST method', observedProperty: 'chloride', value: 12,
    uncertainty: 'Invented fixture for automated tests only.', supports: ['Test measurement validation.'], doesNotEstablish: ['Any actual environmental observation.'],
    nextEvidenceNeeded: ['Replace synthetic fixture with an audited original record.'], relatedFeatureIds: [], ...overrides };
}
