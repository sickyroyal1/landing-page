#!/usr/bin/env python3
"""Regenerate public/og-image.jpg (1200x630) with DINKLAB + branding.

Recipe (matches the original): cover-crop the hero header photo, blur + darken,
then draw the brand headline and a purple CTA pill. Re-run after any brand change.

Usage: python scripts/gen_og_image.py
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "assets", "images", "hero_header_image.jpg")
OUT = os.path.join(ROOT, "public", "og-image.jpg")

W, H = 1200, 630
FONT_DIR = r"C:\Windows\Fonts"
FONT_BOLD = os.path.join(FONT_DIR, "arialbd.ttf")
FONT_REG = os.path.join(FONT_DIR, "arial.ttf")

PURPLE = (167, 139, 250)   # purple-400
VIOLET = (139, 92, 246)    # violet-500
INK = (15, 23, 42)         # slate-900


def cover_crop(img, w, h):
    sw, sh = img.size
    scale = max(w / sw, h / sh)
    nw, nh = round(sw * scale), round(sh * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    x = (nw - w) // 2
    y = (nh - h) // 2
    return img.crop((x, y, x + w, y + h))


def gradient_overlay(size, top, bottom):
    w, h = size
    base = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / max(h - 1, 1)
        base.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return base.resize((w, h), Image.LANCZOS)


def main():
    if not os.path.exists(SRC):
        raise SystemExit(f"source image not found: {SRC}")

    img = cover_crop(Image.open(SRC), W, H)
    img = img.filter(ImageFilter.GaussianBlur(2.5))

    # Darken bottom-left for legibility of the text block.
    dark = Image.new("RGB", (W, H), (0, 0, 0))
    darkened = Image.blend(img, dark, 0.55)
    # Purple tint, stronger at the bottom.
    tint = gradient_overlay((W, H), (49, 46, 129), (30, 27, 75))  # indigo-900 -> indigo-950
    composite = Image.blend(darkened, tint, 0.55)
    img = composite

    draw = ImageDraw.Draw(img)

    # Left-aligned brand block, vertically centered-ish.
    pad_x = 96
    title_font = ImageFont.truetype(FONT_BOLD, 96)
    eyebrow_font = ImageFont.truetype(FONT_BOLD, 40)
    sub_font = ImageFont.truetype(FONT_REG, 34)
    cta_font = ImageFont.truetype(FONT_BOLD, 34)

    # Eyebrow: purple pill "DINKLAB +"
    eyebrow = "DINKLAB +"
    ew = draw.textbbox((0, 0), eyebrow, font=eyebrow_font)
    pill_w = ew[2] - ew[0] + 48
    pill_h = ew[3] - ew[1] + 28
    pill_y = 100
    draw.rounded_rectangle(
        (pad_x, pill_y, pad_x + pill_w, pill_y + pill_h),
        radius=pill_h // 2, fill=PURPLE,
    )
    draw.text(
        (pad_x + 24, pill_y + 10),
        eyebrow, font=eyebrow_font, fill=INK,
    )

    # Headline
    headline = "Elevate Your\nPickleball Game"
    ty = pill_y + pill_h + 36
    draw.multiline_text((pad_x, ty), headline, font=title_font, fill=(255, 255, 255), spacing=6)

    # Sub-line
    sub = "Private coaching in Negros Oriental, Philippines"
    sy = ty + 215
    draw.text((pad_x, sy), sub, font=sub_font, fill=(226, 232, 240))  # slate-200

    # Purple CTA pill
    cta = "Book a Session \u2192"
    cb = draw.textbbox((0, 0), cta, font=cta_font)
    cw = cb[2] - cb[0] + 64
    ch = cb[3] - cb[1] + 36
    cy = sy + 52
    draw.rounded_rectangle((pad_x, cy, pad_x + cw, cy + ch), radius=ch // 2, fill=VIOLET)
    draw.text((pad_x + 32, cy + 12), cta, font=cta_font, fill=(255, 255, 255))

    img.save(OUT, quality=92)
    print(f"wrote {OUT} ({W}x{H})")


if __name__ == "__main__":
    main()
