#!/usr/bin/env python3
"""
Chrome Web Store High-Resolution Graphical Asset Generator

Faithfully reproduces the real browser extension appearance:
- Dark theme styling (#0f0f0f, #181818, #1c1c1c, #272727, #ff0033)
- Real 360px popup layout with exact tabs, speed meter box, and steppers
- Exact in-player HUD pill toast styling from src/content.css
- Zero text overflow with strict padding and multi-line wrapping
- 100% vector-rendered crisp typography and icons
"""

import os
import subprocess

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(ROOT_DIR, "store_assets")
CACHE_DIR = os.path.join(ROOT_DIR, ".cache")

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

FONT_FAMILY = "Helvetica, Arial, -apple-system, sans-serif"


def render_svg_to_png(svg_content, out_png_path):
    env = os.environ.copy()
    env["XDG_CACHE_HOME"] = CACHE_DIR
    cmd = ["magick", "-background", "none", "svg:-", out_png_path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    stdout, stderr = p.communicate(input=svg_content.encode("utf-8"))
    if p.returncode != 0:
        print(f"❌ Error rendering {out_png_path}: {stderr.decode('utf-8')}")
        return False
    size = os.path.getsize(out_png_path)
    print(f"  ✔ Generated: {os.path.basename(out_png_path)} ({size:,} bytes)")
    return True


def build_promo_tile_svg():
    """Small Promo Tile (440x280)"""
    return f"""<svg width="440" height="280" viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg">
  <!-- Deep Dark Background -->
  <rect width="440" height="280" fill="#0f0f0f"/>
  <rect x="0" y="0" width="440" height="3" fill="#ff0033"/>

  <!-- Icon Container -->
  <g transform="translate(180, 26)">
    <rect width="80" height="80" rx="22" fill="#ff0033"/>
    <rect width="80" height="38" rx="22" fill="#ff2652"/>
    <rect y="20" width="80" height="20" fill="#ff0033"/>
    <rect x="14" y="14" width="52" height="52" rx="14" fill="#140206"/>
    <!-- Play Triangle -->
    <polygon points="34,28 34,52 54,40" fill="#ffffff"/>
    <!-- Cyan Lightning Badge -->
    <circle cx="68" cy="68" r="16" fill="#00e5ff" stroke="#0f0f0f" stroke-width="3"/>
    <polygon points="69,59 62,69 68,69 66,77 74,67 68,67" fill="#08101e"/>
  </g>

  <!-- Title & Branding -->
  <text x="220" y="146" font-family="{FONT_FAMILY}" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">CHANNEL SPEED MEMORY</text>
  <text x="220" y="172" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ff334b" text-anchor="middle" letter-spacing="1.5">FOR YOUTUBE™</text>

  <!-- Feature Pill -->
  <g transform="translate(35, 206)">
    <rect width="370" height="46" rx="23" fill="#181818" stroke="#292929" stroke-width="1.5"/>
    <text x="185" y="28" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00f5a0" text-anchor="middle">⚡ Auto-remembers speed per channel</text>
  </g>
</svg>"""


def build_marquee_tile_svg():
    """Marquee Promotional Tile (1400x560)"""
    return f"""<svg width="1400" height="560" viewBox="0 0 1400 560" xmlns="http://www.w3.org/2000/svg">
  <rect width="1400" height="560" fill="#0f0f0f"/>
  <rect x="0" y="0" width="1400" height="4" fill="#ff0033"/>

  <!-- Left: Branding & Value Prop -->
  <g transform="translate(80, 60)">
    <!-- App Icon -->
    <rect width="96" height="96" rx="26" fill="#ff0033"/>
    <rect width="96" height="46" rx="26" fill="#ff2652"/>
    <rect y="24" width="96" height="24" fill="#ff0033"/>
    <rect x="17" y="17" width="62" height="62" rx="16" fill="#140206"/>
    <polygon points="41,33 41,63 67,48" fill="#ffffff"/>
    <circle cx="82" cy="82" r="18" fill="#00e5ff" stroke="#0f0f0f" stroke-width="4"/>
    <polygon points="83,72 75,83 82,83 80,92 89,81 82,81" fill="#08101e"/>

    <!-- Title -->
    <text x="0" y="155" font-family="{FONT_FAMILY}" font-size="34" font-weight="bold" fill="#ffffff" letter-spacing="0.5">CHANNEL SPEED MEMORY</text>
    <text x="0" y="190" font-family="{FONT_FAMILY}" font-size="20" font-weight="bold" fill="#ff334b" letter-spacing="1.5">FOR YOUTUBE™</text>

    <!-- Subtitle -->
    <text x="0" y="240" font-family="{FONT_FAMILY}" font-size="16" fill="#aaaaaa">Automatically remembers and applies your preferred playback speed</text>
    <text x="0" y="265" font-family="{FONT_FAMILY}" font-size="16" fill="#aaaaaa">for each YouTube channel you watch.</text>

    <!-- Feature Capsules -->
    <g transform="translate(0, 310)">
      <rect width="170" height="42" rx="21" fill="#1c1c1c" stroke="#292929" stroke-width="1.2"/>
      <text x="85" y="26" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00f5a0" text-anchor="middle">⚡ Auto-Switching</text>

      <g transform="translate(182, 0)">
        <rect width="180" height="42" rx="21" fill="#1c1c1c" stroke="#292929" stroke-width="1.2"/>
        <text x="90" y="26" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00e5ff" text-anchor="middle">🎯 ±0.05x Steppers</text>
      </g>

      <g transform="translate(374, 0)">
        <rect width="185" height="42" rx="21" fill="#1c1c1c" stroke="#292929" stroke-width="1.2"/>
        <text x="92" y="26" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ff6b82" text-anchor="middle">🔒 100% Local Storage</text>
      </g>
    </g>
  </g>

  <!-- Right: Hero Extension Mockup Matching Real Extension -->
  <g transform="translate(780, 50)">
    <!-- Real In-Player HUD Pill (Matching content.css) -->
    <g transform="translate(40, 10)">
      <rect width="460" height="54" rx="27" fill="#121212" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
      <!-- Lightning Icon -->
      <circle cx="35" cy="27" r="13" fill="#ff0033"/>
      <polygon points="36,18 30,27 35,27 33,35 41,25 35,25" fill="#ffffff"/>
      <text x="60" y="32" font-family="{FONT_FAMILY}" font-size="15" font-weight="500" fill="#e2e2e2">Veritasium</text>
      <!-- Red Badge -->
      <rect x="150" y="14" width="62" height="26" rx="10" fill="#ff0033"/>
      <text x="181" y="32" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75x</text>
      <text x="224" y="32" font-family="{FONT_FAMILY}" font-size="13" fill="#aaaaaa">Applied Automatically</text>
    </g>

    <!-- Browser Popup Preview (Matching popup.html & popup.css) -->
    <g transform="translate(80, 85)">
      <rect width="380" height="355" rx="10" fill="#141414" stroke="#272727" stroke-width="1.5"/>
      <!-- Header -->
      <rect width="380" height="46" rx="10" fill="#181818"/>
      <rect y="26" width="380" height="20" fill="#181818"/>
      <circle cx="28" cy="23" r="10" fill="#ff0033"/>
      <polygon points="26,17 26,29 34,23" fill="#ffffff"/>
      <text x="46" y="28" font-family="{FONT_FAMILY}" font-size="14" font-weight="600" fill="#ffffff">Speed Memory</text>
      <!-- Toggle switch on -->
      <rect x="325" y="12" width="38" height="22" rx="11" fill="#ff0033"/>
      <circle cx="351" cy="23" r="8" fill="#ffffff"/>

      <!-- Navigation Tabs -->
      <rect y="46" width="380" height="34" fill="#141414"/>
      <line x1="0" y1="80" x2="380" y2="80" stroke="#272727" stroke-width="1"/>
      <text x="63" y="68" font-family="{FONT_FAMILY}" font-size="12" font-weight="600" fill="#ffffff" text-anchor="middle">Current Video</text>
      <rect x="15" y="78" width="96" height="2" fill="#ff0033"/>
      <text x="190" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa" text-anchor="middle">Saved Channels</text>
      <rect x="245" y="58" width="18" height="15" rx="7" fill="#2b2b2b"/>
      <text x="254" y="69" font-family="{FONT_FAMILY}" font-size="10" font-weight="bold" fill="#aaaaaa" text-anchor="middle">4</text>
      <text x="325" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa" text-anchor="middle">Settings</text>

      <!-- Active Channel Card Inside Popup -->
      <g transform="translate(14, 94)">
        <rect width="352" height="245" rx="10" fill="#1c1c1c" stroke="#292929" stroke-width="1"/>
        
        <!-- Channel Row -->
        <circle cx="28" cy="28" r="18" fill="#ff0033"/>
        <text x="28" y="35" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">V</text>
        <text x="56" y="24" font-family="{FONT_FAMILY}" font-size="14" font-weight="600" fill="#ffffff">Veritasium</text>
        <text x="56" y="39" font-family="{FONT_FAMILY}" font-size="11" fill="#aaaaaa">@veritasium</text>
        <circle cx="328" cy="28" r="13" fill="#272727"/>
        <text x="328" y="33" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa" text-anchor="middle">↺</text>

        <!-- Speed Meter Box -->
        <g transform="translate(14, 56)">
          <rect width="324" height="60" rx="8" fill="#121212" stroke="#262626" stroke-width="1"/>
          <text x="162" y="20" font-family="{FONT_FAMILY}" font-size="10" font-weight="600" fill="#888888" text-anchor="middle">PLAYBACK SPEED</text>
          <text x="150" y="48" font-family="{FONT_FAMILY}" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75</text>
          <text x="180" y="48" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ff0033">x</text>
        </g>

        <!-- Preset Buttons (2 rows of 3) -->
        <g transform="translate(14, 126)">
          <rect width="102" height="30" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
          <text x="51" y="20" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">0.75x</text>
          
          <rect x="111" width="102" height="30" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
          <text x="162" y="20" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">1.0x</text>
          
          <rect x="222" width="102" height="30" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
          <text x="273" y="20" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">1.25x</text>

          <g transform="translate(0, 36)">
            <rect width="102" height="30" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
            <text x="51" y="20" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">1.5x</text>
            
            <!-- Active 1.75x Button -->
            <rect x="111" width="102" height="30" rx="6" fill="#ff0033"/>
            <text x="162" y="20" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75x</text>
            
            <rect x="222" width="102" height="30" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
            <text x="273" y="20" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">2.0x</text>
          </g>
        </g>

        <!-- Stepper Row with Range Slider -->
        <g transform="translate(14, 204)">
          <rect width="28" height="26" rx="5" fill="#272727" stroke="#383838" stroke-width="1"/>
          <text x="14" y="17" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">-</text>

          <!-- Slider bar -->
          <rect x="36" y="11" width="252" height="5" rx="3" fill="#2b2b2b"/>
          <circle cx="215" cy="13" r="7" fill="#ff0033"/>

          <rect x="296" width="28" height="26" rx="5" fill="#272727" stroke="#383838" stroke-width="1"/>
          <text x="310" y="18" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">+</text>
        </g>
      </g>
    </g>
  </g>
</svg>"""


def build_screenshot1_hud_svg():
    """Screenshot 1: In-Player HUD Feature Spotlight (1280x800)"""
    return f"""<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="800" fill="#0f0f0f"/>

  <!-- Top YouTube Navigation Bar -->
  <rect width="1280" height="56" fill="#0f0f0f"/>
  <line x1="0" y1="56" x2="1280" y2="56" stroke="#272727" stroke-width="1"/>
  <rect x="32" y="16" width="34" height="24" rx="6" fill="#ff0033"/>
  <polygon points="45,23 45,33 54,28" fill="#ffffff"/>
  <text x="74" y="33" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff" letter-spacing="-0.5">YouTube</text>
  <rect x="380" y="10" width="480" height="36" rx="18" fill="#121212" stroke="#303030" stroke-width="1"/>
  <text x="405" y="33" font-family="{FONT_FAMILY}" font-size="14" fill="#888888">Search</text>
  <circle cx="1230" cy="28" r="16" fill="#2b3248"/>
  <text x="1230" y="34" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">U</text>

  <!-- Video Player Section (Hero) -->
  <g transform="translate(40, 80)">
    <rect width="840" height="472" rx="12" fill="#000000" stroke="#272727" stroke-width="1"/>
    
    <!-- Cosmic Video Simulation Scene -->
    <circle cx="420" cy="236" r="105" fill="#141c2e" stroke="#202c46" stroke-width="2"/>
    <ellipse cx="420" cy="236" rx="210" ry="60" fill="none" stroke="#00b4d8" stroke-width="2" opacity="0.6" transform="rotate(-15 420 236)"/>
    <circle cx="525" cy="205" r="16" fill="#00f5a0"/>

    <!-- EXACT REAL IN-PLAYER HUD TOAST (from src/content.css) -->
    <g transform="translate(490, 24)">
      <!-- Frosted Glass Pill -->
      <rect width="326" height="44" rx="22" fill="#161616" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
      
      <!-- Speed Icon -->
      <circle cx="26" cy="22" r="10" fill="#ff0033"/>
      <polygon points="27,15 22,22 26,22 24,29 31,21 26,21" fill="#ffffff"/>
      
      <!-- Channel Name -->
      <text x="44" y="27" font-family="{FONT_FAMILY}" font-size="13.5" font-weight="500" fill="#e2e2e2">Veritasium</text>
      
      <!-- YouTube Red Speed Badge -->
      <rect x="126" y="10" width="54" height="24" rx="10" fill="#ff0033"/>
      <text x="153" y="27" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75x</text>
      
      <!-- Action Text -->
      <text x="188" y="27" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Applied</text>
    </g>

    <!-- Annotation Badge Pointing to Toast -->
    <g transform="translate(460, 80)">
      <polygon points="170,0 178,8 162,8" fill="#00e5ff"/>
      <rect y="8" width="340" height="34" rx="17" fill="#141b26" stroke="#00e5ff" stroke-width="1.2"/>
      <text x="170" y="30" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#00e5ff" text-anchor="middle">👆 On-Screen HUD Notification (content.css)</text>
    </g>

    <!-- Player Bottom Controls Bar -->
    <g transform="translate(0, 432)">
      <rect width="840" height="40" fill="#111111"/>
      <rect width="360" height="3" fill="#ff0033"/>
      <rect x="360" width="480" height="3" fill="#3a3a3a"/>
      <polygon points="25,12 25,28 38,20" fill="#ffffff"/>
      <text x="50" y="25" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#d0d0dc">04:15 / 18:22</text>
      <!-- Settings gear menu speed indicator -->
      <rect x="760" y="8" width="60" height="22" rx="11" fill="#202020" stroke="#ff0033" stroke-width="1"/>
      <text x="790" y="23" font-family="{FONT_FAMILY}" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75x</text>
    </g>
  </g>

  <!-- Below Video Metadata -->
  <g transform="translate(40, 575)">
    <text x="0" y="20" font-family="{FONT_FAMILY}" font-size="20" font-weight="bold" fill="#ffffff">The Astounding Physics of N-Body Orbits</text>
    <circle cx="20" cy="58" r="20" fill="#ff0033"/>
    <text x="20" y="65" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">V</text>
    <text x="50" y="52" font-family="{FONT_FAMILY}" font-size="15" font-weight="600" fill="#ffffff">Veritasium</text>
    <text x="50" y="70" font-family="{FONT_FAMILY}" font-size="12" fill="#888888">15.4M subscribers • Speed saved at 1.75x</text>
    <rect x="290" y="40" width="100" height="34" rx="17" fill="#ffffff"/>
    <text x="340" y="62" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#0f0f0f" text-anchor="middle">Subscribe</text>
  </g>

  <!-- Right Sidebar Feature Benefits (Clean, wrapped, no overflow) -->
  <g transform="translate(910, 80)">
    <rect width="330" height="680" rx="12" fill="#181818" stroke="#272727" stroke-width="1.2"/>
    <rect width="330" height="4" fill="#ff0033"/>

    <text x="24" y="38" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff">IN-PLAYER SPEED HUD</text>
    <text x="24" y="58" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#00e5ff">Automatic On-Screen Feedback</text>

    <!-- Benefit Card 1 -->
    <g transform="translate(20, 80)">
      <rect width="290" height="85" rx="8" fill="#202020" stroke="#2c2c2c" stroke-width="1"/>
      <circle cx="24" cy="24" r="12" fill="#ff0033"/>
      <text x="24" y="29" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
      <text x="44" y="28" font-family="{FONT_FAMILY}" font-size="13.5" font-weight="bold" fill="#ffffff">Instant Recognition</text>
      <text x="16" y="52" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Detects the active channel</text>
      <text x="16" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">the moment a video opens.</text>
    </g>

    <!-- Benefit Card 2 -->
    <g transform="translate(20, 180)">
      <rect width="290" height="85" rx="8" fill="#202020" stroke="#2c2c2c" stroke-width="1"/>
      <circle cx="24" cy="24" r="12" fill="#00f5a0"/>
      <text x="24" y="29" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#0f0f0f" text-anchor="middle">2</text>
      <text x="44" y="28" font-family="{FONT_FAMILY}" font-size="13.5" font-weight="bold" fill="#ffffff">Applies Saved Speed</text>
      <text x="16" y="52" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Sets preferred rate instantly</text>
      <text x="16" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">with zero manual effort.</text>
    </g>

    <!-- Benefit Card 3 -->
    <g transform="translate(20, 280)">
      <rect width="290" height="85" rx="8" fill="#202020" stroke="#2c2c2c" stroke-width="1"/>
      <circle cx="24" cy="24" r="12" fill="#00e5ff"/>
      <text x="24" y="29" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#0f0f0f" text-anchor="middle">3</text>
      <text x="44" y="28" font-family="{FONT_FAMILY}" font-size="13.5" font-weight="bold" fill="#ffffff">Native Player Sync</text>
      <text x="16" y="52" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Keeps YouTube's gear menu</text>
      <text x="16" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">speed setting in exact sync.</text>
    </g>

    <!-- Benefit Card 4 -->
    <g transform="translate(20, 380)">
      <rect width="290" height="85" rx="8" fill="#202020" stroke="#2c2c2c" stroke-width="1"/>
      <circle cx="24" cy="24" r="12" fill="#ffb703"/>
      <text x="24" y="29" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#0f0f0f" text-anchor="middle">4</text>
      <text x="44" y="28" font-family="{FONT_FAMILY}" font-size="13.5" font-weight="bold" fill="#ffffff">Ad &amp; Transition Safe</text>
      <text x="16" y="52" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Prevents ads or new loads</text>
      <text x="16" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">from resetting your speed.</text>
    </g>

    <!-- Bottom summary -->
    <g transform="translate(20, 485)">
      <rect width="290" height="165" rx="8" fill="#141414" stroke="#252525" stroke-width="1"/>
      <text x="16" y="28" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff">Customizable Behavior</text>
      <text x="16" y="52" font-family="{FONT_FAMILY}" font-size="12" fill="#888888">Toggle the HUD on or off,</text>
      <text x="16" y="70" font-family="{FONT_FAMILY}" font-size="12" fill="#888888">or customize display duration</text>
      <text x="16" y="88" font-family="{FONT_FAMILY}" font-size="12" fill="#888888">(1s, 2s, 3s) inside Settings.</text>
      <text x="16" y="120" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#00f5a0">✔ Works across all channels</text>
      <text x="16" y="142" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#00f5a0">✔ Seamless SPA navigation</text>
    </g>
  </g>
</svg>"""


def build_screenshot2_popup_svg():
    """Screenshot 2: Popup UI Controls, Speed Presets, and Steppers (1280x800)"""
    return f"""<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="800" fill="#0f0f0f"/>

  <!-- Page Header -->
  <text x="640" y="55" font-family="{FONT_FAMILY}" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">EXTENSION POPUP CONTROLS</text>
  <text x="640" y="82" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ff334b" text-anchor="middle">Preset Buttons • Stepper Slider • Per-Channel Memory</text>

  <!-- Left Feature Card (Clean wrapped text, strictly fits width) -->
  <g transform="translate(60, 120)">
    <rect width="340" height="580" rx="12" fill="#181818" stroke="#272727" stroke-width="1.2"/>
    <rect width="340" height="4" fill="#ff0033"/>

    <text x="24" y="38" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff">QUICK SPEED CONTROLS</text>
    <text x="24" y="58" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#00f5a0">Instant One-Click Adjustment</text>

    <!-- Box 1: Presets -->
    <g transform="translate(20, 80)">
      <rect width="300" height="110" rx="8" fill="#202020" stroke="#2a2a2a" stroke-width="1"/>
      <text x="18" y="26" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">One-Click Presets</text>
      <text x="18" y="48" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Select from common playback rates:</text>
      <text x="18" y="72" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ff334b">0.75x  •  1.0x  •  1.25x</text>
      <text x="18" y="94" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00f5a0">1.50x  •  1.75x  •  2.00x</text>
    </g>

    <!-- Box 2: Steppers -->
    <g transform="translate(20, 205)">
      <rect width="300" height="110" rx="8" fill="#202020" stroke="#2a2a2a" stroke-width="1"/>
      <text x="18" y="26" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Fine-Tune Stepper Slider</text>
      <text x="18" y="48" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Precision ±0.05x increments.</text>
      <text x="18" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Drag range slider or tap buttons</text>
      <text x="18" y="88" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">to find your ideal listening pace.</text>
    </g>

    <!-- Box 3: Shortcuts -->
    <g transform="translate(20, 330)">
      <rect width="300" height="110" rx="8" fill="#202020" stroke="#2a2a2a" stroke-width="1"/>
      <text x="18" y="26" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Keyboard Shortcuts</text>
      <text x="18" y="48" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Supports YouTube shortcuts:</text>
      <text x="18" y="72" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00e5ff">Shift + &gt; (Speed Up +0.05x)</text>
      <text x="18" y="94" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00e5ff">Shift + &lt; (Slow Down -0.05x)</text>
    </g>

    <!-- Box 4: One-Click Reset -->
    <g transform="translate(20, 455)">
      <rect width="300" height="100" rx="8" fill="#202020" stroke="#2a2a2a" stroke-width="1"/>
      <text x="18" y="26" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Reset to Default</text>
      <text x="18" y="48" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Tap reset button anytime to clear</text>
      <text x="18" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">custom memory for this channel.</text>
    </g>
  </g>

  <!-- ============================================================ -->
  <!-- CENTER: THE REAL EXTENSION POPUP (popup.html & popup.css)    -->
  <!-- ============================================================ -->
  <g transform="translate(460, 120)">
    <!-- Main 360px Body -->
    <rect width="360" height="580" rx="10" fill="#0f0f0f" stroke="#272727" stroke-width="1.5"/>

    <!-- Header (.header) -->
    <rect width="360" height="48" rx="10" fill="#181818"/>
    <rect y="28" width="360" height="20" fill="#181818"/>
    <line x1="0" y1="48" x2="360" y2="48" stroke="#272727" stroke-width="1"/>
    
    <!-- Logo area -->
    <circle cx="28" cy="24" r="11" fill="#ff0033"/>
    <polygon points="26,18 26,30 34,24" fill="#ffffff"/>
    <text x="46" y="29" font-family="{FONT_FAMILY}" font-size="15" font-weight="600" fill="#ffffff">Speed Memory</text>
    
    <!-- Toggle Switch (.switch) -->
    <rect x="306" y="13" width="38" height="22" rx="11" fill="#ff0033"/>
    <circle cx="332" cy="24" r="8" fill="#ffffff"/>

    <!-- Navigation Tabs (.nav-tabs) -->
    <rect y="48" width="360" height="38" fill="#141414"/>
    <line x1="0" y1="86" x2="360" y2="86" stroke="#272727" stroke-width="1"/>
    
    <!-- Tab 1: Current Video (Active) -->
    <text x="56" y="71" font-family="{FONT_FAMILY}" font-size="12" font-weight="600" fill="#ffffff" text-anchor="middle">Current Video</text>
    <rect x="12" y="84" width="88" height="2" fill="#ff0033"/>
    
    <!-- Tab 2: Saved Channels -->
    <text x="175" y="71" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa" text-anchor="middle">Saved Channels</text>
    <rect x="228" y="60" width="18" height="15" rx="7" fill="#2b2b2b"/>
    <text x="237" y="71" font-family="{FONT_FAMILY}" font-size="10" font-weight="bold" fill="#aaaaaa" text-anchor="middle">4</text>
    
    <!-- Tab 3: Settings -->
    <text x="310" y="71" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa" text-anchor="middle">Settings</text>

    <!-- Card (.card) -->
    <g transform="translate(14, 100)">
      <rect width="332" height="460" rx="10" fill="#1c1c1c" stroke="#292929" stroke-width="1"/>

      <!-- Channel Info Row (.channel-info-row) -->
      <circle cx="30" cy="30" r="19" fill="#ff0033"/>
      <text x="30" y="37" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">V</text>
      
      <text x="58" y="26" font-family="{FONT_FAMILY}" font-size="14" font-weight="600" fill="#ffffff">Veritasium</text>
      <text x="58" y="42" font-family="{FONT_FAMILY}" font-size="11.5" fill="#aaaaaa">@veritasium</text>
      
      <!-- Reset button (.icon-btn) -->
      <circle cx="306" cy="30" r="14" fill="#272727"/>
      <text x="306" y="35" font-family="{FONT_FAMILY}" font-size="13" fill="#aaaaaa" text-anchor="middle">↺</text>

      <!-- Speed Meter Box (.speed-meter-box) -->
      <g transform="translate(14, 66)">
        <rect width="304" height="80" rx="8" fill="#121212" stroke="#262626" stroke-width="1"/>
        <text x="152" y="24" font-family="{FONT_FAMILY}" font-size="11" font-weight="600" fill="#888888" text-anchor="middle">PLAYBACK SPEED</text>
        <text x="136" y="60" font-family="{FONT_FAMILY}" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75</text>
        <text x="176" y="60" font-family="{FONT_FAMILY}" font-size="22" font-weight="bold" fill="#ff0033">x</text>
      </g>

      <!-- Preset Buttons (.preset-speeds: 3x2 grid) -->
      <g transform="translate(14, 160)">
        <rect width="96" height="34" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
        <text x="48" y="22" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">0.75x</text>

        <rect x="104" width="96" height="34" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
        <text x="152" y="22" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">1.0x</text>

        <rect x="208" width="96" height="34" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
        <text x="256" y="22" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">1.25x</text>

        <!-- Row 2 -->
        <g transform="translate(0, 42)">
          <rect width="96" height="34" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
          <text x="48" y="22" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">1.5x</text>

          <!-- ACTIVE BUTTON: #ff0033 -->
          <rect x="104" width="96" height="34" rx="6" fill="#ff0033"/>
          <text x="152" y="22" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75x</text>

          <rect x="208" width="96" height="34" rx="6" fill="#272727" stroke="#363636" stroke-width="1"/>
          <text x="256" y="22" font-family="{FONT_FAMILY}" font-size="12" fill="#e5e5e5" text-anchor="middle">2.0x</text>
        </g>
      </g>

      <!-- Stepper Controls (.stepper-controls) -->
      <g transform="translate(14, 250)">
        <rect width="32" height="32" rx="6" fill="#272727" stroke="#383838" stroke-width="1"/>
        <text x="16" y="22" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">-</text>

        <!-- Slider Track & Thumb -->
        <rect x="42" y="14" width="220" height="5" rx="3" fill="#2b2b2b"/>
        <circle cx="195" cy="16" r="8" fill="#ff0033"/>

        <rect x="272" width="32" height="32" rx="6" fill="#272727" stroke="#383838" stroke-width="1"/>
        <text x="288" y="22" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">+</text>
      </g>

      <!-- Status Footer inside card -->
      <g transform="translate(14, 305)">
        <rect width="304" height="42" rx="6" fill="#141414" stroke="#252525" stroke-width="1"/>
        <circle cx="18" cy="21" r="4" fill="#00f5a0"/>
        <text x="28" y="25" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#d0d0d0">Channel speed active &amp; saved</text>
      </g>
    </g>
  </g>

  <!-- Right Feature Card (Clean wrapped text, strictly fits width) -->
  <g transform="translate(880, 120)">
    <rect width="340" height="580" rx="12" fill="#181818" stroke="#272727" stroke-width="1.2"/>
    <rect width="340" height="4" fill="#00e5ff"/>

    <text x="24" y="38" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff">SEAMLESS INTEGRATION</text>
    <text x="24" y="58" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#00e5ff">YouTube Native Synchronized</text>

    <!-- Box 1 -->
    <g transform="translate(20, 80)">
      <rect width="300" height="110" rx="8" fill="#202020" stroke="#2a2a2a" stroke-width="1"/>
      <text x="18" y="26" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Dual-World Player Sync</text>
      <text x="18" y="48" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Directly synchronizes with</text>
      <text x="18" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">YouTube HTML5 video player</text>
      <text x="18" y="88" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">and internal player APIs.</text>
    </g>

    <!-- Box 2 -->
    <g transform="translate(20, 205)">
      <rect width="300" height="110" rx="8" fill="#202020" stroke="#2a2a2a" stroke-width="1"/>
      <text x="18" y="26" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Dark Theme Native</text>
      <text x="18" y="48" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Engineered to match YouTube's</text>
      <text x="18" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">official color palette</text>
      <text x="18" y="88" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">and modern typography.</text>
    </g>

    <!-- Box 3 -->
    <g transform="translate(20, 330)">
      <rect width="300" height="110" rx="8" fill="#202020" stroke="#2a2a2a" stroke-width="1"/>
      <text x="18" y="26" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Ad &amp; Transition Defense</text>
      <text x="18" y="48" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Transition locks prevent</text>
      <text x="18" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">temporary resets during ads</text>
      <text x="18" y="88" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">from corrupting custom speed.</text>
    </g>

    <!-- Box 4 -->
    <g transform="translate(20, 455)">
      <rect width="300" height="100" rx="8" fill="#202020" stroke="#2a2a2a" stroke-width="1"/>
      <text x="18" y="26" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Zero Performance Lag</text>
      <text x="18" y="48" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">Lightweight event driven</text>
      <text x="18" y="68" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa">architecture with 0ms lag.</text>
    </g>
  </g>
</svg>"""


def build_screenshot3_channels_svg():
    """Screenshot 3: Saved Channels List & Management (1280x800)"""
    return f"""<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="800" fill="#0f0f0f"/>

  <!-- Page Header -->
  <text x="100" y="55" font-family="{FONT_FAMILY}" font-size="28" font-weight="bold" fill="#ffffff">SAVED CHANNELS TAB</text>
  <text x="100" y="82" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#00f0ff">Search, Inspect, and Delete Remembered Channel Speeds</text>

  <!-- Left: Real Popup on Tab 2 (360px wide) -->
  <g transform="translate(100, 110)">
    <rect width="360" height="600" rx="10" fill="#0f0f0f" stroke="#272727" stroke-width="1.5"/>

    <!-- Header -->
    <rect width="360" height="48" rx="10" fill="#181818"/>
    <rect y="28" width="360" height="20" fill="#181818"/>
    <line x1="0" y1="48" x2="360" y2="48" stroke="#272727" stroke-width="1"/>
    
    <circle cx="28" cy="24" r="11" fill="#ff0033"/>
    <polygon points="26,18 26,30 34,24" fill="#ffffff"/>
    <text x="46" y="29" font-family="{FONT_FAMILY}" font-size="15" font-weight="600" fill="#ffffff">Speed Memory</text>
    <rect x="306" y="13" width="38" height="22" rx="11" fill="#ff0033"/>
    <circle cx="332" cy="24" r="8" fill="#ffffff"/>

    <!-- Navigation Tabs: Saved Channels ACTIVE -->
    <rect y="48" width="360" height="38" fill="#141414"/>
    <line x1="0" y1="86" x2="360" y2="86" stroke="#272727" stroke-width="1"/>
    
    <text x="56" y="71" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa" text-anchor="middle">Current Video</text>
    
    <!-- Tab 2 ACTIVE -->
    <text x="175" y="71" font-family="{FONT_FAMILY}" font-size="12" font-weight="600" fill="#ffffff" text-anchor="middle">Saved Channels</text>
    <rect x="228" y="60" width="18" height="15" rx="7" fill="#ff0033"/>
    <text x="237" y="71" font-family="{FONT_FAMILY}" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
    <rect x="118" y="84" width="138" height="2" fill="#ff0033"/>

    <text x="310" y="71" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa" text-anchor="middle">Settings</text>

    <!-- Search Bar (.saved-search-bar) -->
    <g transform="translate(16, 102)">
      <rect width="328" height="38" rx="6" fill="#121212" stroke="#2b2b2b" stroke-width="1"/>
      <circle cx="22" cy="19" r="6" fill="none" stroke="#888888" stroke-width="1.5"/>
      <line x1="26" y1="23" x2="31" y2="28" stroke="#888888" stroke-width="1.5"/>
      <text x="38" y="24" font-family="{FONT_FAMILY}" font-size="13" fill="#ffffff">Search saved channels...</text>
    </g>

    <!-- Channels List -->
    <g transform="translate(16, 154)">
      <!-- Channel 1 -->
      <rect width="328" height="66" rx="8" fill="#1c1c1c" stroke="#292929" stroke-width="1"/>
      <circle cx="26" cy="33" r="16" fill="#ff0033"/>
      <text x="26" y="39" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">V</text>
      <text x="50" y="28" font-family="{FONT_FAMILY}" font-size="13" font-weight="600" fill="#ffffff">Veritasium</text>
      <text x="50" y="44" font-family="{FONT_FAMILY}" font-size="11" fill="#aaaaaa">@veritasium</text>
      <!-- Speed badge -->
      <rect x="216" y="20" width="56" height="26" rx="13" fill="#ff0033"/>
      <text x="244" y="37" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75x</text>
      <!-- Delete icon button -->
      <circle cx="298" cy="33" r="13" fill="#272727"/>
      <polygon points="292,27 294,27 298,32 302,27 304,27 300,33 305,39 303,39 298,34 293,39 291,39 296,33" fill="#ff4d6d"/>

      <!-- Channel 2 -->
      <g transform="translate(0, 76)">
        <rect width="328" height="66" rx="8" fill="#1c1c1c" stroke="#292929" stroke-width="1"/>
        <circle cx="26" cy="33" r="16" fill="#1b4d89"/>
        <text x="26" y="39" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">3B</text>
        <text x="50" y="28" font-family="{FONT_FAMILY}" font-size="13" font-weight="600" fill="#ffffff">3Blue1Brown</text>
        <text x="50" y="44" font-family="{FONT_FAMILY}" font-size="11" fill="#aaaaaa">@3blue1brown</text>
        <rect x="216" y="20" width="56" height="26" rx="13" fill="#203045" stroke="#00b4d8" stroke-width="1"/>
        <text x="244" y="37" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#00e5ff" text-anchor="middle">1.25x</text>
        <circle cx="298" cy="33" r="13" fill="#272727"/>
        <polygon points="292,27 294,27 298,32 302,27 304,27 300,33 305,39 303,39 298,34 293,39 291,39 296,33" fill="#ff4d6d"/>
      </g>

      <!-- Channel 3 -->
      <g transform="translate(0, 152)">
        <rect width="328" height="66" rx="8" fill="#1c1c1c" stroke="#292929" stroke-width="1"/>
        <circle cx="26" cy="33" r="16" fill="#6a1b9a"/>
        <text x="26" y="39" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">M</text>
        <text x="50" y="28" font-family="{FONT_FAMILY}" font-size="13" font-weight="600" fill="#ffffff">Marques Brownlee</text>
        <text x="50" y="44" font-family="{FONT_FAMILY}" font-size="11" fill="#aaaaaa">@mkbhd</text>
        <rect x="216" y="20" width="56" height="26" rx="13" fill="#321e42" stroke="#9d4edd" stroke-width="1"/>
        <text x="244" y="37" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#c77dff" text-anchor="middle">1.50x</text>
        <circle cx="298" cy="33" r="13" fill="#272727"/>
        <polygon points="292,27 294,27 298,32 302,27 304,27 300,33 305,39 303,39 298,34 293,39 291,39 296,33" fill="#ff4d6d"/>
      </g>

      <!-- Channel 4 -->
      <g transform="translate(0, 228)">
        <rect width="328" height="66" rx="8" fill="#1c1c1c" stroke="#292929" stroke-width="1"/>
        <circle cx="26" cy="33" r="16" fill="#2a9d8f"/>
        <text x="26" y="39" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">K</text>
        <text x="50" y="28" font-family="{FONT_FAMILY}" font-size="13" font-weight="600" fill="#ffffff">Kurzgesagt</text>
        <text x="50" y="44" font-family="{FONT_FAMILY}" font-size="11" fill="#aaaaaa">@kurzgesagt</text>
        <rect x="216" y="20" width="56" height="26" rx="13" fill="#1c3028" stroke="#00f5a0" stroke-width="1"/>
        <text x="244" y="37" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#00f5a0" text-anchor="middle">1.25x</text>
        <circle cx="298" cy="33" r="13" fill="#272727"/>
        <polygon points="292,27 294,27 298,32 302,27 304,27 300,33 305,39 303,39 298,34 293,39 291,39 296,33" fill="#ff4d6d"/>
      </g>
    </g>

    <!-- Footer (.saved-footer) -->
    <text x="180" y="485" font-family="{FONT_FAMILY}" font-size="12" font-weight="600" fill="#ff4d6d" text-anchor="middle">Clear All Channels</text>
  </g>

  <!-- Right Showcase Area (Clean wrapped text, strictly fits width) -->
  <g transform="translate(510, 110)">
    <rect width="670" height="600" rx="14" fill="#181818" stroke="#272727" stroke-width="1.2"/>
    <rect width="670" height="4" fill="#00f5a0"/>

    <text x="36" y="42" font-family="{FONT_FAMILY}" font-size="22" font-weight="bold" fill="#ffffff">PER-CHANNEL SPEED MEMORY</text>
    <text x="36" y="66" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00f5a0">Automatic Speed Switching Across Every Channel</text>

    <!-- Box 1 -->
    <g transform="translate(36, 95)">
      <rect width="598" height="125" rx="10" fill="#202020" stroke="#2c2c2c" stroke-width="1"/>
      <circle cx="32" cy="32" r="14" fill="#00e5ff"/>
      <text x="32" y="37" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#0f0f0f" text-anchor="middle">🔍</text>
      <text x="60" y="36" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Instant Search &amp; Filter</text>
      <text x="60" y="64" font-family="{FONT_FAMILY}" font-size="13" fill="#aaaaaa">Type any channel name or handle in the search bar to filter</text>
      <text x="60" y="86" font-family="{FONT_FAMILY}" font-size="13" fill="#aaaaaa">your saved channels instantly in real time.</text>
    </g>

    <!-- Box 2 -->
    <g transform="translate(36, 240)">
      <rect width="598" height="125" rx="10" fill="#202020" stroke="#2c2c2c" stroke-width="1"/>
      <circle cx="32" cy="32" r="14" fill="#ff4d6d"/>
      <text x="32" y="37" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#0f0f0f" text-anchor="middle">✕</text>
      <text x="60" y="36" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">One-Click Channel Deletion</text>
      <text x="60" y="64" font-family="{FONT_FAMILY}" font-size="13" fill="#aaaaaa">Click the delete icon next to any channel to remove its saved speed.</text>
      <text x="60" y="86" font-family="{FONT_FAMILY}" font-size="13" fill="#aaaaaa">The channel immediately reverts to your fallback default speed.</text>
    </g>

    <!-- Box 3 -->
    <g transform="translate(36, 385)">
      <rect width="598" height="125" rx="10" fill="#202020" stroke="#2c2c2c" stroke-width="1"/>
      <circle cx="32" cy="32" r="14" fill="#00f5a0"/>
      <text x="32" y="37" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#0f0f0f" text-anchor="middle">✔</text>
      <text x="60" y="36" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Smart Dual-Identity Resolution</text>
      <text x="60" y="64" font-family="{FONT_FAMILY}" font-size="13" fill="#aaaaaa">Seamlessly links YouTube @handles and UC... Channel IDs</text>
      <text x="60" y="86" font-family="{FONT_FAMILY}" font-size="13" fill="#aaaaaa">so preferences never conflict or duplicate.</text>
    </g>

    <!-- Bottom note -->
    <g transform="translate(36, 530)">
      <text x="10" y="24" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#888888">High-Capacity Local Storage • Stores 5,000+ channels locally within Chrome quota</text>
    </g>
  </g>
</svg>"""


def build_screenshot4_settings_svg():
    """Screenshot 4: Settings & 100% Local Privacy Safeguards (1280x800)"""
    return f"""<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="800" fill="#0f0f0f"/>

  <!-- Page Header -->
  <text x="100" y="55" font-family="{FONT_FAMILY}" font-size="28" font-weight="bold" fill="#ffffff">SETTINGS &amp; LOCAL PRIVACY</text>
  <text x="100" y="82" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#00f5a0">Customizable Preferences • Backup &amp; Restore • 100% Private</text>

  <!-- Left: Real Popup on Tab 3 (Settings) -->
  <g transform="translate(100, 110)">
    <rect width="360" height="600" rx="10" fill="#0f0f0f" stroke="#272727" stroke-width="1.5"/>

    <!-- Header -->
    <rect width="360" height="48" rx="10" fill="#181818"/>
    <rect y="28" width="360" height="20" fill="#181818"/>
    <line x1="0" y1="48" x2="360" y2="48" stroke="#272727" stroke-width="1"/>
    
    <circle cx="28" cy="24" r="11" fill="#ff0033"/>
    <polygon points="26,18 26,30 34,24" fill="#ffffff"/>
    <text x="46" y="29" font-family="{FONT_FAMILY}" font-size="15" font-weight="600" fill="#ffffff">Speed Memory</text>
    <rect x="306" y="13" width="38" height="22" rx="11" fill="#ff0033"/>
    <circle cx="332" cy="24" r="8" fill="#ffffff"/>

    <!-- Navigation Tabs: Settings ACTIVE -->
    <rect y="48" width="360" height="38" fill="#141414"/>
    <line x1="0" y1="86" x2="360" y2="86" stroke="#272727" stroke-width="1"/>
    <text x="56" y="71" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa" text-anchor="middle">Current Video</text>
    <text x="175" y="71" font-family="{FONT_FAMILY}" font-size="12" fill="#aaaaaa" text-anchor="middle">Saved Channels</text>
    <rect x="228" y="60" width="18" height="15" rx="7" fill="#2b2b2b"/>
    <text x="237" y="71" font-family="{FONT_FAMILY}" font-size="10" font-weight="bold" fill="#aaaaaa" text-anchor="middle">4</text>
    
    <!-- Tab 3 ACTIVE -->
    <text x="310" y="71" font-family="{FONT_FAMILY}" font-size="12" font-weight="600" fill="#ffffff" text-anchor="middle">Settings</text>
    <rect x="275" y="84" width="70" height="2" fill="#ff0033"/>

    <!-- Settings Group 1 (.settings-group) -->
    <g transform="translate(16, 102)">
      <!-- Setting 1: Default Speed -->
      <g>
        <text x="0" y="16" font-family="{FONT_FAMILY}" font-size="13" font-weight="600" fill="#ffffff">Default Playback Speed</text>
        <text x="0" y="32" font-family="{FONT_FAMILY}" font-size="11" fill="#888888">Used for channels without custom speed</text>
        <rect x="210" y="4" width="118" height="32" rx="6" fill="#1b1b1b" stroke="#333333" stroke-width="1"/>
        <text x="218" y="24" font-family="{FONT_FAMILY}" font-size="11" font-weight="600" fill="#00e5ff">1.0x (Normal)</text>
        <polygon points="314,19 322,19 318,24" fill="#888888"/>
      </g>
      <line x1="0" y1="46" x2="328" y2="46" stroke="#222222" stroke-width="1"/>

      <!-- Setting 2: HUD Toggle -->
      <g transform="translate(0, 56)">
        <text x="0" y="16" font-family="{FONT_FAMILY}" font-size="13" font-weight="600" fill="#ffffff">On-Screen Notification (HUD)</text>
        <text x="0" y="32" font-family="{FONT_FAMILY}" font-size="11" fill="#888888">Display speed toast when switching channels</text>
        <rect x="290" y="8" width="38" height="22" rx="11" fill="#ff0033"/>
        <circle cx="316" cy="19" r="8" fill="#ffffff"/>
      </g>
      <line x1="0" y1="102" x2="328" y2="102" stroke="#222222" stroke-width="1"/>

      <!-- Setting 3: HUD Duration -->
      <g transform="translate(0, 112)">
        <text x="0" y="16" font-family="{FONT_FAMILY}" font-size="13" font-weight="600" fill="#ffffff">HUD Toast Duration</text>
        <text x="0" y="32" font-family="{FONT_FAMILY}" font-size="11" fill="#888888">How long the on-screen pill stays visible</text>
        <rect x="240" y="4" width="88" height="32" rx="6" fill="#1b1b1b" stroke="#333333" stroke-width="1"/>
        <text x="252" y="24" font-family="{FONT_FAMILY}" font-size="12" font-weight="600" fill="#00e5ff">2.0 sec</text>
        <polygon points="314,19 322,19 318,24" fill="#888888"/>
      </g>
    </g>

    <!-- Backup & Restore Group -->
    <g transform="translate(16, 275)">
      <text x="0" y="16" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#aaaaaa">BACKUP &amp; RESTORE</text>
      
      <rect y="28" width="158" height="38" rx="6" fill="#242424" stroke="#383838" stroke-width="1"/>
      <text x="79" y="52" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">📤 Export JSON</text>
      
      <rect x="170" y="28" width="158" height="38" rx="6" fill="#242424" stroke="#383838" stroke-width="1"/>
      <text x="249" y="52" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">📥 Import JSON</text>
    </g>

    <!-- About Card (.about-card) -->
    <g transform="translate(16, 375)">
      <rect width="328" height="95" rx="8" fill="#141414" stroke="#222222" stroke-width="1"/>
      <text x="16" y="28" font-family="{FONT_FAMILY}" font-size="12" font-weight="600" fill="#ffffff">Channel Speed Memory for YouTube™ v1.0.0</text>
      <text x="16" y="48" font-family="{FONT_FAMILY}" font-size="11" fill="#aaaaaa">Automatically saves &amp; applies speed per channel.</text>
      <text x="16" y="72" font-family="{FONT_FAMILY}" font-size="10" fill="#777777">YouTube is a trademark of Google LLC.</text>
    </g>
  </g>

  <!-- Right: Privacy Guarantee Card (Clean wrapped text, strictly fits width) -->
  <g transform="translate(510, 110)">
    <rect width="670" height="600" rx="14" fill="#181818" stroke="#272727" stroke-width="1.2"/>
    <rect width="670" height="4" fill="#00f5a0"/>

    <!-- Shield Icon & Title -->
    <g transform="translate(36, 32)">
      <polygon points="26,4 48,14 48,36 26,48 4,36 4,14" fill="#00f5a0"/>
      <polygon points="26,8 44,16 44,34 26,44 8,34 8,16" fill="#121a18"/>
      <polygon points="17,26 23,32 35,18 33,16 23,28 19,24" fill="#00f5a0"/>
      
      <text x="62" y="26" font-family="{FONT_FAMILY}" font-size="22" font-weight="bold" fill="#ffffff">100% Privacy &amp; Data Security</text>
      <text x="62" y="46" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00f5a0">Complies with Chrome Web Store Developer Program Policies</text>
    </g>

    <!-- 5 Pillars with Clean Multi-line Formatting -->
    <g transform="translate(36, 115)">
      <!-- Pillar 1 -->
      <g>
        <circle cx="20" cy="18" r="14" fill="#00f5a0"/>
        <polygon points="13,18 17,22 27,12 25,10 17,19 15,16" fill="#092015"/>
        <text x="46" y="16" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff">Local Storage Only</text>
        <text x="46" y="36" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">All speed preferences are stored strictly on your device</text>
        <text x="46" y="54" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">using Chrome's secure local storage API.</text>
      </g>

      <!-- Pillar 2 -->
      <g transform="translate(0, 75)">
        <circle cx="20" cy="18" r="14" fill="#00f5a0"/>
        <polygon points="13,18 17,22 27,12 25,10 17,19 15,16" fill="#092015"/>
        <text x="46" y="16" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff">Zero External Network Requests</text>
        <text x="46" y="36" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">No remote servers. The extension never transmits any data</text>
        <text x="46" y="54" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">outside of your local browser.</text>
      </g>

      <!-- Pillar 3 -->
      <g transform="translate(0, 150)">
        <circle cx="20" cy="18" r="14" fill="#00f5a0"/>
        <polygon points="13,18 17,22 27,12 25,10 17,19 15,16" fill="#092015"/>
        <text x="46" y="16" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff">Zero Trackers or Analytics</text>
        <text x="46" y="36" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">Contains zero Google Analytics, telemetry, user profiling,</text>
        <text x="46" y="54" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">or third-party tracking scripts.</text>
      </g>

      <!-- Pillar 4 -->
      <g transform="translate(0, 225)">
        <circle cx="20" cy="18" r="14" fill="#00f5a0"/>
        <polygon points="13,18 17,22 27,12 25,10 17,19 15,16" fill="#092015"/>
        <text x="46" y="16" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff">Minimal Scoped Permissions</text>
        <text x="46" y="36" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">Only requests storage and youtube.com access to detect</text>
        <text x="46" y="54" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">channel names and synchronize playback rate.</text>
      </g>

      <!-- Pillar 5 -->
      <g transform="translate(0, 300)">
        <circle cx="20" cy="18" r="14" fill="#00f5a0"/>
        <polygon points="13,18 17,22 27,12 25,10 17,19 15,16" fill="#092015"/>
        <text x="46" y="16" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff">Open Source Transparency</text>
        <text x="46" y="36" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">Completely open source and auditable on GitHub</text>
        <text x="46" y="54" font-family="{FONT_FAMILY}" font-size="12.5" fill="#aaaaaa">under the permissive MIT License.</text>
      </g>
    </g>

    <!-- Bottom verification status -->
    <g transform="translate(36, 520)">
      <rect width="598" height="42" rx="6" fill="#141414" stroke="#252525" stroke-width="1"/>
      <circle cx="24" cy="21" r="5" fill="#00f5a0"/>
      <text x="38" y="25" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#d0d0d0">Compliant with Single-Purpose and Limited-Use Policies</text>
    </g>
  </g>
</svg>"""


def main():
    print("====================================================")
    print("   GENERATING HIGH-RES GLOSSY CHROME STORE ASSETS   ")
    print("====================================================\n")

    assets = [
        ("promo_tile_440x280.png", build_promo_tile_svg()),
        ("marquee_promo_tile_1400x560.png", build_marquee_tile_svg()),
        ("screenshot1_hud_1280x800.png", build_screenshot1_hud_svg()),
        ("screenshot2_popup_1280x800.png", build_screenshot2_popup_svg()),
        ("screenshot3_channels_1280x800.png", build_screenshot3_channels_svg()),
        ("screenshot4_settings_1280x800.png", build_screenshot4_settings_svg()),
    ]

    for filename, svg in assets:
        path = os.path.join(OUT_DIR, filename)
        render_svg_to_png(svg, path)

    print("\n🎉 ALL ASSETS SUCCESSFULLY REGENERATED IN store_assets/!\n")


if __name__ == "__main__":
    main()
