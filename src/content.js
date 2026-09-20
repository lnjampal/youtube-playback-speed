/**
 * Content Script for YouTube Channel Playback Speed Extension
 * Runs in the ISOLATED world.
 * Observes YouTube navigation, channel changes, and video rate changes.
 */
(function () {
  'use strict';

  // State
  let currentChannel = { id: null, handle: null, channelId: null, name: null };
  let currentVideoId = null;
  let videoElement = null;
  let isNavigating = false;
  let isApplyingSpeed = false;
  let lastAppliedSpeed = null;
  let lastUserInteractionTime = 0;
  let hudElement = null;
  let hudTimeout = null;
  let adObserver = null;
  let videoObserver = null;
  let settings = {
    enabled: true,
    defaultSpeed: 1.0,
    showToast: true,
    toastDuration: 2000,
    autoCloseLiveChat: false,
    isPro: false,
    licenseKey: '',
  };

  let currentNavToken = 0;
  let hasAutoClosedLiveChatForThisVideo = false;
  let liveChatCheckTimer = null;
  let liveChatObserver = null;

  /**
   * Track user gestures (clicks, pointer, keys) to verify deliberate speed changes
   */
  function setupUserInteractionTracking() {
    const recordInteraction = (e) => {
      // If the user clicked on a navigation element (thumbnail, video card, link to /watch or /shorts),
      // this is a page navigation gesture, NOT a speed adjustment!
      if (e && e.target && typeof e.target.closest === 'function') {
        if (
          e.target.closest(
            'ytd-thumbnail, ytd-compact-video-renderer, ytd-rich-item-renderer, a[href*="/watch"], a[href*="/shorts"], a#thumbnail, #video-title'
          )
        ) {
          return;
        }
      }
      lastUserInteractionTime = Date.now();
    };

    window.addEventListener('click', recordInteraction, { capture: true, passive: true });
    window.addEventListener('pointerdown', recordInteraction, { capture: true, passive: true });
    window.addEventListener('keydown', () => {
      lastUserInteractionTime = Date.now();
    }, { capture: true, passive: true });
  }

  /**
   * Initialize settings and start listeners
   */
  async function init() {
    if (window.SpeedStorage) {
      settings = await window.SpeedStorage.getSettings();
    }

    setupUserInteractionTracking();
    setupNavigationListeners();
    setupVideoDetection();
    setupRuntimeMessaging();

    // Check if we are already on a video page on load
    if (isWatchPage()) {
      handlePageChange();
    }
  }

  /**
   * Determine if current page is a watch, live stream, or shorts page
   */
  function isWatchPage() {
    const path = window.location.pathname;
    return (
      path === '/watch' ||
      path.startsWith('/shorts/') ||
      path.startsWith('/live/') ||
      path.endsWith('/live')
    );
  }

  /**
   * Extract video ID from current URL
   */
  function getVideoId() {
    const path = window.location.pathname;
    if (path.startsWith('/shorts/')) {
      return path.split('/shorts/')[1]?.split(/[?#&]/)[0] || null;
    }
    if (path.startsWith('/live/')) {
      return path.split('/live/')[1]?.split(/[?#&]/)[0] || null;
    }
    const params = new URLSearchParams(window.location.search);
    const vParam = params.get('v');
    if (vParam) return vParam;

    // Fallback for /@channel/live: check canonical link or flexy element
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) {
      const match = canonical.href.match(/[?&]v=([^&#]+)/) || canonical.href.match(/\/live\/([^/?#&]+)/);
      if (match) return match[1];
    }
    const flexy = document.querySelector('ytd-watch-flexy');
    if (flexy && flexy.getAttribute('video-id')) {
      return flexy.getAttribute('video-id');
    }

    // Fallback for live channels (e.g. /@channel/live or /channel/UC.../live)
    if (path.endsWith('/live') || path.includes('/live/')) {
      return path;
    }

    return null;
  }

  /**
   * Setup listeners for YouTube's Single Page Application (SPA) navigation
   */
  function setupNavigationListeners() {
    // YouTube's custom navigation events
    document.addEventListener('yt-navigate-start', onNavigateStart);
    document.addEventListener('yt-navigate-finish', onNavigateFinish);
    document.addEventListener('yt-page-data-updated', onPageDataUpdated);
    window.addEventListener('popstate', onPopState);

    // Fallback: observe URL changes
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        if (isWatchPage()) {
          handlePageChange();
        } else {
          onNavigateStart();
        }
      }
    });

    urlObserver.observe(document.head || document.documentElement, {
      subtree: true,
      childList: true,
    });
  }

  function onNavigateStart() {
    currentNavToken++;
    isNavigating = true;
    lastUserInteractionTime = 0; // Crucial: clear interaction timestamp so navigation clicks are never treated as speed changes!
    currentChannel = { id: null, handle: null, channelId: null, name: null };
    currentVideoId = null;
    lastAppliedSpeed = null;
    hasAutoClosedLiveChatForThisVideo = false;
    if (liveChatCheckTimer) {
      clearTimeout(liveChatCheckTimer);
      liveChatCheckTimer = null;
    }
    if (liveChatObserver) {
      liveChatObserver.disconnect();
      liveChatObserver = null;
    }
  }

  function onNavigateFinish() {
    if (isWatchPage()) {
      handlePageChange();
    } else {
      onNavigateStart();
    }
  }

  function onPageDataUpdated() {
    if (isWatchPage()) {
      handlePageChange();
    }
  }

  function onPopState() {
    if (isWatchPage()) {
      handlePageChange();
    } else {
      onNavigateStart();
    }
  }

  /**
   * Main handler when navigation or page data indicates a video change
   */
  async function handlePageChange() {
    const newVideoId = getVideoId();
    if (!newVideoId || !isWatchPage()) {
      onNavigateStart();
      return;
    }

    const navToken = ++currentNavToken;
    isNavigating = true;
    currentVideoId = newVideoId;
    currentChannel = { id: null, handle: null, channelId: null, name: null };
    lastUserInteractionTime = 0;

    // Reset live chat auto-close state for the new video
    hasAutoClosedLiveChatForThisVideo = false;
    if (liveChatCheckTimer) {
      clearTimeout(liveChatCheckTimer);
      liveChatCheckTimer = null;
    }
    if (liveChatObserver) {
      liveChatObserver.disconnect();
      liveChatObserver = null;
    }

    // Refresh settings
    if (window.SpeedStorage) {
      settings = await window.SpeedStorage.getSettings();
    }

    if (!settings.enabled) {
      isNavigating = false;
      return;
    }

    // Attach to video element
    bindVideoElement();

    // Auto-close live chat on live streams (Pro feature)
    if (settings.enabled && settings.isPro && settings.autoCloseLiveChat) {
      triggerAutoCloseLiveChat(navToken);
    }

    // Resolve channel information specifically for THIS new video
    const channelInfo = await resolveChannelInfoWithRetry(newVideoId, navToken, 4000);

    // Abort if another navigation occurred in the meantime
    if (navToken !== currentNavToken) {
      return;
    }

    if (channelInfo && channelInfo.id) {
      currentChannel = channelInfo;
      await applySpeedForChannel(channelInfo);
    } else {
      // Could not detect channel, but on a video: apply default speed if configured
      if (settings.defaultSpeed) {
        applySpeedToPlayer(settings.defaultSpeed);
      }
    }

    // Ensure live chat auto-close is triggered if chat finished mounting during channel resolution
    if (settings.enabled && settings.isPro && settings.autoCloseLiveChat) {
      triggerAutoCloseLiveChat(navToken);
    }

    // Setup ad watcher to restore channel speed when ads end
    setupAdObserver();

    // Allow user ratechange events only after transition settles completely
    setTimeout(() => {
      if (navToken === currentNavToken) {
        isNavigating = false;
      }
    }, 600);
  }

  const HIDE_CHAT_SELECTORS = [
    'ytd-live-chat-frame #show-hide-button button',
    '#chat #show-hide-button button',
    '#chat-container #show-hide-button button',
    'ytd-watch-flexy #chat #show-hide-button ytd-toggle-button-renderer button',
    'ytd-live-chat-frame button#show-hide-button',
    '#show-hide-button yt-button-shape button',
    '#show-hide-button tp-yt-paper-button',
    '#show-hide-button ytd-button-renderer button',
    '#show-hide-button ytd-toggle-button-renderer',
    'yt-live-chat-header-renderer #close-button button',
    'ytd-live-chat-header-renderer #close-button button',
    '#chat #close-button button',
    '#chat yt-icon-button#close-button',
    'button[aria-label*="Hide chat" i]',
    'button[aria-label*="Hide live chat" i]',
    'button[aria-label*="Hide replay" i]',
    'button[aria-label="Close" i]',
  ];

  /**
   * Helper to extract a clickable button element, checking Shadow DOM if present
   */
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

  /**
   * Determine if an element is a Hide or Close chat button
   */
  function isCloseOrHideButton(el) {
    if (!el) return false;
    const label = (el.getAttribute('aria-label') || '').toLowerCase();
    const text = (el.textContent || '').trim().toLowerCase();
    if (label.includes('show') || text.includes('show')) {
      return false;
    }
    const isHide = label.includes('hide') || text.includes('hide') || label.includes('close') || text.includes('close');
    const isChat = label.includes('chat') || label.includes('replay') || text.includes('chat') || text.includes('replay') || label === 'close' || text === 'close' || el.id === 'close-button';
    return isHide && isChat;
  }

  /**
   * Resiliently locate the native YouTube "Hide chat" or "Close" button,
   * inspecting engagement panels, chat frame, header close buttons, and shadow DOM.
   */
  function findHideChatButton() {
    // 1. Check engagement panel layout (#visibility-button or #close-button in panel header)
    const engagementPanels = document.querySelectorAll(
      'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-live-chat"], ' +
      'ytd-engagement-panel-section-list-renderer[target-id*="chat"]'
    );
    for (const panel of engagementPanels) {
      const isHidden = panel.getAttribute('visibility') === 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN';
      if (!isHidden) {
        const candidates = panel.querySelectorAll(
          '#visibility-button button, #visibility-button, #header #close-button button, #header #close-button, #header yt-icon-button, #header button'
        );
        for (const candidate of candidates) {
          const target = extractClickableButton(candidate);
          if (target && typeof target.click === 'function') {
            return target;
          }
        }
      }
    }

    // 2. Check traditional live chat frame layout (#show-hide-button or header)
    const chatFrames = document.querySelectorAll('ytd-live-chat-frame#chat, #chat.ytd-watch-flexy, #chat');
    for (const chatFrame of chatFrames) {
      const isCollapsed = chatFrame.hasAttribute('collapsed') || (chatFrame.classList && chatFrame.classList.contains('collapsed'));
      if (!isCollapsed) {
        const candidates = chatFrame.querySelectorAll(
          '#show-hide-button button, #show-hide-button yt-button-shape, #show-hide-button ytd-toggle-button-renderer, #show-hide-button, #header #close-button button, #close-button'
        );
        for (const candidate of candidates) {
          const target = extractClickableButton(candidate);
          if (target && typeof target.click === 'function') {
            return target;
          }
        }
      }
    }

    // 3. Scan known selectors
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

    // 4. Scan containers (header and show-hide toggle)
    const containers = document.querySelectorAll(
      '#show-hide-button, yt-live-chat-header-renderer, ytd-live-chat-header-renderer, ytd-live-chat-frame, #chat, #chat-container'
    );
    for (const container of containers) {
      const candidates = container.querySelectorAll('button, yt-button-shape, yt-icon-button, ytd-toggle-button-renderer, tp-yt-paper-button');
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

  /**
   * Notify YouTube's layout engine to recalculate and expand the video player
   */
  function triggerPlayerExpansion() {
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new CustomEvent('yt-channel-speed:expand-video'));

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new CustomEvent('yt-channel-speed:expand-video'));
    }, 180);
  }

  /**
   * Ensure any "Open panel" or "Show chat" toggle buttons are enabled and not locked in disabled state
   */
  function enableOpenPanelButton() {
    const openButtons = document.querySelectorAll(
      'button[aria-label*="Open panel" i], button[aria-label*="Show chat" i], ' +
      'yt-button-shape button[aria-label*="Open panel" i], yt-button-shape button[aria-label*="Show chat" i], ' +
      '#show-hide-button button, ytd-button-renderer#show-hide-button button'
    );
    openButtons.forEach((b) => {
      if (b.disabled || b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true') {
        b.disabled = false;
        b.removeAttribute('disabled');
        b.setAttribute('aria-disabled', 'false');
      }
    });
  }

  /**
   * Automatically close live chat on live streams (Pro feature).
   * Runs ONLY the first time the video/stream is loaded.
   * Respects user override if they manually re-open the chat during this stream.
   */
  function triggerAutoCloseLiveChat(navToken) {
    if (hasAutoClosedLiveChatForThisVideo || navToken !== currentNavToken) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 32; // Check over ~8 seconds for late-mounting chat

    function cleanupWatcher() {
      if (liveChatCheckTimer) {
        clearTimeout(liveChatCheckTimer);
        liveChatCheckTimer = null;
      }
      if (liveChatObserver) {
        liveChatObserver.disconnect();
        liveChatObserver = null;
      }
    }

    function checkAndClose() {
      if (hasAutoClosedLiveChatForThisVideo || navToken !== currentNavToken) {
        cleanupWatcher();
        return;
      }
      if (!settings.enabled || !settings.isPro || !settings.autoCloseLiveChat) {
        return;
      }

      // 1. Check engagement panel layout
      const engagementPanel = document.querySelector(
        'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-live-chat"], ' +
        'ytd-engagement-panel-section-list-renderer[target-id*="chat"]'
      );
      const isEngagementPanelOpen = engagementPanel &&
        engagementPanel.getAttribute('visibility') !== 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN';

      // 2. Check traditional chat frame
      const chatFrame = document.querySelector('ytd-live-chat-frame#chat, #chat.ytd-watch-flexy, #chat');
      const isChatFrameOpen = chatFrame &&
        !chatFrame.hasAttribute('collapsed') &&
        !(chatFrame.classList && chatFrame.classList.contains('collapsed'));

      if (isEngagementPanelOpen || isChatFrameOpen) {
        const btn = findHideChatButton();
        let closed = false;

        if (btn && typeof btn.click === 'function') {
          btn.click();
          btn.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            composed: true, // Allows event to cross Shadow DOM boundary
            view: window,
          }));
          closed = true;
        }

        if (closed) {
          // Once closed on the first load, mark done and stop all further checks/observers
          hasAutoClosedLiveChatForThisVideo = true;
          cleanupWatcher();

          // Force layout recalculation so the video player immediately expands
          triggerPlayerExpansion();

          // Ensure the "Open panel" / "Show chat" button is enabled and not locked
          setTimeout(enableOpenPanelButton, 100);
          setTimeout(enableOpenPanelButton, 350);
          return;
        }
      }

      attempts++;
      if (attempts < maxAttempts && !hasAutoClosedLiveChatForThisVideo) {
        liveChatCheckTimer = setTimeout(checkAndClose, 250);
      } else {
        // Fallback if max attempts reached and chat still open
        if (!hasAutoClosedLiveChatForThisVideo) {
          if (engagementPanel && isEngagementPanelOpen) {
            engagementPanel.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN');
          }
          if (chatFrame && isChatFrameOpen) {
            chatFrame.setAttribute('collapsed', '');
            if ('collapsed' in chatFrame) chatFrame.collapsed = true;
          }
          enableOpenPanelButton();
          triggerPlayerExpansion();
          hasAutoClosedLiveChatForThisVideo = true;
        }
        cleanupWatcher();
      }
    }

    // Immediate check
    checkAndClose();

    // Also observe DOM in case chat iframe mounts asynchronously
    if (!hasAutoClosedLiveChatForThisVideo && typeof MutationObserver !== 'undefined') {
      if (liveChatObserver) liveChatObserver.disconnect();
      let chatCheckPending = false;
      liveChatObserver = new MutationObserver(() => {
        if (navToken !== currentNavToken || hasAutoClosedLiveChatForThisVideo) {
          cleanupWatcher();
          return;
        }
        if (chatCheckPending) return;
        chatCheckPending = true;
        setTimeout(() => {
          chatCheckPending = false;
          checkAndClose();
        }, 120);
      });

      const target = document.querySelector('ytd-watch-flexy, #columns, #primary') || document.querySelector('ytd-app') || document.body;
      if (target) {
        liveChatObserver.observe(target, { childList: true, subtree: true });
        setTimeout(() => {
          cleanupWatcher();
        }, 8000);
      }
    }
  }

  /**
   * Bind event listeners to HTML5 video element
   */
  function bindVideoElement() {
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    if (!video || video === videoElement) return;

    if (videoElement) {
      videoElement.removeEventListener('ratechange', handleVideoRateChange);
      videoElement.removeEventListener('playing', handleVideoPlaying);
    }

    videoElement = video;
    videoElement.addEventListener('ratechange', handleVideoRateChange);
    videoElement.addEventListener('playing', handleVideoPlaying);
  }

  /**
   * Watch for video element recreation or insertion (throttled)
   */
  let videoDetectionPending = false;
  function setupVideoDetection() {
    const checkVideo = () => {
      videoDetectionPending = false;
      const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
      if (video && video !== videoElement) {
        bindVideoElement();
      }
    };

    videoObserver = new MutationObserver(() => {
      if (videoDetectionPending) return;
      videoDetectionPending = true;
      setTimeout(checkVideo, 150);
    });

    const target = document.getElementById('movie_player') || document.querySelector('ytd-player') || document.body || document.documentElement;
    videoObserver.observe(target, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Check whether an ad is currently playing
   */
  function isAdPlaying() {
    const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    if (!player) return false;
    return (
      player.classList.contains('ad-showing') ||
      player.classList.contains('ad-interrupting')
    );
  }

  /**
   * Observe ad state to restore channel speed when ad ends
   */
  function setupAdObserver() {
    if (adObserver) {
      adObserver.disconnect();
      adObserver = null;
    }

    const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    if (!player) return;

    let wasAdPlaying = isAdPlaying();

    adObserver = new MutationObserver(() => {
      const currentlyPlayingAd = isAdPlaying();
      if (wasAdPlaying && !currentlyPlayingAd) {
        // Ad just finished! Restore channel speed
        if (currentChannel && currentChannel.id) {
          setTimeout(() => {
            applySpeedForChannel(currentChannel);
          }, 200);
        }
      }
      wasAdPlaying = currentlyPlayingAd;
    });

    adObserver.observe(player, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  /**
   * Re-verify speed when video starts playing
   */
  function handleVideoPlaying() {
    if (!settings.enabled || isNavigating || isApplyingSpeed || isAdPlaying()) return;

    if (currentChannel && currentChannel.id && lastAppliedSpeed !== null) {
      if (videoElement && Math.abs(videoElement.playbackRate - lastAppliedSpeed) > 0.01) {
        // Playback rate drifted (e.g. YouTube reset it on stream switch)
        applySpeedToPlayer(lastAppliedSpeed);
      }
    }
  }

  /**
   * Detect user-initiated speed changes
   */
  async function handleVideoRateChange() {
    if (!settings.enabled) return;
    if (isNavigating || isApplyingSpeed || isAdPlaying()) return;
    if (!videoElement || !currentChannel || !currentChannel.id) return;

    const newRate = Math.round(videoElement.playbackRate * 100) / 100;

    // Ignore if identical to last applied speed
    if (lastAppliedSpeed !== null && Math.abs(newRate - lastAppliedSpeed) < 0.01) {
      return;
    }

    // Check if this ratechange was accompanied by recent deliberate user interaction (click, shortcut)
    const isRecentUserAction = (Date.now() - lastUserInteractionTime) < 3000;

    if (!isRecentUserAction) {
      if (window.SpeedStorage) {
        const savedSpeed = await getChannelSavedSpeed(currentChannel);
        if (savedSpeed !== null && Math.abs(newRate - savedSpeed) > 0.01) {
          // Unprompted reset by YouTube player: re-assert user's saved speed
          applySpeedToPlayer(savedSpeed);
          return;
        }
      }
      // Not a user action: update local tracking without polluting storage
      lastAppliedSpeed = newRate;
      return;
    }

    // This is an intentional user speed change!
    lastAppliedSpeed = newRate;

    await saveChannelSpeedWithAliases(currentChannel, newRate);

    if (settings.showToast) {
      showHudToast(currentChannel.name, newRate, 'Saved');
    }
  }

  /**
   * Extract channel ID, Handle, and Name from DOM
   */
  function extractChannelInfo() {
    let handleKey = null;
    let channelIdKey = null;
    let displayName = null;

    // 1. Search for handle link (/@...) strictly in owner / metadata area
    const handleEl =
      document.querySelector('ytd-watch-metadata #owner a[href*="/@"]') ||
      document.querySelector('ytd-video-owner-renderer a.yt-simple-endpoint[href*="/@"]') ||
      document.querySelector('#owner #channel-name a[href*="/@"]');

    if (handleEl) {
      handleKey = normalizeChannelKey(handleEl.getAttribute('href'));
      if (handleEl.textContent && handleEl.textContent.trim()) {
        displayName = handleEl.textContent.trim();
      }
    }

    // 2. Search for channel ID link (/channel/UC...) strictly in owner area
    const channelIdEl =
      document.querySelector('ytd-watch-metadata #owner a[href*="/channel/"]') ||
      document.querySelector('ytd-video-owner-renderer a.yt-simple-endpoint[href*="/channel/"]') ||
      document.querySelector('#owner #channel-name a[href*="/channel/"]') ||
      document.querySelector('#upload-info #channel-name a');

    if (channelIdEl) {
      channelIdKey = normalizeChannelKey(channelIdEl.getAttribute('href'));
      if (!displayName && channelIdEl.textContent && channelIdEl.textContent.trim()) {
        displayName = channelIdEl.textContent.trim();
      }
    }

    // 3. Fallback to channel title text inside owner area
    if (!displayName) {
      displayName =
        document.querySelector('ytd-watch-metadata #owner #channel-name yt-formatted-string')?.textContent?.trim() ||
        document.querySelector('#owner #channel-name yt-formatted-string')?.textContent?.trim() ||
        document.querySelector('ytd-channel-name yt-formatted-string')?.textContent?.trim() ||
        document.querySelector('#channel-name')?.textContent?.trim();
    }

    // 4. Meta tag fallback: ONLY if the meta tag videoId matches the current video (prevent stale SPA head data)
    const metaVideoId = document.querySelector('meta[itemprop="videoId"]')?.getAttribute('content');
    const currentVid = getVideoId();
    if (metaVideoId && currentVid && metaVideoId === currentVid) {
      if (!channelIdKey) {
        const metaId = document.querySelector('meta[itemprop="channelId"]')?.getAttribute('content');
        if (metaId) channelIdKey = metaId;
      }
      if (!displayName) {
        displayName =
          document.querySelector('link[itemprop="name"]')?.getAttribute('content') ||
          document.querySelector('meta[itemprop="name"]')?.getAttribute('content');
      }
    }

    // 5. Shorts fallback (active reel)
    if (!handleKey && !channelIdKey) {
      const shortsLink =
        document.querySelector('ytd-reel-video-renderer[is-active] ytd-channel-name a') ||
        document.querySelector('ytd-shorts ytd-channel-name a');
      if (shortsLink) {
        const key = normalizeChannelKey(shortsLink.getAttribute('href'));
        if (key && key.startsWith('@')) handleKey = key;
        else if (key) channelIdKey = key;
        if (!displayName) displayName = shortsLink.textContent?.trim();
      }
    }

    const primaryId = handleKey || channelIdKey;
    if (!primaryId) return null;

    return {
      id: primaryId,
      handle: handleKey,
      channelId: channelIdKey,
      name: displayName || primaryId,
    };
  }

  /**
   * Normalize channel key to a consistent, safe identifier
   */
  function normalizeChannelKey(href) {
    if (!href || typeof href !== 'string') return null;

    // Disallow dangerous URI schemes
    if (/^(?:javascript|data|blob|vbscript):/i.test(href)) {
      return null;
    }

    // Handle @channel handles: /@veritasium or https://www.youtube.com/@veritasium
    const handleMatch = href.match(/@([a-zA-Z0-9_.-]{1,100})/);
    if (handleMatch) {
      return `@${handleMatch[1]}`;
    }

    // Handle /channel/UCxxxx...
    const channelMatch = href.match(/\/channel\/(UC[a-zA-Z0-9_-]{1,100})/);
    if (channelMatch) {
      return channelMatch[1];
    }

    // Handle /c/ChannelName or /user/ChannelName
    const customMatch = href.match(/\/(?:c|user)\/([a-zA-Z0-9_.-]{1,100})/);
    if (customMatch) {
      return customMatch[1];
    }

    const cleanPath = href.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0];
    const candidate = cleanPath.replace(/^\//, '').slice(0, 100);

    // Disallow prototype keys or strange characters
    if (['__proto__', 'constructor', 'prototype'].includes(candidate)) {
      return null;
    }
    return /^[a-zA-Z0-9_.-]+$/.test(candidate) ? candidate : null;
  }

  /**
   * Verify whether the DOM is ready for the given videoId
   */
  function isDOMReadyForVideo(targetVideoId) {
    if (!targetVideoId) return false;

    if (window.location.pathname.startsWith('/shorts/')) {
      return true;
    }

    const flexy = document.querySelector('ytd-watch-flexy');
    if (flexy) {
      const flexyVideoId = flexy.getAttribute('video-id');
      // If flexy has video-id and it does NOT match our targetVideoId, DOM is still from the previous video!
      if (flexyVideoId && flexyVideoId !== targetVideoId) {
        return false;
      }
    }

    return true;
  }

  /**
   * Query video info from main-world #movie_player
   */
  function queryPlayerVideoInfo() {
    return new Promise((resolve) => {
      let resolved = false;
      const handler = (e) => {
        if (resolved) return;
        resolved = true;
        window.removeEventListener('yt-channel-speed:player-data-response', handler);
        resolve(e.detail || null);
      };

      window.addEventListener('yt-channel-speed:player-data-response', handler);
      window.dispatchEvent(new CustomEvent('yt-channel-speed:get-player-data'));

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          window.removeEventListener('yt-channel-speed:player-data-response', handler);
          resolve(null);
        }
      }, 300);
    });
  }

  /**
   * Resolve channel info with retry/polling mechanism
   */
  function resolveChannelInfoWithRetry(targetVideoId, navToken, maxWaitMs = 4000) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const check = async () => {
        if (navToken !== currentNavToken) {
          resolve(null);
          return;
        }

        // 1. Only query DOM when ytd-watch-flexy has caught up to targetVideoId
        if (isDOMReadyForVideo(targetVideoId)) {
          const info = extractChannelInfo();
          if (info && info.id) {
            resolve(info);
            return;
          }
        }

        // 2. Query player API as fallback
        const playerInfo = await queryPlayerVideoInfo();
        if (playerInfo && playerInfo.videoId === targetVideoId && playerInfo.author) {
          if (Date.now() - startTime > 1500) {
            const fallbackKey = normalizeChannelKey(playerInfo.author);
            if (fallbackKey) {
              resolve({
                id: fallbackKey,
                handle: fallbackKey.startsWith('@') ? fallbackKey : null,
                channelId: null,
                name: playerInfo.author,
              });
              return;
            }
          }
        }

        if (Date.now() - startTime >= maxWaitMs) {
          // Last ditch attempt
          resolve(extractChannelInfo());
          return;
        }

        setTimeout(check, 100);
      };

      check();
    });
  }

  /**
   * Get saved playback speed for a channel, checking primary ID, handle, and channelId
   */
  async function getChannelSavedSpeed(channelInfo) {
    if (!window.SpeedStorage || !channelInfo) return null;

    const keysToCheck = [
      channelInfo.id,
      channelInfo.handle,
      channelInfo.channelId,
    ].filter(Boolean);

    if (typeof window.SpeedStorage.getSpeedForAny === 'function') {
      return window.SpeedStorage.getSpeedForAny(keysToCheck);
    }

    for (const key of keysToCheck) {
      const speed = await window.SpeedStorage.getChannelSpeed(key);
      if (typeof speed === 'number' && Number.isFinite(speed)) {
        return speed;
      }
    }

    return null;
  }

  /**
   * Save channel speed with handle and channelId aliases
   */
  async function saveChannelSpeedWithAliases(channelInfo, speed) {
    if (!window.SpeedStorage || !channelInfo || !channelInfo.id) return;

    // Prefer handle (@...) as primary ID if available, otherwise fallback to channelId or id
    const primaryKey = channelInfo.handle || channelInfo.id;
    const aliases = [channelInfo.channelId, channelInfo.id].filter(
      (k) => Boolean(k) && k !== primaryKey
    );

    await window.SpeedStorage.saveChannelSpeed(
      primaryKey,
      channelInfo.name,
      speed,
      aliases
    );
  }

  /**
   * Apply speed for a given channel
   */
  async function applySpeedForChannel(channelInfo) {
    if (!window.SpeedStorage || !channelInfo || !channelInfo.id) return;

    const savedSpeed = await getChannelSavedSpeed(channelInfo);
    let targetSpeed = savedSpeed;
    let isSavedChannel = true;

    if (targetSpeed === null || typeof targetSpeed !== 'number') {
      isSavedChannel = false;
      targetSpeed = settings.defaultSpeed || 1.0;
    }

    applySpeedToPlayer(targetSpeed);

    if (settings.showToast) {
      showHudToast(
        channelInfo.name,
        targetSpeed,
        isSavedChannel ? 'Applied' : 'Default'
      );
    }
  }

  /**
   * Send speed change to main-world script and video element
   */
  function applySpeedToPlayer(speed) {
    if (typeof speed !== 'number' || !Number.isFinite(speed) || speed < 0.1 || speed > 16.0) return;

    isApplyingSpeed = true;
    lastAppliedSpeed = Math.round(speed * 100) / 100;

    // 1. Direct video element set
    if (videoElement) {
      try {
        videoElement.playbackRate = lastAppliedSpeed;
      } catch (e) {
        // Ignored
      }
    }

    // 2. Dispatch to main-world script for YouTube player API sync
    window.dispatchEvent(
      new CustomEvent('yt-channel-speed:set', {
        detail: { speed: lastAppliedSpeed },
      })
    );

    // Release application lock after debounce period
    setTimeout(() => {
      isApplyingSpeed = false;
    }, 400);
  }

  /**
   * On-screen HUD Notification
   */
  function showHudToast(channelName, speed, actionLabel = 'Applied') {
    if (!settings.showToast) return;

    const player =
      document.getElementById('movie_player') ||
      document.querySelector('.html5-video-player') ||
      document.body;

    if (!player) return;

    if (!hudElement) {
      hudElement = document.createElement('div');
      hudElement.className = 'yt-speed-hud';

      const iconSpan = document.createElement('span');
      iconSpan.className = 'yt-speed-hud-icon';
      iconSpan.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.92 6-4.72 7.28L14.4 17.5c2.14-1 3.6-3.19 3.6-5.5 0-3.32-2.52-6.07-5.78-6.43L13 2.05M12 6c-3.31 0-6 2.69-6 6 0 1.94.94 3.67 2.4 4.77l1.44-1.44C8.98 14.65 8.5 13.38 8.5 12c0-1.93 1.57-3.5 3.5-3.5.7 0 1.34.22 1.88.58l1.45-1.45C14.34 6.64 13.22 6 12 6m-9 6c0-4.08 3.05-7.44 7-7.93v2.02C6.74 6.55 4.22 9.3 4.22 12.62c0 2.31 1.46 4.5 3.6 5.5l-.88 1.78C4.14 18.62 2.22 15.83 2.22 12.62H3m8 0a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2h-6a1 1 0 0 1-1-1Z"/></svg>';

      const chSpan = document.createElement('span');
      chSpan.className = 'yt-speed-hud-channel';

      const bdSpan = document.createElement('span');
      bdSpan.className = 'yt-speed-hud-badge';

      const actSpan = document.createElement('span');
      actSpan.className = 'yt-speed-hud-action';

      hudElement.appendChild(iconSpan);
      hudElement.appendChild(chSpan);
      hudElement.appendChild(bdSpan);
      hudElement.appendChild(actSpan);

      player.appendChild(hudElement);
    } else if (hudElement.parentNode !== player) {
      player.appendChild(hudElement);
    }

    const channelSpan = hudElement.querySelector('.yt-speed-hud-channel');
    const badgeSpan = hudElement.querySelector('.yt-speed-hud-badge');
    const actionSpan = hudElement.querySelector('.yt-speed-hud-action');

    if (channelSpan) channelSpan.textContent = channelName || 'Channel';
    if (badgeSpan) badgeSpan.textContent = `${speed.toFixed(2).replace(/\.00$/, '')}x`;
    if (actionSpan) actionSpan.textContent = actionLabel;

    // Trigger animation without synchronous layout thrashing
    hudElement.classList.remove('yt-speed-hud-visible');
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (hudElement) {
            hudElement.classList.add('yt-speed-hud-visible');
          }
        });
      });
    } else {
      hudElement.classList.add('yt-speed-hud-visible');
    }

    if (hudTimeout) {
      clearTimeout(hudTimeout);
    }

    hudTimeout = setTimeout(() => {
      if (hudElement) {
        hudElement.classList.remove('yt-speed-hud-visible');
      }
    }, settings.toastDuration || 2000);
  }

  /**
   * Handle messages from extension popup
   */
  function setupRuntimeMessaging() {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) return;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // Validate sender origin if available
      if (sender && sender.id && sender.id !== chrome.runtime.id) {
        return false;
      }

      if (request.action === 'GET_PAGE_STATUS') {
        const currentSpeed = videoElement ? videoElement.playbackRate : 1.0;
        sendResponse({
          isWatchPage: isWatchPage(),
          channel: currentChannel,
          currentSpeed: Math.round(currentSpeed * 100) / 100,
          settings: settings,
        });
        return true;
      }

      if (request.action === 'APPLY_CHANNEL_SPEED') {
        const { speed } = request;
        if (typeof speed === 'number' && Number.isFinite(speed) && speed >= 0.1 && speed <= 16.0) {
          applySpeedToPlayer(speed);
          if (settings.showToast) {
            showHudToast(currentChannel?.name, speed, 'Saved');
          }
          if (currentChannel && currentChannel.id && window.SpeedStorage) {
            saveChannelSpeedWithAliases(currentChannel, speed).then(() => {
              sendResponse({ success: true, speed });
            });
            return true;
          }
          sendResponse({ success: true, speed });
          return true;
        } else {
          sendResponse({ success: false, error: 'Invalid speed value' });
          return false;
        }
      }

      if (request.action === 'RESET_CHANNEL_SPEED') {
        if (currentChannel && currentChannel.id && window.SpeedStorage) {
          const keysToRemove = [currentChannel.id, currentChannel.handle, currentChannel.channelId].filter(Boolean);
          const removePromise = typeof window.SpeedStorage.removeChannelSpeeds === 'function'
            ? window.SpeedStorage.removeChannelSpeeds(keysToRemove)
            : Promise.all(keysToRemove.map((k) => window.SpeedStorage.removeChannelSpeed(k)));

          removePromise.then(() => {
            const defaultSpeed = settings.defaultSpeed || 1.0;
            applySpeedToPlayer(defaultSpeed);
            if (settings.showToast) {
              showHudToast(currentChannel.name, defaultSpeed, 'Reset');
            }
            sendResponse({ success: true, defaultSpeed });
          });
          return true;
        } else {
          sendResponse({ success: false, defaultSpeed: settings.defaultSpeed || 1.0 });
          return false;
        }
      }

      if (request.action === 'SETTINGS_UPDATED') {
        if (window.SpeedStorage) {
          window.SpeedStorage.getSettings().then(async (newSettings) => {
            settings = newSettings;
            // If currently on a channel without custom speed, apply new default speed immediately
            if (currentChannel && currentChannel.id) {
              const savedSpeed = await getChannelSavedSpeed(currentChannel);
              if (savedSpeed === null && settings.defaultSpeed) {
                applySpeedToPlayer(settings.defaultSpeed);
                if (settings.showToast) {
                  showHudToast(currentChannel.name, settings.defaultSpeed, 'Default');
                }
              }
            }
            // If live chat auto-close was just enabled, attempt to close chat if on stream and not yet closed
            if (settings.enabled && settings.isPro && settings.autoCloseLiveChat && isWatchPage()) {
              if (!hasAutoClosedLiveChatForThisVideo) {
                triggerAutoCloseLiveChat(currentNavToken);
              }
            }
            sendResponse({ success: true });
          });
          return true;
        }
      }
    });

    // Also listen directly to storage changes so Pro features activate instantly across all tabs
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.settings && changes.settings.newValue) {
          settings = { ...settings, ...changes.settings.newValue };
          if (settings.enabled && settings.isPro && settings.autoCloseLiveChat && isWatchPage()) {
            if (!hasAutoClosedLiveChatForThisVideo) {
              triggerAutoCloseLiveChat(currentNavToken);
            }
          }
        }
      });
    }
  }

  // Initialize content script
  init();
})();
