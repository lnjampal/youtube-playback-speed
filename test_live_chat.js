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
    this.classList = new Set();
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
    return true;
  }
  if (s.startsWith('ytd-live-chat-frame')) {
    if (el.tagName !== 'YTD-LIVE-CHAT-FRAME') return false;
    if (s.includes('#chat')) return el.attrs.id === 'chat';
    return true;
  }
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
    'button[aria-label*="Hide chat" i]',
  ];

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
      if (chatFrame.hasAttribute('collapsed')) {
        hasAutoClosedLiveChatForThisVideo = true;
        return;
      }

      for (const sel of HIDE_CHAT_SELECTORS) {
        const btn = document.querySelector(sel);
        if (btn && typeof btn.click === 'function') {
          btn.click();
          hasAutoClosedLiveChatForThisVideo = true;
          return;
        }
      }
    }
  }

  function userManuallyShowsChat() {
    const chatFrame = document.querySelector('ytd-live-chat-frame#chat, #chat');
    if (chatFrame) {
      chatFrame.removeAttribute('collapsed');
    }
    // Note: hasAutoClosedLiveChatForThisVideo remains TRUE, so auto-close will NOT re-trigger!
  }

  return {
    onNewVideo,
    triggerAutoClose,
    userManuallyShowsChat,
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

  console.log('====================================================');
  console.log('🎉 ALL LIVE CHAT AUTO-CLOSE TESTS PASSED (100%)!   ');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
