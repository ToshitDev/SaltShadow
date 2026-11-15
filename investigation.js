import { createEvidenceEngine, validateClaim } from './evidence.js';

const actions = {
  connectivity: 'Check municipal drainage-network records and verify the road-to-stream pathway with local watershed experts.',
  application: 'Obtain dated municipal salt-application records for the candidate road and selected event.',
  chloride: 'Retrieve dated chloride observations for the selected station and event; retain original sample records.',
  sampling: 'With local experts, identify suitable upstream and downstream sampling sites and a sampling schedule.',
  method: 'Verify each sample’s analytical method, chloride units, station ID, and quality-control flags.',
  timing: 'Check that observation timestamps align with the selected event; keep other dates as context only.',
  safety: 'Ask public works staff to review operational and road-safety constraints before evaluating any treatment change.'
};

function eventLocalDate(observedAt, timezone) {
  if (observedAt.length === 10) return observedAt; // A date-only sample retains its reported date.
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(observedAt));
  const part = name => parts.find(item => item.type === name).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

/** Deterministic recommendations scoped to one claim and the supplied case snapshot. */
export function recommendInvestigation(caseStudy, claimId) {
  const engine = createEvidenceEngine(caseStudy);
  const claim = engine.getClaimById(claimId);
  const evaluation = engine.evaluateClaim(claimId);
  const observed = engine.getClaims('documented').filter(item => item.id === claimId || claim?.supportingClaimIds?.includes(item.id)).map(item => ({ claimId: item.id, text: item.text, status: item.status, sourceName: item.sourceName, sourceUrl: item.sourceUrl }));
  const verifiedMeasurements = engine.getClaims('documented').filter(item => item.status === 'MEASURED' && item.observedProperty?.toLowerCase() === 'chloride');
  // Raw imported rows are never upgraded to verified measurements by their mere presence.
  const matchedChloride = verifiedMeasurements.filter(item => {
    if (!validateClaim(item).valid || item.stationId !== caseStudy.site.stationId) return false;
    const day = eventLocalDate(item.observedAt, caseStudy.event.timezone ?? 'America/New_York');
    return day >= caseStudy.event.startDate && day <= caseStudy.event.endDate;
  });
  const gaps = new Set(claim?.evidenceGaps ?? []);
  if (gaps.has('chloride') && matchedChloride.length) gaps.delete('chloride');
  const recommendations = [...gaps].map(code => ({ code, action: actions[code] ?? `Resolve the documented evidence gap: ${code}.` }));
  if (!recommendations.length) for (const action of claim?.nextEvidenceNeeded ?? evaluation.missingEvidence) recommendations.push({ code: 'review', action });
  return {
    claimId, observed,
    possibleExplanations: claim?.status === 'INFERRED' ? [{ label: 'HYPOTHESIS', text: claim.text, uncertainty: claim.uncertainty }] : [],
    notEstablished: [...new Set([...(claim?.doesNotEstablish ?? []), ...evaluation.missingEvidence])],
    recommendedNextEvidence: recommendations,
    chlorideData: { state: matchedChloride.length ? 'AVAILABLE' : 'GAP', count: matchedChloride.length, explanation: matchedChloride.length ? 'Audited station- and event-matched chloride observations are available; causation remains a separate question.' : 'No verified station- and event-matched chloride observations are included in this case. Missing data is not zero chloride.' },
    relatedFeatures: structuredClone((caseStudy.mapFeatures ?? []).filter(feature => evaluation.relatedFeatureIds.includes(feature.id)))
  };
}
