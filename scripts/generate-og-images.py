#!/usr/bin/env python3
"""Generate per-post OG images (1200x630 PNG) for social sharing.

Called from GitHub Actions before jekyll build. Outputs to assets/og/.
Uses DejaVu fonts available on Ubuntu runners at /usr/share/fonts/truetype/dejavu/.
"""

import os
import re
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow not installed. Run: pip install Pillow")
    sys.exit(1)

POSTS_DIR = Path(__file__).parent.parent / "_posts"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "og"
WIDTH, HEIGHT = 1200, 630

# Brand colours (matches _sass/_tokens.scss light theme)
BG_COLOR = "#ffffff"
TEXT_COLOR = "#1a1a2e"
ACCENT_COLOR = "#2563eb"
SUBTITLE_COLOR = "#64748b"
BADGE_BG = "#dbeafe"
BADGE_TEXT = "#1e40af"

# Font paths: Linux CI runner or Windows local
_FONT_DIRS = [
    Path("/usr/share/fonts/truetype/dejavu"),  # Ubuntu CI
    Path("C:/Windows/Fonts"),                   # Windows local
]


def load_font(weight="Bold", size=48):
    names = {
        "Bold": ["DejaVuSans-Bold.ttf", "arialbd.ttf"],
        "Regular": ["DejaVuSans.ttf", "arial.ttf"],
    }
    for d in _FONT_DIRS:
        for name in names.get(weight, names["Bold"]):
            p = d / name
            if p.exists():
                return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def wrap_text(text, font, max_width, draw):
    """Word-wrap text to fit within max_width pixels."""
    words = text.split()
    lines = []
    current_line = []
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))
    return lines


def generate_og_image(title, topic, slug, output_path):
    """Generate a single OG image."""
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Left accent bar
    draw.rectangle([(0, 0), (8, HEIGHT)], fill=ACCENT_COLOR)

    # Topic badge
    badge_font = load_font("Bold", 20)
    badge_text = topic.upper() if topic else "DEV-BLOG"
    badge_bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    badge_w = badge_bbox[2] - badge_bbox[0] + 24
    badge_h = badge_bbox[3] - badge_bbox[1] + 12
    badge_x, badge_y = 60, 60
    draw.rounded_rectangle(
        [badge_x, badge_y, badge_x + badge_w, badge_y + badge_h],
        radius=4,
        fill=BADGE_BG,
    )
    draw.text((badge_x + 12, badge_y + 4), badge_text, fill=BADGE_TEXT, font=badge_font)

    # Title
    title_font = load_font("Bold", 48)
    title_lines = wrap_text(title, title_font, WIDTH - 120, draw)
    y = 140
    for line in title_lines[:3]:  # Max 3 lines
        draw.text((60, y), line, fill=TEXT_COLOR, font=title_font)
        y += 60

    # Brand name
    brand_font = load_font("Bold", 22)
    draw.text((60, HEIGHT - 80), "Real Repos, Real Ops", fill=ACCENT_COLOR, font=brand_font)

    # URL
    url_font = load_font("Regular", 16)
    draw.text((60, HEIGHT - 50), "mayurjp.github.io/dev-blog", fill=SUBTITLE_COLOR, font=url_font)

    img.save(str(output_path), "PNG")
    return output_path


def extract_front_matter(post_path):
    """Extract title and categories from post front matter."""
    content = post_path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return None, None
    fm = match.group(1)
    title_m = re.search(r'^title:\s*["\']?(.*?)["\']?\s*$', fm, re.MULTILINE)
    cat_m = re.search(r'^categories:\s*(\S+)', fm, re.MULTILINE)
    title = title_m.group(1) if title_m else post_path.stem
    category = cat_m.group(1) if cat_m else ""
    return title, category


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Generate default OG image
    default_title = "Real Repos, Real Ops"
    default_path = OUTPUT_DIR / "default.png"
    generate_og_image(default_title, "Kubernetes, Docker, Security & more", "", default_path)
    print(f"[OK] Default OG image -> {default_path}")

    # Generate per-post OG images
    posts = sorted(POSTS_DIR.glob("*.md"))
    count = 0
    for post in posts:
        title, category = extract_front_matter(post)
        if not title:
            continue
        slug = post.stem
        # Remove date prefix if present
        slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", slug)
        out = OUTPUT_DIR / f"{slug}.png"
        generate_og_image(title, category, slug, out)
        count += 1

    print(f"[OK] Generated {count} per-post OG images -> {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
