/*
 * Compatibility adapter for Hemanth's authoritative v1 case record and
 * Rithvik's stricter evidence-engine claim contract. This module never writes
 * to the source record and deliberately rejects unfamiliar claims.
 */
const CLAIM_ADAPTATIONS = Object.freeze({
  'station-location-001': Object.freeze({
    status: 'MAPPED',
    verified: true,
    claimType: 'LOCATION',
    supports: Object.freeze([
      'USGS identifies and maps the Stony Brook at Princeton NJ stream monitoring location (01401000).'
    ]),
    doesNotEstablish: Object.freeze([
      'Event-matched chloride measurements for the January 25–26, 2026 storm.',
      'Drainage connectivity or a road-salt source.'
    ])
  }),
  'hypothesis-runoff-001': Object.freeze({
    status: 'INFERRED',
    verified: false,
    claimType: 'CONNECTION',
    supports: Object.freeze([
      'The case provides a documented storm and a mapped monitoring location as investigation context.'
    ]),
    doesNotEstablish: Object.freeze([
      'A drainage connection from any particular road.',
      'Road-specific salt application, event-matched chloride, or causation.'
    ])
  }),
  'chloride-gap-001': Object.freeze({
    status: 'UNKNOWN',
    verified: false,
    claimType: 'DATA_GAP',
    supports: Object.freeze([
      'The case contains no verified event-matched chloride observations.'
    ]),
    doesNotEstablish: Object.freeze([
      'A chloride increase, decrease, or zero chloride concentration.',
      'That no measurements exist elsewhere.'
    ])
  })
});

function isNonemptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isNonemptyString);
}

function normalizedNextEvidence(value, claimId) {
  if (isNonemptyString(value)) return [value];
  if (isStringArray(value)) return [...value];
  throw new TypeError(`${claimId} must provide a nonempty nextEvidenceNeeded string or array.`);
}

function preservedArrayOrDefault(value, fallback, field, claimId) {
  if (value == null) return [...fallback];
  if (isStringArray(value)) return [...value];
  throw new TypeError(`${claimId}.${field} must be a nonempty string array when supplied.`);
}

function adaptClaim(claim) {
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
    throw new TypeError('Each case-study claim must be an object.');
  }
  const adaptation = CLAIM_ADAPTATIONS[claim.id];
  if (!adaptation) throw new TypeError(`Unsupported claim ID: ${String(claim.id)}.`);
  if (claim.status !== adaptation.status || claim.verified !== adaptation.verified) {
    throw new TypeError(`${claim.id} has an unsupported status or verified flag.`);
  }
  if (!Array.isArray(claim.featureIds) || !claim.featureIds.every(isNonemptyString)) {
    throw new TypeError(`${claim.id} must retain a string featureIds array.`);
  }

  return {
    ...claim,
    claimType: adaptation.claimType,
    supports: preservedArrayOrDefault(claim.supports, adaptation.supports, 'supports', claim.id),
    doesNotEstablish: preservedArrayOrDefault(claim.doesNotEstablish, adaptation.doesNotEstablish, 'doesNotEstablish', claim.id),
    nextEvidenceNeeded: normalizedNextEvidence(claim.nextEvidenceNeeded, claim.id)
  };
}

/**
 * Returns a new evidence-engine-compatible snapshot of the authoritative case.
 * The known claim IDs are intentionally fixed so new evidence cannot be
 * silently classified or promoted without an explicit adapter revision.
 */
export function adaptCaseStudyForEvidence(caseStudy) {
  if (!caseStudy || typeof caseStudy !== 'object' || caseStudy.schemaVersion !== 1) {
    throw new TypeError('Expected a v1 case-study object.');
  }
  if (!Array.isArray(caseStudy.claims) || !Array.isArray(caseStudy.mapFeatures) || !Array.isArray(caseStudy.observations)) {
    throw new TypeError('Case study must contain claims, mapFeatures, and observations arrays.');
  }
  const expectedClaimIds = Object.keys(CLAIM_ADAPTATIONS);
  if (caseStudy.claims.length !== expectedClaimIds.length) {
    throw new TypeError('Unsupported claim set; update the adapter with source-audited claim rules.');
  }
  const adapted = structuredClone(caseStudy);
  adapted.claims = caseStudy.claims.map(adaptClaim);
  const adaptedIds = new Set(adapted.claims.map((claim) => claim.id));
  if (adaptedIds.size !== expectedClaimIds.length || expectedClaimIds.some((id) => !adaptedIds.has(id))) {
    throw new TypeError('Unsupported claim set; expected the three source-audited case claims.');
  }
  return adapted;
}
