# Chrome Web Store Listing Information

Use this document to quickly copy and paste all required text into the **Google Chrome Web Store Developer Dashboard** (`https://chrome.google.com/webstore/devconsole`).

---

## 1. Store Listing Details

### Item Title
```text
Channel Speed Memory for YouTube™
```
*(35 / 45 characters)*

### Short Description / Summary
```text
Automatically remembers and applies your preferred playback speed for every YouTube channel you watch.
```
*(104 / 132 characters)*

### Category
- **Primary Category:** `Productivity`
- **Secondary Category:** `Accessibility`

### Language
- **Default Language:** `English`

---

## 2. Detailed Description (Paste into Store Listing)

```text
Never fiddle with YouTube playback speed controls again!

Channel Speed Memory for YouTube™ automatically remembers your preferred playback speed for every YouTube channel you watch and applies it seamlessly the moment you start playing a video.

Do you like watching fast-paced educational videos at 1.75x or 2.0x, but prefer music videos, tutorials, or documentaries at 1.0x or 1.25x? This extension remembers your choice automatically for each specific channel.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Automatic Speed Memory
Whenever you adjust the playback speed—using YouTube's native player menu, keyboard shortcuts (Shift + > / Shift + <), or the extension popup—your speed preference is instantly remembered for that channel.

⚡ Instant Channel Switching
Switching between channels? The extension immediately detects the new channel and applies your custom speed without delay or manual interaction.

⚡ Native Player Sync
Seamlessly synchronizes with YouTube's HTML5 video player and internal settings menu. The native player gear menu stays completely in sync with your active playback rate.

⚡ In-Player HUD Notification
A clean, unobtrusive pill notification appears momentarily at the top right of the video (e.g. "⚡ Veritasium: 1.75x Applied") so you always know your custom speed is active. (Can be toggled on/off in Settings).

⚡ Smart Ad & Transition Protection
Prevents YouTube's internal player resets and ad playback from overriding or corrupting your saved channel speeds.

⚡ Full-Featured Extension Popup
• Active Video Tab: View active channel, current speed, quick preset buttons (0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x), and fine-tune steppers (±0.05x).
• Saved Channels Tab: Search, filter, and manage all remembered channels with individual speed badges and delete buttons.
• Settings Tab: Set your fallback default playback speed, customize or disable HUD notifications, and export/import your settings as a JSON backup.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⌨️ KEYBOARD SHORTCUTS SUPPORTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Shift + > : Increase playback speed
• Shift + < : Decrease playback speed

Any adjustment made via keyboard shortcuts is automatically captured and saved for the current channel!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 PRIVACY & SECURITY FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 100% Local: All settings and channel preferences are stored strictly on your device using Chrome's local storage (chrome.storage.local).
• Zero Tracking: No analytics, no telemetry, and no tracking scripts.
• No Remote Servers: The extension makes zero external network requests.
• Open Source: Fully open source under the MIT License.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YouTube™ is a trademark of Google LLC. Use of this trademark is subject to Google Permissions. This extension is an independent project and has no affiliation with, sponsorship from, or endorsement by Google LLC or YouTube.
```

---

## 3. Privacy Practices Tab (Developer Dashboard)

### Single Purpose Description
```text
Automatically remembers, stores, and restores the user's preferred video playback speed on a per-channel basis on YouTube.
```

### Host Permissions Justification (`*://*.youtube.com/*`)
```text
Required to detect channel handle and identifier on YouTube watch pages, read playback rate changes made by the user, and apply the saved playback speed to YouTube's HTML5 video player element. The extension only executes on youtube.com and does not access any other website.
```

### Host Permissions Justification (`https://api.gumroad.com/*`)
```text
Required to verify the user's license key when activating the optional PRO tier via Gumroad's official License Verification API. No user data other than the entered license key is sent.
```

### Storage Permission Justification (`storage`)
```text
Required to save user preferences, fallback default speed, HUD display settings, and channel-to-speed mappings locally in chrome.storage.local so they persist across browser sessions.
```

### Data Usage Declarations
Under the **Data usage** certification:
1. Check: **"I certify that my extension adheres to the Chrome Web Store Developer Program Policies."**
2. Check: **"I do not sell or transfer user data to third parties."**
3. Check: **"I do not use or transfer user data for purposes unrelated to the item's core functionality."**
4. Check: **"I do not use or transfer user data to determine creditworthiness or for lending purposes."**
5. Data Collection: Select **"None"** (the extension does not collect personal, financial, authentication, or browsing history data).

---

## 4. URLs & External Links

- **Privacy Policy URL:**  
  `https://github.com/lnjampal/youtube-playback-speed/blob/main/PRIVACY_POLICY.md`
- **Homepage / Support URL:**  
  `https://github.com/lnjampal/youtube-playback-speed`
- **Support Email:**  
  *(Use your developer email associated with your Google Developer account)*
