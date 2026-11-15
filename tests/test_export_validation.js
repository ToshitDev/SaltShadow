
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const SaltEngine = require('../engine.js');

// Load the real app without starting its browser interface.
const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const marker = "document.addEventListener('DOMContentLoaded', init);";
assert.ok(source.includes(marker));

const testCode = source.replace(marker, 'globalThis.runExport = buildBrief;');

const defaults = {
  'lane-miles': '6',
  'application-rate': '250',
  'reduction-percent': '20',
  'price-per-ton': '105'
};

const fields = {};
for (const [id, value] of Object.entries(defaults)) {
  fields[id] = { value };
}

fields['case-name'] = { textContent: 'Princeton storm' };
fields['export-status'] = { textContent: '', dataset: {} };

let downloads = 0;

const browser = {
  SaltEngine,
  Blob,
  document: {
    getElementById: id => fields[id],
    createElement: () => ({
      click: () => downloads++,
      remove: () => {}
    }),
    body: { append: () => {} }
  },
  window: {
    clearTimeout: () => {},
    setTimeout: () => {}
  },
  URL: {
    createObjectURL: () => 'blob:test',
    revokeObjectURL: () => {}
  }
};

vm.runInNewContext(testCode, browser);

// Empty inputs must never create a report.
for (const id of Object.keys(defaults)) {
  fields[id].value = '';
  browser.runExport();

  assert.equal(downloads, 0, id + ' allowed an invalid export');
  assert.match(fields['export-status'].textContent, /Cannot export/i);

  fields[id].value = defaults[id];
}

// Valid inputs should still allow exporting.
browser.runExport();
assert.equal(downloads, 1);

console.log('Decision brief validation tests passed.');
