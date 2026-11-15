/*
 * Compatibility boundary between the authoritative case record and the Prove
 * It UI. A source-audited record that already satisfies the evidence schema is
 * passed through as a detached snapshot; this module never classifies claims
 * or supplies missing evidence on its own.
 */
import { validateCaseStudy } from './evidence.js';

function isCaseRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && value.schemaVersion === 1
    && Array.isArray(value.claims) && Array.isArray(value.mapFeatures) && Array.isArray(value.observations);
}

/**
 * Returns a validated deep clone for the evidence engine. Validation happens
 * before and after cloning so malformed or unfamiliar claims fail closed
 * instead of receiving an inferred classification from this adapter.
 */
export function adaptCaseStudyForEvidence(caseStudy) {
  if (!isCaseRecord(caseStudy)) {
    throw new TypeError('Expected a v1 case-study object with claims, mapFeatures, and observations arrays.');
  }
  const validation = validateCaseStudy(caseStudy);
  if (!validation.valid) {
    throw new TypeError('Case study failed evidence validation: ' + validation.errors.join(' '));
  }
  const snapshot = structuredClone(caseStudy);
  const snapshotValidation = validateCaseStudy(snapshot);
  if (!snapshotValidation.valid) {
    throw new TypeError('Cloned case study failed evidence validation: ' + snapshotValidation.errors.join(' '));
  }
  return snapshot;
}
