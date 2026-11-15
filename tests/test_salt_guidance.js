'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const { getGuidance } = require('../salt-guidance.js');
const noRate = 'No verified application rate available for these conditions.';

// Even plausible conditions cannot establish a matching published rate with
// only temperature and a broad road-condition category.
for (const condition of ['snow', 'ice', 'frost', 'unknown', 'unsupported']) {
  for (const temperature of [-100, 14.9, 15, 20, 28, 32, 32.1, 100, NaN, Infinity, null, '', '28']) {
    const guidance = getGuidance(temperature, condition);
    assert.ok(guidance.message.startsWith(noRate));
    assert.match(guidance.sourceUrl, /^https:\/\/www\.fhwa\.dot\.gov\//);
    assert.doesNotMatch(guidance.message, /\b\d+(?:\.\d+)?\s*(?:lb|kg|gal)\b|guaranteed safe|\bSAFE\b/);
  }
}
assert.match(getGuidance(NaN, 'snow').message, /temperature is unknown/);
assert.match(getGuidance(28, 'unknown').message, /Road condition is unknown/);
assert.match(getGuidance(28, 'unsupported').message, /Road condition is unknown/);
assert.match(getGuidance(28, 'snow').message, /plowing before treatment/);
assert.match(getGuidance(28, 'frost').message, /dew point, traffic/);
assert.match(getGuidance(28, 'ice').message, /distinguishes freezing rain from existing ice/);
assert.match(getGuidance(14, 'snow').message, /steady or falling/);
assert.match(getGuidance(14, 'frost').message, /trend is unknown/);
assert.match(getGuidance(40, 'snow').message, /one reading does not establish treatment needs/);

// The same guidance API is available to the buildless browser app.
const browser = {};
vm.runInNewContext(readFileSync(require.resolve('../salt-guidance.js'), 'utf8'), browser);
assert.equal(browser.SaltGuidance.getGuidance(28, 'snow').message, getGuidance(28, 'snow').message);
console.log('Salt guidance tests passed (unknown, unsupported, temperature boundaries, and browser API).');
