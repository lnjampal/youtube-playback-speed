# Privacy Policy

**Effective Date:** September 8, 2026  
**Extension Name:** Channel Speed Memory for YouTube™

This Privacy Policy explains how **Channel Speed Memory for YouTube™** ("the Extension", "we", "us", or "our") handles user information. We take privacy seriously and are committed to maintaining complete transparency.

---

## 1. Summary: Zero Personal Data Collection

**We do not collect, store, transmit, track, or share any personal data.** 

All functionality operates entirely locally within your browser. There are no external tracking scripts, analytics, diagnostic telemetry, or third-party servers involved in the operation of this Extension.

---

## 2. Information We Handle and Where It Is Stored

The Extension only handles data strictly necessary to fulfill its single purpose: remembering your preferred playback speeds on YouTube.

| Data Type | Purpose | Storage Location | Externally Transmitted? |
| :--- | :--- | :--- | :--- |
| **Channel Identifiers** (e.g. `@channel_handle` or Channel ID) | Used to associate a specific YouTube channel with your preferred playback speed. | Locally on your computer via `chrome.storage.local` | **No (Never)** |
| **Playback Speeds** (e.g. `1.75x`) | The speed value you selected for a channel or your default fallback speed. | Locally on your computer via `chrome.storage.local` | **No (Never)** |
| **Extension Preferences** (e.g. HUD notifications enabled, HUD duration) | UI display preferences. | Locally on your computer via `chrome.storage.local` | **No (Never)** |

**None of this data ever leaves your computer or browser.**

---

## 3. Browser Permissions and Why They Are Required

In accordance with the principle of least privilege, the Extension only requests permissions that are strictly necessary for its functionality:

1. **`storage`**:
   - **Why it is needed:** Required to save your channel speed preferences and settings locally in your browser using Chrome's secure `chrome.storage.local` API so they persist between browsing sessions.
2. **`host_permissions: ["*://*.youtube.com/*"]`**:
   - **Why it is needed:** Required to detect when you are watching a video on YouTube, identify the current channel, read your speed adjustments, and apply your saved playback speed to YouTube's HTML5 video player.
   - **Scope:** The Extension has no access to any website other than `youtube.com`.

---

## 4. Third-Party Services & Data Sharing

- **No Remote Servers:** The Extension has no backend server and makes zero network requests.
- **No Analytics or Trackers:** No tracking libraries (such as Google Analytics, Mixpanel, etc.) are included.
- **No Data Monetization:** We do not sell, rent, trade, or transfer any user data to third parties for advertising, marketing, or any other purpose.

---

## 5. User Control and Data Management

You have complete control over all data stored by the Extension:
- **View Saved Data:** You can view all remembered channels and their speeds anytime in the extension popup under the **Saved Channels** tab.
- **Delete Specific Channels:** You can remove individual channels directly from the popup list.
- **Clear All Data:** You can reset individual channels or use the Export/Import feature to manage your data.
- **Uninstall:** Uninstalling the Extension immediately and permanently deletes all stored preferences from your browser.

---

## 6. Compliance with Chrome Web Store Policies

This Extension complies fully with the [Google Chrome Web Store Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/), including:
- The **Single Purpose Policy** (only modifying and remembering YouTube playback speeds).
- The **Limited Use Policy** regarding user data.

---

## 7. Contact & Inquiries

If you have any questions or feedback regarding this Privacy Policy or the Extension, please open an issue on the official GitHub repository:
- **Repository:** [https://github.com/lnjampal/youtube-playback-speed](https://github.com/lnjampal/youtube-playback-speed)

---

## 8. Trademark Disclaimer

YouTube™ is a trademark of Google LLC. Use of this trademark is for identification and descriptive purposes only and does not imply any affiliation, sponsorship, or endorsement by Google LLC.
