/* Educational summaries of FHWA-RD-95-202; source review: 2026-11-15.
 * Two inputs cannot match an Appendix C rate: trend, surface moisture,
 * storm intensity, chemical form, and (for frost) dew point/traffic matter.
 * This module deliberately supplies no numerical application rate.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SaltGuidance = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const NO_RATE = 'No verified application rate available for these conditions.';
  const PRACTICES = 'https://www.fhwa.dot.gov/publications/research/safety/95202/003.cfm';
  const APPENDIX = 'https://www.fhwa.dot.gov/publications/research/safety/95202/006.cfm';

  function getGuidance(temperatureF, condition) {
    let explanation;
    let sourceUrl = PRACTICES;
    if (typeof temperatureF !== 'number' || !Number.isFinite(temperatureF)) {
      explanation = 'Pavement temperature is unknown; FHWA emphasizes monitoring pavement temperature and its trend alongside weather and road conditions.';
    } else if (!['snow', 'ice', 'frost'].includes(condition)) {
      explanation = 'Road condition is unknown; FHWA emphasizes identifying precipitation and pavement conditions and monitoring temperature trends before treatment decisions.';
    } else if (temperatureF > 32) {
      explanation = 'Above freezing, FHWA emphasizes monitoring pavement temperature for a drop toward freezing; one reading does not establish treatment needs.';
      sourceUrl = APPENDIX;
    } else if (temperatureF < 15) {
      explanation = 'For pavement below 15°F and steady or falling, FHWA describes limits on chemical use and discusses plowing for snow or abrasives for icing; the trend is unknown here.';
      sourceUrl = APPENDIX;
    } else if (condition === 'snow') {
      explanation = 'FHWA discusses plowing before treatment and choosing chemical form using pavement temperature trend and surface moisture; these details and snowfall intensity are missing here.';
    } else if (condition === 'frost') {
      explanation = 'FHWA’s frost guidance also depends on dew point, traffic, and pavement temperature trend, which are not supplied here.';
      sourceUrl = APPENDIX;
    } else {
      explanation = 'FHWA distinguishes freezing rain from existing ice and considers precipitation intensity, temperature trend, and chemical form; this combined condition cannot identify a matching rate.';
      sourceUrl = APPENDIX;
    }
    return Object.freeze({
      message: NO_RATE + ' ' + explanation,
      sourceUrl,
      sourceLabel: sourceUrl === APPENDIX ? 'FHWA Appendix C, tables 8–12 ↗' : 'FHWA anti-icing practices ↗'
    });
  }

  return Object.freeze({ getGuidance });
}));
