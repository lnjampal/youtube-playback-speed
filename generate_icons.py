import zlib
import struct
import math

def create_png(width, height, get_pixel_func):
    """Generate a valid RGBA PNG using only standard library."""
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0: None
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(bytes(raw_data), 9)
    
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    png = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(chunk(b'IHDR', ihdr_data))
    png.extend(chunk(b'IDAT', compressed))
    png.extend(chunk(b'IEND', b''))
    return bytes(png)

def point_in_triangle(px, py, p1, p2, p3):
    """Barycentric coordinate test."""
    x1, y1 = p1
    x2, y2 = p2
    x3, y3 = p3
    det = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3)
    if det == 0: return False
    l1 = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / det
    l2 = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / det
    l3 = 1.0 - l1 - l2
    return l1 >= 0 and l2 >= 0 and l3 >= 0

def get_icon_pixel(x, y, width, height):
    # Normalized coords: -1 to 1
    nx = (x + 0.5) / width * 2.0 - 1.0
    ny = (y + 0.5) / height * 2.0 - 1.0
    
    # Rounded rect background
    # YouTube rounded rect
    corner_radius = 0.35
    ax = abs(nx)
    ay = abs(ny)
    
    in_card = False
    if ax <= (0.9 - corner_radius) and ay <= 0.9:
        in_card = True
    elif ay <= (0.9 - corner_radius) and ax <= 0.9:
        in_card = True
    else:
        dx = ax - (0.9 - corner_radius)
        dy = ay - (0.9 - corner_radius)
        if dx * dx + dy * dy <= corner_radius * corner_radius:
            in_card = True
            
    if not in_card:
        return (0, 0, 0, 0)
    
    # YouTube Red gradient: from #ff1a40 to #e60026
    red_r = int(255 - (ny + 1) * 12)
    red_g = 15
    red_b = 40
    
    # Double play arrow (fast forward / speed indicator)
    # Triangle 1: left arrow
    t1_p1 = (-0.45, -0.42)
    t1_p2 = (-0.45, 0.42)
    t1_p3 = (0.02, 0.0)
    
    # Triangle 2: right arrow
    t2_p1 = (0.00, -0.42)
    t2_p2 = (0.00, 0.42)
    t2_p3 = (0.47, 0.0)
    
    if point_in_triangle(nx, ny, t1_p1, t1_p2, t1_p3) or point_in_triangle(nx, ny, t2_p1, t2_p2, t2_p3):
        return (255, 255, 255, 255)
        
    return (red_r, red_g, red_b, 255)

for size in [16, 48, 128]:
    data = create_png(size, size, get_icon_pixel)
    with open(f"icons/icon{size}.png", "wb") as f:
        f.write(data)

print("Icons generated successfully!")
