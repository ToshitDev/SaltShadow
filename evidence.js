/** Pure v1 evidence contract. `verified` records a human source audit, never URL existence. */
export const EVIDENCE_STATUSES = Object.freeze(['MEASURED', 'MAPPED', 'INFERRED', 'ASSUMED', 'UNKNOWN']);
const documentedStatuses = ['MEASURED', 'MAPPED'];
const copy = value => structuredClone(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const strings = value => Array.isArray(value) && value.every(nonempty);
export const featureIdsFor = claim => claim?.relatedFeatureIds ?? claim?.featureIds ?? [];
export function validEvidenceDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return false;
  const day = value.slice(0, 10);
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day && Number.isFinite(Date.parse(value));
}
export function safeSourceUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}

export function validateClaim(claim) {
  const errors = [];
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) return { valid: false, errors: ['Claim must be an object.'] };
  for (const field of ['id', 'text', 'uncertainty']) if (!nonempty(claim[field])) errors.push(`${field} is required.`);
  if (!EVIDENCE_STATUSES.includes(claim.status)) errors.push('Unknown evidence status.');
  if (typeof claim.verified !== 'boolean') errors.push('verified must be boolean.');
  for (const field of ['supports', 'doesNotEstablish', 'nextEvidenceNeeded']) {
    if (!strings(claim[field]) || !claim[field].length) errors.push(`${field} must be a nonempty string array.`);
  }
  if (!strings(featureIdsFor(claim))) errors.push('Feature references must be a string array.');
  if (claim.supportingClaimIds != null && !strings(claim.supportingClaimIds)) errors.push('Supporting claim IDs must be a string array.');
  if (claim.evidenceGaps != null && !strings(claim.evidenceGaps)) errors.push('Evidence gaps must be a string array.');
  if (claim.featureIds && claim.relatedFeatureIds && JSON.stringify(claim.featureIds) !== JSON.stringify(claim.relatedFeatureIds)) errors.push('Feature ID aliases disagree.');
  if (claim.sourceUrl != null && !safeSourceUrl(claim.sourceUrl)) errors.push('Source URL must use HTTP or HTTPS.');
  if (claim.verified && !documentedStatuses.includes(claim.status)) errors.push('Hypotheses, assumptions, and unknowns cannot be verified.');
  if (documentedStatuses.includes(claim.status)) {
    if (!claim.verified) errors.push('Documented classifications require a source audit.');
    if (!nonempty(claim.sourceName) || !safeSourceUrl(claim.sourceUrl)) errors.push('Documented claims require a named source and URL.');
  }
  if (claim.status === 'MAPPED' && claim.claimType !== 'LOCATION') errors.push('MAPPED supports location claims only, not measurements or causal connections.');
  if (claim.status === 'MEASURED') {
    if (claim.claimType !== 'OBSERVATION') errors.push('MEASURED supports observations only.');
    for (const field of ['observedAt', 'stationId', 'units', 'method', 'observedProperty']) if (!nonempty(claim[field])) errors.push(`${field} is required for measurements.`);
    if (!validEvidenceDate(claim.observedAt)) errors.push('Measurement date is invalid; timestamps require an explicit time zone.');
    if (typeof claim.value !== 'number' || !Number.isFinite(claim.value)) errors.push('A finite observed value is required; missing is not zero.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateCaseStudy(data) {
  const errors = [];
  if (!data || data.schemaVersion !== 1) errors.push('Expected schemaVersion 1.');
  for (const field of ['claims', 'mapFeatures', 'observations']) if (!Array.isArray(data?.[field])) errors.push(`${field} must be an array.`);
  if (!nonempty(data?.caseId)) errors.push('caseId is required.');
  if (!data?.event || !data?.site) errors.push('event and site are required.');
  if (errors.length) return { valid: false, errors };
  if (!data.claims.length) errors.push('No claims are available. Add an audited claim or an explicitly labeled hypothesis.');
  for (const key of ['startDate', 'endDate']) if (!validEvidenceDate(data.event[key]) || data.event[key].length !== 10) errors.push(`event.${key} must be an ISO calendar date.`);
  if (data.event.startDate > data.event.endDate) errors.push('Event dates are reversed.');
  if (data.event.timezone != null) {
    try { new Intl.DateTimeFormat('en-US', { timeZone: data.event.timezone }); }
    catch { errors.push('Event timezone is invalid.'); }
  }
  const claims = new Map(); const features = new Map();
  for (const claim of data.claims) {
    if (claims.has(claim?.id)) errors.push(`Duplicate claim: ${claim?.id}`);
    claims.set(claim?.id, claim);
    errors.push(...validateClaim(claim).errors.map(error => `${claim?.id}: ${error}`));
  }
  for (const feature of data.mapFeatures) {
    if (!feature || typeof feature !== 'object') { errors.push('Feature must be an object.'); continue; }
    if (!nonempty(feature?.id) || features.has(feature.id)) errors.push(`Invalid/duplicate feature: ${feature?.id}`);
    features.set(feature?.id, feature);
    if (!claims.has(feature?.claimId)) errors.push(`Unknown claim reference: ${feature?.claimId}`);
    else {
      const ids = featureIdsFor(claims.get(feature.claimId));
      if (!strings(ids) || !ids.includes(feature.id)) errors.push(`Feature ${feature.id} lacks a reciprocal claim reference.`);
    }
    if (!EVIDENCE_STATUSES.includes(feature?.status)) errors.push(`Invalid feature status: ${feature?.id}`);
  }
  for (const claim of data.claims) {
    if (!claim || typeof claim !== 'object') continue;
    for (const id of strings(featureIdsFor(claim)) ? featureIdsFor(claim) : []) {
      if (!features.has(id) || features.get(id).claimId !== claim.id) errors.push(`Broken feature reference: ${claim.id} -> ${id}`);
    }
    for (const id of strings(claim.supportingClaimIds) ? claim.supportingClaimIds : []) if (!claims.has(id)) errors.push(`Unknown supporting claim: ${id}`);
  }
  return { valid: errors.length === 0, errors };
}

/** Snapshot-based instance: no globals, DOM, network, mutation, or automatic promotion of hypotheses. */
export function createEvidenceEngine(caseStudy) {
  if (!Array.isArray(caseStudy?.claims) || !Array.isArray(caseStudy?.mapFeatures)) throw new TypeError('claims and mapFeatures arrays are required.');
  const data = copy(caseStudy);
  if (data.claims.some(claim => !claim || !nonempty(claim.id))) throw new TypeError('Every claim requires a stable string ID.');
  const claims = new Map(data.claims.map(claim => [claim.id, claim]));
  if (claims.size !== data.claims.length) throw new TypeError('Duplicate claim IDs.');
  const getClaimById = id => copy(claims.get(id) ?? null);
  function evaluateClaim(id) {
    const claim = claims.get(id);
    const validation = validateClaim(claim);
    const supported = validation.valid && claim.verified && documentedStatuses.includes(claim.status);
    return {
      claimId: id, status: claim?.status ?? 'UNKNOWN', result: supported ? 'SUPPORTED' : 'NOT PROVEN', supported,
      disproven: false,
      explanation: supported ? 'The audited source supports this narrow statement. Its stated limits still apply.' : 'Available evidence is insufficient to establish this claim. This does not mean the hypothesis is false.',
      validationErrors: validation.errors,
      missingEvidence: supported ? [] : [
        ...copy(Array.isArray(claim?.nextEvidenceNeeded) ? claim.nextEvidenceNeeded : ['Identify the claim and obtain an auditable source.']),
        ...validation.errors.map(error => `Complete the evidence record: ${error}`)
      ],
      supports: copy(claim?.supports ?? []), doesNotEstablish: copy(claim?.doesNotEstablish ?? []),
      sourceName: claim?.sourceName ?? null, sourceUrl: safeSourceUrl(claim?.sourceUrl),
      uncertainty: claim?.uncertainty ?? 'No claim record available.', relatedFeatureIds: copy(claim ? featureIdsFor(claim) : [])
    };
  }
  function getClaims(mode = 'hypotheses') {
    checkMode(mode);
    return copy(data.claims.filter(claim => mode === 'hypotheses' || evaluateClaim(claim.id).supported));
  }
  function getVisibleFeatures(mode = 'hypotheses') {
    checkMode(mode);
    return copy(data.mapFeatures.filter(feature => {
      const claim = claims.get(feature?.claimId);
      const ids = featureIdsFor(claim);
      if (!claim || !strings(ids) || !ids.includes(feature.id)) return false;
      return mode === 'hypotheses' || (documentedStatuses.includes(feature.status) && feature.status === claim.status && evaluateClaim(claim.id).supported);
    }));
  }
  return Object.freeze({ getClaimById, getClaims, evaluateClaim,
    getClaimEvidence: id => ({ claim: getClaimById(id), evaluation: evaluateClaim(id) }),
    getMissingEvidence: id => evaluateClaim(id).missingEvidence,
    getVisibleFeatures,
    exportEvidence: () => ({ schemaVersion: 1, caseId: data.caseId, claims: data.claims.map(claim => ({ ...getClaimById(claim.id), evaluation: evaluateClaim(claim.id) })) })
  });
}
function checkMode(mode) {
  if (!['documented', 'hypotheses'].includes(mode)) throw new TypeError('Mode must be documented or hypotheses.');
}
