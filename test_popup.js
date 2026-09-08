/**
 * Test Suite for Popup UI and Logic (popup/popup.js)
 */

const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('   RUNNING POPUP UI & LOGIC TEST SUITE              ');
console.log('====================================================\n');

class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  contains(c) { return this.classes.has(c); }
  has(c) { return this.classes.has(c); }
}

// Mock DOM elements for Popup
class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = { ...attributes };
    this.children = [];
    this.parentNode = null;
    this.classList = new MockClassList();
    this.style = {};
    this._textContent = '';
    this.value = '';
    this.selectedIndex = 0;
    this.checked = false;
    this._listeners = {};
    this.dataset = {};
  }

  get options() {
    return this.children.filter(c => c.tagName === 'OPTION');
  }

  get textContent() { return this._textContent; }
  set textContent(val) { this._textContent = String(val); }

  get className() { return Array.from(this.classList.classes).join(' '); }
  set className(val) {
    this.classList.classes.clear();
    String(val).split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
  }

  get innerHTML() { return this._innerHTML || ''; }
  set innerHTML(val) {
    this._innerHTML = String(val);
    if (val === '') {
      this.children = [];
    }
  }

  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, val) { this.attributes[name] = String(val); }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  addEventListener(type, cb) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(cb);
  }

  dispatchEvent(event) {
    event.target = this;
    if (this._listeners[event.type]) {
      this._listeners[event.type].forEach(cb => cb(event));
    }
    return true;
  }

  click() {
    this.dispatchEvent({ type: 'click' });
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector) {
    const matches = [];
    function traverse(node) {
      if (!node || !node.children) return;
      for (const child of node.children) {
        if (selector.startsWith('.') && child.classList.has(selector.slice(1))) {
          matches.push(child);
        } else if (selector.startsWith('#') && child.getAttribute('id') === selector.slice(1)) {
          matches.push(child);
        } else if (child.tagName.toLowerCase() === selector.toLowerCase()) {
          matches.push(child);
        }
        traverse(child);
      }
    }
    traverse(this);
    return matches;
  }
}

// Elements map
const elementsById = {};
function createEl(tag, id, classes = []) {
  const el = new MockElement(tag, { id });
  classes.forEach(c => el.classList.add(c));
  elementsById[id] = el;
  return el;
}

// Build Popup DOM tree according to popup.html
const root = new MockElement('div');
createEl('input', 'toggle-enabled');
createEl('span', 'saved-count-badge');
createEl('div', 'active-channel-card');
createEl('div', 'no-video-card');
createEl('h2', 'active-channel-name');
createEl('span', 'active-channel-handle');
createEl('div', 'active-channel-avatar');
createEl('span', 'current-speed-value');
createEl('input', 'speed-slider');
createEl('button', 'btn-speed-minus');
createEl('button', 'btn-speed-plus');
createEl('button', 'reset-channel-btn');
createEl('input', 'channel-search-input');
createEl('div', 'saved-channels-list');
createEl('div', 'no-saved-channels');
createEl('button', 'clear-all-btn');
const defaultSpeedSelect = createEl('select', 'setting-default-speed');
['0.5', '0.75', '1', '1.25', '1.5', '1.75', '2', '2.25', '2.5'].forEach(val => {
  const opt = new MockElement('option', { value: val });
  opt.value = val;
  opt.textContent = val + 'x';
  defaultSpeedSelect.appendChild(opt);
});

createEl('input', 'setting-show-toast');
const toastDurationSelect = createEl('select', 'setting-toast-duration');
['1000', '2000', '3000'].forEach(val => {
  const opt = new MockElement('option', { value: val });
  opt.value = val;
  opt.textContent = val + 'ms';
  toastDurationSelect.appendChild(opt);
});

createEl('button', 'btn-export-data');
createEl('input', 'file-import-data');

// Tabs
const tabCurrent = new MockElement('button');
tabCurrent.classList.add('nav-tab', 'active');
tabCurrent.dataset.tab = 'tab-current';

const tabSaved = new MockElement('button');
tabSaved.classList.add('nav-tab');
tabSaved.dataset.tab = 'tab-saved';

const tabSettings = new MockElement('button');
tabSettings.classList.add('nav-tab');
tabSettings.dataset.tab = 'tab-settings';

const paneCurrent = createEl('section', 'tab-current', ['tab-pane', 'active']);
const paneSaved = createEl('section', 'tab-saved', ['tab-pane']);
const paneSettings = createEl('section', 'tab-settings', ['tab-pane']);

// Preset buttons
const presets = ['0.75', '1.0', '1.25', '1.5', '1.75', '2.0'].map(spd => {
  const b = new MockElement('button');
  b.classList.add('preset-btn');
  b.dataset.speed = spd;
  root.appendChild(b);
  return b;
});

root.appendChild(tabCurrent);
root.appendChild(tabSaved);
root.appendChild(tabSettings);
root.appendChild(paneCurrent);
root.appendChild(paneSaved);
root.appendChild(paneSettings);

for (const id in elementsById) {
  root.appendChild(elementsById[id]);
}

// Global Mocks for Popup
const mockStorageData = {
  channel_speeds: {
    '@veritasium': { id: '@veritasium', name: 'Veritasium', speed: 1.75, updatedAt: 1000 },
    '@3blue1brown': { id: '@3blue1brown', name: '3Blue1Brown', speed: 1.25, updatedAt: 2000 },
  },
  extension_settings: {
    enabled: true,
    defaultSpeed: 1.0,
    showToast: true,
    toastDuration: 2000,
  }
};

global.window = {
  SpeedStorage: require('./src/utils/storage.js'),
  URL: {
    createObjectURL: () => 'blob:dummy',
    revokeObjectURL: () => {},
  }
};

global.document = {
  getElementById: (id) => elementsById[id] || null,
  querySelector: (sel) => {
    if (sel.startsWith('#')) return elementsById[sel.slice(1)] || null;
    return root.querySelector(sel);
  },
  querySelectorAll: (sel) => {
    if (sel === '.nav-tab') return [tabCurrent, tabSaved, tabSettings];
    if (sel === '.tab-pane') return [paneCurrent, paneSaved, paneSettings];
    if (sel === '.preset-btn') return presets;
    return root.querySelectorAll(sel);
  },
  createElement: (tag) => new MockElement(tag),
  addEventListener: (event, cb) => {
    if (event === 'DOMContentLoaded') global.__domContentLoaded = cb;
  }
};

global.chrome = {
  storage: {
    local: {
      get: (keys, cb) => {
        let result = {};
        if (typeof keys === 'string') result = { [keys]: mockStorageData[keys] };
        else if (Array.isArray(keys)) keys.forEach(k => result[k] = mockStorageData[k]);
        else result = { ...mockStorageData };
        if (typeof cb === 'function') cb(result);
        return Promise.resolve(result);
      },
      set: (data, cb) => {
        Object.assign(mockStorageData, data);
        if (typeof cb === 'function') cb();
        return Promise.resolve();
      }
    }
  },
  tabs: {
    query: async () => [{ id: 101, url: 'https://www.youtube.com/watch?v=video1' }],
    sendMessage: (tabId, msg, cb) => {
      const callback = typeof cb === 'function' ? cb : () => {};
      if (msg.action === 'GET_PAGE_STATUS') {
        callback({
          isWatchPage: true,
          channel: { id: '@veritasium', name: 'Veritasium' },
          currentSpeed: 1.75,
          settings: mockStorageData.extension_settings
        });
      } else if (msg.action === 'APPLY_CHANNEL_SPEED') {
        callback({ success: true, speed: msg.speed });
      } else if (msg.action === 'RESET_CHANNEL_SPEED') {
        callback({ success: true, defaultSpeed: 1.0 });
      } else {
        callback({ success: true });
      }
    }
  },
  runtime: {
    lastError: null
  }
};

async function testPopup() {
  console.log('1. Loading popup script...');
  require('./popup/popup.js');
  assert.ok(global.__domContentLoaded, 'DOMContentLoaded listener must be registered');
  await global.__domContentLoaded();
  await new Promise(r => setTimeout(r, 100));

  // Verify Active Channel View
  console.log('2. Verifying active YouTube channel display in popup...');
  assert.strictEqual(elementsById['active-channel-name'].textContent, 'Veritasium');
  assert.strictEqual(elementsById['active-channel-handle'].textContent, '@veritasium');
  assert.strictEqual(elementsById['current-speed-value'].textContent, '1.75');
  assert.strictEqual(elementsById['active-channel-card'].style.display, 'block');
  console.log('  ✔ Active channel correctly identified as Veritasium at 1.75x');

  // Verify Preset Speed Click
  console.log('\n3. Testing preset speed button click (2.0x)...');
  const btn2x = presets.find(b => b.dataset.speed === '2.0');
  btn2x.click();
  await new Promise(r => setTimeout(r, 100));
  assert.strictEqual(elementsById['current-speed-value'].textContent, '2');
  let saved = await window.SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(saved, 2.0);
  console.log('  ✔ Clicking preset 2.0x successfully updated speed and storage.');

  // Verify Stepper Button Click (-)
  console.log('\n4. Testing stepper decrement (-0.05x)...');
  elementsById['btn-speed-minus'].click();
  await new Promise(r => setTimeout(r, 100));
  assert.strictEqual(elementsById['current-speed-value'].textContent, '1.95');
  saved = await window.SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(saved, 1.95);
  console.log('  ✔ Stepper decrement accurately updated speed to 1.95x.');

  // Verify Saved Channels List & Badge
  console.log('\n5. Verifying saved channels list and badge count...');
  assert.strictEqual(elementsById['saved-count-badge'].textContent, '2');
  const savedList = elementsById['saved-channels-list'];
  assert.strictEqual(savedList.children.length, 2);
  console.log('  ✔ Saved channels badge correctly shows 2 channels.');

  // Verify Search Filter
  console.log('\n6. Testing channel search filtering...');
  elementsById['channel-search-input'].value = '3blue';
  elementsById['channel-search-input'].dispatchEvent({ type: 'input' });
  assert.strictEqual(savedList.children.length, 1);
  const filteredItem = savedList.children[0];
  const nameEl = filteredItem.querySelector('.channel-item-name');
  assert.strictEqual(nameEl.textContent, '3Blue1Brown');
  console.log('  ✔ Search correctly filtered list to 3Blue1Brown.');

  // Reset Search
  elementsById['channel-search-input'].value = '';
  elementsById['channel-search-input'].dispatchEvent({ type: 'input' });
  assert.strictEqual(savedList.children.length, 2);

  // Verify Reset Channel Button
  console.log('\n7. Testing reset active channel speed...');
  elementsById['reset-channel-btn'].click();
  await new Promise(r => setTimeout(r, 100));
  saved = await window.SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(saved, null, 'Veritasium should be removed from saved speeds on reset');
  console.log('  ✔ Reset button removed custom speed from storage.');

  // Verify Master Toggle
  console.log('\n8. Testing master enabled toggle switch...');
  elementsById['toggle-enabled'].checked = false;
  elementsById['toggle-enabled'].dispatchEvent({ type: 'change' });
  await new Promise(r => setTimeout(r, 100));
  let settings = await window.SpeedStorage.getSettings();
  assert.strictEqual(settings.enabled, false);
  console.log('  ✔ Master toggle updated extension settings.');

  // 9. Verify Default Playback Speed Dropdown Saving
  console.log('\n9. Testing default speed dropdown change and persistence...');
  elementsById['setting-default-speed'].value = '1.75';
  elementsById['setting-default-speed'].dispatchEvent({ type: 'change' });
  await new Promise(r => setTimeout(r, 100));
  settings = await window.SpeedStorage.getSettings();
  assert.strictEqual(settings.defaultSpeed, 1.75, 'Default speed must be saved as 1.75 in storage');
  console.log('  ✔ Default playback speed dropdown successfully saved to storage.');

  // 10. Verify Option Selection for integer speeds (e.g. 2.0x, 1.0x)
  console.log('\n10. Testing dropdown option selection for 2.0x...');
  elementsById['setting-default-speed'].value = '2';
  elementsById['setting-default-speed'].dispatchEvent({ type: 'change' });
  await new Promise(r => setTimeout(r, 100));
  settings = await window.SpeedStorage.getSettings();
  assert.strictEqual(settings.defaultSpeed, 2.0, 'Default speed must be saved as 2.0 in storage');
  console.log('  ✔ Integer speeds (2.0x, 1.0x) correctly saved and parsed.');

  console.log('\n====================================================');
  console.log('🎉 ALL POPUP TESTS PASSED WITH 100% SUCCESS!        ');
  console.log('====================================================\n');
}

testPopup().catch(err => {
  console.error('❌ Popup test failed:', err);
  process.exit(1);
});
