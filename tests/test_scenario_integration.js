
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const SaltEngine = require('../engine.js');

// Load the actual case study.
const file = path.join(__dirname, '../data/case_study.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const defaults = data.scenarioDefaults;

// Verify the inputs are hypothetical and numeric.
assert.equal(defaults.status, 'ASSUMED');

const inputs = [
  defaults.laneMiles,
  defaults.rateLbPerLaneMile,
  defaults.reductionPct,
  defaults.priceUsdPerShortTon
];

inputs.forEach(value => assert.ok(Number.isFinite(value)));

// Calculate using the actual case-study defaults.
const result = SaltEngine.calculate(...inputs);

assert.equal(result.baselineSaltLb, 1500);
assert.equal(result.scenarioSaltLb, 1200);
assert.equal(result.saltSavedLb, 300);
assert.equal(result.costSavedUsd, 15.75);

console.log('Scenario integration tests passed.');
