from __future__ import annotations

import shutil
from dataclasses import dataclass
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[1]
SITE = REPO_ROOT / "services" / "site"
WEB_FONTS = SITE / "public" / "fonts"
TTF_FONTS = SITE / "fonts"
PHOTOS = SITE / "public" / "photos"
FONT_CACHE = HERE / ".fontcache"


INK = (0x20, 0x1F, 0x1E)  # primary text (sand-900)
INK_STRONG_MUTED = (0x57, 0x52, 0x47)  # secondary text
INK_MUTED = (0x79, 0x72, 0x63)  # captions, running heads
INK_FAINT = (0x9C, 0x96, 0x86)  # leaders, disabled
LINE = (0xDC, 0xD7, 0xCB)  # hairline
FILL_SUBTLE = (0xED, 0xEA, 0xE3)  # subtle fill (sand-100)
CANVAS = (0xF5, 0xF4, 0xEF)  # page canvas (sand-50)
SURFACE = (0xFB, 0xFB, 0xF9)  # raised surface
WHITE = (0xFF, 0xFF, 0xFF)

BLUE = (0x2F, 0x6B, 0xFF)
BLUE_SOFT = (0xDB, 0xE4, 0xFF)
MAGENTA = (0xE1, 0x1F, 0xD0)
MAGENTA_SOFT = (0xFF, 0xD9, 0xFB)
AMBER = (0xFF, 0xC4, 0x0F)
AMBER_SOFT = (0xFF, 0xEE, 0xB0)

ACCENTS = {
    "blue": (BLUE, BLUE_SOFT),
    "magenta": (MAGENTA, MAGENTA_SOFT),
    "amber": (AMBER, AMBER_SOFT),
}


def accent(name: str) -> tuple[tuple[int, int, int], tuple[int, int, int]]:
    """(strong, soft) pair for an accent name; falls back to blue."""
    return ACCENTS.get(name, ACCENTS["blue"])


PAGE_W = 210.0
PAGE_H = 297.0
MARGIN_L = 24.0
MARGIN_R = 24.0
MARGIN_T = 30.0
MARGIN_B = 24.0
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R  # 162 mm

HEADER_Y = 15.0
HEADER_RULE_Y = 19.5
FOOTER_RULE_Y = 279.0
FOOTER_Y = 282.0

PT_COVER_TITLE = 27.0
PT_COVER_SUB = 12.0
PT_DIVIDER_NUM = 520.0
PT_DIVIDER_TITLE = 20.0
PT_H1 = 22.0
PT_H2 = 13.0
PT_H3 = 10.8
PT_BODY = 10.2
PT_LEAD = 11.2
PT_CAPTION = 8.2
PT_LABEL = 7.4

LEAD_BODY = 5.5
LEAD_LEAD = 6.0

SPACE_AFTER_P = 3.4
SPACE_BEFORE_H2 = 8.0
SPACE_AFTER_H2 = 3.6

DISPLAY = "display"
BODY = "body"
MONO = "mono"


@dataclass
class FontFile:
    family: str
    style: str  # "" | "B"
    path: Path


def _woff2_to_ttf(src: Path, dst: Path) -> Path | None:
    """Transcode a .woff2 to .ttf (cached). Returns None if not possible."""
    if dst.exists():
        return dst
    try:
        from fontTools.ttLib import TTFont  # noqa: PLC0415
    except ImportError:
        return None
    if not src.exists():
        return None
    try:
        font = TTFont(str(src))
        font.flavor = None
        dst.parent.mkdir(parents=True, exist_ok=True)
        font.save(str(dst))
        return dst
    except Exception:
        return None


def resolve_fonts() -> tuple[list[FontFile], list[str]]:
    """
    Build the font registration plan.

    Returns (files, notes) where `notes` records any fallback that was applied,
    so the CLI can tell the operator the PDF is off-brand typographically.
    """
    notes: list[str] = []
    files: list[FontFile] = []

    spline_regular = TTF_FONTS / "SplineSans-Regular.ttf"
    spline_semibold = TTF_FONTS / "SplineSans-SemiBold.ttf"
    spline_bold = TTF_FONTS / "SplineSans-Bold.ttf"

    if not spline_regular.exists():
        raise FileNotFoundError(
            f"Spline Sans not found at {spline_regular}. "
            "Run this script from inside the agency repository."
        )

    body_bold = spline_semibold if spline_semibold.exists() else spline_bold
    files += [
        FontFile(BODY, "", spline_regular),
        FontFile(BODY, "B", body_bold),
    ]

    grotesk_r = _woff2_to_ttf(WEB_FONTS / "SpaceGrotesk-500.woff2", FONT_CACHE / "SpaceGrotesk-500.ttf")
    grotesk_b = _woff2_to_ttf(WEB_FONTS / "SpaceGrotesk-700.woff2", FONT_CACHE / "SpaceGrotesk-700.ttf")
    if grotesk_r and grotesk_b:
        files += [FontFile(DISPLAY, "", grotesk_r), FontFile(DISPLAY, "B", grotesk_b)]
    else:
        notes.append(
            "Space Grotesk unavailable (install `fonttools` and `brotli`); "
            "headings fall back to Spline Sans."
        )
        files += [FontFile(DISPLAY, "", spline_regular), FontFile(DISPLAY, "B", body_bold)]

    mono_r = _woff2_to_ttf(WEB_FONTS / "JetBrainsMono-Regular.woff2", FONT_CACHE / "JetBrainsMono-Regular.ttf")
    mono_b = _woff2_to_ttf(WEB_FONTS / "JetBrainsMono-Bold.woff2", FONT_CACHE / "JetBrainsMono-Bold.ttf")
    if mono_r and mono_b:
        files += [FontFile(MONO, "", mono_r), FontFile(MONO, "B", mono_b)]
    else:
        notes.append(
            "JetBrains Mono unavailable (install `fonttools` and `brotli`); "
            "labels fall back to Courier."
        )

    return files, notes


def has_mono(files: list[FontFile]) -> bool:
    return any(f.family == MONO for f in files)


def clear_font_cache() -> None:
    if FONT_CACHE.exists():
        shutil.rmtree(FONT_CACHE)


MARK_BOX = (1138.0, 1217.0)
MARK_STROKES = (
    (247.8, 248.8, 126.0, 569.0, 45.0, "blue"),
    (889.8, 248.8, 126.0, 569.0, -45.0, "magenta"),
    (573.0, 929.5, 126.0, 575.0, 0.0, "amber"),
)

MARK_COLORS = {"blue": BLUE, "magenta": MAGENTA, "amber": AMBER}
