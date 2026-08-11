from __future__ import annotations

from . import primitives as P
from . import theme
from . import typo

GAP = 5.0


def draw(pdf, spec: dict, x: float, y: float, w: float, render: bool = True,
         extra: dict | None = None, tr=None) -> float:
    """Render a figure spec. Returns its height; render=False measures only.

    `tr` is the language's typographic transform; drawers receive it so a figure
    reads the same as the prose around it."""
    kind = spec["kind"]
    fn = (extra or {}).get(kind) or KINDS[kind]
    return fn(pdf, spec, x, y, w, render, tr or typo.fr)


def _columns(pdf, spec: dict, x: float, y: float, w: float, draw: bool, tr) -> float:
    up = lambda text: tr(text).upper()  # noqa: E731
    cols = spec["columns"]
    colw = (w - (len(cols) - 1) * GAP) / len(cols)
    inner = colw - 8
    head_h = 7.5
    item_lead = 4.0

    box_h = 0.0
    for col in cols:
        h = head_h + 3.0
        h += P.measure(pdf, tr(col["title"]), inner, theme.DISPLAY, "B", 9.6, 4.8)
        h += 2.5
        for item in col["items"]:
            h += P.measure(pdf, tr(item), inner - 4, theme.BODY, "", 7.6, item_lead)
            h += 1.0

        box_h = max(box_h, h + 4.0)

    axis_h = 13.0
    total = box_h + axis_h
    if not draw:
        return total

    for i, col in enumerate(cols):
        strong, soft = theme.accent(col["accent"])
        bx = x + i * (colw + GAP)
        P.notched_rect(pdf, bx, y, colw, box_h, fill=theme.SURFACE,
                       stroke=theme.LINE, corners=("tr",), notch=3.0)
        pdf.set_fill_color(*soft)
        pdf.rect(bx, y, colw, head_h, style="F")
        pdf.set_fill_color(*strong)
        pdf.rect(bx, y, 1.6, head_h, style="F")
        P.mono_label(pdf, bx + 4.5, y + 2.2, up(col["label"]), 7.0, strong, 0.7)

        cy = y + head_h + 3.0
        cy += P.text_block(pdf, bx + 4, cy, inner, tr(col["title"]),
                           theme.DISPLAY, "B", 9.6, 4.8, theme.INK)
        cy += 2.5
        for item in col["items"]:
            P.marker_square(pdf, bx + 4, cy + 1.35, 1.2, strong)
            cy += P.text_block(pdf, bx + 8, cy, inner - 4, tr(item),
                               theme.BODY, "", 7.6, item_lead, theme.INK_STRONG_MUTED)
            cy += 1.0

    ay = y + box_h + 6.0
    P.rule(pdf, x, ay, x + w - 4, theme.LINE, 0.25)
    P.arrow_right(pdf, x + w - 6, x + w, ay, theme.INK_FAINT, 1.6, 0.25)
    for i, label in enumerate(spec["axis"]):
        bx = x + i * (colw + GAP)
        pdf.set_fill_color(*theme.CANVAS)
        pdf.rect(bx + 2, ay - 1.6, P.mono_width(pdf, up(label), 7.0) + 3, 3.2, style="F")
        P.mono_label(pdf, bx + 3.5, ay - 1.5, up(label), 7.0, theme.INK_MUTED, 0.7)

    return total


def _grid(pdf, spec: dict, x: float, y: float, w: float, draw: bool, tr) -> float:
    up = lambda text: tr(text).upper()  # noqa: E731
    items = spec["items"]
    per_row = spec.get("per_row", 3)
    rows = -(-len(items) // per_row)
    gap = 4.0
    colw = (w - (per_row - 1) * gap) / per_row
    inner = colw - 8
    accents = ("blue", "magenta", "amber")

    box_h = 0.0
    for _num, title, desc in items:
        h = 8.0
        h += P.measure(pdf, tr(title), inner, theme.DISPLAY, "B", 8.6, 4.3)
        h += 1.4
        h += P.measure(pdf, tr(desc), inner, theme.BODY, "", 7.1, 3.7)
        box_h = max(box_h, h + 4.5)

    total = rows * box_h + (rows - 1) * gap
    if not draw:
        return total

    for i, (num, title, desc) in enumerate(items):
        strong, _soft = theme.accent(accents[i % len(accents)])
        bx = x + (i % per_row) * (colw + gap)
        by = y + (i // per_row) * (box_h + gap)
        P.notched_rect(pdf, bx, by, colw, box_h, fill=theme.SURFACE,
                       stroke=theme.LINE, corners=("tr",), notch=3.0)
        P.mono_label(pdf, bx + 4, by + 3.0, num, 7.2, strong, 0.6, style="B")
        cy = by + 8.0
        cy += P.text_block(pdf, bx + 4, cy, inner, tr(title),
                           theme.DISPLAY, "B", 8.6, 4.3, theme.INK)
        cy += 1.4
        P.text_block(pdf, bx + 4, cy, inner, tr(desc),
                     theme.BODY, "", 7.1, 3.7, theme.INK_STRONG_MUTED)
    return total


def _pipeline(pdf, spec: dict, x: float, y: float, w: float, draw: bool, tr) -> float:
    up = lambda text: tr(text).upper()  # noqa: E731
    steps = spec["steps"]
    per_row = spec.get("per_row", 4)
    rows = -(-len(steps) // per_row)
    gap = 6.0
    bw = (w - (per_row - 1) * gap) / per_row
    bh = 13.0
    rail_h = 6.2
    row_gap = 11.0

    total = rail_h + 4.5 + rows * bh + (rows - 1) * row_gap + 4.5 + rail_h
    if not draw:
        return total

    def rail(ry: float, text: str, color) -> None:
        P.notched_rect(pdf, x, ry, w, rail_h, fill=theme.FILL_SUBTLE,
                       stroke=None, corners=("tr", "bl"), notch=2.2)
        P.mono_label(pdf, x, ry + 1.9, up(text), 6.8, color, 0.6,
                     align="C", w=w)

    rail(y, spec["rail_top"], theme.INK_MUTED)

    row_y = [y + rail_h + 4.5 + r * (bh + row_gap) for r in range(rows)]
    for i, step in enumerate(steps):
        row, col = divmod(i, per_row)
        bx = x + col * (bw + gap)
        by = row_y[row]
        terminal = i in (0, len(steps) - 1)
        P.notched_rect(
            pdf, bx, by, bw, bh,
            fill=theme.BLUE_SOFT if terminal else theme.SURFACE,
            stroke=theme.INK if terminal else theme.LINE,
            corners=("tr",), notch=2.6, lw=0.25 if terminal else 0.2,
        )
        label = tr(step)
        th = P.measure(pdf, label, bw - 5, theme.BODY, "B" if terminal else "", 7.5, 3.9)
        P.text_block(pdf, bx + 2.5, by + (bh - th) / 2, bw - 5, label,
                     theme.BODY, "B" if terminal else "", 7.5, 3.9,
                     theme.INK if terminal else theme.INK_STRONG_MUTED, align="C")
        if col < per_row - 1 and i != len(steps) - 1:
            P.arrow_right(pdf, bx + bw + 1.2, bx + bw + gap - 1.2, by + bh / 2,
                          theme.INK_FAINT, 1.5)

    last_top_x = x + (per_row - 1) * (bw + gap) + bw / 2
    first_bottom_x = x + bw / 2
    pdf.set_draw_color(*theme.INK_FAINT)
    pdf.set_line_width(0.25)
    for r in range(rows - 1):
        mid_y = row_y[r] + bh + row_gap / 2
        pdf.line(last_top_x, row_y[r] + bh + 1.2, last_top_x, mid_y)
        pdf.line(last_top_x, mid_y, first_bottom_x, mid_y)
        P.arrow_down(pdf, first_bottom_x, mid_y, row_y[r + 1] - 1.2, theme.INK_FAINT, 1.5)

    rail(y + total - rail_h, spec["rail_bottom"], theme.INK)
    return total


def _cycle(pdf, spec: dict, x: float, y: float, w: float, draw: bool, tr) -> float:
    up = lambda text: tr(text).upper()  # noqa: E731
    steps = spec["steps"]
    gap = 7.0
    bw = (w - (len(steps) - 1) * gap) / len(steps)
    inner = bw - 6

    bh = 0.0
    for title, desc in steps:
        h = 4.0
        h += P.measure(pdf, tr(title), inner, theme.DISPLAY, "B", 8.6, 4.3)
        h += 1.2
        h += P.measure(pdf, tr(desc), inner, theme.BODY, "", 7.1, 3.7)
        bh = max(bh, h + 4.0)

    feedback_h = 12.0
    total = bh + feedback_h
    if not draw:
        return total

    accents = ("blue", "magenta", "amber")
    for i, (title, desc) in enumerate(steps):
        strong, _ = theme.accent(accents[i % len(accents)])
        bx = x + i * (bw + gap)
        P.notched_rect(pdf, bx, y, bw, bh, fill=theme.SURFACE, stroke=theme.LINE,
                       corners=("tr",), notch=2.8)
        pdf.set_fill_color(*strong)
        pdf.rect(bx, y, bw, 1.1, style="F")
        cy = y + 4.0
        cy += P.text_block(pdf, bx + 3, cy, inner, tr(title),
                           theme.DISPLAY, "B", 8.6, 4.3, theme.INK)
        cy += 1.2
        P.text_block(pdf, bx + 3, cy, inner, tr(desc),
                     theme.BODY, "", 7.1, 3.7, theme.INK_STRONG_MUTED)
        if i < len(steps) - 1:
            P.arrow_right(pdf, bx + bw + 1.4, bx + bw + gap - 1.4, y + bh / 2,
                          theme.INK_FAINT, 1.6)

    ry = y + bh + 5.5
    pdf.set_draw_color(*theme.INK_FAINT)
    pdf.set_line_width(0.25)
    pdf.set_dash_pattern(1.1, 1.1)
    pdf.line(x + w - bw / 2, y + bh + 1.2, x + w - bw / 2, ry)
    pdf.line(x + w - bw / 2, ry, x + bw / 2, ry)
    pdf.set_dash_pattern()
    P.arrow_up(pdf, x + bw / 2, ry, y + bh + 1.2, theme.INK_FAINT, 1.5)

    label = up(spec["feedback"])
    lw = P.mono_width(pdf, label, 6.6) + 6
    pdf.set_fill_color(*theme.CANVAS)
    pdf.rect(x + (w - lw) / 2, ry - 1.7, lw, 3.4, style="F")
    P.mono_label(pdf, x, ry - 1.5, label, 6.6, theme.INK_MUTED, 0.6, align="C", w=w)
    return total


KINDS = {
    "columns": _columns,
    "grid": _grid,
    "pipeline": _pipeline,
    "cycle": _cycle,
}
