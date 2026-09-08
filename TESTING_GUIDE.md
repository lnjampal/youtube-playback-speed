# Quick Testing Guide for Google Chrome

Follow these simple steps to install and test the extension directly in your Chrome browser on macOS.

---

## 📥 Step 1: Load the Extension into Chrome

1. Open **Google Chrome**.
2. In the Chrome address bar, type:
   ```
   chrome://extensions
   ```
   and press **Enter**.
3. In the top-right corner of the Extensions page, switch the **Developer mode** toggle to **ON**.
4. In the top-left corner, click the **"Load unpacked"** button.
5. In the file picker dialog, navigate to your Desktop and select the folder:
   ```
   /Users/ln/Desktop/Youtube-ChromeExtension
   ```
6. Click **Select** / **Open**.
7. You will now see **"YouTube Channel Playback Speed Memory"** loaded on your extensions page!

---

## 📌 Step 2: Pin the Extension Icon for Quick Access

1. In Chrome's top-right toolbar, click the **Puzzle Piece icon** (Extensions menu).
2. Find **YouTube Channel Playback Speed Memory**.
3. Click the **Pin icon** (📌) next to it so it stays visible in your toolbar.

---

## 🎬 Step 3: Test on YouTube

### Test A: Automatic Speed Memory
1. Open any YouTube video (for example, on [Veritasium](https://www.youtube.com/@veritasium) or [MKBHD](https://www.youtube.com/@mkbhd)).
2. Change the video playback speed to **1.75x** (using the YouTube player's gear menu ⚙️ or keyboard shortcut `Shift + >`).
3. You will see a subtle in-player toast at the top-right:
   ```
   ⚡ Channel Name: 1.75x Saved
   ```
4. The extension has now automatically remembered this channel's preference!

### Test B: Switch to a Different Channel
1. Open or search for a video from a **different channel** (e.g. [3Blue1Brown](https://www.youtube.com/@3blue1brown) or [Kurzgesagt](https://www.youtube.com/@kurzgesagt)).
2. Notice the video plays at the default **1.0x** speed.
3. Change this second channel's playback speed to **1.25x**.
4. You will see the in-player confirmation toast.

### Test C: Automatic Speed Pickup
1. Now, navigate back to a video from your **first channel** (Veritasium/MKBHD).
2. **Watch the magic happen**:
   - The extension immediately recognizes the channel.
   - It automatically sets the video to **1.75x**!
   - A floating pill appears: `⚡ Channel Name: 1.75x Applied`.
   - If you check YouTube's gear menu ⚙️, it also displays **1.75x**!

### Test D: Extension Popup & Saved Channels
1. Click the extension icon in your Chrome toolbar.
2. In the **Current Video** tab:
   - See the active channel name, handle, and speed.
   - Click any preset button (`1.25x`, `1.5x`, `2.0x`) or fine-tune with `+` / `-`.
3. In the **Saved Channels** tab:
   - See both channels listed with their saved speeds.
   - Try the search bar to filter channels.
   - Try the delete trash icon to remove a channel's saved speed.
4. In the **Settings** tab:
   - Customize your default fallback speed or toast duration.
   - Try the **Export JSON** backup button.

---

## 🔄 Making Changes / Reloading
If any extension files are updated in the future, just go to `chrome://extensions` and click the **Reload (🔄)** icon on the extension card.
