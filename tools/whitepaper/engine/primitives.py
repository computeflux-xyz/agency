from __future__ import annotations

from typing import Iterable, Sequence

from . import theme

Color = Sequence[int]


def hexa(color: Color) -> str:
    return "#%02X%02X%02X" % (color[0], color[1], color[2])


def notched_rect(
    pdf,
    x: float,
    y: float,
    w: float,
    h: float,
    fill: Color | None = None,
    stroke: Color | None = None,
    lw: float = 0.2,
    notch: float = 2.6,
    corners: Iterable[str] = ("tr",),
) -> None:
    corners = set(corners)
    n = notch
    pts: list[tuple[float, float]] = []

    # top-left -> top-right -> bottom-right -> bottom-left
    pts.append((x + n, y) if "tl" in corners else (x, y))
    if "tr" in corners:
        pts += [(x + w - n, y), (x + w, y + n)]
    else:
        pts.append((x + w, y))
    if "br" in corners:
        pts += [(x + w, y + h - n), (x + w - n, y + h)]
    else:
        pts.append((x + w, y + h))
    if "bl" in corners:
        pts += [(x + n, y + h), (x, y + h - n)]
    else:
        pts.append((x, y + h))
    if "tl" in corners:
        pts.append((x, y + n))

    with pdf.new_path() as path:
        path.style.fill_color = hexa(fill) if fill else None
        path.style.stroke_color = hexa(stroke) if stroke else None
        path.style.stroke_width = lw if stroke else 0
        path.move_to(*pts[0])
        for pt in pts[1:]:
            path.line_to(*pt)

        path.close()


def polygon(pdf, pts: Sequence[tuple[float, float]], fill: Color | None = None,
            stroke: Color | None = None, lw: float = 0.2) -> None:
    with pdf.new_path() as path:
        path.style.fill_color = hexa(fill) if fill else None
        path.style.stroke_color = hexa(stroke) if stroke else None
        path.style.stroke_width = lw if stroke else 0
        path.move_to(*pts[0])
        for pt in pts[1:]:
            path.line_to(*pt)
        path.close()


def rule(pdf, x1: float, y: float, x2: float, color: Color = theme.LINE, lw: float = 0.2) -> None:
    pdf.set_draw_color(*color)
    pdf.set_line_width(lw)
    pdf.line(x1, y, x2, y)


def arrow_right(pdf, x1: float, x2: float, y: float, color: Color = theme.INK_FAINT,
                head: float = 1.5, lw: float = 0.25) -> None:
    pdf.set_draw_color(*color)
    pdf.set_line_width(lw)
    pdf.line(x1, y, x2 - head, y)
    polygon(pdf, [(x2, y), (x2 - head, y - head * 0.62), (x2 - head, y + head * 0.62)], fill=color)


def arrow_down(pdf, x: float, y1: float, y2: float, color: Color = theme.INK_FAINT,
               head: float = 1.5, lw: float = 0.25) -> None:
    pdf.set_draw_color(*color)
    pdf.set_line_width(lw)
    pdf.line(x, y1, x, y2 - head)
    polygon(pdf, [(x, y2), (x - head * 0.62, y2 - head), (x + head * 0.62, y2 - head)], fill=color)


def arrow_up(pdf, x: float, y1: float, y2: float, color: Color = theme.INK_FAINT,
             head: float = 1.5, lw: float = 0.25) -> None:
    pdf.set_draw_color(*color)
    pdf.set_line_width(lw)
    pdf.line(x, y1, x, y2 + head)
    polygon(pdf, [(x, y2), (x - head * 0.62, y2 + head), (x + head * 0.62, y2 + head)], fill=color)


def marker_square(pdf, x: float, y: float, size: float, color: Color) -> None:
    pdf.set_fill_color(*color)
    pdf.rect(x, y, size, size, style="F")


def measure(pdf, text: str, w: float, font: str, style: str, size: float,
            lead: float, markdown: bool = False) -> float:
    pdf.set_font(font, style, size)
    return pdf.multi_cell(w, lead, text, dry_run=True, output="HEIGHT",
                          markdown=markdown, align="L")


def text_block(pdf, x: float, y: float, w: float, text: str, font: str, style: str,
               size: float, lead: float, color: Color = theme.INK, align: str = "L",
               markdown: bool = False) -> float:
    pdf.set_xy(x, y)
    pdf.set_font(font, style, size)
    pdf.set_text_color(*color)
    pdf.multi_cell(w, lead, text, align=align, markdown=markdown,
                   new_x="LMARGIN", new_y="NEXT")

    return pdf.get_y() - y


def mono_label(pdf, x: float, y: float, text: str, size: float = theme.PT_LABEL,
               color: Color = theme.INK_MUTED, spacing: float = 0.55,
               style: str = "", align: str = "L", w: float = 0.0) -> float:

    pdf.set_font(theme.MONO, style, size)
    pdf.set_text_color(*color)
    pdf.set_char_spacing(spacing)
    width = w or pdf.get_string_width(text) + 2
    pdf.set_xy(x, y)
    pdf.cell(width, size * 0.4, text, align=align)
    pdf.set_char_spacing(0)
    return size * 0.4


def mono_width(pdf, text: str, size: float, spacing: float = 0.55, style: str = "") -> float:
    pdf.set_font(theme.MONO, style, size)
    base = pdf.get_string_width(text)
    return base + spacing * len(text) * 0.3528  # pt -> mm


def brand_mark(pdf, x: float, y: float, width: float, opacity: float = 1.0,
               colors: dict | None = None) -> None:

    palette = colors or theme.MARK_COLORS
    box_w, box_h = theme.MARK_BOX
    k = width / box_w
    with pdf.local_context(fill_opacity=opacity, stroke_opacity=opacity):
        for cx, cy, cw, cl, angle, key in theme.MARK_STROKES:
            px, py = x + cx * k, y + cy * k
            pw, ph = cw * k, cl * k
            pdf.set_fill_color(*palette[key])
            if angle:
                with pdf.rotation(angle, px, py):
                    pdf.rect(px - pw / 2, py - ph / 2, pw, ph, style="F",
                             round_corners=True, corner_radius=pw / 2)
            else:
                pdf.rect(px - pw / 2, py - ph / 2, pw, ph, style="F",
                         round_corners=True, corner_radius=pw / 2)
    _ = box_h


def wordmark(pdf, x: float, y: float, height: float = 5.0,
             color: Color = theme.INK) -> float:

    mark_w = height * (theme.MARK_BOX[0] / theme.MARK_BOX[1])
    brand_mark(pdf, x, y, mark_w)
    pdf.set_font(theme.DISPLAY, "B", height * 2.6)
    pdf.set_text_color(*color)
    pdf.set_xy(x + mark_w + height * 0.35, y + height * 0.16)
    label = "computeflux"
    pdf.cell(pdf.get_string_width(label) + 1, height * 0.7, label)
    return mark_w + height * 0.35 + pdf.get_string_width(label)
