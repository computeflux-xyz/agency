from __future__ import annotations

import json
import math
import re
from pathlib import Path

import primitives as P
import theme

ICONS_JSON = theme.HERE / "assets" / "icons.json"
NODE_ICONS = theme.SITE / "node_modules" / "simple-icons" / "icons"

TOOLS: list[tuple[str, str]] = [
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

ACCENT_TILES = {4: theme.BLUE, 13: theme.MAGENTA, 22: theme.AMBER}

ICON_INK = (0xC9, 0xC3, 0xB4)
FACE_TOP = (0x30, 0x2F, 0x2A)
FACE_RIGHT = (0x25, 0x24, 0x21)
FACE_LEFT = (0x1A, 0x19, 0x18)
FACE_EDGE = (0x3E, 0x3B, 0x36)


def load_icons(refresh: bool = False) -> dict[str, str]:
    """
    Renvoie {slug: données `d` du tracé}. Lit le cache versionné, et le
    reconstruit depuis node_modules si demandé ou s'il est absent.
    """
    if not refresh and ICONS_JSON.exists():
        data = json.loads(ICONS_JSON.read_text(encoding="utf-8"))
        return data.get("paths", {})

    return extract_icons()


def extract_icons() -> dict[str, str]:
    """Extrait les tracés depuis `services/site/node_modules/simple-icons`."""
    if not NODE_ICONS.is_dir():
        return {}

    paths: dict[str, str] = {}
    for slug, _ in TOOLS:
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
                    refresh_icons: bool = False) -> tuple[float, float]:

    from fpdf.svg import SVGObject

    icons = load_icons(refresh=refresh_icons)
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

        slug, mono = TOOLS[(len(cells) - 1 - n) % len(TOOLS)]
        accent = ACCENT_TILES.get(n)
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


def draw_top_shadow(pdf, height: float, color=theme.INK, bands: int = 60) -> None:
    step = height / bands
    for k in range(bands):
        opacity = (1 - k / bands) ** 2.1
        if opacity <= 0.004:
            continue
        with pdf.local_context(fill_opacity=opacity, stroke_opacity=opacity):
            pdf.set_fill_color(*color)
            pdf.rect(0, k * step, theme.PAGE_W, step + 0.15, style="F")


def refresh_icon_cache() -> int:
    return len(extract_icons())


_ = math
