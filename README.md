# Channel Speed Memory for YouTube™

A lightweight, modern Manifest V3 Chrome Extension that automatically remembers and applies your preferred playback speed for every YouTube channel you watch.

---

## 🚀 Features

- **Automatic Speed Memory**: Whenever you adjust the playback speed on YouTube (via player settings, keyboard shortcuts `Shift + >` / `Shift + <`, or the extension popup), the extension automatically detects the channel and remembers your chosen speed.
- **Instant Speed Switching**: When navigating between videos or different channels, the extension automatically looks up the channel's saved speed and applies it immediately.
- **Smart Ad & Reset Protection**: YouTube frequently resets playback speed to `1.0x` when loading new videos or after video ads finish. The extension ignores these temporary player resets and re-applies your custom channel speed as soon as real content plays.
- **Native Player UI Sync**: Integrates with YouTube's internal `#movie_player` API so that YouTube's built-in gear menu and player controls stay in sync with the actual speed.
- **Non-Intrusive In-Player HUD**: Shows a brief, sleek on-screen toast (`⚡ Veritasium: 1.75x`) whenever a channel's speed is applied or updated (can be disabled in Settings).
- **Full-Featured Popup UI**:
  - **Current Video Tab**: View active channel, current speed, quick preset buttons (`0.75x` to `2.0x`), fine-tuning slider/steppers, and one-click reset to default.
  - **Saved Channels Tab**: Searchable list of all remembered channels with individual speed badges and delete buttons.
  - **Settings & Backup**: Configure fallback default speed, customize HUD toast duration, and Export/Import your channel speeds as JSON.

---

## 📦 How to Install in Google Chrome

1. Clone or download this repository.
2. Open Google Chrome and navigate to:
   ```
   chrome://extensions
   ```
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **"Load unpacked"** button in the top-left corner.
5. Select this project directory.
6. The extension icon will appear in your Chrome toolbar. Pin it for quick access!

---

## 🧪 Running Automated Tests

Run the complete test suite (verification, integration, popup controller, and security hardening) using Node.js:

```bash
node test_extension.js && node test_integration.js && node test_popup.js && node test_security.js
```

---

## 🛠️ Project Structure

```
Youtube-ChromeExtension/
├── manifest.json            # Manifest V3 extension configuration
├── src/
│   ├── background.js        # Service worker for initialization
│   ├── content.js           # Isolated world content script (DOM, storage, SPA navigation)
│   ├── main-world.js        # Main world script (direct #movie_player API sync)
│   ├── content.css          # In-player floating HUD toast styles
│   └── utils/
│       └── storage.js       # Typed storage helper for chrome.storage.local
├── popup/
│   ├── popup.html           # Modern dark-theme popup interface
│   ├── popup.css            # YouTube-inspired dark styling
│   └── popup.js             # Tab management, channel search, settings logic
├── icons/                   # High-resolution extension icons (16, 48, 128)
├── store_assets/            # Chrome Web Store promo tile (440x280) and screenshots (1280x800)
├── dist/                    # Packaged production ZIP archives for Web Store upload
├── package.js               # Production ZIP packager script
├── generate_store_assets.py # Standalone store graphic assets generator
├── STORE_LISTING.md         # Ready-to-use Chrome Web Store metadata & justifications
├── SUBMISSION_GUIDE.md      # Step-by-step developer console submission walkthrough
├── PRIVACY_POLICY.md       # Full privacy disclosure compliant with CWS user data policy
├── LICENSE                  # MIT License & disclaimers
└── README.md
```

---

## 📦 Building for Chrome Web Store

To build a clean production ZIP archive containing only runtime extension files (excluding test suites, scripts, and documentation):

```bash
node package.js
```

This creates `dist/channel-speed-memory-v1.0.0.zip` ready for upload to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). See [SUBMISSION_GUIDE.md](SUBMISSION_GUIDE.md) and [STORE_LISTING.md](STORE_LISTING.md) for full instructions.

---

## 🔒 Privacy Policy

All channel playback speed preferences are stored strictly locally in your browser using Chrome's `chrome.storage.local`. No data is ever collected, tracked, or transmitted. Read our complete [Privacy Policy](PRIVACY_POLICY.md).

---

## 📄 License & Disclaimer

This project is licensed under the [MIT License](LICENSE).

**Disclaimer**: YouTube™ is a trademark of Google LLC. This extension is an independent open-source project and has no affiliation with, sponsorship by, or endorsement from Google LLC or YouTube.
