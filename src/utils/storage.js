/**
 * Storage Helper for YouTube Channel Playback Speed Extension
 * Wraps chrome.storage.local with typed, promise-based methods.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SpeedStorage = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEYS = {
    CHANNEL_SPEEDS: 'channel_speeds',
    SETTINGS: 'extension_settings',
  };

  const DEFAULT_SETTINGS = {
    enabled: true,
    defaultSpeed: 1.0,
    showToast: true,
    toastDuration: 2000, // milliseconds
    autoCloseLiveChat: false,
    isPro: false,
    licenseKey: '',
  };

  // Block prototype pollution properties
  const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

  /**
   * Validate and sanitize a playback speed value
   */
  function sanitizeSpeed(speed, fallback = 1.0) {
    if (typeof speed !== 'number' || !Number.isFinite(speed) || isNaN(speed)) {
      return fallback;
    }
    // Clamp between 0.1x and 16.0x (standard HTML5 video bounds)
    const clamped = Math.max(0.1, Math.min(16.0, speed));
    return Math.round(clamped * 100) / 100;
  }

  /**
   * Validate channel key
   */
  function isValidChannelKey(key) {
    return (
      typeof key === 'string' &&
      key.length > 0 &&
      key.length <= 128 &&
      !FORBIDDEN_KEYS.has(key)
    );
  }

  /**
   * Helper to retrieve items from chrome.storage.local
   */
  function getStorage(keys) {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        resolve({});
        return;
      }
      chrome.storage.local.get(keys, (result) => {
        resolve(result || {});
      });
    });
  }

  /**
   * Helper to write items to chrome.storage.local
   */
  function setStorage(data) {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        resolve();
        return;
      }
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  }

  /**
   * Get all saved channel speeds
   * @returns {Promise<Object>} Map of channelKey -> { id, name, speed, updatedAt }
   */
  async function getAllChannelSpeeds() {
    const data = await getStorage(STORAGE_KEYS.CHANNEL_SPEEDS);
    const raw = data[STORAGE_KEYS.CHANNEL_SPEEDS];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return Object.create(null);
    }

    // Return sanitized object without prototype pollution
    const clean = Object.create(null);
    for (const key of Object.keys(raw)) {
      if (isValidChannelKey(key) && raw[key] && typeof raw[key] === 'object') {
        clean[key] = {
          id: key,
          name: String(raw[key].name || key).slice(0, 150),
          speed: sanitizeSpeed(raw[key].speed, 1.0),
          aliases: Array.isArray(raw[key].aliases)
            ? raw[key].aliases.filter(isValidChannelKey)
            : [],
          updatedAt: typeof raw[key].updatedAt === 'number' ? raw[key].updatedAt : Date.now(),
        };
      }
    }
    return clean;
  }

  /**
   * Get saved playback speed for a specific channel or alias
   * @param {string} channelKey - e.g. "@veritasium" or "UC..."
   * @returns {Promise<number|null>}
   */
  async function getChannelSpeed(channelKey) {
    if (!isValidChannelKey(channelKey)) return null;
    const all = await getAllChannelSpeeds();

    // 1. Direct key match
    const entry = all[channelKey];
    if (entry && typeof entry.speed === 'number') {
      return entry.speed;
    }

    // 2. Search aliases
    for (const key of Object.keys(all)) {
      const item = all[key];
      if (item && item.aliases && item.aliases.includes(channelKey)) {
        return item.speed;
      }
    }

    return null;
  }

  /**
   * Get saved playback speed for any of the provided candidate keys or aliases in a single storage read
   * @param {string[]} channelKeys - Array of candidate keys e.g. [id, handle, channelId]
   * @returns {Promise<number|null>}
   */
  async function getSpeedForAny(channelKeys) {
    if (!Array.isArray(channelKeys) || channelKeys.length === 0) return null;
    const validKeys = channelKeys.filter(isValidChannelKey);
    if (validKeys.length === 0) return null;

    const all = await getAllChannelSpeeds();

    // 1. Direct key matches first (fast path)
    for (const k of validKeys) {
      const entry = all[k];
      if (entry && typeof entry.speed === 'number') {
        return entry.speed;
      }
    }

    // 2. Search aliases across channels
    for (const key of Object.keys(all)) {
      const item = all[key];
      if (item && Array.isArray(item.aliases) && typeof item.speed === 'number') {
        for (const k of validKeys) {
          if (item.aliases.includes(k)) {
            return item.speed;
          }
        }
      }
    }

    return null;
  }

  /**
   * Save or update the playback speed for a channel, optionally with aliases
   * @param {string} channelKey - Primary channel handle or ID
   * @param {string} channelName - Human-readable channel name
   * @param {number} speed - Playback speed (e.g. 1.5)
   * @param {string[]} [aliases=[]] - Alternate identifiers (e.g. UC... channel ID)
   */
  async function saveChannelSpeed(channelKey, channelName, speed, aliases = []) {
    if (!isValidChannelKey(channelKey)) return;

    const validatedSpeed = sanitizeSpeed(speed, 1.0);
    const safeName = String(channelName || channelKey).slice(0, 150);
    const validAliases = Array.isArray(aliases)
      ? aliases.filter((a) => isValidChannelKey(a) && a !== channelKey)
      : [];

    const all = await getAllChannelSpeeds();

    // If an alias already exists as its own primary entry, merge and remove duplicate
    for (const alias of validAliases) {
      if (all[alias]) {
        if (Array.isArray(all[alias].aliases)) {
          validAliases.push(...all[alias].aliases);
        }
        delete all[alias];
      }
    }

    // Collect existing aliases if channel already exists
    const existingAliases = (all[channelKey] && Array.isArray(all[channelKey].aliases))
      ? all[channelKey].aliases
      : [];

    const mergedAliases = Array.from(new Set([...existingAliases, ...validAliases]))
      .filter((a) => isValidChannelKey(a) && a !== channelKey);

    // Prevent excessive storage usage (cap at 2000 channels) - O(N) linear scan
    const keys = Object.keys(all);
    if (keys.length >= 2000 && !all[channelKey]) {
      let oldestKey = null;
      let oldestTime = Infinity;
      for (const k of keys) {
        const time = typeof all[k].updatedAt === 'number' ? all[k].updatedAt : 0;
        if (time < oldestTime) {
          oldestTime = time;
          oldestKey = k;
        }
      }
      if (oldestKey) {
        delete all[oldestKey];
      }
    }

    all[channelKey] = {
      id: channelKey,
      name: safeName,
      speed: validatedSpeed,
      aliases: mergedAliases,
      updatedAt: Date.now(),
    };
    await setStorage({ [STORAGE_KEYS.CHANNEL_SPEEDS]: all });
    return all[channelKey];
  }

  /**
   * Remove a channel's saved speed and any alias references
   * @param {string} channelKey
   */
  async function removeChannelSpeed(channelKey) {
    if (!isValidChannelKey(channelKey)) return;
    return removeChannelSpeeds([channelKey]);
  }

  /**
   * Remove multiple channel keys and aliases in a single storage read/write operation
   * @param {string[]} channelKeys
   */
  async function removeChannelSpeeds(channelKeys) {
    if (!Array.isArray(channelKeys) || channelKeys.length === 0) return;
    const keysSet = new Set(channelKeys.filter(isValidChannelKey));
    if (keysSet.size === 0) return;

    const all = await getAllChannelSpeeds();
    let modified = false;

    for (const key of keysSet) {
      if (key in all) {
        delete all[key];
        modified = true;
      }
    }

    // Also remove from aliases
    for (const key of Object.keys(all)) {
      if (all[key].aliases && Array.isArray(all[key].aliases)) {
        const prevLen = all[key].aliases.length;
        all[key].aliases = all[key].aliases.filter((a) => !keysSet.has(a));
        if (all[key].aliases.length !== prevLen) {
          modified = true;
        }
      }
    }

    if (modified) {
      await setStorage({ [STORAGE_KEYS.CHANNEL_SPEEDS]: all });
    }
  }

  /**
   * Clear all saved channel speeds
   */
  async function clearAllChannelSpeeds() {
    await setStorage({ [STORAGE_KEYS.CHANNEL_SPEEDS]: Object.create(null) });
  }

  /**
   * Get current extension settings with defaults applied
   */
  async function getSettings() {
    const data = await getStorage(STORAGE_KEYS.SETTINGS);
    const raw = data[STORAGE_KEYS.SETTINGS];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { ...DEFAULT_SETTINGS };
    }

    return {
      enabled: typeof raw.enabled === 'boolean' ? raw.enabled : DEFAULT_SETTINGS.enabled,
      defaultSpeed: sanitizeSpeed(raw.defaultSpeed, DEFAULT_SETTINGS.defaultSpeed),
      showToast: typeof raw.showToast === 'boolean' ? raw.showToast : DEFAULT_SETTINGS.showToast,
      toastDuration:
        typeof raw.toastDuration === 'number' && Number.isFinite(raw.toastDuration)
          ? Math.max(500, Math.min(10000, Math.round(raw.toastDuration)))
          : DEFAULT_SETTINGS.toastDuration,
      autoCloseLiveChat:
        typeof raw.autoCloseLiveChat === 'boolean' ? raw.autoCloseLiveChat : DEFAULT_SETTINGS.autoCloseLiveChat,
      isPro: typeof raw.isPro === 'boolean' ? raw.isPro : DEFAULT_SETTINGS.isPro,
      licenseKey: typeof raw.licenseKey === 'string' ? raw.licenseKey.slice(0, 128) : DEFAULT_SETTINGS.licenseKey,
    };
  }

  /**
   * Update extension settings
   * @param {Partial<typeof DEFAULT_SETTINGS>} newSettings
   */
  async function updateSettings(newSettings) {
    if (!newSettings || typeof newSettings !== 'object') {
      return getSettings();
    }
    const current = await getSettings();
    const cleanUpdate = {};

    if (typeof newSettings.enabled === 'boolean') {
      cleanUpdate.enabled = newSettings.enabled;
    }
    if (typeof newSettings.defaultSpeed === 'number' || typeof newSettings.defaultSpeed === 'string') {
      const parsedSpeed = parseFloat(newSettings.defaultSpeed);
      if (!isNaN(parsedSpeed) && Number.isFinite(parsedSpeed)) {
        cleanUpdate.defaultSpeed = sanitizeSpeed(parsedSpeed, current.defaultSpeed);
      }
    }
    if (typeof newSettings.showToast === 'boolean') {
      cleanUpdate.showToast = newSettings.showToast;
    }
    if (typeof newSettings.toastDuration === 'number' || typeof newSettings.toastDuration === 'string') {
      const parsedDuration = parseInt(newSettings.toastDuration, 10);
      if (!isNaN(parsedDuration) && Number.isFinite(parsedDuration)) {
        cleanUpdate.toastDuration = Math.max(500, Math.min(10000, Math.round(parsedDuration)));
      }
    }
    if (typeof newSettings.autoCloseLiveChat === 'boolean') {
      cleanUpdate.autoCloseLiveChat = newSettings.autoCloseLiveChat;
    }
    if (typeof newSettings.isPro === 'boolean') {
      cleanUpdate.isPro = newSettings.isPro;
    }
    if (typeof newSettings.licenseKey === 'string') {
      cleanUpdate.licenseKey = newSettings.licenseKey.slice(0, 128);
    }

    const merged = { ...current, ...cleanUpdate };
    await setStorage({ [STORAGE_KEYS.SETTINGS]: merged });
    return merged;
  }

  /**
   * Import channel speeds and settings from JSON object with strict schema validation
   */
  async function importData(imported) {
    if (!imported || typeof imported !== 'object' || Array.isArray(imported)) {
      throw new Error('Invalid data format: root must be an object');
    }

    const cleanUpdate = {};

    // Validate and sanitize channel speeds
    if (imported.channel_speeds && typeof imported.channel_speeds === 'object' && !Array.isArray(imported.channel_speeds)) {
      const sanitizedChannels = Object.create(null);
      let count = 0;

      for (const [key, val] of Object.entries(imported.channel_speeds)) {
        if (count >= 2000) break; // Limit imported records
        if (!isValidChannelKey(key) || !val || typeof val !== 'object') continue;

        sanitizedChannels[key] = {
          id: key,
          name: String(val.name || key).slice(0, 150),
          speed: sanitizeSpeed(val.speed, 1.0),
          updatedAt: typeof val.updatedAt === 'number' && Number.isFinite(val.updatedAt) ? val.updatedAt : Date.now(),
        };
        count++;
      }
      cleanUpdate[STORAGE_KEYS.CHANNEL_SPEEDS] = sanitizedChannels;
    }

    // Validate and sanitize settings
    if (imported.settings && typeof imported.settings === 'object' && !Array.isArray(imported.settings)) {
      const current = await getSettings();
      cleanUpdate[STORAGE_KEYS.SETTINGS] = {
        enabled: typeof imported.settings.enabled === 'boolean' ? imported.settings.enabled : current.enabled,
        defaultSpeed: sanitizeSpeed(imported.settings.defaultSpeed, current.defaultSpeed),
        showToast: typeof imported.settings.showToast === 'boolean' ? imported.settings.showToast : current.showToast,
        toastDuration:
          typeof imported.settings.toastDuration === 'number' && Number.isFinite(imported.settings.toastDuration)
            ? Math.max(500, Math.min(10000, Math.round(imported.settings.toastDuration)))
            : current.toastDuration,
        autoCloseLiveChat:
          typeof imported.settings.autoCloseLiveChat === 'boolean'
            ? imported.settings.autoCloseLiveChat
            : current.autoCloseLiveChat,
        isPro: current.isPro || Boolean(imported.settings.isPro),
        licenseKey:
          current.licenseKey ||
          (typeof imported.settings.licenseKey === 'string'
            ? imported.settings.licenseKey.slice(0, 128)
            : ''),
      };
    }

    await setStorage(cleanUpdate);
  }

  /**
   * Export all data for backup
   */
  async function exportData() {
    const [channel_speeds, settings] = await Promise.all([
      getAllChannelSpeeds(),
      getSettings(),
    ]);
    return {
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
      channel_speeds,
      settings,
    };
  }

  return {
    STORAGE_KEYS,
    DEFAULT_SETTINGS,
    getAllChannelSpeeds,
    getChannelSpeed,
    getSpeedForAny,
    saveChannelSpeed,
    removeChannelSpeed,
    removeChannelSpeeds,
    clearAllChannelSpeeds,
    getSettings,
    updateSettings,
    saveSettings: updateSettings,
    importData,
    exportData,
  };
});
