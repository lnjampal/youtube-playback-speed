#!/usr/bin/env python3
"""
Chrome Web Store High-Resolution Graphical Asset Generator

Renders smooth, anti-aliased, glossy 1280x800 presentation screenshots
and 440x280 promotional tile using ImageMagick vector SVG rasterization.
All badges, checkmarks, icons, and delete buttons are drawn as clean vector polygons.
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
    return f"""<svg width="440" height="280" viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg">
  <!-- Deep Dark Background -->
  <rect width="440" height="280" fill="#0c0e14"/>
  
  <!-- Subtle Top Accent Bar -->
  <rect x="0" y="0" width="440" height="4" fill="#ff0033"/>

  <!-- Soft Shadow behind App Icon -->
  <rect x="176" y="28" width="88" height="88" rx="26" fill="#05060a"/>

  <!-- Glowing Red App Icon Container -->
  <rect x="180" y="26" width="80" height="80" rx="22" fill="#ff0033"/>
  <rect x="180" y="26" width="80" height="38" rx="22" fill="#ff2853"/>
  <rect x="180" y="46" width="80" height="18" fill="#ff0033"/>
  
  <!-- Inner Screen -->
  <rect x="194" y="40" width="52" height="52" rx="14" fill="#140206"/>
  
  <!-- Crisp Play Triangle -->
  <polygon points="214,54 214,78 234,66" fill="#ffffff"/>
  
  <!-- Cyan Speed Lightning Badge -->
  <circle cx="248" cy="92" r="16" fill="#00e5ff" stroke="#0c0e14" stroke-width="3"/>
  <polygon points="249,83 242,93 248,93 246,101 254,91 248,91" fill="#08101e"/>

  <!-- Title & Branding -->
  <text x="220" y="146" font-family="{FONT_FAMILY}" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">CHANNEL SPEED MEMORY</text>
  <text x="220" y="172" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ff334b" text-anchor="middle" letter-spacing="1.5">FOR YOUTUBE™</text>

  <!-- Glossy Feature Pill -->
  <rect x="33" y="204" width="374" height="50" rx="25" fill="#00f5a0"/>
  <rect x="35" y="206" width="370" height="46" rx="23" fill="#141824"/>
  <text x="220" y="235" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00f5a0" text-anchor="middle">⚡ Auto-remembers speed per channel</text>
</svg>"""


def build_screenshot1_hud_svg():
    """Screenshot 1: In-Player HUD Feature Spotlight (1280x800)"""
    return f"""<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <!-- YouTube Theater Canvas -->
  <rect width="1280" height="800" fill="#0f0f12"/>

  <!-- Top YouTube Header Bar -->
  <rect width="1280" height="56" fill="#18181f" stroke="#252530" stroke-width="1"/>
  <rect x="32" y="16" width="36" height="24" rx="6" fill="#ff0033"/>
  <polygon points="46,23 46,33 55,28" fill="#ffffff"/>
  <text x="76" y="34" font-family="{FONT_FAMILY}" font-size="19" font-weight="bold" fill="#ffffff" letter-spacing="-0.5">YouTube</text>
  
  <!-- Search Bar -->
  <rect x="420" y="10" width="440" height="36" rx="18" fill="#121216" stroke="#30303c" stroke-width="1"/>
  <text x="445" y="33" font-family="{FONT_FAMILY}" font-size="14" fill="#888899">Search</text>

  <!-- Video Player Section (Hero) -->
  <rect x="38" y="78" width="864" height="488" rx="16" fill="#050608"/>
  <rect x="40" y="80" width="860" height="484" rx="14" fill="#0e1322" stroke="#2a2e3d" stroke-width="1"/>
  
  <!-- Planet & Space Simulation Scene inside Player -->
  <circle cx="450" cy="310" r="120" fill="#16203a" stroke="#253560" stroke-width="2"/>
  <ellipse cx="450" cy="310" rx="240" ry="70" fill="none" stroke="#00b4d8" stroke-width="2" opacity="0.6" transform="rotate(-15 450 310)"/>
  <circle cx="570" cy="275" r="20" fill="#00f5a0"/>

  <!-- Player Controls Bar -->
  <rect x="40" y="524" width="860" height="40" fill="#11131c"/>
  <rect x="40" y="522" width="380" height="3" fill="#ff0033"/>
  <rect x="420" y="522" width="480" height="3" fill="#3a3d4d"/>
  <polygon points="65,536 65,552 78,544" fill="#ffffff"/>
  <text x="95" y="549" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#d0d0dc">04:15 / 18:22</text>
  <!-- Gear menu speed indicator -->
  <rect x="790" y="533" width="80" height="24" rx="12" fill="#1b2234" stroke="#00f5a0" stroke-width="1.2"/>
  <text x="830" y="550" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#00f5a0" text-anchor="middle">1.75x</text>

  <!-- ============================================================ -->
  <!-- HERO FEATURE: GLOSSY IN-PLAYER FLOATING HUD TOAST (PROMINENT)-->
  <!-- ============================================================ -->
  <!-- Outer Glowing Border Container -->
  <rect x="444" y="96" width="432" height="80" rx="40" fill="#00e5ff"/>
  <!-- Inner Glass Card -->
  <rect x="448" y="100" width="424" height="72" rx="36" fill="#0c1220"/>
  <!-- Lightning Icon Circle Badge -->
  <circle cx="490" cy="136" r="24" fill="#00e5ff"/>
  <polygon points="492,122 481,136 490,136 487,150 500,132 492,132" fill="#06101d"/>
  <!-- Toast Text Content -->
  <text x="530" y="131" font-family="{FONT_FAMILY}" font-size="20" font-weight="bold" fill="#ffffff">Veritasium: 1.75x</text>
  <text x="530" y="153" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#00f5a0">⚡ Applied Automatically</text>

  <!-- Feature Annotation Pointer -->
  <polygon points="625,188 635,198 615,198" fill="#00e5ff"/>
  <rect x="458" y="196" width="334" height="38" rx="19" fill="#00e5ff"/>
  <rect x="460" y="198" width="330" height="34" rx="17" fill="#121b28"/>
  <text x="625" y="221" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00e5ff" text-anchor="middle">👆 Instant On-Screen Speed Confirmation</text>

  <!-- Below Video Metadata -->
  <text x="40" y="598" font-family="{FONT_FAMILY}" font-size="22" font-weight="bold" fill="#ffffff">The Astounding Physics of N-Body Orbits</text>
  
  <circle cx="62" cy="642" r="22" fill="#2d3748" stroke="#ff0033" stroke-width="2"/>
  <text x="62" y="650" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">V</text>
  
  <text x="96" y="638" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Veritasium</text>
  <text x="96" y="656" font-family="{FONT_FAMILY}" font-size="13" fill="#8d94a5">15.4M subscribers • Saved at 1.75x</text>
  
  <rect x="340" y="624" width="110" height="38" rx="19" fill="#ffffff"/>
  <text x="395" y="648" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#0f0f12" text-anchor="middle">Subscribe</text>

  <!-- Right Sidebar Feature Highlights -->
  <rect x="930" y="80" width="310" height="680" rx="16" fill="#161924" stroke="#282e42" stroke-width="1.5"/>
  <rect x="930" y="80" width="310" height="6" rx="3" fill="#00e5ff"/>

  <text x="960" y="125" font-family="{FONT_FAMILY}" font-size="20" font-weight="bold" fill="#ffffff">IN-PLAYER HUD TOAST</text>
  <text x="960" y="148" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00e5ff">Automatic On-Screen Feedback</text>

  <!-- Benefit Card 1 -->
  <g transform="translate(955, 180)">
    <rect width="260" height="85" rx="12" fill="#1c202e" stroke="#2e354a" stroke-width="1"/>
    <circle cx="28" cy="28" r="14" fill="#20293d"/>
    <text x="28" y="34" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#00f0ff" text-anchor="middle">1</text>
    <text x="52" y="32" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Instant Recognition</text>
    <text x="20" y="58" font-family="{FONT_FAMILY}" font-size="12" fill="#9ba3b5">Detects the active channel as soon as video loads.</text>
  </g>

  <!-- Benefit Card 2 -->
  <g transform="translate(955, 280)">
    <rect width="260" height="85" rx="12" fill="#1c202e" stroke="#2e354a" stroke-width="1"/>
    <circle cx="28" cy="28" r="14" fill="#20293d"/>
    <text x="28" y="34" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#00f5a0" text-anchor="middle">2</text>
    <text x="52" y="32" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Applies Saved Speed</text>
    <text x="20" y="58" font-family="{FONT_FAMILY}" font-size="12" fill="#9ba3b5">Sets player rate instantly without manual interaction.</text>
  </g>

  <!-- Benefit Card 3 -->
  <g transform="translate(955, 380)">
    <rect width="260" height="85" rx="12" fill="#1c202e" stroke="#2e354a" stroke-width="1"/>
    <circle cx="28" cy="28" r="14" fill="#20293d"/>
    <text x="28" y="34" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ff334b" text-anchor="middle">3</text>
    <text x="52" y="32" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Native Player Sync</text>
    <text x="20" y="58" font-family="{FONT_FAMILY}" font-size="12" fill="#9ba3b5">Keeps YouTube's gear settings menu in exact sync.</text>
  </g>

  <!-- Benefit Card 4 -->
  <g transform="translate(955, 480)">
    <rect width="260" height="85" rx="12" fill="#1c202e" stroke="#2e354a" stroke-width="1"/>
    <circle cx="28" cy="28" r="14" fill="#20293d"/>
    <text x="28" y="34" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffb703" text-anchor="middle">4</text>
    <text x="52" y="32" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Ad &amp; Transition Safe</text>
    <text x="20" y="58" font-family="{FONT_FAMILY}" font-size="12" fill="#9ba3b5">Prevents video ads or player resets from losing your speed.</text>
  </g>
</svg>"""


def build_screenshot2_popup_svg():
    """Screenshot 2: Popup UI Controls, Speed Presets, and Steppers (1280x800)"""
    return f"""<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark Background -->
  <rect width="1280" height="800" fill="#0b0c11"/>

  <!-- Page Header -->
  <text x="640" y="60" font-family="{FONT_FAMILY}" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">INTUITIVE POPUP CONTROLS</text>
  <text x="640" y="90" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#00f0ff" text-anchor="middle">One-Click Presets • Fine-Tune Steppers • Real-Time Channel Detection</text>

  <!-- Left Feature Callout -->
  <g transform="translate(70, 240)">
    <rect width="330" height="160" rx="16" fill="#161924" stroke="#2b3144" stroke-width="1.5"/>
    <rect width="330" height="5" rx="2.5" fill="#ff0033"/>
    <text x="30" y="44" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff">One-Click Presets</text>
    <text x="30" y="74" font-family="{FONT_FAMILY}" font-size="13" fill="#9ba3b5">Instantly jump to standard rates:</text>
    <text x="30" y="102" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ff334b">0.75x  •  1.0x  •  1.25x</text>
    <text x="30" y="130" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#00f5a0">1.50x  •  1.75x  •  2.00x</text>
  </g>

  <g transform="translate(70, 440)">
    <rect width="330" height="160" rx="16" fill="#161924" stroke="#2b3144" stroke-width="1.5"/>
    <rect width="330" height="5" rx="2.5" fill="#00e5ff"/>
    <text x="30" y="44" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff">Keyboard Supported</text>
    <text x="30" y="74" font-family="{FONT_FAMILY}" font-size="13" fill="#9ba3b5">Use native YouTube shortcuts:</text>
    <text x="30" y="104" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#00e5ff">Shift + &gt; (Speed Up)</text>
    <text x="30" y="130" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#00e5ff">Shift + &lt; (Slow Down)</text>
  </g>

  <!-- CENTER: POPUP INTERFACE (Hero Element) -->
  <rect x="428" y="128" width="424" height="624" rx="22" fill="#040508"/>
  
  <g transform="translate(430, 130)">
    <!-- Popup Body -->
    <rect width="420" height="620" rx="20" fill="#141620" stroke="#2e354a" stroke-width="1.8"/>
    
    <!-- Top Header -->
    <rect width="420" height="66" rx="20" fill="#1c1f2e"/>
    <rect y="46" width="420" height="20" fill="#1c1f2e"/>
    <!-- Icon -->
    <rect x="20" y="16" width="34" height="34" rx="10" fill="#ff0033"/>
    <polygon points="33,26 33,40 44,33" fill="#ffffff"/>
    <text x="64" y="38" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Channel Speed Memory</text>
    <circle cx="385" cy="33" r="5" fill="#00f5a0"/>

    <!-- Tabs Bar -->
    <rect x="18" y="78" width="124" height="38" rx="10" fill="#ff0033"/>
    <text x="80" y="102" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">Current Video</text>
    
    <rect x="148" y="78" width="124" height="38" rx="10" fill="#202434"/>
    <text x="210" y="102" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#8d94a5" text-anchor="middle">Channels (3)</text>
    
    <rect x="278" y="78" width="124" height="38" rx="10" fill="#202434"/>
    <text x="340" y="102" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#8d94a5" text-anchor="middle">Settings</text>

    <!-- Active Channel Card -->
    <g transform="translate(18, 132)">
      <rect width="384" height="100" rx="14" fill="#1c202e" stroke="#323a50" stroke-width="1.2"/>
      <circle cx="48" cy="50" r="26" fill="#2b3248" stroke="#ff0033" stroke-width="2"/>
      <text x="48" y="58" font-family="{FONT_FAMILY}" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">V</text>
      
      <text x="88" y="44" font-family="{FONT_FAMILY}" font-size="19" font-weight="bold" fill="#ffffff">Veritasium</text>
      <text x="88" y="66" font-family="{FONT_FAMILY}" font-size="13" fill="#8d94a5">@veritasium</text>
      
      <!-- Speed Pill Badge -->
      <rect x="270" y="28" width="98" height="44" rx="22" fill="#ff0033"/>
      <text x="319" y="56" font-family="{FONT_FAMILY}" font-size="19" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75x</text>
      <text x="319" y="20" font-family="{FONT_FAMILY}" font-size="11" font-weight="bold" fill="#00f5a0" text-anchor="middle">● SAVED</text>
    </g>

    <!-- Presets Section -->
    <text x="22" y="260" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#8d94a5">PLAYBACK SPEED PRESETS</text>

    <!-- Row 1 -->
    <g transform="translate(18, 274)">
      <rect width="122" height="48" rx="10" fill="#202434" stroke="#30374c" stroke-width="1"/>
      <text x="61" y="30" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">0.75x</text>
      
      <rect x="131" width="122" height="48" rx="10" fill="#202434" stroke="#30374c" stroke-width="1"/>
      <text x="192" y="30" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">1.00x</text>
      
      <rect x="262" width="122" height="48" rx="10" fill="#202434" stroke="#30374c" stroke-width="1"/>
      <text x="323" y="30" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">1.25x</text>
    </g>

    <!-- Row 2 -->
    <g transform="translate(18, 332)">
      <rect width="122" height="48" rx="10" fill="#202434" stroke="#30374c" stroke-width="1"/>
      <text x="61" y="30" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">1.50x</text>
      
      <!-- ACTIVE BUTTON (Vibrant YouTube Red with White Star) -->
      <rect x="131" width="122" height="48" rx="10" fill="#ff0033"/>
      <text x="192" y="30" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75x ★</text>
      
      <rect x="262" width="122" height="48" rx="10" fill="#202434" stroke="#30374c" stroke-width="1"/>
      <text x="323" y="30" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">2.00x</text>
    </g>

    <!-- Stepper Buttons Row -->
    <text x="22" y="408" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#8d94a5">FINE-TUNE ADJUSTMENT</text>
    <g transform="translate(18, 420)">
      <rect width="186" height="48" rx="10" fill="#222738" stroke="#343c54" stroke-width="1"/>
      <text x="93" y="30" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">− 0.05x Step</text>
      
      <rect x="198" width="186" height="48" rx="10" fill="#222738" stroke="#343c54" stroke-width="1"/>
      <text x="291" y="30" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">+ 0.05x Step</text>
    </g>

    <!-- Reset Button -->
    <rect x="18" y="488" width="384" height="46" rx="10" fill="#26161b" stroke="#772535" stroke-width="1.2"/>
    <text x="210" y="517" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ff6b82" text-anchor="middle">Reset Channel to Default (1.0x)</text>

    <!-- Footer Status -->
    <rect x="18" y="550" width="384" height="52" rx="10" fill="#181b26"/>
    <circle cx="44" cy="576" r="5" fill="#00f5a0"/>
    <text x="60" y="581" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#d0d5e2">Channel memory active &amp; synchronized</text>
  </g>

  <!-- Right Feature Callouts (Clean multi-line formatting) -->
  <g transform="translate(880, 240)">
    <rect width="330" height="160" rx="16" fill="#161924" stroke="#2b3144" stroke-width="1.5"/>
    <rect width="330" height="5" rx="2.5" fill="#00f5a0"/>
    <text x="30" y="44" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff">Fine-Tune Precision</text>
    <text x="30" y="74" font-family="{FONT_FAMILY}" font-size="13" fill="#9ba3b5">Step by ±0.05x increments.</text>
    <text x="30" y="98" font-family="{FONT_FAMILY}" font-size="13" fill="#9ba3b5">Find your perfect pace (1.15x,</text>
    <text x="30" y="118" font-family="{FONT_FAMILY}" font-size="13" fill="#9ba3b5">1.35x, 1.85x) with single-click ease.</text>
  </g>

  <g transform="translate(880, 440)">
    <rect width="330" height="160" rx="16" fill="#161924" stroke="#2b3144" stroke-width="1.5"/>
    <rect width="330" height="5" rx="2.5" fill="#00e5ff"/>
    <text x="30" y="44" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff">Real-Time Sync</text>
    <text x="30" y="74" font-family="{FONT_FAMILY}" font-size="13" fill="#9ba3b5">Speed changes inside popup</text>
    <text x="30" y="98" font-family="{FONT_FAMILY}" font-size="13" fill="#9ba3b5">immediately update the playing video</text>
    <text x="30" y="118" font-family="{FONT_FAMILY}" font-size="13" fill="#9ba3b5">and native player gear settings.</text>
  </g>
</svg>"""


def build_screenshot3_channels_svg():
    """Screenshot 3: Saved Channels List & Management (1280x800)"""
    return f"""<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1280" height="800" fill="#0c0d12"/>

  <!-- Page Title -->
  <text x="100" y="70" font-family="{FONT_FAMILY}" font-size="30" font-weight="bold" fill="#ffffff">SAVED CHANNELS MANAGEMENT</text>
  <text x="100" y="100" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#00f0ff">Search, Inspect, and Manage Individual Channel Preferences</text>

  <!-- Left: Channels Manager UI Card (Hero) -->
  <g transform="translate(100, 130)">
    <rect width="520" height="610" rx="20" fill="#141620" stroke="#2d3348" stroke-width="1.8"/>

    <!-- Search Bar inside Manager -->
    <rect x="24" y="24" width="472" height="48" rx="12" fill="#1c202e" stroke="#353c54" stroke-width="1.2"/>
    <circle cx="50" cy="48" r="7" fill="none" stroke="#8d94a5" stroke-width="2"/>
    <line x1="55" y1="53" x2="62" y2="60" stroke="#8d94a5" stroke-width="2"/>
    <text x="74" y="53" font-family="{FONT_FAMILY}" font-size="15" fill="#ffffff">Search saved channels...</text>

    <!-- Header Stats -->
    <text x="24" y="100" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00f5a0">4 CHANNELS SAVED</text>

    <!-- Channel Item 1 -->
    <g transform="translate(24, 114)">
      <rect width="472" height="78" rx="12" fill="#1b1f2e" stroke="#2d354a" stroke-width="1.2"/>
      <circle cx="44" cy="39" r="20" fill="#ff0033"/>
      <text x="44" y="46" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">V</text>
      
      <text x="76" y="32" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Veritasium</text>
      <text x="76" y="52" font-family="{FONT_FAMILY}" font-size="13" fill="#8d94a5">@veritasium</text>
      
      <!-- Speed Pill -->
      <rect x="330" y="22" width="76" height="34" rx="17" fill="#ff0033"/>
      <text x="368" y="44" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">1.75x</text>
      
      <!-- Vector Delete X Button -->
      <circle cx="438" cy="39" r="17" fill="#521520" stroke="#ff334b" stroke-width="1.5"/>
      <polygon points="431,32 433,32 438,37 443,32 445,32 440,39 446,46 444,46 438,41 432,46 430,46 436,39" fill="#ffffff"/>
    </g>

    <!-- Channel Item 2 -->
    <g transform="translate(24, 204)">
      <rect width="472" height="78" rx="12" fill="#1b1f2e" stroke="#2d354a" stroke-width="1.2"/>
      <circle cx="44" cy="39" r="20" fill="#1b4d89"/>
      <text x="44" y="46" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">3B</text>
      
      <text x="76" y="32" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">3Blue1Brown</text>
      <text x="76" y="52" font-family="{FONT_FAMILY}" font-size="13" fill="#8d94a5">@3blue1brown</text>
      
      <rect x="330" y="22" width="76" height="34" rx="17" fill="#1c2f42" stroke="#00e5ff" stroke-width="1.5"/>
      <text x="368" y="44" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#00e5ff" text-anchor="middle">1.25x</text>
      
      <!-- Vector Delete X Button -->
      <circle cx="438" cy="39" r="17" fill="#521520" stroke="#ff334b" stroke-width="1.5"/>
      <polygon points="431,32 433,32 438,37 443,32 445,32 440,39 446,46 444,46 438,41 432,46 430,46 436,39" fill="#ffffff"/>
    </g>

    <!-- Channel Item 3 -->
    <g transform="translate(24, 294)">
      <rect width="472" height="78" rx="12" fill="#1b1f2e" stroke="#2d354a" stroke-width="1.2"/>
      <circle cx="44" cy="39" r="20" fill="#7b2cbf"/>
      <text x="44" y="46" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">M</text>
      
      <text x="76" y="32" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Marques Brownlee</text>
      <text x="76" y="52" font-family="{FONT_FAMILY}" font-size="13" fill="#8d94a5">@mkbhd</text>
      
      <rect x="330" y="22" width="76" height="34" rx="17" fill="#2d2242" stroke="#b5179e" stroke-width="1.5"/>
      <text x="368" y="44" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#e0aaff" text-anchor="middle">1.50x</text>
      
      <!-- Vector Delete X Button -->
      <circle cx="438" cy="39" r="17" fill="#521520" stroke="#ff334b" stroke-width="1.5"/>
      <polygon points="431,32 433,32 438,37 443,32 445,32 440,39 446,46 444,46 438,41 432,46 430,46 436,39" fill="#ffffff"/>
    </g>

    <!-- Channel Item 4 -->
    <g transform="translate(24, 384)">
      <rect width="472" height="78" rx="12" fill="#1b1f2e" stroke="#2d354a" stroke-width="1.2"/>
      <circle cx="44" cy="39" r="20" fill="#2a9d8f"/>
      <text x="44" y="46" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">K</text>
      
      <text x="76" y="32" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Kurzgesagt – In a Nutshell</text>
      <text x="76" y="52" font-family="{FONT_FAMILY}" font-size="13" fill="#8d94a5">@kurzgesagt</text>
      
      <rect x="330" y="22" width="76" height="34" rx="17" fill="#182e25" stroke="#00f5a0" stroke-width="1.5"/>
      <text x="368" y="44" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#00f5a0" text-anchor="middle">1.25x</text>
      
      <!-- Vector Delete X Button -->
      <circle cx="438" cy="39" r="17" fill="#521520" stroke="#ff334b" stroke-width="1.5"/>
      <polygon points="431,32 433,32 438,37 443,32 445,32 440,39 446,46 444,46 438,41 432,46 430,46 436,39" fill="#ffffff"/>
    </g>

    <!-- Bottom Quick Info -->
    <rect x="24" y="480" width="472" height="96" rx="12" fill="#181b26" stroke="#2d344a" stroke-width="1"/>
    <text x="48" y="514" font-family="{FONT_FAMILY}" font-size="14" font-weight="bold" fill="#ffffff">Smart Channel Alias Resolution</text>
    <text x="48" y="538" font-family="{FONT_FAMILY}" font-size="12" fill="#9ba3b5">Seamlessly maps YouTube handles (@handle) and Channel IDs (UC...)</text>
    <text x="48" y="556" font-family="{FONT_FAMILY}" font-size="12" fill="#9ba3b5">so your preferences never conflict or duplicate.</text>
  </g>

  <!-- Right Side: Highlights -->
  <g transform="translate(680, 150)">
    <!-- Card 1 -->
    <g>
      <rect width="500" height="150" rx="16" fill="#161924" stroke="#2b3144" stroke-width="1.5"/>
      <rect width="500" height="5" rx="2.5" fill="#00e5ff"/>
      <text x="36" y="44" font-family="{FONT_FAMILY}" font-size="19" font-weight="bold" fill="#ffffff">Instant Search &amp; Filter</text>
      <text x="36" y="74" font-family="{FONT_FAMILY}" font-size="14" fill="#9ba3b5">Type any part of a channel name or handle to instantly filter.</text>
      <text x="36" y="100" font-family="{FONT_FAMILY}" font-size="14" fill="#9ba3b5">Manage dozens or hundreds of channels effortlessly.</text>
    </g>

    <!-- Card 2 -->
    <g transform="translate(0, 180)">
      <rect width="500" height="150" rx="16" fill="#161924" stroke="#2b3144" stroke-width="1.5"/>
      <rect width="500" height="5" rx="2.5" fill="#00f5a0"/>
      <text x="36" y="44" font-family="{FONT_FAMILY}" font-size="19" font-weight="bold" fill="#ffffff">One-Click Channel Deletion</text>
      <text x="36" y="74" font-family="{FONT_FAMILY}" font-size="14" fill="#9ba3b5">Click the red ✕ button to remove any channel from memory.</text>
      <text x="36" y="100" font-family="{FONT_FAMILY}" font-size="14" fill="#9ba3b5">The channel instantly reverts back to your default speed.</text>
    </g>

    <!-- Card 3 -->
    <g transform="translate(0, 360)">
      <rect width="500" height="150" rx="16" fill="#161924" stroke="#2b3144" stroke-width="1.5"/>
      <rect width="500" height="5" rx="2.5" fill="#ff0033"/>
      <text x="36" y="44" font-family="{FONT_FAMILY}" font-size="19" font-weight="bold" fill="#ffffff">High-Capacity Local Storage</text>
      <text x="36" y="74" font-family="{FONT_FAMILY}" font-size="14" fill="#9ba3b5">Optimized lightweight key-value data structure.</text>
      <text x="36" y="100" font-family="{FONT_FAMILY}" font-size="14" fill="#9ba3b5">Easily store over 5,000 channels within local browser quota.</text>
    </g>
  </g>
</svg>"""


def build_screenshot4_settings_svg():
    """Screenshot 4: Settings & 100% Local Privacy Safeguards (1280x800)"""
    return f"""<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1280" height="800" fill="#0b0c11"/>

  <!-- Page Header -->
  <text x="100" y="70" font-family="{FONT_FAMILY}" font-size="30" font-weight="bold" fill="#ffffff">CUSTOM SETTINGS &amp; PRIVACY</text>
  <text x="100" y="100" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#00f5a0">Tailor Every Detail • Zero Tracking • 100% Local Browser Storage</text>

  <!-- Left Side: Settings Interface -->
  <g transform="translate(100, 130)">
    <rect width="500" height="610" rx="20" fill="#141620" stroke="#2d3348" stroke-width="1.8"/>

    <text x="30" y="42" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#ffffff">Extension Preferences</text>

    <!-- Setting Item 1: Default Speed -->
    <g transform="translate(24, 65)">
      <rect width="452" height="96" rx="12" fill="#1b1f2e" stroke="#2d354a" stroke-width="1.2"/>
      <text x="24" y="38" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff">Default Fallback Speed</text>
      <text x="24" y="62" font-family="{FONT_FAMILY}" font-size="12" fill="#8d94a5">Applied when watching a channel without a saved speed.</text>
      <!-- Dropdown Box -->
      <rect x="340" y="28" width="90" height="40" rx="8" fill="#181c28" stroke="#3d445c" stroke-width="1.2"/>
      <text x="372" y="53" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#00e5ff">1.00x</text>
      <polygon points="414,48 422,48 418,54" fill="#8d94a5"/>
    </g>

    <!-- Setting Item 2: HUD Notification Toggle -->
    <g transform="translate(24, 180)">
      <rect width="452" height="96" rx="12" fill="#1b1f2e" stroke="#2d354a" stroke-width="1.2"/>
      <text x="24" y="38" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff">In-Player HUD Notification</text>
      <text x="24" y="62" font-family="{FONT_FAMILY}" font-size="12" fill="#8d94a5">Displays floating pill toast when a custom speed is applied.</text>
      <!-- Toggle ON -->
      <rect x="350" y="32" width="80" height="34" rx="17" fill="#00f5a0"/>
      <circle cx="413" cy="49" r="13" fill="#ffffff"/>
      <text x="375" y="54" font-family="{FONT_FAMILY}" font-size="12" font-weight="bold" fill="#092015">ON</text>
    </g>

    <!-- Setting Item 3: HUD Display Duration -->
    <g transform="translate(24, 295)">
      <rect width="452" height="96" rx="12" fill="#1b1f2e" stroke="#2d354a" stroke-width="1.2"/>
      <text x="24" y="38" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff">HUD Display Duration</text>
      <text x="24" y="62" font-family="{FONT_FAMILY}" font-size="12" fill="#8d94a5">How long the on-screen pill remains visible before fading.</text>
      <text x="365" y="55" font-family="{FONT_FAMILY}" font-size="18" font-weight="bold" fill="#00e5ff">2.0 sec</text>
    </g>

    <!-- Setting Item 4: Backup & Sync -->
    <g transform="translate(24, 410)">
      <rect width="452" height="135" rx="12" fill="#1b1f2e" stroke="#2d354a" stroke-width="1.2"/>
      <text x="24" y="38" font-family="{FONT_FAMILY}" font-size="15" font-weight="bold" fill="#ffffff">Backup &amp; Restore</text>
      <text x="24" y="60" font-family="{FONT_FAMILY}" font-size="12" fill="#8d94a5">Export your preferences or transfer them to another device.</text>
      
      <rect x="24" y="78" width="194" height="42" rx="8" fill="#222738" stroke="#363c52" stroke-width="1"/>
      <text x="121" y="104" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">📤 Export JSON</text>
      
      <rect x="234" y="78" width="194" height="42" rx="8" fill="#222738" stroke="#363c52" stroke-width="1"/>
      <text x="331" y="104" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">📥 Import JSON</text>
    </g>
  </g>

  <!-- Right Side: Privacy Commitment Card (High Trust) -->
  <g transform="translate(660, 130)">
    <rect width="520" height="610" rx="20" fill="#121a1f" stroke="#1f3c34" stroke-width="1.8"/>
    <rect width="520" height="6" rx="3" fill="#00f5a0"/>

    <!-- Shield Icon with Crisp Checkmark -->
    <g transform="translate(40, 40)">
      <polygon points="30,8 52,18 52,42 30,56 8,42 8,18" fill="#00f5a0"/>
      <polygon points="30,12 48,20 48,40 30,52 12,40 12,20" fill="#0e171b"/>
      <polygon points="21,32 26,38 39,24 37,22 26,34 23,30" fill="#00f5a0"/>
    </g>
    
    <text x="110" y="68" font-family="{FONT_FAMILY}" font-size="22" font-weight="bold" fill="#ffffff">100% Privacy Guarantee</text>
    <text x="110" y="90" font-family="{FONT_FAMILY}" font-size="13" font-weight="bold" fill="#00f5a0">Complies with Google Chrome Web Store Policies</text>

    <!-- Privacy Pillars with Crisp Vector Checkmarks -->
    <g transform="translate(40, 120)">
      <!-- Pillar 1 -->
      <g transform="translate(0, 0)">
        <circle cx="20" cy="20" r="16" fill="#00f5a0"/>
        <polygon points="12,20 17,25 28,14 26,12 17,21 14,18" fill="#071a10"/>
        <text x="48" y="22" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Local Storage Only</text>
        <text x="48" y="44" font-family="{FONT_FAMILY}" font-size="13" fill="#8da39b">All preferences are saved securely on your device using Chrome's local storage API.</text>
      </g>

      <!-- Pillar 2 -->
      <g transform="translate(0, 85)">
        <circle cx="20" cy="20" r="16" fill="#00f5a0"/>
        <polygon points="12,20 17,25 28,14 26,12 17,21 14,18" fill="#071a10"/>
        <text x="48" y="22" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Zero External Transmissions</text>
        <text x="48" y="44" font-family="{FONT_FAMILY}" font-size="13" fill="#8da39b">No backend servers. The extension makes zero outbound network calls.</text>
      </g>

      <!-- Pillar 3 -->
      <g transform="translate(0, 170)">
        <circle cx="20" cy="20" r="16" fill="#00f5a0"/>
        <polygon points="12,20 17,25 28,14 26,12 17,21 14,18" fill="#071a10"/>
        <text x="48" y="22" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Zero Tracking or Analytics</text>
        <text x="48" y="44" font-family="{FONT_FAMILY}" font-size="13" fill="#8da39b">No Google Analytics, no user profiling, no cookies, and no telemetry.</text>
      </g>

      <!-- Pillar 4 -->
      <g transform="translate(0, 255)">
        <circle cx="20" cy="20" r="16" fill="#00f5a0"/>
        <polygon points="12,20 17,25 28,14 26,12 17,21 14,18" fill="#071a10"/>
        <text x="48" y="22" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Minimal Permissions</text>
        <text x="48" y="44" font-family="{FONT_FAMILY}" font-size="13" fill="#8da39b">Only accesses youtube.com to detect channels and synchronize player speed.</text>
      </g>

      <!-- Pillar 5 -->
      <g transform="translate(0, 340)">
        <circle cx="20" cy="20" r="16" fill="#00f5a0"/>
        <polygon points="12,20 17,25 28,14 26,12 17,21 14,18" fill="#071a10"/>
        <text x="48" y="22" font-family="{FONT_FAMILY}" font-size="16" font-weight="bold" fill="#ffffff">Open Source Transparency</text>
        <text x="48" y="44" font-family="{FONT_FAMILY}" font-size="13" fill="#8da39b">Every line of code is open source and auditable on GitHub under MIT License.</text>
      </g>
    </g>
  </g>
</svg>"""


def main():
    print("====================================================")
    print("   GENERATING HIGH-RES GLOSSY CHROME STORE ASSETS   ")
    print("====================================================\n")

    assets = [
        ("promo_tile_440x280.png", build_promo_tile_svg()),
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
