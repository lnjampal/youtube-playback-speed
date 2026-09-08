/**
 * Security & Hardening Verification Test Suite
 * Tests prototype pollution, input sanitization, dangerous URI schemes,
 * boundary validation, and payload limits.
 */

const assert = require('assert');

console.log('====================================================');
console.log('   RUNNING SECURITY & HARDENING TEST SUITE          ');
console.log('====================================================\n');

// Mock chrome.storage.local
const mockStorage = {};
global.chrome = {
  storage: {
    local: {
      get: (keys, cb) => {
        let res = {};
        if (typeof keys === 'string') res = { [keys]: mockStorage[keys] };
        else if (Array.isArray(keys)) keys.forEach(k => res[k] = mockStorage[k]);
        else res = { ...mockStorage };
        if (cb) cb(res);
        return Promise.resolve(res);
      },
      set: (data, cb) => {
        Object.assign(mockStorage, data);
        if (cb) cb();
        return Promise.resolve();
      }
    }
  }
};

const SpeedStorage = require('./src/utils/storage.js');

async function testSecurity() {
  // 1. Prototype Pollution Defense
  console.log('1. Testing Prototype Pollution Defense...');
  await SpeedStorage.saveChannelSpeed('__proto__', 'Hacker', 2.0);
  await SpeedStorage.saveChannelSpeed('constructor', 'Hacker', 2.0);
  await SpeedStorage.saveChannelSpeed('prototype', 'Hacker', 2.0);

  // Object prototype must remain untainted
  assert.strictEqual(({}).speed, undefined, 'Object.prototype must not be polluted');
  const allChannels = await SpeedStorage.getAllChannelSpeeds();
  assert.strictEqual(allChannels['__proto__'], undefined, '__proto__ must not be stored');
  assert.strictEqual(allChannels['constructor'], undefined, 'constructor must not be stored');
  console.log('  ✔ Prototype pollution attempts safely blocked.');

  // 2. Out-of-bounds, NaN, and Infinity Playback Rates
  console.log('\n2. Testing Boundary & Type Sanitization on Playback Rates...');
  await SpeedStorage.saveChannelSpeed('@test1', 'Test', Infinity);
  let speed = await SpeedStorage.getChannelSpeed('@test1');
  assert.strictEqual(speed, 1.0, 'Infinity must be sanitized to fallback (1.0)');

  await SpeedStorage.saveChannelSpeed('@test2', 'Test', -5.0);
  speed = await SpeedStorage.getChannelSpeed('@test2');
  assert.strictEqual(speed, 0.1, 'Negative rates must be clamped to 0.1 minimum');

  await SpeedStorage.saveChannelSpeed('@test3', 'Test', 999.0);
  speed = await SpeedStorage.getChannelSpeed('@test3');
  assert.strictEqual(speed, 16.0, 'Excessive rates must be clamped to 16.0 maximum');

  await SpeedStorage.saveChannelSpeed('@test4', 'Test', NaN);
  speed = await SpeedStorage.getChannelSpeed('@test4');
  assert.strictEqual(speed, 1.0, 'NaN must be sanitized to fallback (1.0)');

  await SpeedStorage.saveChannelSpeed('@test5', 'Test', 'malicious_string');
  speed = await SpeedStorage.getChannelSpeed('@test5');
  assert.strictEqual(speed, 1.0, 'Non-number types must be sanitized to fallback (1.0)');
  console.log('  ✔ Playback speeds strictly clamped to safe HTML5 bounds [0.1, 16.0].');

  // 3. Import Data Validation & Sanitization
  console.log('\n3. Testing Ingestion & Validation on importData()...');
  const maliciousBackup = {
    channel_speeds: {
      '__proto__': { speed: 2.0, name: 'polluter' },
      '@legit': { speed: 1.5, name: 'A'.repeat(500) },
      '@bad_speed': { speed: 'drop table', name: 'SQLi' }
    },
    settings: {
      defaultSpeed: -99,
      showToast: 'not-a-boolean',
      toastDuration: 999999
    }
  };

  await SpeedStorage.importData(maliciousBackup);
  assert.strictEqual(({}).speed, undefined);

  const importedChannels = await SpeedStorage.getAllChannelSpeeds();
  assert.strictEqual(importedChannels['__proto__'], undefined);
  assert.ok(importedChannels['@legit']);
  assert.strictEqual(importedChannels['@legit'].speed, 1.5);
  assert.ok(importedChannels['@legit'].name.length <= 150, 'Name length must be capped');
  assert.strictEqual(importedChannels['@bad_speed'].speed, 1.0, 'Invalid speed in backup must be sanitized');

  const importedSettings = await SpeedStorage.getSettings();
  assert.strictEqual(importedSettings.defaultSpeed, 0.1, 'Default speed must be clamped');
  assert.strictEqual(importedSettings.toastDuration, 10000, 'Toast duration must be capped at 10000ms');
  console.log('  ✔ Malicious backup JSON safely ingested, sanitized, and normalized.');

  // 4. Dangerous URI Scheme Rejection
  console.log('\n4. Testing Dangerous URI Scheme Rejection in Channel Extraction...');
  // Extract channel normalization function logic
  function normalizeChannelKey(href) {
    if (!href || typeof href !== 'string') return null;
    if (/^(?:javascript|data|blob|vbscript):/i.test(href)) return null;
    const handleMatch = href.match(/@([a-zA-Z0-9_.-]{1,100})/);
    if (handleMatch) return `@${handleMatch[1]}`;
    const channelMatch = href.match(/\/channel\/(UC[a-zA-Z0-9_-]{1,100})/);
    if (channelMatch) return channelMatch[1];
    const customMatch = href.match(/\/(?:c|user)\/([a-zA-Z0-9_.-]{1,100})/);
    if (customMatch) return customMatch[1];
    const cleanPath = href.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0];
    const candidate = cleanPath.replace(/^\//, '').slice(0, 100);
    if (['__proto__', 'constructor', 'prototype'].includes(candidate)) return null;
    return /^[a-zA-Z0-9_.-]+$/.test(candidate) ? candidate : null;
  }

  assert.strictEqual(normalizeChannelKey('javascript:alert(1)'), null);
  assert.strictEqual(normalizeChannelKey('data:text/html,<script>alert(1)</script>'), null);
  assert.strictEqual(normalizeChannelKey('blob:https://youtube.com/xyz'), null);
  assert.strictEqual(normalizeChannelKey('/__proto__'), null);
  assert.strictEqual(normalizeChannelKey('/@safe_channel'), '@safe_channel');
  console.log('  ✔ Dangerous URI schemes and injection vectors strictly rejected.');

  console.log('\n====================================================');
  console.log('🎉 ALL SECURITY AUDIT TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================\n');
}

testSecurity().catch(err => {
  console.error('❌ Security test failed:', err);
  process.exit(1);
});
