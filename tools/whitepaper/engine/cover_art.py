from __future__ import annotations

import json
import math
import re
from pathlib import Path

from . import primitives as P
from . import theme

ICONS_JSON = theme.ASSETS / "icons.json"
NODE_ICONS = theme.SITE / "node_modules" / "simple-icons" / "icons"

DEFAULT_TOOLS: list[tuple[str, str]] = [
    ("python", "PY"),
    ("rust", "RS"),
    ("go", "GO"),
    ("pytorch", "PT"),
    ("kubernetes", "K8"),
    ("postgresql", "PG"),
    ("apachespark", "SP"),
    ("clickhouse", "CH"),
    ("nvidia", "NV"),
    ("docker", "DK"),
    ("huggingface", "HF"),
    ("apachekafka", "KA"),
    ("duckdb", "DD"),
    ("terraform", "TF"),
    ("ray", "RAY"),
    ("vllm", "VL"),
    ("apacheairflow", "AF"),
    ("polars", "PL"),
    ("grafana", "GF"),
    ("cplusplus", "C++"),
    ("onnx", "OX"),
    ("qdrant", "QD"),
    ("apacheflink", "FL"),
    ("prometheus", "PM"),
    ("redis", "RD"),
    ("langchain", "LC"),
    ("trino", "TR"),
    ("ollama", "OL"),
    ("opentelemetry", "OT"),
    ("mlflow", "ML"),
    ("snowflake", "SF"),
    ("zig", "ZG"),
    ("neo4j", "N4"),
    ("linux", "LX"),
    ("ocaml", "OC"),
    ("scylladb", "SC"),
]

DEFAULT_ACCENT_TILES = {4: theme.BLUE, 13: theme.MAGENTA, 22: theme.AMBER}

ICON_INK = (0xC9, 0xC3, 0xB4)
FACE_TOP = (0x30, 0x2F, 0x2A)
FACE_RIGHT = (0x25, 0x24, 0x21)
FACE_LEFT = (0x1A, 0x19, 0x18)
FACE_EDGE = (0x3E, 0x3B, 0x36)
PILLAR_TOP = (0x1A, 0x19, 0x18)
PILLAR_LEFT = (0x15, 0x14, 0x13)
PILLAR_RIGHT = (0x28, 0x27, 0x23)


def load_icons(refresh: bool = False, tools=None) -> dict[str, str]:
    """
    Renvoie {slug: données `d` du tracé}. Lit le cache versionné, et le
    reconstruit depuis node_modules si demandé ou s'il est absent.
    """
    if not refresh and ICONS_JSON.exists():
        data = json.loads(ICONS_JSON.read_text(encoding="utf-8"))
        return data.get("paths", {})

    return extract_icons(tools)


def extract_icons(tools=None) -> dict[str, str]:
    """Extrait les tracés depuis `services/site/node_modules/simple-icons`."""
    if not NODE_ICONS.is_dir():
        return {}

    paths: dict[str, str] = {}
    for slug, _ in (tools or DEFAULT_TOOLS):
        svg = NODE_ICONS / f"{slug}.svg"
        if not svg.exists():
            continue
        match = re.search(r'\sd="([^"]+)"', svg.read_text(encoding="utf-8"))
        if match:
            paths[slug] = match.group(1)

    if paths:
        ICONS_JSON.parent.mkdir(parents=True, exist_ok=True)
        ICONS_JSON.write_text(
            json.dumps(
                {
                    "source": "simple-icons (https://simpleicons.org), CC0 1.0",
                    "viewBox": "0 0 24 24",
                    "paths": paths,
                },
                ensure_ascii=False,
                indent=1,
            )
            + "\n",
            encoding="utf-8",
        )

    return paths


def _tile(pdf, x: float, y: float, a: float, b: float, t: float, top=FACE_TOP, accent=None) -> None:
    P.polygon(pdf, [(x - a, y), (x, y + b), (x, y + b + t), (x - a, y + t)], fill=FACE_LEFT)
    P.polygon(pdf, [(x, y + b), (x + a, y), (x + a, y + t), (x, y + b + t)], fill=FACE_RIGHT)
    P.polygon(
        pdf,
        [(x, y - b), (x + a, y), (x, y + b), (x - a, y)],
        fill=top,
        stroke=accent or FACE_EDGE,
        lw=0.35 if accent else 0.15,
    )


def _icon_svg(entries: list[tuple[str, float, float, float, float, tuple]], width: float, height: float) -> str:
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.3f} {height:.3f}">'
    ]
    for path_d, cx, cy, sa, sb, color in entries:
        parts.append(
            f'<g transform="matrix({sa:.5f},{sb:.5f},{-sa:.5f},{sb:.5f},'
            f'{cx:.4f},{cy - 24 * sb:.4f})">'
            f'<path d="{path_d}" fill="{P.hexa(color)}"/></g>'
        )

    parts.append("</svg>")
    return "".join(parts)


def draw_tool_field(pdf, cx: float, cy: float, cols: int = 6,
                    half_w: float = 15.5, spread: float = 1.10,
                    thickness: float = 3.0, icon_scale: float = 0.60,
                    refresh_icons: bool = False, tools=None,
                    accent_tiles=None) -> tuple[float, float]:

    from fpdf.svg import SVGObject

    tools = tools or DEFAULT_TOOLS
    accent_tiles = DEFAULT_ACCENT_TILES if accent_tiles is None else accent_tiles
    icons = load_icons(refresh=refresh_icons, tools=tools)
    a = half_w
    b = half_w / 2
    sx = a * spread
    sy = b * spread

    span_y = (cols - 1) * 2 * sy
    oy = cy - span_y / 2

    cells = [(i, j) for j in range(cols) for i in range(cols)]
    cells.sort(key=lambda c: (c[0] + c[1]))

    svg_entries: list[tuple] = []
    for n, (i, j) in enumerate(cells):
        x = cx + (i - j) * sx
        y = oy + (i + j) * sy

        slug, mono = tools[(len(cells) - 1 - n) % len(tools)]
        accent = accent_tiles.get(n)
        _tile(pdf, x, y, a, b, thickness, accent=accent)

        color = accent or ICON_INK
        path_d = icons.get(slug)
        if path_d:
            svg_entries.append((path_d, x, y, a * icon_scale / 24, b * icon_scale / 24, color))
        else:
            _monogram(pdf, x, y, mono, a, color)

    if svg_entries:
        obj = SVGObject(_icon_svg(svg_entries, theme.PAGE_W, theme.PAGE_H).encode())
        _, _, group = obj.transform_to_rect_viewport(
            scale=1, width=theme.PAGE_W, height=theme.PAGE_H, align_viewbox=False
        )
        pdf.draw_path(group)

    return oy - b - thickness, oy + span_y + b + thickness


def _monogram(pdf, x: float, y: float, text: str, a: float, color) -> None:
    pdf.set_font(theme.MONO, "B", a * 0.9)
    pdf.set_text_color(*color)
    pdf.set_xy(x - a, y - a * 0.16)
    pdf.cell(2 * a, a * 0.32, text, align="C")


def field_extent(cols: int = 6, half_w: float = 15.5,
                 spread: float = 1.10) -> tuple[float, float]:
    """Half-width and half-height of the field's diamond silhouette."""
    a = half_w
    return (cols - 1) * a * spread + a, (cols - 1) * (a / 2) * spread + a / 2


def _lerp(c1, c2, t: float):
    return tuple(round(a + (b - a) * t) for a, b in zip(c1, c2))


def _pillar_body(pdf, cx: float, y_top: float, a: float, b: float, bottom: float,
                 top, left, right) -> None:
    P.polygon(pdf, [(cx, y_top - b), (cx + a, y_top), (cx, y_top + b), (cx - a, y_top)], fill=top)
    P.polygon(pdf, [(cx - a, y_top), (cx, y_top + b), (cx, bottom), (cx - a, bottom)], fill=left)
    P.polygon(pdf, [(cx, y_top + b), (cx + a, y_top), (cx + a, bottom), (cx, bottom)], fill=right)


def draw_pillar(pdf, cx: float, y_top: float, half_w: float, bottom: float,
                half_h: float | None = None, fade_from: float | None = None,
                bands: int = 110, bg=theme.INK, saturate: float = 0.82) -> None:
    """Isometric column under the field. Drawn before the tiles, which hide its
    top face: only what falls below the field's V-shaped silhouette shows.

    The lower part dissolves into the background by redrawing the column in
    opaque bands whose colour is interpolated towards `bg` — stacking
    translucent bands instead would compound at the seams and stripe."""
    faces = (PILLAR_TOP, PILLAR_LEFT, PILLAR_RIGHT)
    half_h = half_w / 2 if half_h is None else half_h
    fade_from = bottom if fade_from is None else fade_from

    with pdf.rect_clip(0, 0, theme.PAGE_W, fade_from):
        _pillar_body(pdf, cx, y_top, half_w, half_h, bottom, *faces)

    step = (bottom - fade_from) / bands
    for k in range(bands):
        t = min(1.0, (k + 0.5) / bands / saturate) ** 0.85
        with pdf.rect_clip(0, fade_from + k * step, theme.PAGE_W, step + 0.08):
            _pillar_body(pdf, cx, y_top, half_w, half_h, bottom,
                         *[_lerp(c, bg, t) for c in faces])


def _fade(pdf, y0: float, y1: float, color, bands: int, exponent: float) -> None:
    """Stack bands of decreasing opacity: an axial shading cannot carry alpha,
    and this keeps the cover free of any bitmap."""
    step = (y1 - y0) / bands
    for k in range(bands):
        opacity = (1 - k / bands) ** exponent
        if opacity <= 0.004:
            continue
        with pdf.local_context(fill_opacity=opacity, stroke_opacity=opacity):
            pdf.set_fill_color(*color)
            pdf.rect(0, y0 + k * step, theme.PAGE_W, step + 0.08, style="F")


def draw_top_shadow(pdf, height: float, color=theme.INK, bands: int = 60) -> None:
    _fade(pdf, 0.0, height, color, bands, 2.1)


def refresh_icon_cache(tools=None) -> int:
    return len(extract_icons(tools))


_ = math
