/* SaltShadow's deterministic, material-only scenario calculator. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SaltEngine = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LIMITS = Object.freeze({
    laneMiles: 100000,
    applicationRate: 50000,
    pricePerShortTon: 100000
  });

  function requireFinite(name, value, min, max) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(name + ' must be a finite number.');
    }
    if (value < min || value > max) {
      throw new RangeError(name + ' must be between ' + min + ' and ' + max + '.');
    }
    return value;
  }

  function calculate(laneMiles, applicationRate, reductionPercent, pricePerShortTon) {
    const miles = requireFinite('Treated lane miles', laneMiles, 0, LIMITS.laneMiles);
    const rate = requireFinite('Salt application rate', applicationRate, 0, LIMITS.applicationRate);
    const reduction = requireFinite('Reduction percentage', reductionPercent, 0, 100);
    const price = requireFinite('Salt price per US short ton', pricePerShortTon, 0, LIMITS.pricePerShortTon);

    const baselineSaltLb = miles * rate;
    const scenarioSaltLb = baselineSaltLb * (1 - reduction / 100);
    const saltSavedLb = baselineSaltLb - scenarioSaltLb;
    const costSavedUsd = (saltSavedLb / 2000) * price;

    return Object.freeze({
      baselineSaltLb,
      scenarioSaltLb,
      saltSavedLb,
      costSavedUsd
    });
  }

  return Object.freeze({ calculate, LIMITS });
}));
