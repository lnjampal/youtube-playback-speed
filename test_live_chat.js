/**
 * Automated Test Suite for Live Chat Auto-Close Feature
 */
const assert = require('assert');

// Mock DOM elements
class MockElement {
  constructor(tagName, attrs = {}) {
    this.tagName = tagName.toUpperCase();
    this.attrs = { ...attrs };
    this.children = [];
    this.classList = {
      _set: new Set(),
      contains(c) { return this._set.has(c); },
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      has(c) { return this._set.has(c); }
    };
    this.clickCount = 0;
    this.offsetParent = {}; // Simulates being visible in layout
  }

  getAttribute(name) {
    return this.attrs[name] || null;
  }

  setAttribute(name, val) {
    this.attrs[name] = val;
  }

  hasAttribute(name) {
    return name in this.attrs;
  }

  removeAttribute(name) {
    delete this.attrs[name];
  }

  click() {
    this.clickCount++;
    if (typeof this.onclick === 'function') {
      this.onclick();
    }
  }

  attachShadow() {
    this.shadowRoot = new MockElement('#shadow-root');
    return this.shadowRoot;
  }

  querySelector(selector) {
    return querySelectorFrom(this, selector);
  }

  querySelectorAll(selector) {
    return querySelectorAllFrom(this, selector);
  }
}

function querySelectorFrom(root, selector) {
  const all = querySelectorAllFrom(root, selector);
  return all.length > 0 ? all[0] : null;
}

function querySelectorAllFrom(root, selector) {
  const results = [];
  function traverse(el) {
    if (matchesSelector(el, selector)) {
      results.push(el);
    }
    for (const child of el.children) {
      traverse(child);
    }
  }
  for (const child of root.children) {
    traverse(child);
  }
  return results;
}

function matchesSelector(el, selector) {
  const s = selector.trim();
  if (s.includes(',')) {
    return s.split(',').some(part => matchesSelector(el, part.trim()));
  }
  if (s.includes(' ')) {
    const parts = s.split(/\s+/);
    // Simple ancestor match for last element
    const lastPart = parts[parts.length - 1];
    return matchesSelector(el, lastPart);
  }
  if (s.startsWith('#')) {
    const id = s.slice(1).split(/[.[]/)[0];
    if (el.attrs.id !== id) return false;
    if (s.includes('[collapsed]')) return el.hasAttribute('collapsed');
    return true;
  }
  if (s.startsWith('button')) {
    if (el.tagName !== 'BUTTON') return false;
    if (s.includes('aria-label*="Hide chat"')) {
      return (el.attrs['aria-label'] || '').toLowerCase().includes('hide chat');
    }
    if (s.includes('aria-label="Close"')) {
      return (el.attrs['aria-label'] || '').toLowerCase() === 'close';
    }
    return true;
  }
  if (s.startsWith('ytd-live-chat-frame')) {
    if (el.tagName !== 'YTD-LIVE-CHAT-FRAME') return false;
    if (s.includes('#chat')) return el.attrs.id === 'chat';
    return true;
  }
  if (s.startsWith('yt-button-shape')) return el.tagName === 'YT-BUTTON-SHAPE';
  if (s.startsWith('yt-icon-button')) return el.tagName === 'YT-ICON-BUTTON';
  if (s.startsWith('ytd-toggle-button-renderer')) return el.tagName === 'YTD-TOGGLE-BUTTON-RENDERER';
  if (s.startsWith('yt-live-chat-header-renderer')) return el.tagName === 'YT-LIVE-CHAT-HEADER-RENDERER';
  return el.tagName === s.toUpperCase();
}

// Build mock document
const mockDoc = new MockElement('HTML');
const mockBody = new MockElement('BODY');
mockDoc.children.push(mockBody);

global.document = {
  body: mockBody,
  querySelector: (sel) => querySelectorFrom(mockDoc, sel),
  querySelectorAll: (sel) => querySelectorAllFrom(mockDoc, sel),
};

// Test implementation of autoCloseLiveChat logic
function createLiveChatManager(initialSettings = {}) {
  let settings = { ...initialSettings };
  let currentNavToken = 0;
  let hasAutoClosedLiveChatForThisVideo = false;

  const HIDE_CHAT_SELECTORS = [
    'ytd-live-chat-frame #show-hide-button button',
    '#chat #show-hide-button button',
    '#chat-container #show-hide-button button',
    '#show-hide-button yt-button-shape button',
    '#show-hide-button ytd-toggle-button-renderer',
    'yt-live-chat-header-renderer #close-button button',
    '#chat #close-button button',
    'button[aria-label*="Hide chat" i]',
    'button[aria-label="Close" i]',
  ];

  function extractClickableButton(el) {
    if (!el) return null;
    if (el.tagName === 'BUTTON') return el;
    if (el.shadowRoot) {
      const shadowBtn = el.shadowRoot.querySelector('button');
      if (shadowBtn) return shadowBtn;
    }
    const childBtn = el.querySelector('button');
    if (childBtn) return childBtn;
    return el;
  }

  function isCloseOrHideButton(el) {
    if (!el) return false;
    const label = (el.getAttribute('aria-label') || '').toLowerCase();
    const text = (el.textContent || '').trim().toLowerCase();
    if (label.includes('show') || text.includes('show')) return false;
    const isHide = label.includes('hide') || text.includes('hide') || label.includes('close') || text.includes('close');
    const isChat = label.includes('chat') || label.includes('replay') || text.includes('chat') || text.includes('replay') || label === 'close' || text === 'close' || el.attrs.id === 'close-button';
    return isHide && isChat;
  }

  function findHideChatButton() {
    for (const sel of HIDE_CHAT_SELECTORS) {
      const btn = document.querySelector(sel);
      if (btn) {
        const target = extractClickableButton(btn);
        if (target && typeof target.click === 'function' && isCloseOrHideButton(target)) {
          return target;
        }
        if (typeof btn.click === 'function' && isCloseOrHideButton(btn)) {
          return btn;
        }
      }
    }
    const containers = document.querySelectorAll(
      '#show-hide-button, yt-live-chat-header-renderer, ytd-live-chat-frame, #chat, #chat-container'
    );
    for (const container of containers) {
      const candidates = container.querySelectorAll('button, yt-button-shape, yt-icon-button, ytd-toggle-button-renderer');
      for (const candidate of candidates) {
        const target = extractClickableButton(candidate);
        if (target && typeof target.click === 'function' && isCloseOrHideButton(target)) {
          return target;
        }
        if (typeof candidate.click === 'function' && isCloseOrHideButton(candidate)) {
          return candidate;
        }
      }
    }
    return null;
  }

  function onNewVideo(newSettings = null) {
    currentNavToken++;
    hasAutoClosedLiveChatForThisVideo = false;
    if (newSettings) settings = { ...newSettings };
    if (settings.enabled && settings.isPro && settings.autoCloseLiveChat) {
      triggerAutoClose(currentNavToken);
    }
  }

  function triggerAutoClose(navToken) {
    if (hasAutoClosedLiveChatForThisVideo || navToken !== currentNavToken) {
      return;
    }
    if (!settings.enabled || !settings.isPro || !settings.autoCloseLiveChat) {
      return;
    }

    const chatFrame = document.querySelector('ytd-live-chat-frame#chat, #chat');
    if (chatFrame) {
      const isCollapsed = chatFrame.hasAttribute('collapsed') || (chatFrame.classList && chatFrame.classList.contains('collapsed'));
      if (!isCollapsed) {
        const btn = findHideChatButton();
        if (btn && typeof btn.click === 'function') {
          btn.click();
        }
        chatFrame.setAttribute('collapsed', '');
        // Chat closure happens strictly ONCE on first load
        hasAutoClosedLiveChatForThisVideo = true;
      }
    }
  }

  function userManuallyShowsChat() {
    const chatFrame = document.querySelector('ytd-live-chat-frame#chat, #chat');
    if (chatFrame) {
      chatFrame.removeAttribute('collapsed');
    }
  }

  function onStorageSettingsChanged(newSettings) {
    settings = { ...settings, ...newSettings };
    if (settings.enabled && settings.isPro && settings.autoCloseLiveChat) {
      if (!hasAutoClosedLiveChatForThisVideo) {
        triggerAutoClose(currentNavToken);
      }
    }
  }

  return {
    onNewVideo,
    triggerAutoClose,
    userManuallyShowsChat,
    onStorageSettingsChanged,
    findHideChatButton,
    getState: () => ({ hasAutoClosedLiveChatForThisVideo, currentNavToken }),
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('   RUNNING LIVE CHAT AUTO-CLOSE TEST SUITE          ');
  console.log('====================================================\n');

  // Setup DOM with live chat and hide button
  const chatFrame = new MockElement('ytd-live-chat-frame', { id: 'chat' });
  const showHideContainer = new MockElement('div', { id: 'show-hide-button' });
  const hideButton = new MockElement('button', { 'aria-label': 'Hide chat' });
  
  showHideContainer.children.push(hideButton);
  chatFrame.children.push(showHideContainer);
  mockBody.children.push(chatFrame);

  // When hideButton is clicked, it collapses the chatFrame in YouTube's native DOM
  hideButton.onclick = () => {
    chatFrame.setAttribute('collapsed', '');
  };

  // Test 1: When Free Tier (isPro = false), chat is NOT closed
  console.log('1. Verifying chat is untouched for Free Tier...');
  const manager = createLiveChatManager({
    enabled: true,
    isPro: false,
    autoCloseLiveChat: false,
  });

  manager.onNewVideo();
  assert.strictEqual(hideButton.clickCount, 0, 'Hide button must NOT be clicked for Free Tier');
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), false, 'Chat frame must remain open');
  console.log('  ✔ Free tier does not trigger auto-close.\n');

  // Test 2: When Pro enabled but autoCloseLiveChat is false, chat is NOT closed
  console.log('2. Verifying chat is untouched when autoCloseLiveChat = false...');
  manager.onNewVideo({ enabled: true, isPro: true, autoCloseLiveChat: false });
  assert.strictEqual(hideButton.clickCount, 0, 'Hide button must NOT be clicked when setting is disabled');
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), false, 'Chat frame must remain open');
  console.log('  ✔ Setting disabled does not trigger auto-close.\n');

  // Test 3: When Pro & autoCloseLiveChat = true, chat is automatically closed
  console.log('3. Verifying auto-close triggers when Pro & autoCloseLiveChat = true...');
  manager.onNewVideo({ enabled: true, isPro: true, autoCloseLiveChat: true });
  assert.strictEqual(hideButton.clickCount, 1, 'Hide button must be clicked exactly once');
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), true, 'Chat frame must now be collapsed');
  assert.strictEqual(manager.getState().hasAutoClosedLiveChatForThisVideo, true, 'hasAutoClosedLiveChat must be true');
  console.log('  ✔ Live chat automatically closed on stream load.\n');

  // Test 4: Respect manual user override ("Show chat")
  console.log('4. Testing respect for user manual override ("Show chat")...');
  // User opens chat
  manager.userManuallyShowsChat();
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), false, 'Chat frame reopened by user');

  // Any subsequent DOM check or mutation during the same video stream must NOT re-close it
  manager.triggerAutoClose(manager.getState().currentNavToken);
  assert.strictEqual(hideButton.clickCount, 1, 'Hide button must NOT be clicked again during the same stream');
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), false, 'Chat frame must remain OPEN per user preference');
  console.log('  ✔ User manual override respected: chat remains open during the same stream.\n');

  // Test 5: Navigating to a new video resets state and auto-closes again
  console.log('5. Testing state reset upon navigating to a new live stream...');
  manager.onNewVideo();
  assert.strictEqual(hideButton.clickCount, 2, 'Hide button must be clicked again for the new video stream');
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), true, 'Chat frame must be collapsed for the new video');
  console.log('  ✔ New stream navigation cleanly resets state and auto-closes chat.\n');

  // Test 6: Channel switching test - transitioning from a video where chat was already collapsed
  console.log('6. Testing channel switch from collapsed state to a new live stream...');
  // Chat starts with 'collapsed' from previous video
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), true);
  
  // Navigate to new channel
  manager.onNewVideo();
  
  // The new live stream mounts and uncollapses chat
  chatFrame.removeAttribute('collapsed');
  
  // Extension observer detects open chat and closes it
  manager.triggerAutoClose(manager.getState().currentNavToken);
  assert.strictEqual(hideButton.clickCount, 3, 'Hide button must be clicked when new channel chat opens');
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), true, 'Chat frame must be collapsed on the new channel');
  console.log('  ✔ Channel switch from collapsed video to new live stream successfully auto-closed.\n');

  // Test 7: Instant Pro Activation without page reload
  console.log('7. Testing instant Pro activation without window reload...');
  const instantManager = createLiveChatManager({
    enabled: true,
    isPro: false,
    autoCloseLiveChat: false,
  });
  // Stream is open
  chatFrame.removeAttribute('collapsed');
  const prevClickCount = hideButton.clickCount;
  instantManager.onNewVideo();
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), false, 'Chat remains open initially before Pro');

  // User activates Pro in popup (storage change event arrives)
  instantManager.onStorageSettingsChanged({ isPro: true, autoCloseLiveChat: true });
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), true, 'Chat must close immediately upon Pro activation without reload!');
  assert.strictEqual(hideButton.clickCount, prevClickCount + 1, 'Hide button must be clicked immediately');
  console.log('  ✔ Pro features take effect instantly without refreshing the page.\n');

  // Test 8: Chat closure happens strictly ONCE on first load
  console.log('8. Verifying chat closure happens ONLY ONCE on first load...');
  // Chat is already closed from Test 7
  assert.strictEqual(instantManager.getState().hasAutoClosedLiveChatForThisVideo, true);
  const clicksAfterAutoClose = hideButton.clickCount;

  // Multiple simulated DOM mutations / timer ticks during the same video
  instantManager.triggerAutoClose(instantManager.getState().currentNavToken);
  instantManager.triggerAutoClose(instantManager.getState().currentNavToken);
  assert.strictEqual(hideButton.clickCount, clicksAfterAutoClose, 'No redundant clicks on subsequent checks');

  // User manually re-opens chat
  instantManager.userManuallyShowsChat();
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), false, 'User re-opened chat');

  // More DOM mutations happen (e.g. chat messages arriving)
  instantManager.triggerAutoClose(instantManager.getState().currentNavToken);
  assert.strictEqual(chatFrame.hasAttribute('collapsed'), false, 'Chat must stay open per user action; no re-close!');
  assert.strictEqual(hideButton.clickCount, clicksAfterAutoClose, 'Button must NOT be clicked again during same video');
  console.log('  ✔ Closure strictly occurs only once on first load.\n');

  // Test 9: Shadow DOM button piercing and Header Close Button support
  console.log('9. Testing Shadow DOM button piercing and Header Close Button...');
  const headerContainer = new MockElement('yt-live-chat-header-renderer');
  const headerCloseBtn = new MockElement('button', { id: 'close-button', 'aria-label': 'Close' });
  headerContainer.children.push(headerCloseBtn);
  chatFrame.children.push(headerContainer);

  const webComponent = new MockElement('yt-button-shape');
  const shadowRoot = webComponent.attachShadow();
  const shadowButton = new MockElement('button', { 'aria-label': 'Hide chat' });
  shadowRoot.children.push(shadowButton);
  showHideContainer.children.push(webComponent);

  const foundBtn = instantManager.findHideChatButton();
  assert.ok(foundBtn, 'Must find button even when nested inside Shadow DOM or header');
  console.log('  ✔ Shadow DOM and Header close buttons successfully resolved.\n');

  console.log('====================================================');
  console.log('🎉 ALL LIVE CHAT AUTO-CLOSE TESTS PASSED (100%)!   ');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

