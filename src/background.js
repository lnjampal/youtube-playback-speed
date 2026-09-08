/**
 * Background Service Worker
 * Handles lifecycle events and initializes storage defaults.
 */

const DEFAULT_SETTINGS = {
  enabled: true,
  defaultSpeed: 1.0,
  showToast: true,
  toastDuration: 2000,
};

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Seed initial settings
    const current = await chrome.storage.local.get(['extension_settings', 'channel_speeds']);
    if (!current.extension_settings) {
      await chrome.storage.local.set({ extension_settings: DEFAULT_SETTINGS });
    }
    if (!current.channel_speeds) {
      await chrome.storage.local.set({ channel_speeds: {} });
    }
  }
});
