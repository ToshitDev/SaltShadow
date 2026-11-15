'use strict';
const assert = require('node:assert/strict');
const SaltEngine = require('../engine.js');
const fs = require('node:fs');
const vm = require('node:vm');

// Normal scenario and required acceptance calculation.
const normal = SaltEngine.calculate(6, 250, 20, 105);
assert.equal(normal.baselineSaltLb, 1500);
assert.equal(normal.scenarioSaltLb, 1200);
assert.equal(normal.saltSavedLb, 300);
assert.equal(normal.costSavedUsd, 15.75);

// 0% reduction keeps all salt applied and saves no material cost.
const zero = SaltEngine.calculate(6, 250, 0, 105);
assert.equal(zero.scenarioSaltLb, 1500);
assert.equal(zero.saltSavedLb, 0);
assert.equal(zero.costSavedUsd, 0);

// 100% reduction is arithmetic only, never a safety recommendation.
const full = SaltEngine.calculate(6, 250, 100, 105);
assert.equal(full.scenarioSaltLb, 0);
assert.equal(full.saltSavedLb, 1500);
assert.equal(full.costSavedUsd, 78.75);

// Invalid input cannot yield NaN, Infinity, or a negative salt amount.
assert.throws(() => SaltEngine.calculate(-1, 250, 20, 105), RangeError);
assert.throws(() => SaltEngine.calculate(6, Infinity, 20, 105), TypeError);
assert.throws(() => SaltEngine.calculate(6, 250, 101, 105), RangeError);

// US short-ton conversion: 2,000 lb at $105/short ton saves exactly $105.
const conversion = SaltEngine.calculate(8, 250, 100, 105);
assert.equal(conversion.saltSavedLb, 2000);
assert.equal(conversion.costSavedUsd, 105);

// Additional input validation tests.
assert.throws(() => SaltEngine.calculate("6", 250, 20, 105), TypeError);
assert.throws(() => SaltEngine.calculate(6, NaN, 20, 105), TypeError);
assert.throws(() => SaltEngine.calculate(6, 250, -10, 105), RangeError);
assert.throws(() => SaltEngine.calculate(6, 250, 20, -5), RangeError);
assert.throws(() => SaltEngine.calculate(100001, 250, 20, 105), RangeError);
assert.throws(() => SaltEngine.calculate(6, 50001, 20, 105), RangeError);


 // Test fractional distance, reduction, and price.
const fractional = SaltEngine.calculate(2.5, 200, 12.5, 80.5);
assert.equal(fractional.baselineSaltLb, 500);
assert.equal(fractional.scenarioSaltLb, 437.5);
assert.equal(fractional.saltSavedLb, 62.5);
assert.equal(fractional.costSavedUsd, 2.515625);

// Test a fractional salt application rate.
const decimalRate = SaltEngine.calculate(2, 250.5, 50, 100);
assert.equal(decimalRate.baselineSaltLb, 501);
assert.equal(decimalRate.scenarioSaltLb, 250.5);
assert.equal(decimalRate.saltSavedLb, 250.5);


 // Test zero lane miles.
const noRoad = SaltEngine.calculate(0, 250, 20, 105);
assert.equal(noRoad.baselineSaltLb, 0);
assert.equal(noRoad.scenarioSaltLb, 0);
assert.equal(noRoad.saltSavedLb, 0);
assert.equal(noRoad.costSavedUsd, 0);

// Test zero salt application.
const noSalt = SaltEngine.calculate(6, 0, 20, 105);
assert.equal(noSalt.baselineSaltLb, 0);
assert.equal(noSalt.saltSavedLb, 0);
assert.equal(noSalt.costSavedUsd, 0);

// Test zero material price.
const freeSalt = SaltEngine.calculate(6, 250, 20, 0);
assert.equal(freeSalt.saltSavedLb, 300);
assert.equal(freeSalt.costSavedUsd, 0);

// Test exact maximum allowed inputs.
const maximum = SaltEngine.calculate(100000, 50000, 100, 100000);
assert.equal(maximum.baselineSaltLb, 5000000000);
assert.equal(maximum.scenarioSaltLb, 0);
assert.equal(maximum.saltSavedLb, 5000000000);
assert.equal(maximum.costSavedUsd, 250000000000);

// Test salt balance and cost consistency.
for (const [miles, rate, reduction, price] of [
  [6, 250, 20, 105],
  [2.5, 200, 12.5, 80.5],
  [4, 175, 33, 95]
]) {
  const result = SaltEngine.calculate(miles, rate, reduction, price);

  assert.ok(Math.abs(result.baselineSaltLb -
    result.scenarioSaltLb - result.saltSavedLb) < 0.000001);

  assert.ok(Math.abs(result.costSavedUsd -
    (result.saltSavedLb / 2000) * price) < 0.000001);
}

// Doubling reduction should double the savings.
const twenty = SaltEngine.calculate(6, 250, 20, 105);
const forty = SaltEngine.calculate(6, 250, 40, 105);

assert.equal(forty.saltSavedLb, twenty.saltSavedLb * 2);
assert.equal(forty.costSavedUsd, twenty.costSavedUsd * 2);

// Test the calculator without Node.js module imports.
const browser = {};

vm.runInNewContext(
  fs.readFileSync(require.resolve('../engine.js'), 'utf8'),
  browser
);

assert.equal(typeof browser.SaltEngine.calculate, 'function');

const browserResult = browser.SaltEngine.calculate(6, 250, 20, 105);
assert.equal(browserResult.baselineSaltLb, 1500);
assert.equal(browserResult.scenarioSaltLb, 1200);
assert.equal(browserResult.saltSavedLb, 300);
assert.equal(browserResult.costSavedUsd, 15.75);

// Small positive reductions should not become zero.
const tiny = SaltEngine.calculate(6, 250, 1e-15, 105);
assert.ok(tiny.saltSavedLb > 0);
assert.ok(tiny.costSavedUsd > 0);

console.log('SaltEngine tests passed.');