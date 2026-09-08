# Chrome Web Store Submission Guide

This guide walks you step-by-step through uploading and publishing **Channel Speed Memory for YouTube™** to the **Google Chrome Web Store**.

---

## 📋 Pre-Flight Checklist

Before opening the Chrome Web Store Developer Console, verify that your deliverables are ready:

- [x] **Production ZIP Package:** [`dist/channel-speed-memory-v1.0.0.zip`](file:///Users/ln/Desktop/Youtube-ChromeExtension/dist/channel-speed-memory-v1.0.0.zip) *(Built and verified with 0 prohibited files, ~24 KB)*.
- [x] **Store Listing Copy:** [`STORE_LISTING.md`](file:///Users/ln/Desktop/Youtube-ChromeExtension/STORE_LISTING.md) *(Pre-formatted text and justifications)*.
- [x] **Privacy Policy:** [`PRIVACY_POLICY.md`](file:///Users/ln/Desktop/Youtube-ChromeExtension/PRIVACY_POLICY.md) *(Hosted on your GitHub repository)*.
- [x] **Store Screenshots (1280x800):** Located in [`store_assets/`](file:///Users/ln/Desktop/Youtube-ChromeExtension/store_assets/).
- [x] **Small Promo Tile (440x280):** Located in [`store_assets/promo_tile_440x280.png`](file:///Users/ln/Desktop/Youtube-ChromeExtension/store_assets/promo_tile_440x280.png).
- [x] **Marquee Promo Tile (1400x560):** Located in [`store_assets/marquee_promo_tile_1400x560.png`](file:///Users/ln/Desktop/Youtube-ChromeExtension/store_assets/marquee_promo_tile_1400x560.png).
- [x] **Store Icon (128x128):** Located in [`icons/icon128.png`](file:///Users/ln/Desktop/Youtube-ChromeExtension/icons/icon128.png).

---

## Step 1: Open the Developer Dashboard

1. Navigate to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with the Google Account you wish to publish under.
3. *Note for first-time publishers:* If you haven't published an extension before, Google requires a **one-time $5 USD registration fee** to activate your developer account. Follow the on-screen prompt to complete this step.

---

## Step 2: Upload the Extension ZIP

1. In the Developer Dashboard, click the blue **"+ New Item"** button in the upper-right corner.
2. A file upload dialog will appear.
3. Drag and drop the packaged zip file:
   ```
   dist/channel-speed-memory-v1.0.0.zip
   ```
   *(Or click "Browse files" and select the file from your `/Users/ln/Desktop/Youtube-ChromeExtension/dist/` folder).*
4. The dashboard will automatically parse `manifest.json`, validate the bundle, and create your draft listing.

---

## Step 3: Complete the "Store Listing" Tab

In the left sidebar, select **Store listing**. Fill in the fields using the text from [`STORE_LISTING.md`](file:///Users/ln/Desktop/Youtube-ChromeExtension/STORE_LISTING.md):

1. **Extension Title:**
   ```text
   Channel Speed Memory for YouTube™
   ```
2. **Summary (Short description):**
   ```text
   Automatically remembers and applies your preferred playback speed for every YouTube channel you watch.
   ```
3. **Description:**
   - Copy the entire text under **Section 2: Detailed Description** from [`STORE_LISTING.md`](file:///Users/ln/Desktop/Youtube-ChromeExtension/STORE_LISTING.md) and paste it into the description box.
4. **Category:**
   - Select **Productivity** (or **Accessibility**).
5. **Language:**
   - Select **English**.

---

## Step 4: Upload Graphic Assets & Screenshots

Scroll down to the **Graphic assets** section:

1. **Store Icon (128x128):**
   - Click to upload [`icons/icon128.png`](file:///Users/ln/Desktop/Youtube-ChromeExtension/icons/icon128.png).
2. **Screenshots (1280x800):**
   - Upload the 4 screenshots from the `store_assets/` folder:
     - `store_assets/screenshot1_hud_1280x800.png`
     - `store_assets/screenshot2_popup_1280x800.png`
     - `store_assets/screenshot3_channels_1280x800.png`
     - `store_assets/screenshot4_settings_1280x800.png`
3. **Small Promo Tile (440x280):**
   - Under *Promotional tiles*, click **Small tile** and upload:
     - `store_assets/promo_tile_440x280.png`
4. **Marquee Promo Tile (1400x560):**
   - Under *Promotional tiles*, click **Marquee tile** and upload:
     - `store_assets/marquee_promo_tile_1400x560.png`

*(Tip: You can open [`store_assets/preview.html`](file:///Users/ln/Desktop/Youtube-ChromeExtension/store_assets/preview.html) in your browser to inspect all assets prior to uploading).*

---

## Step 5: Complete the "Privacy Practices" Tab

In the left sidebar, click **Privacy practices**. Google review teams inspect this tab closely.

1. **Single Purpose:**
   Paste the following:
   ```text
   Automatically remembers, stores, and restores the user's preferred video playback speed on a per-channel basis on YouTube.
   ```
2. **Permission Justifications:**
   - **`storage` justification:**
     ```text
     Required to save user preferences, fallback default speed, HUD display settings, and channel-to-speed mappings locally in chrome.storage.local so they persist across browser sessions.
     ```
   - **Host permission (`*://*.youtube.com/*`) justification:**
     ```text
     Required to detect channel handle and identifier on YouTube watch pages, read playback rate changes made by the user, and apply the saved playback speed to YouTube's HTML5 video player element. The extension only executes on youtube.com and does not access any other website.
     ```
3. **Data Usage Certification:**
   - Check the boxes certifying that:
     - You comply with Developer Program Policies.
     - You do not sell or transfer user data.
     - You do not use data for unrelated purposes.
     - You do not use data for creditworthiness or lending.
4. **Data Collection:**
   - Check **"No, I am not collecting or using user data"** (or verify that all individual data types like Personal Info, Financial Info, Location, Web History are set to **Not collected**).
5. **Privacy Policy URL:**
   Enter the public GitHub URL:
   ```text
   https://github.com/lnjampal/youtube-playback-speed/blob/main/PRIVACY_POLICY.md
   ```

---

## Step 6: Set Distribution & Pricing

In the left sidebar, click **Distribution**:

1. **Visibility:** Select **Public** (or Unlisted if you want a private testing link first).
2. **Pricing:** Select **Free**.
3. **Regions:** Select **All regions** (or your preferred geographic regions).

---

## Step 7: Review and Submit

1. Click **Save draft** in the upper right.
2. Verify there are no red validation warnings remaining on any tab.
3. Click the blue **"Submit for review"** button.
4. An optional prompt will ask whether to publish automatically once approved:
   - Select **"Publish automatically as soon as it passes review"**.
5. Click **Submit**.

---

## ⏱️ What Happens Next?

- **Review Duration:** Google's automated and manual review typically takes between **24 to 72 hours** (1 to 3 business days).
- **Status Updates:** You will receive an email from the Chrome Web Store team when your extension has been approved and is live on the store, or if any additional information is required.
- **Store URL:** Once published, your extension will have a dedicated public URL on `chromewebstore.google.com`.
