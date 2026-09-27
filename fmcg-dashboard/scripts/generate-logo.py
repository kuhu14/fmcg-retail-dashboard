"""Generates the FMCG Sales PWA icon set with Pillow: a rounded-square tile,
blue-to-aqua gradient (matching the dashboard's validated chart palette:
#2a78d6 -> #1baf7a), with a simple ascending-bars glyph (sales growth).
Drawn once at high resolution and downsampled for crispness at every size.
"""
import math
import os

from PIL import Image, ImageDraw

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
os.makedirs(OUT_DIR, exist_ok=True)

BASE = 1024
COLOR_START = (42, 120, 214)   # #2a78d6 blue
COLOR_END = (27, 175, 122)     # #1baf7a aqua
WHITE = (255, 255, 255, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_base_icon(corner_radius_ratio: float, glyph_scale: float) -> Image.Image:
    img = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))

    # Diagonal gradient background
    grad = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))
    gpix = grad.load()
    for y in range(BASE):
        for x in range(0, BASE, 4):  # stride for speed; fine at this smoothness
            t = (x + y) / (2 * BASE)
            c = lerp(COLOR_START, COLOR_END, t)
            for dx in range(4):
                if x + dx < BASE:
                    gpix[x + dx, y] = (*c, 255)

    mask = Image.new("L", (BASE, BASE), 0)
    mdraw = ImageDraw.Draw(mask)
    radius = int(BASE * corner_radius_ratio)
    mdraw.rounded_rectangle([0, 0, BASE - 1, BASE - 1], radius=radius, fill=255)
    img.paste(grad, (0, 0), mask)

    # Glyph: three ascending bars (sales growth), centered, sized within the
    # maskable-safe zone (glyph_scale controls how much of the canvas it fills)
    draw = ImageDraw.Draw(img)
    glyph_w = BASE * glyph_scale
    glyph_h = glyph_w * 0.62
    cx, cy = BASE / 2, BASE / 2
    left = cx - glyph_w / 2
    bottom = cy + glyph_h / 2

    bar_count = 3
    gap = glyph_w * 0.12
    bar_w = (glyph_w - gap * (bar_count - 1)) / bar_count
    heights = [glyph_h * 0.42, glyph_h * 0.70, glyph_h * 1.0]
    bar_radius = bar_w * 0.28

    for i, h in enumerate(heights):
        x0 = left + i * (bar_w + gap)
        x1 = x0 + bar_w
        y1 = bottom
        y0 = bottom - h
        draw.rounded_rectangle([x0, y0, x1, y1], radius=bar_radius, fill=WHITE)

    return img


def save_sized(img: Image.Image, size: int, path: str):
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(path)
    print(f"{path} ({size}x{size})")


# "any" icon: normal rounded-square app icon, tighter corner radius
any_base = make_base_icon(corner_radius_ratio=0.22, glyph_scale=0.5)
save_sized(any_base, 512, os.path.join(OUT_DIR, "icon-512.png"))
save_sized(any_base, 192, os.path.join(OUT_DIR, "icon-192.png"))

# "maskable" icon: fills the full square (OS applies its own mask shape),
# glyph kept smaller so it survives a circular crop
maskable_base = make_base_icon(corner_radius_ratio=0.0, glyph_scale=0.34)
save_sized(maskable_base, 512, os.path.join(OUT_DIR, "icon-maskable-512.png"))

# Apple touch icon: iOS applies its own rounding, wants a full square, no alpha
apple_base = make_base_icon(corner_radius_ratio=0.0, glyph_scale=0.46).convert("RGB")
apple_base.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT_DIR, "apple-touch-icon.png"))
print(f"{os.path.join(OUT_DIR, 'apple-touch-icon.png')} (180x180)")

# Favicon.ico with multiple embedded sizes
favicon_base = make_base_icon(corner_radius_ratio=0.22, glyph_scale=0.5)
favicon_sizes = [16, 32, 48]
favicon_path = os.path.join(os.path.dirname(__file__), "..", "src", "app", "favicon.ico")
favicon_base.resize((256, 256), Image.LANCZOS).save(
    favicon_path, sizes=[(s, s) for s in favicon_sizes]
)
print(f"{favicon_path} (multi-size ico)")

print("Done.")
