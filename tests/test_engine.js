'use strict';
const assert = require('node:assert/strict');
const SaltEngine = require('../engine.js');

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

console.log('SaltEngine tests passed.');
