/**
 * Comprehensive Integration & Simulation Test Suite
 * Tests storage, content script, main-world sync, navigation, ad handling,
 * auto-reset protection, HUD toast rendering, and popup UI interactions.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('   RUNNING COMPLETE INTEGRATION TEST SUITE          ');
console.log('====================================================\n');

// 1. Setup Mock Browser Environment
class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  contains(c) { return this.classes.has(c); }
}

class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = { ...attributes };
    this.children = [];
    this.parentNode = null;
    this.classList = new MockClassList();
    this.style = {};
    this.textContent = '';
    this.innerHTML = '';
    this._listeners = {};
    this.dataset = {};
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  addEventListener(type, cb, options) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(cb);
  }

  removeEventListener(type, cb) {
    if (this._listeners[type]) {
      this._listeners[type] = this._listeners[type].filter(l => l !== cb);
    }
  }

  dispatchEvent(event) {
    event.target = this;
    if (this._listeners[event.type]) {
      this._listeners[event.type].forEach(cb => cb(event));
    }
    return true;
  }

  querySelector(selector) {
    return querySelectorMock(this, selector);
  }

  querySelectorAll(selector) {
    return querySelectorAllMock(this, selector);
  }
}

class MockVideoElement extends MockElement {
  constructor() {
    super('video');
    this.playbackRate = 1.0;
  }
}

// Simple selector matcher for mock DOM
function querySelectorMock(root, selector) {
  const all = querySelectorAllMock(root, selector);
  return all.length > 0 ? all[0] : null;
}

function querySelectorAllMock(root, selector) {
  const matches = [];
  function traverse(node) {
    if (!node || !node.children) return;
    for (const child of node.children) {
      if (matchesSelector(child, selector)) {
        matches.push(child);
      }
      traverse(child);
    }
  }
  traverse(root);
  return matches;
}

function matchesSelector(el, selector) {
  if (selector.startsWith('#')) {
    const id = selector.slice(1);
    return el.getAttribute('id') === id;
  }
  if (selector.startsWith('.')) {
    const cls = selector.slice(1);
    return el.classList.contains(cls);
  }
  if (selector === 'video' || selector === 'video.html5-main-video') {
    return el.tagName === 'VIDEO';
  }
  if (selector.includes('a[href*="/@"]')) {
    return el.tagName === 'A' && (el.getAttribute('href') || '').includes('/@');
  }
  if (selector.includes('a')) {
    return el.tagName === 'A';
  }
  return false;
}

// Global Mocks
const mockStorageData = {};
global.chrome = {
  storage: {
    local: {
      get: (keys, cb) => {
        let result = {};
        if (typeof keys === 'string') {
          result = { [keys]: mockStorageData[keys] };
        } else if (Array.isArray(keys)) {
          keys.forEach(k => result[k] = mockStorageData[k]);
        } else {
          result = { ...mockStorageData };
        }
        if (typeof cb === 'function') {
          cb(result);
        }
        return Promise.resolve(result);
      },
      set: (data, cb) => {
        Object.assign(mockStorageData, data);
        if (typeof cb === 'function') {
          cb();
        }
        return Promise.resolve();
      }
    }
  },
  runtime: {
    onInstalled: { addListener: (cb) => { global.__onInstalledListener = cb; } },
    onMessage: { addListener: (cb) => { global.__contentMessageListener = cb; } },
    sendMessage: (msg, cb) => { if (cb) cb(); }
  },
  tabs: {
    query: async () => [{ id: 1, url: 'https://www.youtube.com/watch?v=video1' }],
    sendMessage: (tabId, msg, cb) => {
      if (global.__contentMessageListener) {
        return global.__contentMessageListener(msg, {}, cb);
      }
      if (cb) cb();
    }
  }
};

global.window = {
  location: {
    href: 'https://www.youtube.com/watch?v=video1',
    pathname: '/watch',
    search: '?v=video1',
  },
  addEventListener: (type, cb) => {
    if (!global.__windowListeners) global.__windowListeners = {};
    if (!global.__windowListeners[type]) global.__windowListeners[type] = [];
    global.__windowListeners[type].push(cb);
  },
  dispatchEvent: (event) => {
    if (global.__windowListeners && global.__windowListeners[event.type]) {
      global.__windowListeners[event.type].forEach(cb => cb(event));
    }
  },
  CustomEvent: class {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail || {};
    }
  },
  Event: class {
    constructor(type) {
      this.type = type;
    }
  },
  MouseEvent: class {
    constructor(type) {
      this.type = type;
    }
  }
};

global.document = new MockElement('document');
document.body = new MockElement('body');
document.head = new MockElement('head');
document.documentElement = new MockElement('html');
document.documentElement.appendChild(document.head);
document.documentElement.appendChild(document.body);
document.createElement = (tag) => new MockElement(tag);
document.getElementById = (id) => {
  return querySelectorMock(document.documentElement, `#${id}`);
};
document.querySelector = (sel) => {
  return querySelectorMock(document.documentElement, sel);
};
document.querySelectorAll = (sel) => {
  return querySelectorAllMock(document.documentElement, sel);
};
document.addEventListener = window.addEventListener;
document.dispatchEvent = window.dispatchEvent;

global.MutationObserver = class {
  constructor(cb) { this.cb = cb; }
  observe() {}
  disconnect() {}
};

async function testAll() {
  // -------------------------------------------------------------
  // TEST 1: Background Service Worker Initialization
  // -------------------------------------------------------------
  console.log('TEST 1: Background Service Worker Initialization...');
  require('./src/background.js');
  assert.ok(global.__onInstalledListener, 'Background script must register onInstalled listener');
  await global.__onInstalledListener({ reason: 'install' });
  assert.ok(mockStorageData.extension_settings, 'Must seed extension_settings on install');
  assert.strictEqual(mockStorageData.extension_settings.enabled, true);
  console.log('  ✔ Background worker correctly initialized default settings.');

  // -------------------------------------------------------------
  // TEST 2: Main World Script & Movie Player Synchronization
  // -------------------------------------------------------------
  console.log('\nTEST 2: Main World Script & Player Synchronization...');
  // Setup player in mock DOM
  const moviePlayer = new MockElement('div', { id: 'movie_player' });
  const videoEl = new MockVideoElement();
  moviePlayer.appendChild(videoEl);
  document.body.appendChild(moviePlayer);

  let moviePlayerRate = 1.0;
  moviePlayer.setPlaybackRate = (r) => { moviePlayerRate = r; };
  moviePlayer.getPlaybackRate = () => moviePlayerRate;

  require('./src/main-world.js');

  // Dispatch custom set speed event
  window.dispatchEvent(new window.CustomEvent('yt-channel-speed:set', { detail: { speed: 1.75 } }));
  assert.strictEqual(moviePlayerRate, 1.75, 'Movie player rate should be synced to 1.75');
  assert.strictEqual(videoEl.playbackRate, 1.75, 'Video element rate should be synced to 1.75');
  console.log('  ✔ Main world script successfully synced #movie_player and video element.');

  // -------------------------------------------------------------
  // TEST 3: Content Script - Channel Extraction & Navigation
  // -------------------------------------------------------------
  console.log('\nTEST 3: Content Script - Channel Detection & Speed Persistence...');
  // Add channel element to DOM
  const ownerEl = new MockElement('div', { id: 'owner' });
  const channelNameEl = new MockElement('div', { id: 'channel-name' });
  const channelLink = new MockElement('a', { href: '/@veritasium' });
  channelLink.textContent = 'Veritasium';
  channelNameEl.appendChild(channelLink);
  ownerEl.appendChild(channelNameEl);
  document.body.appendChild(ownerEl);

  // Reset video playbackRate to 1.0
  videoEl.playbackRate = 1.0;

  // Load storage into window
  const SpeedStorage = require('./src/utils/storage.js');
  window.SpeedStorage = SpeedStorage;

  // Load content script
  require('./src/content.js');
  // Wait for initial handlePageChange() and the 600ms navigation settle lock
  await new Promise(r => setTimeout(r, 750));

  // Verify that setting speed with user gesture triggers saving
  console.log('  -> Simulating user clicking and pressing Shift+> to set 1.75x...');
  window.dispatchEvent(new window.MouseEvent('click'));
  videoEl.playbackRate = 1.75;
  videoEl.dispatchEvent(new window.Event('ratechange'));
  await new Promise(r => setTimeout(r, 150));

  let saved = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(saved, 1.75, 'Speed 1.75 must be saved for @veritasium');
  console.log('  ✔ Channel speed 1.75x successfully saved for @veritasium!');

  // -------------------------------------------------------------
  // TEST 4: Auto-Reset Protection (Guarding against YouTube resetting to 1.0)
  // -------------------------------------------------------------
  console.log('\nTEST 4: Auto-Reset Protection against YouTube player resets...');
  // Wait 3.5 seconds so lastUserInteractionTime is considered old (> 3000ms)
  await new Promise(r => setTimeout(r, 3100));

  // YouTube resets to 1.0 WITHOUT any user click
  videoEl.playbackRate = 1.0;
  videoEl.dispatchEvent(new window.Event('ratechange'));
  await new Promise(r => setTimeout(r, 150));

  // The saved speed must NOT be overwritten!
  saved = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(saved, 1.75, 'Auto-reset must NOT overwrite 1.75x in storage!');
  assert.strictEqual(videoEl.playbackRate, 1.75, 'Extension must re-assert 1.75x on the video element!');
  console.log('  ✔ Auto-reset protection successfully preserved saved channel speed and re-applied it!');

  // -------------------------------------------------------------
  // TEST 5: Switching to Channel 2 (3Blue1Brown)
  // -------------------------------------------------------------
  console.log('\nTEST 5: Channel Switching & Automatic Pickup...');
  // Switch URL and channel link to Channel 2
  window.location.href = 'https://www.youtube.com/watch?v=video2';
  window.location.search = '?v=video2';
  channelLink.setAttribute('href', '/@3blue1brown');
  channelLink.textContent = '3Blue1Brown';

  // Save 1.25x for 3Blue1Brown in storage
  await SpeedStorage.saveChannelSpeed('@3blue1brown', '3Blue1Brown', 1.25);

  // Trigger SPA navigation finish
  document.dispatchEvent(new window.Event('yt-navigate-finish'));
  await new Promise(r => setTimeout(r, 750));

  assert.strictEqual(videoEl.playbackRate, 1.25, 'Video must automatically pick up 1.25x for 3Blue1Brown!');
  console.log('  ✔ Successfully switched channels and automatically picked up 1.25x!');

  // Switch back to Veritasium
  console.log('  -> Switching back to Veritasium (expecting 1.75x)...');
  window.location.href = 'https://www.youtube.com/watch?v=video1';
  window.location.search = '?v=video1';
  channelLink.setAttribute('href', '/@veritasium');
  channelLink.textContent = 'Veritasium';

  document.dispatchEvent(new window.Event('yt-navigate-finish'));
  await new Promise(r => setTimeout(r, 750));

  assert.strictEqual(videoEl.playbackRate, 1.75, 'Video must automatically pick up 1.75x for Veritasium!');
  console.log('  ✔ Switching back to Veritasium automatically applied 1.75x!');

  // -------------------------------------------------------------
  // TEST 6: Ad State Handling
  // -------------------------------------------------------------
  console.log('\nTEST 6: Ad State Handling...');
  // Ad starts playing
  moviePlayer.classList.add('ad-showing');
  videoEl.playbackRate = 1.0;
  videoEl.dispatchEvent(new window.Event('ratechange'));
  await new Promise(r => setTimeout(r, 50));

  saved = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(saved, 1.75, 'Rate changes during ads must be ignored');
  console.log('  ✔ Ad playback did not corrupt channel speed.');

  // Ad finishes
  moviePlayer.classList.remove('ad-showing');

  // -------------------------------------------------------------
  // TEST 7: Extension Runtime Messaging (Popup -> Content Script)
  // -------------------------------------------------------------
  console.log('\nTEST 7: Extension Runtime Messaging...');
  let pageStatus = null;
  global.__contentMessageListener({ action: 'GET_PAGE_STATUS' }, {}, (res) => {
    pageStatus = res;
  });
  assert.ok(pageStatus);
  assert.strictEqual(pageStatus.channel.id, '@veritasium');
  assert.strictEqual(pageStatus.channel.name, 'Veritasium');
  console.log('  ✔ Popup message GET_PAGE_STATUS returned active channel details.');

  // Apply speed via message
  let applyRes = null;
  await new Promise((resolve) => {
    global.__contentMessageListener({ action: 'APPLY_CHANNEL_SPEED', speed: 2.0 }, {}, (res) => {
      applyRes = res;
      resolve();
    });
  });
  assert.ok(applyRes.success);
  assert.strictEqual(videoEl.playbackRate, 2.0);
  saved = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(saved, 2.0);
  console.log('  ✔ APPLY_CHANNEL_SPEED successfully updated player and storage.');

  // Reset speed via message
  let resetRes = null;
  global.__contentMessageListener({ action: 'RESET_CHANNEL_SPEED' }, {}, (res) => {
    resetRes = res;
  });
  await new Promise(r => setTimeout(r, 50));
  assert.ok(resetRes.success);
  saved = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(saved, null, 'Reset must remove channel from storage');
  assert.strictEqual(videoEl.playbackRate, 1.0, 'Video element must reset to default 1.0x');
  console.log('  ✔ RESET_CHANNEL_SPEED successfully reset speed to default.');

  // -------------------------------------------------------------
  // TEST 8: Channel Handle & UC Channel ID Alias Resolution
  // -------------------------------------------------------------
  console.log('\nTEST 8: Channel Handle & UC Channel ID Alias Resolution...');
  // Save with handle and alias
  await SpeedStorage.saveChannelSpeed('@mkbhd', 'Marques Brownlee', 1.75, ['UCBJycsmduvYEL83R_U4JriQ']);
  
  // Lookup via handle
  const handleSpeed = await SpeedStorage.getChannelSpeed('@mkbhd');
  assert.strictEqual(handleSpeed, 1.75, 'Lookup via handle must return 1.75');

  // Lookup via UC channel ID alias
  const ucSpeed = await SpeedStorage.getChannelSpeed('UCBJycsmduvYEL83R_U4JriQ');
  assert.strictEqual(ucSpeed, 1.75, 'Lookup via UC channel ID alias must return 1.75');

  // Switch page to URL using only /channel/UCBJycsmduvYEL83R_U4JriQ
  channelLink.setAttribute('href', '/channel/UCBJycsmduvYEL83R_U4JriQ');
  channelLink.textContent = 'Marques Brownlee';
  document.dispatchEvent(new window.Event('yt-navigate-finish'));
  await new Promise(r => setTimeout(r, 750));

  assert.strictEqual(videoEl.playbackRate, 1.75, 'Video element must pick up 1.75x via UC channel ID alias!');
  console.log('  ✔ Seamless alias resolution between @handles and UC channel IDs verified!');

  // -------------------------------------------------------------
  // TEST 9: Prevention of Cross-Channel Setting Pollution on Navigation
  // -------------------------------------------------------------
  console.log('\nTEST 9: Cross-Channel Setting Isolation During Video Load...');
  // Ensure Veritasium is saved at 1.75x
  await SpeedStorage.saveChannelSpeed('@veritasium', 'Veritasium', 1.75);

  // User starts navigating to a new channel (e.g. Kurzgesagt)
  document.dispatchEvent(new window.Event('yt-navigate-start'));
  
  // While navigating, the video element resets rate to 1.0 (internal YouTube player behavior)
  videoEl.playbackRate = 1.0;
  videoEl.dispatchEvent(new window.Event('ratechange'));
  await new Promise(r => setTimeout(r, 100));

  // Verify Veritasium was NOT overwritten with 1.0
  const vSpeed = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(vSpeed, 1.75, 'Veritasium speed must NOT be overwritten by video loading ratechange!');

  // Now finish navigation to Kurzgesagt
  window.location.href = 'https://www.youtube.com/watch?v=kurz1';
  window.location.search = '?v=kurz1';
  channelLink.setAttribute('href', '/@kurzgesagt');
  channelLink.textContent = 'Kurzgesagt';
  document.dispatchEvent(new window.Event('yt-navigate-finish'));
  await new Promise(r => setTimeout(r, 750));

  // User explicitly sets Kurzgesagt to 2.25x
  window.dispatchEvent(new window.MouseEvent('click'));
  videoEl.playbackRate = 2.25;
  videoEl.dispatchEvent(new window.Event('ratechange'));
  await new Promise(r => setTimeout(r, 150));

  // Verify Kurzgesagt is 2.25x
  const kSpeed = await SpeedStorage.getChannelSpeed('@kurzgesagt');
  assert.strictEqual(kSpeed, 2.25, 'Kurzgesagt must be saved at 2.25x');

  // Verify Veritasium is STILL 1.75x and was not polluted
  const vSpeedAfter = await SpeedStorage.getChannelSpeed('@veritasium');
  assert.strictEqual(vSpeedAfter, 1.75, 'Veritasium must remain untouched at 1.75x after Kurzgesagt speed change!');
  console.log('  ✔ Cross-channel isolation confirmed: new video loads cannot corrupt previous channel settings!');

  console.log('\n====================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!  ');
  console.log('====================================================');
}

testAll().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
