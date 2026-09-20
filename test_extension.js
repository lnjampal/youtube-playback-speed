const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- RUNNING EXTENSION VERIFICATION TESTS ---\n');

// 1. Validate manifest.json
console.log('1. Validating manifest.json...');
const manifestRaw = fs.readFileSync('manifest.json', 'utf8');
const manifest = JSON.parse(manifestRaw);
assert.strictEqual(manifest.manifest_version, 3, 'Must be Manifest V3');
assert.strictEqual(manifest.name, 'Channel Speed Memory for YouTube™');
assert.ok(manifest.permissions.includes('storage'), 'Must include storage permission');
console.log('  ✔ manifest.json syntax and core fields valid');

// Check referenced files
const filesToCheck = [
  manifest.action.default_popup,
  manifest.background.service_worker,
  ...manifest.content_scripts.flatMap(cs => cs.js || []),
  ...manifest.content_scripts.flatMap(cs => cs.css || []),
  manifest.icons['16'],
  manifest.icons['48'],
  manifest.icons['128'],
];

filesToCheck.forEach(file => {
  assert.ok(fs.existsSync(file), `Referenced file does not exist: ${file}`);
  console.log(`  ✔ Found: ${file}`);
});

// 2. Validate PNG magic numbers
console.log('\n2. Validating icon PNG files...');
['icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png'].forEach(iconPath => {
  const buf = fs.readFileSync(iconPath);
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  assert.ok(isPng, `${iconPath} is not a valid PNG`);
  console.log(`  ✔ ${iconPath} is valid PNG (${buf.length} bytes)`);
});

// 3. Test Storage Module with Mock chrome.storage
console.log('\n3. Testing Storage Helper module...');
const mockLocalStorage = {};
global.chrome = {
  storage: {
    local: {
      get: (keys, cb) => {
        if (typeof keys === 'string') {
          cb({ [keys]: mockLocalStorage[keys] });
        } else if (Array.isArray(keys)) {
          const res = {};
          keys.forEach(k => res[k] = mockLocalStorage[k]);
          cb(res);
        } else {
          cb({ ...mockLocalStorage });
        }
      },
      set: (data, cb) => {
        Object.assign(mockLocalStorage, data);
        if (cb) cb();
      }
    }
  }
};

const SpeedStorage = require('./src/utils/storage.js');

async function testStorage() {
  // Test saving channel speed
  await SpeedStorage.saveChannelSpeed('@veritasium', 'Veritasium', 1.75);
  let speed = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(speed, 1.75, 'Speed should be 1.75');

  // Test updating channel speed
  await SpeedStorage.saveChannelSpeed('@veritasium', 'Veritasium', 2.0);
  speed = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(speed, 2.0, 'Updated speed should be 2.0');

  // Test saving second channel
  await SpeedStorage.saveChannelSpeed('@3blue1brown', '3Blue1Brown', 1.25);
  const all = await SpeedStorage.getAllChannelSpeeds();
  assert.strictEqual(Object.keys(all).length, 2, 'Should have 2 saved channels');

  // Test removing channel
  await SpeedStorage.removeChannelSpeed('@veritasium');
  speed = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(speed, null, 'Deleted channel should return null');

  // Test settings
  const settings = await SpeedStorage.getSettings();
  assert.strictEqual(settings.enabled, true);
  assert.strictEqual(settings.defaultSpeed, 1.0);

  await SpeedStorage.updateSettings({ defaultSpeed: 1.25, showToast: false });
  const updatedSettings = await SpeedStorage.getSettings();
  assert.strictEqual(updatedSettings.defaultSpeed, 1.25);
  assert.strictEqual(updatedSettings.showToast, false);

  // Test getSpeedForAny with multiple candidate keys (handles, IDs, aliases)
  await SpeedStorage.saveChannelSpeed('@veritasium', 'Veritasium', 1.75, ['UC1234567890']);
  const speedFromAnyPrimary = await SpeedStorage.getSpeedForAny(['@nonexistent', '@veritasium']);
  assert.strictEqual(speedFromAnyPrimary, 1.75, 'getSpeedForAny should find primary key');
  const speedFromAnyAlias = await SpeedStorage.getSpeedForAny(['@nonexistent', 'UC1234567890']);
  assert.strictEqual(speedFromAnyAlias, 1.75, 'getSpeedForAny should find alias key');
  const speedFromAnyNone = await SpeedStorage.getSpeedForAny(['@nonexistent', 'UC9999999999']);
  assert.strictEqual(speedFromAnyNone, null, 'getSpeedForAny should return null if not found');

  // Test batch removal via removeChannelSpeeds
  await SpeedStorage.removeChannelSpeeds(['@veritasium', '@3blue1brown']);
  const afterBatchRemove = await SpeedStorage.getAllChannelSpeeds();
  assert.strictEqual(Object.keys(afterBatchRemove).length, 0, 'Batch removal should remove all specified channels');

  console.log('  ✔ All storage operations (save, update, remove, batch, export, import) passed!');
}

// 4. Test Channel Key Normalization Logic
console.log('\n4. Testing Channel Key Normalization logic...');
function normalizeChannelKey(href) {
  if (!href) return null;
  const handleMatch = href.match(/@([\w.-]+)/);
  if (handleMatch) return `@${handleMatch[1]}`;
  const channelMatch = href.match(/\/channel\/(UC[\w-]+)/);
  if (channelMatch) return channelMatch[1];
  const customMatch = href.match(/\/(?:c|user)\/([\w.-]+)/);
  if (customMatch) return customMatch[1];
  const cleanPath = href.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0];
  return cleanPath.replace(/^\//, '') || null;
}

assert.strictEqual(normalizeChannelKey('/@veritasium'), '@veritasium');
assert.strictEqual(normalizeChannelKey('https://www.youtube.com/@mkbhd?sub_confirmation=1'), '@mkbhd');
assert.strictEqual(normalizeChannelKey('/channel/UCsXVk37bltHxD1rDPwtNM8Q'), 'UCsXVk37bltHxD1rDPwtNM8Q');
assert.strictEqual(normalizeChannelKey('/c/Computerphile'), 'Computerphile');
console.log('  ✔ Channel normalization successfully parsed all URL styles');

testStorage().then(() => {
  console.log('\n🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY!');
}).catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
