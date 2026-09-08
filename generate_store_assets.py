#!/usr/bin/env python3
"""
Chrome Web Store Graphical Asset Generator

Generates high-resolution store promotional images and screenshots
using only Python's standard library (zlib, struct, math):
1. Small Promo Tile (440x280 PNG)
2. Screenshot 1: In-Player HUD Notification (1280x800 PNG)
3. Screenshot 2: Extension Popup UI Controls (1280x800 PNG)
4. Screenshot 3: Saved Channels Management (1280x800 PNG)
5. Screenshot 4: Extension Settings & Privacy (1280x800 PNG)
"""

import os
import struct
import zlib
import math

# --- 5x7 ASCII Bitmap Font Definition ---
FONT_5X7 = {
    ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    '!': [0x04, 0x04, 0x04, 0x04, 0x00, 0x00, 0x04],
    '"': [0x0A, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00],
    '#': [0x0A, 0x0A, 0x1F, 0x0A, 0x1F, 0x0A, 0x0A],
    '$': [0x04, 0x0F, 0x14, 0x0E, 0x05, 0x1E, 0x04],
    '%': [0x19, 0x19, 0x02, 0x04, 0x08, 0x13, 0x13],
    '&': [0x08, 0x14, 0x14, 0x08, 0x15, 0x12, 0x0D],
    '\'': [0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00],
    '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
    ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
    '*': [0x00, 0x04, 0x15, 0x0E, 0x15, 0x04, 0x00],
    '+': [0x00, 0x04, 0x04, 0x1F, 0x04, 0x04, 0x00],
    ',': [0x00, 0x00, 0x00, 0x00, 0x04, 0x04, 0x08],
    '-': [0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00],
    '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x06],
    '/': [0x01, 0x02, 0x04, 0x08, 0x10, 0x00, 0x00],
    '0': [0x0E, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0E],
    '1': [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
    '2': [0x0E, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1F],
    '3': [0x1F, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0E],
    '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
    '5': [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E],
    '6': [0x06, 0x08, 0x10, 0x1E, 0x11, 0x11, 0x0E],
    '7': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
    '8': [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
    '9': [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x02, 0x0C],
    ':': [0x00, 0x06, 0x06, 0x00, 0x06, 0x06, 0x00],
    ';': [0x00, 0x06, 0x06, 0x00, 0x06, 0x04, 0x08],
    '<': [0x02, 0x04, 0x08, 0x10, 0x08, 0x04, 0x02],
    '=': [0x00, 0x1F, 0x00, 0x1F, 0x00, 0x00, 0x00],
    '>': [0x08, 0x04, 0x02, 0x01, 0x02, 0x04, 0x08],
    '?': [0x0E, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
    '@': [0x0E, 0x11, 0x01, 0x0D, 0x15, 0x15, 0x0E],
    'A': [0x0E, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
    'B': [0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E],
    'C': [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
    'D': [0x1C, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1C],
    'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
    'F': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
    'G': [0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0F],
    'H': [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
    'I': [0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E],
    'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0C],
    'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
    'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
    'M': [0x11, 0x1B, 0x15, 0x15, 0x11, 0x11, 0x11],
    'N': [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
    'O': [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
    'P': [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
    'Q': [0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0D],
    'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
    'S': [0x0E, 0x11, 0x10, 0x0E, 0x01, 0x11, 0x0E],
    'T': [0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
    'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
    'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04],
    'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x1B, 0x11],
    'X': [0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11],
    'Y': [0x11, 0x11, 0x0A, 0x04, 0x04, 0x04, 0x04],
    'Z': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F],
    '[': [0x0E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x0E],
    '\\': [0x10, 0x08, 0x04, 0x02, 0x01, 0x00, 0x00],
    ']': [0x0E, 0x02, 0x02, 0x02, 0x02, 0x02, 0x0E],
    '^': [0x04, 0x0A, 0x11, 0x00, 0x00, 0x00, 0x00],
    '_': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F],
    '`': [0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00],
    '|': [0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
    '~': [0x00, 0x08, 0x15, 0x02, 0x00, 0x00, 0x00],
    'x': [0x00, 0x00, 0x11, 0x0A, 0x04, 0x0A, 0x11],
    'v': [0x00, 0x00, 0x11, 0x11, 0x0A, 0x04, 0x00],
    'c': [0x00, 0x00, 0x0E, 0x11, 0x10, 0x11, 0x0E],
    'o': [0x00, 0x00, 0x0E, 0x11, 0x11, 0x11, 0x0E],
    'e': [0x00, 0x00, 0x0E, 0x1F, 0x10, 0x11, 0x0E],
    'a': [0x00, 0x00, 0x0E, 0x01, 0x0F, 0x11, 0x0F],
    'r': [0x00, 0x00, 0x16, 0x19, 0x10, 0x10, 0x10],
    's': [0x00, 0x00, 0x0F, 0x10, 0x0E, 0x01, 0x1E],
    'i': [0x04, 0x00, 0x0C, 0x04, 0x04, 0x04, 0x0E],
    't': [0x08, 0x08, 0x1C, 0x08, 0x08, 0x09, 0x06],
    'u': [0x00, 0x00, 0x11, 0x11, 0x11, 0x13, 0x0D],
    'm': [0x00, 0x00, 0x1A, 0x15, 0x15, 0x11, 0x11],
    'n': [0x00, 0x00, 0x16, 0x19, 0x11, 0x11, 0x11],
    'p': [0x00, 0x00, 0x1E, 0x11, 0x1E, 0x10, 0x10],
    'd': [0x00, 0x01, 0x0D, 0x13, 0x11, 0x13, 0x0D],
    'l': [0x0C, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E],
    'y': [0x00, 0x00, 0x11, 0x11, 0x0F, 0x01, 0x0E],
    'b': [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x1E],
    'k': [0x10, 0x10, 0x12, 0x14, 0x18, 0x14, 0x12],
    'h': [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x11],
    'g': [0x00, 0x00, 0x0F, 0x11, 0x0F, 0x01, 0x0E],
    'f': [0x06, 0x09, 0x08, 0x1C, 0x08, 0x08, 0x08],
    'w': [0x00, 0x00, 0x11, 0x15, 0x15, 0x15, 0x0A],
}

# Auto-generate lowercase fallback by converting to uppercase if missing
for c in 'abcdefghijklmnopqrstuvwxyz':
    if c not in FONT_5X7:
        FONT_5X7[c] = FONT_5X7[c.upper()]


class ImageCanvas:
    def __init__(self, width, height, bg_color=(15, 15, 18)):
        self.width = width
        self.height = height
        # Flattened RGBA bytearray: width * height * 4
        self.pixels = bytearray(width * height * 4)
        r, g, b = bg_color
        for i in range(0, len(self.pixels), 4):
            self.pixels[i] = r
            self.pixels[i+1] = g
            self.pixels[i+2] = b
            self.pixels[i+3] = 255

    def set_pixel(self, x, y, color, alpha=1.0):
        if 0 <= x < self.width and 0 <= y < self.height:
            idx = (y * self.width + x) * 4
            r, g, b = color[:3]
            a = color[3] if len(color) > 3 else 255
            a_norm = (a / 255.0) * alpha
            if a_norm >= 0.99:
                self.pixels[idx] = r
                self.pixels[idx+1] = g
                self.pixels[idx+2] = b
                self.pixels[idx+3] = 255
            elif a_norm > 0:
                bg_r = self.pixels[idx]
                bg_g = self.pixels[idx+1]
                bg_b = self.pixels[idx+2]
                self.pixels[idx] = int(r * a_norm + bg_r * (1.0 - a_norm))
                self.pixels[idx+1] = int(g * a_norm + bg_g * (1.0 - a_norm))
                self.pixels[idx+2] = int(b * a_norm + bg_b * (1.0 - a_norm))
                self.pixels[idx+3] = 255

    def fill_rect(self, x, y, w, h, color, radius=0):
        x1, y1 = max(0, x), max(0, y)
        x2, y2 = min(self.width, x + w), min(self.height, y + h)
        if radius <= 0:
            for py in range(y1, y2):
                idx = (py * self.width + x1) * 4
                r, g, b = color[:3]
                span = bytearray([r, g, b, 255] * (x2 - x1))
                self.pixels[idx:idx + len(span)] = span
        else:
            r2 = radius * radius
            for py in range(y1, y2):
                for px in range(x1, x2):
                    in_corner = False
                    if px < x + radius and py < y + radius:
                        dx, dy = px - (x + radius), py - (y + radius)
                        in_corner = (dx*dx + dy*dy > r2)
                    elif px >= x + w - radius and py < y + radius:
                        dx, dy = px - (x + w - radius - 1), py - (y + radius)
                        in_corner = (dx*dx + dy*dy > r2)
                    elif px < x + radius and py >= y + h - radius:
                        dx, dy = px - (x + radius), py - (y + h - radius - 1)
                        in_corner = (dx*dx + dy*dy > r2)
                    elif px >= x + w - radius and py >= y + h - radius:
                        dx, dy = px - (x + w - radius - 1), py - (y + h - radius - 1)
                        in_corner = (dx*dx + dy*dy > r2)
                    if not in_corner:
                        self.set_pixel(px, py, color)

    def fill_gradient(self, x, y, w, h, c1, c2, vertical=True):
        for py in range(y, y + h):
            t_y = (py - y) / max(1, h - 1) if vertical else 0
            for px in range(x, x + w):
                t = t_y if vertical else (px - x) / max(1, w - 1)
                r = int(c1[0] * (1.0 - t) + c2[0] * t)
                g = int(c1[1] * (1.0 - t) + c2[1] * t)
                b = int(c1[2] * (1.0 - t) + c2[2] * t)
                self.set_pixel(px, py, (r, g, b, 255))

    def draw_text(self, x, y, text, color=(255, 255, 255), scale=1):
        cur_x = x
        for char in text:
            matrix = FONT_5X7.get(char, FONT_5X7[' '])
            for row in range(7):
                row_val = matrix[row]
                for col in range(5):
                    if (row_val >> (4 - col)) & 1:
                        self.fill_rect(cur_x + col * scale, y + row * scale, scale, scale, color)
            cur_x += 6 * scale

    def draw_play_lightning_icon(self, cx, cy, radius):
        """Draws clean rounded icon with play triangle and speed lightning badge."""
        # Rounded container
        size = radius * 2
        self.fill_rect(cx - radius, cy - radius, size, size, (255, 0, 51), radius=int(radius * 0.45))
        # Inner dark display screen
        inner_r = int(radius * 0.7)
        self.fill_rect(cx - inner_r, cy - inner_r, inner_r * 2, inner_r * 2, (30, 0, 10), radius=int(radius * 0.25))
        
        # White play triangle
        # Points: (cx - 0.2*r, cy - 0.3*r), (cx - 0.2*r, cy + 0.3*r), (cx + 0.3*r, cy)
        tx1, ty1 = cx - int(radius * 0.25), cy - int(radius * 0.35)
        tx2, ty2 = cx - int(radius * 0.25), cy + int(radius * 0.35)
        tx3, ty3 = cx + int(radius * 0.35), cy
        
        def pt_in_tri(px, py):
            d = (ty2 - ty3) * (tx1 - tx3) + (tx3 - tx2) * (ty1 - ty3)
            if d == 0: return False
            w1 = ((ty2 - ty3) * (px - tx3) + (tx3 - tx2) * (py - ty3)) / d
            w2 = ((ty3 - ty1) * (px - tx3) + (tx1 - tx3) * (py - ty3)) / d
            w3 = 1.0 - w1 - w2
            return w1 >= 0 and w2 >= 0 and w3 >= 0

        for py in range(ty1, ty2 + 1):
            for px in range(tx1, tx3 + 1):
                if pt_in_tri(px, py):
                    self.set_pixel(px, py, (255, 255, 255))

        # Cyan lightning badge at bottom right
        lx, ly = cx + int(radius * 0.5), cy + int(radius * 0.5)
        self.fill_rect(lx - 8, ly - 8, 16, 16, (0, 220, 255), radius=8)

    def save_png(self, filepath):
        raw = bytearray()
        stride = self.width * 4
        for y in range(self.height):
            raw.append(0)  # Filter byte: None
            idx = y * stride
            raw.extend(self.pixels[idx:idx + stride])

        compressed = zlib.compress(bytes(raw), 6)

        def make_chunk(chunk_type, data):
            c = chunk_type + data
            crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
            return struct.pack('>I', len(data)) + c + crc

        png = bytearray(b'\x89PNG\r\n\x1a\n')
        ihdr = struct.pack('>IIBBBBB', self.width, self.height, 8, 6, 0, 0, 0)
        png.extend(make_chunk(b'IHDR', ihdr))
        png.extend(make_chunk(b'IDAT', compressed))
        png.extend(make_chunk(b'IEND', b''))

        with open(filepath, 'wb') as f:
            f.write(png)
        print(f"  ✔ Generated: {os.path.basename(filepath)} ({self.width}x{self.height}, {len(png):,} bytes)")


def generate_promo_tile(out_dir):
    """440x280 Promo Tile for Chrome Web Store Home & Category listing"""
    w, h = 440, 280
    canvas = ImageCanvas(w, h, bg_color=(15, 15, 20))
    
    # Gradient background: deep night to dark crimson/indigo
    canvas.fill_gradient(0, 0, w, h, (20, 10, 25), (10, 12, 18), vertical=True)
    
    # Outer accent border
    canvas.fill_rect(0, 0, w, 3, (255, 0, 51))
    
    # App Icon centered at top
    canvas.draw_play_lightning_icon(220, 75, radius=38)
    
    # Title
    canvas.draw_text(68, 140, "CHANNEL SPEED MEMORY", color=(255, 255, 255), scale=3)
    canvas.draw_text(160, 175, "FOR YOUTUBE", color=(255, 60, 70), scale=2)
    
    # Subtitle pill
    canvas.fill_rect(45, 215, 350, 36, (30, 32, 45), radius=18)
    canvas.draw_text(65, 226, "Auto-remembers speed for every channel", color=(0, 220, 255), scale=2)
    
    canvas.save_png(os.path.join(out_dir, "promo_tile_440x280.png"))


def generate_screenshot_hud(out_dir):
    """1280x800 Screenshot 1: In-Player HUD Pill on YouTube Watch Page"""
    w, h = 1280, 800
    canvas = ImageCanvas(w, h, bg_color=(15, 15, 15))
    
    # Top YouTube Navigation Bar
    canvas.fill_rect(0, 0, w, 56, (33, 33, 33))
    # Red logo badge
    canvas.fill_rect(32, 16, 32, 24, (255, 0, 0), radius=5)
    canvas.draw_text(74, 20, "YouTube", color=(255, 255, 255), scale=3)
    # Search bar
    canvas.fill_rect(420, 10, 440, 36, (18, 18, 18), radius=18)
    canvas.draw_text(450, 22, "Search", color=(130, 130, 130), scale=2)
    
    # Video Player Container
    vid_x, vid_y, vid_w, vid_h = 40, 80, 860, 484
    canvas.fill_gradient(vid_x, vid_y, vid_w, vid_h, (25, 28, 38), (10, 12, 16), vertical=True)
    
    # IN-PLAYER HUD TOAST NOTIFICATION (Feature Spotlight)
    hud_w, hud_h = 330, 50
    hud_x, hud_y = vid_x + vid_w - hud_w - 24, vid_y + 24
    # Glow / outline
    canvas.fill_rect(hud_x - 2, hud_y - 2, hud_w + 4, hud_h + 4, (0, 220, 255), radius=14)
    # Background
    canvas.fill_rect(hud_x, hud_y, hud_w, hud_h, (12, 15, 24), radius=12)
    # Text
    canvas.draw_text(hud_x + 20, hud_y + 16, "VERITASIUM: 1.75x APPLIED", color=(0, 255, 200), scale=2)
    
    # Video player controls bar at bottom
    canvas.fill_rect(vid_x, vid_y + vid_h - 40, vid_w, 40, (18, 18, 18, 200))
    # Red progress bar
    canvas.fill_rect(vid_x, vid_y + vid_h - 44, int(vid_w * 0.42), 4, (255, 0, 0))
    canvas.fill_rect(vid_x + int(vid_w * 0.42), vid_y + vid_h - 44, vid_w - int(vid_w * 0.42), 4, (70, 70, 70))
    canvas.draw_text(vid_x + 60, vid_y + vid_h - 26, "PLAY  |  04:12 / 12:45   SPEED: 1.75x", color=(255, 255, 255), scale=2)
    
    # Video Title & Channel Info
    canvas.draw_text(vid_x, vid_y + vid_h + 20, "The Astounding Physics of N-Body Orbits", color=(255, 255, 255), scale=3)
    canvas.draw_text(vid_x, vid_y + vid_h + 60, "Veritasium  *  15.4M subscribers", color=(180, 180, 180), scale=2)
    canvas.fill_rect(vid_x + 360, vid_y + vid_h + 50, 110, 36, (255, 255, 255), radius=18)
    canvas.draw_text(vid_x + 382, vid_y + vid_h + 62, "Subscribe", color=(15, 15, 15), scale=2)
    
    # Sidebar: Feature Callout Banner on Right
    call_x, call_y, call_w, call_h = 930, 80, 310, 680
    canvas.fill_rect(call_x, call_y, call_w, call_h, (24, 24, 30), radius=16)
    canvas.fill_rect(call_x, call_y, call_w, 6, (0, 220, 255))
    canvas.draw_text(call_x + 24, call_y + 35, "IN-PLAYER HUD", color=(0, 220, 255), scale=3)
    canvas.draw_text(call_x + 24, call_y + 80, "Instant Confirmation", color=(255, 255, 255), scale=2)
    
    bullets = [
        "- Shows channel name",
        "- Displays saved speed",
        "- Zero configuration",
        "- Fully customizable",
        "- Auto-fades smoothly"
    ]
    by = call_y + 130
    for b in bullets:
        canvas.draw_text(call_x + 24, by, b, color=(200, 200, 210), scale=2)
        by += 40
        
    canvas.save_png(os.path.join(out_dir, "screenshot1_hud_1280x800.png"))


def generate_screenshot_popup(out_dir):
    """1280x800 Screenshot 2: Extension Popup UI Controls & Presets"""
    w, h = 1280, 800
    canvas = ImageCanvas(w, h, bg_color=(20, 20, 26))
    
    # Background subtle pattern
    canvas.fill_gradient(0, 0, w, h, (16, 16, 22), (24, 24, 34), vertical=True)
    
    # Heading header
    canvas.draw_text(60, 45, "CHANNEL SPEED MEMORY FOR YOUTUBE", color=(255, 255, 255), scale=4)
    canvas.draw_text(60, 95, "Intuitive Popup Controls & Precision Playback Tuning", color=(0, 220, 255), scale=2)
    
    # Centered Popup Card
    pw, ph = 400, 580
    px, py = 120, 150
    # Outer glow
    canvas.fill_rect(px - 4, py - 4, pw + 8, ph + 8, (255, 0, 60), radius=20)
    canvas.fill_rect(px, py, pw, ph, (15, 15, 18), radius=16)
    
    # Popup Header
    canvas.fill_rect(px, py, pw, 60, (26, 26, 32), radius=16)
    canvas.draw_play_lightning_icon(px + 36, py + 30, radius=18)
    canvas.draw_text(px + 68, py + 22, "Channel Speed Memory", color=(255, 255, 255), scale=2)
    
    # Tabs
    canvas.fill_rect(px + 16, py + 75, 115, 34, (255, 0, 51), radius=8)
    canvas.draw_text(px + 28, py + 85, "Current Video", color=(255, 255, 255), scale=2)
    canvas.fill_rect(px + 140, py + 75, 115, 34, (35, 35, 42), radius=8)
    canvas.draw_text(px + 155, py + 85, "Channels (3)", color=(180, 180, 180), scale=2)
    canvas.fill_rect(px + 265, py + 75, 115, 34, (35, 35, 42), radius=8)
    canvas.draw_text(px + 285, py + 85, "Settings", color=(180, 180, 180), scale=2)
    
    # Channel Info Banner
    canvas.fill_rect(px + 20, py + 125, pw - 40, 75, (26, 28, 38), radius=12)
    canvas.draw_text(px + 35, py + 142, "Veritasium", color=(255, 255, 255), scale=3)
    canvas.draw_text(px + 35, py + 172, "Current Speed: 1.75x", color=(0, 255, 180), scale=2)
    
    # Speed Presets Grid (2 rows of 3)
    presets = ["0.75x", "1.00x", "1.25x", "1.50x", "1.75x", "2.00x"]
    grid_y = py + 220
    for i, p in enumerate(presets):
        col, row = i % 3, i // 3
        bx = px + 20 + col * 122
        by = grid_y + row * 52
        is_active = (p == "1.75x")
        btn_color = (255, 0, 51) if is_active else (38, 38, 48)
        text_color = (255, 255, 255)
        canvas.fill_rect(bx, by, 114, 42, btn_color, radius=8)
        canvas.draw_text(bx + 26, by + 13, p, color=text_color, scale=2)
        
    # Steppers row
    step_y = py + 340
    canvas.fill_rect(px + 20, step_y, 175, 44, (34, 36, 46), radius=8)
    canvas.draw_text(px + 45, step_y + 14, "- 0.05x Step", color=(255, 255, 255), scale=2)
    canvas.fill_rect(px + 205, step_y, 175, 44, (34, 36, 46), radius=8)
    canvas.draw_text(px + 230, step_y + 14, "+ 0.05x Step", color=(255, 255, 255), scale=2)
    
    # Reset Button
    canvas.fill_rect(px + 20, py + 405, pw - 40, 44, (45, 25, 30), radius=8)
    canvas.draw_text(px + 80, py + 419, "Reset Channel to Default", color=(255, 100, 100), scale=2)
    
    # Right Side: Feature Highlights
    feat_x = 600
    features = [
        ("ONE-CLICK PRESETS", "Quickly set playback speed from 0.75x to 2.0x"),
        ("FINE-TUNE STEPPERS", "Precise +/-0.05x incremental speed adjustment"),
        ("KEYBOARD READY", "Works seamlessly with Shift+> and Shift+<"),
        ("INSTANT MEMORY", "Changes are automatically saved for this channel"),
        ("CLEAN DARK UI", "Designed to feel native to YouTube's modern interface")
    ]
    fy = 170
    for title, desc in features:
        canvas.fill_rect(feat_x, fy, 600, 76, (26, 28, 36), radius=12)
        canvas.draw_text(feat_x + 24, fy + 16, title, color=(0, 220, 255), scale=2)
        canvas.draw_text(feat_x + 24, fy + 44, desc, color=(210, 210, 220), scale=2)
        fy += 95
        
    canvas.save_png(os.path.join(out_dir, "screenshot2_popup_1280x800.png"))


def generate_screenshot_channels(out_dir):
    """1280x800 Screenshot 3: Saved Channels List & Management"""
    w, h = 1280, 800
    canvas = ImageCanvas(w, h, bg_color=(18, 18, 24))
    
    # Background
    canvas.fill_gradient(0, 0, w, h, (15, 15, 20), (22, 22, 30), vertical=True)
    
    canvas.draw_text(60, 45, "MANAGE SAVED CHANNELS", color=(255, 255, 255), scale=4)
    canvas.draw_text(60, 95, "Search, inspect, and customize all remembered channel speeds", color=(0, 220, 255), scale=2)
    
    # Center Manager Card
    cw, ch = 540, 580
    cx, cy = 80, 150
    canvas.fill_rect(cx, cy, cw, ch, (26, 28, 36), radius=16)
    
    # Search Box
    canvas.fill_rect(cx + 24, cy + 24, cw - 48, 48, (18, 18, 24), radius=10)
    canvas.draw_text(cx + 44, cy + 38, "Search channels...", color=(120, 120, 140), scale=2)
    
    # Badge count
    canvas.draw_text(cx + 24, cy + 90, "4 SAVED CHANNELS", color=(0, 255, 180), scale=2)
    
    channels = [
        ("@veritasium", "Veritasium", "1.75x"),
        ("@3blue1brown", "3Blue1Brown", "1.25x"),
        ("@mkbhd", "Marques Brownlee", "1.50x"),
        ("@kurzgesagt", "Kurzgesagt - In a Nutshell", "1.25x"),
    ]
    
    chy = cy + 120
    for handle, name, speed in channels:
        canvas.fill_rect(cx + 24, chy, cw - 48, 80, (34, 36, 48), radius=10)
        canvas.draw_text(cx + 44, chy + 20, name, color=(255, 255, 255), scale=3)
        canvas.draw_text(cx + 44, chy + 50, handle, color=(140, 140, 160), scale=2)
        # Speed pill
        canvas.fill_rect(cx + cw - 160, chy + 22, 75, 36, (255, 0, 51), radius=18)
        canvas.draw_text(cx + cw - 148, chy + 32, speed, color=(255, 255, 255), scale=2)
        # Delete icon box
        canvas.fill_rect(cx + cw - 70, chy + 22, 36, 36, (50, 30, 35), radius=8)
        canvas.draw_text(cx + cw - 58, chy + 32, "x", color=(255, 100, 100), scale=2)
        chy += 95
        
    # Right side: Overview Benefits
    rx = 680
    canvas.draw_text(rx, 180, "EFFORTLESS CHANNEL CONTROL", color=(255, 255, 255), scale=3)
    
    points = [
        "Instant Search & Filter",
        "Fast-search through hundreds of saved channels.",
        "",
        "Dual Identity Resolution",
        "Seamlessly resolves @handles and YouTube Channel IDs.",
        "",
        "One-Click Removal",
        "Easily remove channel memory or reset to default.",
        "",
        "Zero Storage Quota Anxiety",
        "Stores over 5,000 channels within local storage."
    ]
    py = 240
    for line in points:
        color = (0, 220, 255) if line and not line.startswith(" ") and not line.startswith("Fast") and not line.startswith("Seam") and not line.startswith("Easi") and not line.startswith("Stor") else (200, 200, 210)
        scale = 2
        canvas.draw_text(rx, py, line, color=color, scale=scale)
        py += 32
        
    canvas.save_png(os.path.join(out_dir, "screenshot3_channels_1280x800.png"))


def generate_screenshot_settings(out_dir):
    """1280x800 Screenshot 4: Settings & Privacy Safeguards"""
    w, h = 1280, 800
    canvas = ImageCanvas(w, h, bg_color=(16, 16, 22))
    canvas.fill_gradient(0, 0, w, h, (12, 14, 20), (20, 22, 30), vertical=True)
    
    canvas.draw_text(60, 45, "PREFERENCES & PRIVACY", color=(255, 255, 255), scale=4)
    canvas.draw_text(60, 95, "Fully customizable playback options with 100% local data privacy", color=(0, 220, 255), scale=2)
    
    # Left Card: Settings UI
    sw, sh = 520, 580
    sx, sy = 80, 150
    canvas.fill_rect(sx, sy, sw, sh, (25, 27, 36), radius=16)
    
    canvas.draw_text(sx + 24, sy + 30, "EXTENSION SETTINGS", color=(255, 255, 255), scale=3)
    
    # Setting 1: Default Speed
    canvas.fill_rect(sx + 24, sy + 75, sw - 48, 90, (33, 35, 46), radius=10)
    canvas.draw_text(sx + 40, sy + 95, "Default Playback Speed", color=(255, 255, 255), scale=2)
    canvas.draw_text(sx + 40, sy + 125, "Used when no channel speed is saved", color=(140, 140, 160), scale=2)
    canvas.fill_rect(sx + sw - 140, sy + 95, 95, 40, (18, 18, 24), radius=8)
    canvas.draw_text(sx + sw - 120, sy + 107, "1.00x", color=(0, 220, 255), scale=2)
    
    # Setting 2: HUD Notification Toggle
    canvas.fill_rect(sx + 24, sy + 180, sw - 48, 90, (33, 35, 46), radius=10)
    canvas.draw_text(sx + 40, sy + 200, "Show In-Player HUD Pill", color=(255, 255, 255), scale=2)
    canvas.draw_text(sx + 40, sy + 230, "Floating confirmation toast in video player", color=(140, 140, 160), scale=2)
    # Green toggle ON
    canvas.fill_rect(sx + sw - 120, sy + 205, 75, 34, (0, 200, 120), radius=17)
    canvas.draw_text(sx + sw - 98, sy + 214, "ON", color=(255, 255, 255), scale=2)
    
    # Setting 3: HUD Duration
    canvas.fill_rect(sx + 24, sy + 285, sw - 48, 90, (33, 35, 46), radius=10)
    canvas.draw_text(sx + 40, sy + 305, "HUD Display Duration", color=(255, 255, 255), scale=2)
    canvas.draw_text(sx + 40, sy + 335, "Duration in seconds before toast fades", color=(140, 140, 160), scale=2)
    canvas.draw_text(sx + sw - 110, sy + 315, "2.0s", color=(0, 220, 255), scale=3)
    
    # Setting 4: Backup & Sync
    canvas.fill_rect(sx + 24, sy + 390, sw - 48, 130, (33, 35, 46), radius=10)
    canvas.draw_text(sx + 40, sy + 410, "Backup & Restore", color=(255, 255, 255), scale=2)
    canvas.fill_rect(sx + 40, sy + 450, 180, 45, (45, 48, 65), radius=8)
    canvas.draw_text(sx + 65, sy + 465, "Export JSON", color=(255, 255, 255), scale=2)
    canvas.fill_rect(sx + 240, sy + 450, 180, 45, (45, 48, 65), radius=8)
    canvas.draw_text(sx + 265, sy + 465, "Import JSON", color=(255, 255, 255), scale=2)
    
    # Right Side: Privacy Commitment Card
    px, py, pw, ph = 650, 150, 550, 580
    canvas.fill_rect(px, py, pw, ph, (20, 30, 28), radius=16)
    canvas.fill_rect(px, py, pw, 6, (0, 255, 180))
    canvas.draw_text(px + 30, py + 35, "PRIVACY FIRST ARCHITECTURE", color=(0, 255, 180), scale=3)
    
    commitments = [
        ("ZERO EXTERNAL TRANSMISSION", "No data is ever sent to any remote server."),
        ("100% LOCAL STORAGE", "Everything is stored inside your browser."),
        ("ZERO TRACKING / TELEMETRY", "No analytics, no telemetry, no profiling."),
        ("MINIMAL PERMISSIONS", "Only storage and youtube.com access."),
        ("FULL USER CONTROL", "Export, import, or erase your data anytime.")
    ]
    cy = py + 95
    for title, desc in commitments:
        canvas.draw_text(px + 30, cy, title, color=(255, 255, 255), scale=2)
        canvas.draw_text(px + 30, cy + 30, desc, color=(160, 220, 200), scale=2)
        cy += 85
        
    canvas.save_png(os.path.join(out_dir, "screenshot4_settings_1280x800.png"))


def main():
    root = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(root, "store_assets")
    os.makedirs(out_dir, exist_ok=True)
    
    print("====================================================")
    print("   GENERATING CHROME WEB STORE GRAPHICAL ASSETS     ")
    print("====================================================\n")
    
    generate_promo_tile(out_dir)
    generate_screenshot_hud(out_dir)
    generate_screenshot_popup(out_dir)
    generate_screenshot_channels(out_dir)
    generate_screenshot_settings(out_dir)
    
    print("\n🎉 ALL ASSETS GENERATED SUCCESSFULLY IN store_assets/!\n")


if __name__ == "__main__":
    main()
