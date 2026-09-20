/**
 * License Manager for YouTube Channel Playback Speed Extension
 * Handles Pro license activation, verification, and persistence.
 * Integrates with Gumroad License Verification API.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LicenseManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Development / Test license keys for offline local testing
  const DEV_TEST_KEYS = new Set([
    'PRO-TRIAL-2026',
    'PRO-TEST-KEY',
    'PRO-LIFETIME-DEV'
  ]);

  // Gumroad Configuration
  // Developers can set their Gumroad Product Permalink here or in settings
  const DEFAULT_GUMROAD_CONFIG = {
    // e.g. "youtube-speed-pro" (from https://yourname.gumroad.com/l/youtube-speed-pro)
    productPermalink: 'youtube-speed-pro',
    verifyEndpoint: 'https://api.gumroad.com/v2/licenses/verify',
  };

  /**
   * Check if current user has an active Pro license
   * @param {Object} [settings] - Optional pre-loaded settings object
   * @returns {Promise<boolean>}
   */
  async function isProUser(settings) {
    try {
      const currentSettings = settings || (window.SpeedStorage ? await window.SpeedStorage.getSettings() : {});
      return Boolean(currentSettings.isPro);
    } catch (e) {
      console.warn('[SpeedExtension] Error checking Pro status:', e);
      return false;
    }
  }

  /**
   * Activate a license key
   * Supports built-in dev test keys for offline testing, plus Gumroad API verification.
   * 
   * @param {string} rawKey - The license key entered by the user
   * @param {Object} [options] - Verification options
   * @param {string} [options.productPermalink] - Gumroad product permalink
   * @returns {Promise<{ success: boolean, message: string, license?: Object }>}
   */
  async function activateLicense(rawKey, options = {}) {
    if (!rawKey || typeof rawKey !== 'string') {
      return { success: false, message: 'Please enter a valid license key.' };
    }

    const key = rawKey.trim();
    if (!key) {
      return { success: false, message: 'License key cannot be empty.' };
    }

    // 1. Check for Offline Developer / Test Keys
    if (DEV_TEST_KEYS.has(key.toUpperCase())) {
      const licenseData = {
        isPro: true,
        licenseKey: key.toUpperCase(),
        licenseTier: 'pro_lifetime_test',
        activatedAt: Date.now(),
        provider: 'dev_test',
      };

      if (window.SpeedStorage) {
        await window.SpeedStorage.updateSettings({
          isPro: true,
          licenseKey: key.toUpperCase(),
        });
      }

      return {
        success: true,
        message: 'PRO Lifetime Test License successfully activated! 🎉',
        license: licenseData,
      };
    }

    // 2. Online Gumroad Verification
    const permalink = options.productPermalink || DEFAULT_GUMROAD_CONFIG.productPermalink;
    try {
      const response = await fetch(DEFAULT_GUMROAD_CONFIG.verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          product_permalink: permalink,
          license_key: key,
          increment_uses_count: 'true',
        }),
      });

      const data = await response.json();

      if (data && data.success && !data.purchase?.refunded && !data.purchase?.chargebacked) {
        const licenseData = {
          isPro: true,
          licenseKey: key,
          licenseTier: 'pro_gumroad',
          activatedAt: Date.now(),
          provider: 'gumroad',
          email: data.purchase?.email || null,
        };

        if (window.SpeedStorage) {
          await window.SpeedStorage.updateSettings({
            isPro: true,
            licenseKey: key,
          });
        }

        return {
          success: true,
          message: 'PRO License successfully activated! Thank you for your support. 🎉',
          license: licenseData,
        };
      } else {
        const errorMsg = data?.message || 'Invalid or revoked license key. Please check and try again.';
        return { success: false, message: errorMsg };
      }
    } catch (networkError) {
      console.warn('[SpeedExtension] Gumroad verification network error:', networkError);
      return {
        success: false,
        message: 'Unable to reach verification server. Please check your internet connection and try again.',
      };
    }
  }

  /**
   * Deactivate current Pro license and return to Free tier
   * @returns {Promise<boolean>}
   */
  async function deactivateLicense() {
    try {
      if (window.SpeedStorage) {
        await window.SpeedStorage.updateSettings({
          isPro: false,
          licenseKey: '',
          autoCloseLiveChat: false, // Turn off Pro features on deactivation
        });
      }
      return true;
    } catch (e) {
      console.warn('[SpeedExtension] Error deactivating license:', e);
      return false;
    }
  }

  return {
    isProUser,
    activateLicense,
    deactivateLicense,
    DEV_TEST_KEYS,
    DEFAULT_GUMROAD_CONFIG,
  };
});
