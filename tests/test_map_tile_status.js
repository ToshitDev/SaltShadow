'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

const source = readFileSync(require.resolve('../app.js'), 'utf8');
const marker = "document.addEventListener('DOMContentLoaded', init);";
assert.ok(source.includes(marker), 'Expected the dashboard initialization marker.');

const testCode = source.replace(marker, 'globalThis.tileAvailabilityState = tileAvailabilityState;');
const browser = {};
vm.runInNewContext(testCode, browser);

const availability = browser.tileAvailabilityState;
assert.equal(availability(1, 0, false), 'AVAILABLE', 'A newly loaded tile clears a total-outage state.');
assert.equal(availability(3, 1, true), 'PARTIAL', 'Successful and failed requests produce a partial warning.');
assert.equal(availability(0, 2, false), 'OFFLINE', 'Only failed tiles with no successful imagery remain unavailable.');
assert.equal(availability(0, 2, true), 'PARTIAL', 'Previously rendered successful imagery prevents a false total-outage warning.');
assert.equal(availability(0, 0, true), 'AVAILABLE', 'Cached successful imagery clears a stale outage warning.');
assert.equal(availability(0, 0, false), 'PENDING', 'No result yet is neither available nor an outage.');

console.log('Map tile status tests passed.');
