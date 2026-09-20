/**
 * Automated Test Suite for PRO Licensing & Gumroad Integration
 */
const assert = require('assert');
const path = require('path');

// Mock chrome.storage.local
const mockStorage = {};
global.chrome = {
  storage: {
    local: {
      get: (keys, callback) => {
        if (typeof keys === 'string') {
          callback({ [keys]: mockStorage[keys] });
        } else if (Array.isArray(keys)) {
          const res = {};
          keys.forEach(k => res[k] = mockStorage[k]);
          callback(res);
        } else {
          callback({ ...mockStorage });
        }
      },
      set: (items, callback) => {
        Object.assign(mockStorage, items);
        if (callback) callback();
      },
    },
  },
};

// Load SpeedStorage and LicenseManager
const SpeedStorage = require('./src/utils/storage.js');
global.SpeedStorage = SpeedStorage;
global.window = { SpeedStorage };

const LicenseManager = require('./src/utils/license.js');

async function runTests() {
  console.log('====================================================');
  console.log('   RUNNING PRO LICENSING & GUMROAD TEST SUITE       ');
  console.log('====================================================\n');

  // Test 1: Initial state is Free Tier
  console.log('1. Verifying initial Free Tier status...');
  let settings = await SpeedStorage.getSettings();
  assert.strictEqual(settings.isPro, false, 'Default isPro must be false');
  assert.strictEqual(settings.autoCloseLiveChat, false, 'Default autoCloseLiveChat must be false');
  assert.strictEqual(settings.licenseKey, '', 'Default licenseKey must be empty string');
  
  let isPro = await LicenseManager.isProUser(settings);
  assert.strictEqual(isPro, false, 'isProUser must return false for initial settings');
  console.log('  ✔ Initial Free Tier state verified.\n');

  // Test 2: Invalid license keys rejected
  console.log('2. Testing invalid license key handling...');
  const emptyRes = await LicenseManager.activateLicense('');
  assert.strictEqual(emptyRes.success, false, 'Empty key must fail');

  const whitespaceRes = await LicenseManager.activateLicense('   ');
  assert.strictEqual(whitespaceRes.success, false, 'Whitespace key must fail');

  const nullRes = await LicenseManager.activateLicense(null);
  assert.strictEqual(nullRes.success, false, 'Null key must fail');
  console.log('  ✔ Empty/invalid key inputs safely rejected.\n');

  // Test 3: Activate using built-in developer test key
  console.log('3. Testing offline developer test key activation (PRO-TRIAL-2026)...');
  const activateRes = await LicenseManager.activateLicense('PRO-TRIAL-2026');
  assert.strictEqual(activateRes.success, true, 'PRO-TRIAL-2026 should successfully activate');
  assert.strictEqual(activateRes.license.isPro, true, 'License object must reflect isPro = true');
  assert.strictEqual(activateRes.license.provider, 'dev_test');

  // Verify stored settings
  settings = await SpeedStorage.getSettings();
  assert.strictEqual(settings.isPro, true, 'Storage isPro must be true after activation');
  assert.strictEqual(settings.licenseKey, 'PRO-TRIAL-2026', 'Storage licenseKey must be saved');

  isPro = await LicenseManager.isProUser();
  assert.strictEqual(isPro, true, 'isProUser must now return true');
  console.log('  ✔ PRO-TRIAL-2026 test key activated and persisted successfully.\n');

  // Test 4: Enable Auto-Close Live Chat setting under Pro
  console.log('4. Testing Auto-Close Live Chat setting persistence...');
  await SpeedStorage.updateSettings({ autoCloseLiveChat: true });
  settings = await SpeedStorage.getSettings();
  assert.strictEqual(settings.autoCloseLiveChat, true, 'autoCloseLiveChat must be true');
  console.log('  ✔ autoCloseLiveChat setting verified.\n');

  // Test 5: Deactivate license
  console.log('5. Testing Pro license deactivation...');
  const deactivateRes = await LicenseManager.deactivateLicense();
  assert.strictEqual(deactivateRes, true, 'deactivateLicense should return true');

  settings = await SpeedStorage.getSettings();
  assert.strictEqual(settings.isPro, false, 'Storage isPro must be false after deactivation');
  assert.strictEqual(settings.licenseKey, '', 'Storage licenseKey must be cleared');
  assert.strictEqual(settings.autoCloseLiveChat, false, 'autoCloseLiveChat must reset to false on deactivation');

  isPro = await LicenseManager.isProUser();
  assert.strictEqual(isPro, false, 'isProUser must return false after deactivation');
  console.log('  ✔ Deactivation cleans up license and Pro features properly.\n');

  console.log('====================================================');
  console.log('🎉 ALL PRO LICENSING TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
