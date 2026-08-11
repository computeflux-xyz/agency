from __future__ import annotations

from pathlib import Path

from fpdf import FPDF
from fpdf.fonts import FontFace

from . import cover_art, diagrams
from . import primitives as P
from . import theme
from . import i18n
from .paper import Paper
from .theme import (
    BODY,
    CONTENT_W,
    DISPLAY,
    MARGIN_B,
    MARGIN_L,
    MARGIN_R,
    MARGIN_T,
    MONO,
    PAGE_H,
    PAGE_W,
)
from . import typo

IMAGE_H = 54.0

SVG_FAMILIES = {DISPLAY: "Space Grotesk", BODY: "Spline Sans", MONO: "JetBrains Mono"}


class WhitePaper(FPDF):
    def __init__(self, paper: Paper, refresh_icons: bool = False) -> None:
        super().__init__(orientation="P", unit="mm", format="A4")
        self.paper = paper
        self.tr = typo.for_lang(paper.lang)
        self.ui = i18n.ui(paper.lang)
        self.chrome = False
        self.accent_name = "blue"
        self.running = ""
        self.missing_images: list[str] = []
        self.font_notes: list[str] = []
        self.refresh_icons = refresh_icons
        self._chrome_pages: dict[int, bool] = {}
        self.set_margins(MARGIN_L, MARGIN_T, MARGIN_R)
        self.set_auto_page_break(True, MARGIN_B)
        self._register_fonts()
        self._set_metadata()

    def _register_fonts(self) -> None:
        files, notes = theme.resolve_fonts()
        self.font_notes = notes
        self._has_mono = theme.has_mono(files)
        for f in files:
            self.add_font(f.family, f.style, str(f.path))
            self.add_font(SVG_FAMILIES[f.family], f.style, str(f.path))
        if not self._has_mono:
            regular = str(next(f.path for f in files if f.family == BODY and f.style == ""))
            bold = str(next(f.path for f in files if f.family == BODY and f.style == "B"))
            for family in (MONO, SVG_FAMILIES[MONO]):
                self.add_font(family, "", regular)
                self.add_font(family, "B", bold)

    def _set_metadata(self) -> None:
        self.set_title(self.paper.title)
        self.set_author(self.paper.author)
        self.set_subject(self.paper.subject or self.paper.description)
        self.set_keywords(self.paper.keywords)
        self.set_creator("Computeflux — tools/whitepaper")
        self.set_lang(i18n.pdf_lang(self.paper.lang))

    def header(self) -> None:
        self._chrome_pages[self.page] = self.chrome
        if not self.chrome:
            return
        P.mono_label(self, MARGIN_L, theme.HEADER_Y, self.up(self.paper.author),
                     theme.PT_LABEL, theme.INK_MUTED, 0.7)
        if self.running:
            P.mono_label(self, MARGIN_L, theme.HEADER_Y, self.up(self.running),
                         theme.PT_LABEL, theme.INK_FAINT, 0.7, align="R", w=CONTENT_W)
        P.rule(self, MARGIN_L, theme.HEADER_RULE_Y, PAGE_W - MARGIN_R, theme.LINE, 0.2)
        self.set_xy(MARGIN_L, MARGIN_T)

    def footer(self) -> None:
        if not self._chrome_pages.get(self.page, self.chrome):
            return
        P.rule(self, MARGIN_L, theme.FOOTER_RULE_Y, PAGE_W - MARGIN_R, theme.LINE, 0.2)
        P.mono_label(self, MARGIN_L, theme.FOOTER_Y, self.paper.site, theme.PT_LABEL,
                     theme.INK_FAINT, 0.6)
        P.mono_label(self, MARGIN_L, theme.FOOTER_Y, str(self.page_no() - 1),
                     theme.PT_LABEL, theme.INK_MUTED, 0.6, align="R", w=CONTENT_W, style="B")

    def up(self, text: str) -> str:
        return self.tr(text).upper()

    def ensure(self, height: float) -> None:
        if self.get_y() + height > self.page_break_trigger:
            self.add_page()

    def content_page(self, reuse_empty: bool = False) -> None:
        self.chrome = True
        if reuse_empty and self.page_no() > 1 and abs(self.get_y() - MARGIN_T) < 0.5:
            return

        self.add_page()

    def cover(self) -> None:
        self.chrome = False
        self.add_page()
        self.set_fill_color(*theme.INK)
        self.rect(0, 0, PAGE_W, PAGE_H, style="F")

        field_cy = 86.0
        field_w, field_h = cover_art.field_extent()
        cover_art.draw_pillar(self, cx=PAGE_W / 2, y_top=field_cy + 4.0,
                              half_w=field_w, half_h=field_h,
                              bottom=178.0, fade_from=96.0)
        cover_art.draw_tool_field(self, cx=PAGE_W / 2, cy=field_cy,
                                  refresh_icons=self.refresh_icons,
                                  tools=self.paper.cover_tools)
        cover_art.draw_top_shadow(self, height=104.0)

        P.mono_label(self, MARGIN_L, 186, self.up(self.paper.eyebrow),
                     11.0, theme.INK_MUTED, 2.6, style="B")

        P.text_block(self, MARGIN_L, 196, CONTENT_W - 6, self.tr(self.paper.title),
                     DISPLAY, "B", theme.PT_COVER_TITLE, 11.2, theme.WHITE)
        y = self.get_y() + 4
        P.text_block(self, MARGIN_L, y, CONTENT_W - 6, self.tr(self.paper.subtitle),
                     BODY, "", theme.PT_COVER_SUB, 6.4, theme.INK_FAINT)

        P.rule(self, MARGIN_L, 258, PAGE_W - MARGIN_R, (0x3A, 0x38, 0x35), 0.3)
        P.wordmark(self, MARGIN_L, 266, 5.6, theme.WHITE)
        if self.paper.edition:
            P.mono_label(self, MARGIN_L, 267.5, self.up(self.paper.edition),
                         theme.PT_LABEL, theme.INK_MUTED, 0.7, align="R", w=CONTENT_W)

    def render_toc(self, outline) -> None:
        self.set_y(MARGIN_T)
        P.text_block(self, MARGIN_L, MARGIN_T, CONTENT_W, self.tr(self.ui["toc"]),
                     DISPLAY, "B", 18.0, 9.0, theme.INK)
        y = self.get_y() + 2
        P.rule(self, MARGIN_L, y, MARGIN_L + 26, theme.BLUE, 0.7)
        y += 9

        page_x = PAGE_W - MARGIN_R
        for section in outline:
            name = self.tr(section.name)
            page = str(section.page_number - 1)
            level0 = section.level == 0
            if level0:
                y += 4.2
            font, style, size = (DISPLAY, "B", 10.4) if level0 else (BODY, "", 9.4)
            color = theme.INK if level0 else theme.INK_STRONG_MUTED
            indent = 0.0 if level0 else 8.0

            self.set_font(font, style, size)
            self.set_text_color(*color)
            self.set_xy(MARGIN_L + indent, y)
            text_w = self.get_string_width(name)
            self.cell(text_w + 1, 5.2, name)

            self.set_font(MONO, "B" if level0 else "", 8.0)
            num_w = self.get_string_width(page) + 1
            self.set_text_color(*(theme.INK if level0 else theme.INK_MUTED))
            self.set_xy(page_x - num_w, y)
            self.cell(num_w, 5.2, page, align="R")

            dot_start = MARGIN_L + indent + text_w + 2.5
            dot_end = page_x - num_w - 2.0
            if dot_end > dot_start:
                self.set_draw_color(*theme.INK_FAINT)
                self.set_line_width(0.18)
                self.set_dash_pattern(0.35, 1.25)
                self.line(dot_start, y + 3.5, dot_end, y + 3.5)
                self.set_dash_pattern()
            y += 5.6

    def divider(self, num: str, title: str, accent_name: str) -> None:
        self.accent_name = accent_name
        self.running = title.replace("\n", " ")
        strong, soft = theme.accent(accent_name)

        self.chrome = False
        self.add_page()
        self.start_section(self.tr(f"{num}  {self.running}"), 0)
        band_h = 168.0
        self.set_fill_color(*soft)
        self.rect(0, 0, PAGE_W, band_h, style="F")

        with self.rect_clip(0, 0, PAGE_W, band_h - 1.4):
            self.set_font(DISPLAY, "B", theme.PT_DIVIDER_NUM)
            self.set_text_color(*theme.WHITE)
            num_w = self.get_string_width(num)
            self.text(PAGE_W - MARGIN_R - num_w, band_h - 1.4, num)

        self.set_fill_color(*strong)
        self.rect(0, band_h - 1.4, PAGE_W, 1.4, style="F")

        P.mono_label(self, MARGIN_L, 30, self.up(self.ui["part"].format(num=num)), 8.4, strong, 1.6, style="B")

        P.text_block(self, MARGIN_L, 196, CONTENT_W, self.tr(title),
                     DISPLAY, "B", theme.PT_DIVIDER_TITLE, 9.6, theme.INK, align="L")
        y = self.get_y() + 5
        P.rule(self, MARGIN_L, y, MARGIN_L + 26, strong, 0.7)

        self.content_page()

    def h1(self, title: str) -> None:
        self.running = title
        self.content_page(reuse_empty=True)
        self.start_section(self.tr(title), 0)
        P.text_block(self, MARGIN_L, self.get_y(), CONTENT_W, self.tr(title),
                     DISPLAY, "B", theme.PT_H1, 10.5, theme.INK)
        y = self.get_y() + 2.5
        strong, _ = theme.accent(self.accent_name)
        P.rule(self, MARGIN_L, y, MARGIN_L + 26, strong, 0.7)
        self.set_y(y + 7.5)

    def h2(self, num: str, title: str) -> None:
        strong, _ = theme.accent(self.accent_name)
        title_h = P.measure(self, self.tr(title), CONTENT_W - 14, DISPLAY, "B", theme.PT_H2, 6.2)
        self.ensure(theme.SPACE_BEFORE_H2 + title_h + theme.SPACE_AFTER_H2 + 16)
        y = self.get_y() + theme.SPACE_BEFORE_H2
        self.start_section(self.tr(f"{num}  {title}"), 1)
        P.mono_label(self, MARGIN_L, y + 1.6, num, 8.4, strong, 0.5, style="B")
        P.text_block(self, MARGIN_L + 14, y, CONTENT_W - 14, self.tr(title),
                     DISPLAY, "B", theme.PT_H2, 6.2, theme.INK)
        self.set_y(y + title_h + theme.SPACE_AFTER_H2)

    def h3(self, title: str) -> None:
        strong, _ = theme.accent(self.accent_name)
        title_h = P.measure(self, self.tr(title), CONTENT_W, DISPLAY, "B", theme.PT_H3, 5.6)
        self.ensure(6 + title_h + 14)
        y = self.get_y() + 6
        self.start_section(self.tr(title), 1)
        P.marker_square(self, MARGIN_L, y + 1.9, 1.6, strong)
        P.text_block(self, MARGIN_L + 4.5, y, CONTENT_W - 4.5, self.tr(title),
                     DISPLAY, "B", theme.PT_H3, 5.6, theme.INK)
        self.set_y(y + title_h + 2.6)

    def para(self, text: str, lead: bool = False) -> None:
        size = theme.PT_LEAD if lead else theme.PT_BODY
        line = theme.LEAD_LEAD if lead else theme.LEAD_BODY
        color = theme.INK if lead else theme.INK_STRONG_MUTED
        body = self.tr(text)

        self.ensure(min(P.measure(self, body, CONTENT_W, BODY, "", size, line, True), 2 * line))
        P.text_block(self, MARGIN_L, self.get_y(), CONTENT_W, body,
                     BODY, "", size, line, color, align="J", markdown=True)
        self.ln(theme.SPACE_AFTER_P)

    def bullets(self, items: list[str], numbered: bool = False) -> None:
        strong, _ = theme.accent(self.accent_name)
        indent = 7.5
        for i, item in enumerate(items, start=1):
            text = self.tr(item)
            h = P.measure(self, text, CONTENT_W - indent, BODY, "", theme.PT_BODY,
                          theme.LEAD_BODY, True)
            self.ensure(min(h, 2 * theme.LEAD_BODY))
            y = self.get_y()
            if numbered:
                P.mono_label(self, MARGIN_L, y + 0.9, f"{i:02d}", 7.6, strong, 0.4, style="B")
            else:
                P.marker_square(self, MARGIN_L + 1.2, y + 2.0, 1.5, strong)
            P.text_block(self, MARGIN_L + indent, y, CONTENT_W - indent, text,
                         BODY, "", theme.PT_BODY, theme.LEAD_BODY,
                         theme.INK_STRONG_MUTED, align="J", markdown=True)
            self.ln(1.8)
        self.ln(theme.SPACE_AFTER_P - 1.0)

    def callout(self, title: str, text: str, accent_name: str | None = None) -> None:
        strong, soft = theme.accent(accent_name or self.accent_name)
        pad = 6.0
        inner = CONTENT_W - 2 * pad - 2.0
        title_h = P.measure(self, self.tr(title), inner, DISPLAY, "B", 11.6, 6.0)
        body_h = P.measure(self, self.tr(text), inner, BODY, "", 10.0, 5.4, True)
        box_h = pad + title_h + 2.0 + body_h + pad
        self.ensure(box_h + 6)
        y = self.get_y() + 2
        P.notched_rect(self, MARGIN_L, y, CONTENT_W, box_h, fill=soft, stroke=None,
                       corners=("tr", "bl"), notch=4.5)
        self.set_fill_color(*strong)
        self.rect(MARGIN_L, y, 2.0, box_h, style="F")
        cy = y + pad
        cy += P.text_block(self, MARGIN_L + pad + 2, cy, inner, self.tr(title),
                           DISPLAY, "B", 11.6, 6.0, strong)
        cy += 2.0
        P.text_block(self, MARGIN_L + pad + 2, cy, inner, self.tr(text),
                     BODY, "", 10.0, 5.4, theme.INK, align="J", markdown=True)
        self.set_y(y + box_h + 6)

    def application(self, title: str, text: str, label: str = "Application") -> None:
        strong, _ = theme.accent(self.accent_name)
        pad = 6.0
        inner = CONTENT_W - 2 * pad
        title_h = P.measure(self, self.tr(title), inner, DISPLAY, "B", 9.8, 5.2)
        body_h = P.measure(self, self.tr(text), inner, BODY, "", 9.4, 5.0, True)
        box_h = pad + 4.4 + title_h + 1.8 + body_h + pad
        self.ensure(box_h + 6)
        y = self.get_y() + 2

        P.notched_rect(self, MARGIN_L, y, CONTENT_W, box_h, fill=theme.FILL_SUBTLE,
                       stroke=None, corners=("tr", "bl"), notch=4.0)
        P.rule(self, MARGIN_L + pad, y + pad - 0.4, MARGIN_L + pad + 5, strong, 0.6)
        P.mono_label(self, MARGIN_L + pad + 7.5, y + pad - 2.0, self.up(label),
                     7.0, strong, 0.9, style="B")

        cy = y + pad + 4.4
        cy += P.text_block(self, MARGIN_L + pad, cy, inner, self.tr(title),
                           DISPLAY, "B", 9.8, 5.2, theme.INK)
        cy += 1.8
        P.text_block(self, MARGIN_L + pad, cy, inner, self.tr(text),
                     BODY, "", 9.4, 5.0, theme.INK_STRONG_MUTED, align="J", markdown=True)
        self.set_y(y + box_h + 6)

    def panel(self, title: str, items: list[str]) -> None:
        strong, _ = theme.accent(self.accent_name)
        pad = 6.0
        indent = 6.0
        inner = CONTENT_W - 2 * pad - indent
        box_h = pad + 5.0
        for item in items:
            box_h += P.measure(self, self.tr(item), inner, BODY, "", 9.2, 4.8) + 1.6
        box_h += pad - 1.6
        self.ensure(box_h + 8)
        y = self.get_y() + 4
        P.notched_rect(self, MARGIN_L, y, CONTENT_W, box_h, fill=theme.SURFACE,
                       stroke=theme.INK, corners=("tr", "bl"), notch=4.5, lw=0.35)
        P.mono_label(self, MARGIN_L + pad, y + pad - 1.4, self.up(title),
                     7.6, strong, 0.9, style="B")
        cy = y + pad + 5.0
        for item in items:
            P.marker_square(self, MARGIN_L + pad, cy + 1.7, 1.4, strong)
            cy += P.text_block(self, MARGIN_L + pad + indent, cy, inner, self.tr(item),
                               BODY, "", 9.2, 4.8, theme.INK_STRONG_MUTED)
            cy += 1.6
        self.set_y(y + box_h + 7)

    def comparison_table(self, spec: dict) -> None:
        cols, rows = spec["cols"], spec["rows"]
        widths = spec.get("widths") or [1] * len(cols)
        self.ensure(58)
        self.ln(2)
        _, soft = theme.accent(self.accent_name)
        self.set_draw_color(*theme.LINE)
        self.set_line_width(0.2)
        self.set_font(BODY, "", 8.6)
        self.set_text_color(*theme.INK_STRONG_MUTED)
        # fpdf2 captures the current fill colour as the cell style: reset it,
        # or rows inherit the last accent used by a bullet marker.
        self.set_fill_color(*theme.CANVAS)
        headings = FontFace(family=MONO, emphasis="BOLD", size_pt=7.2,
                            color=theme.INK, fill_color=soft)
        with self.table(
            col_widths=widths,
            width=CONTENT_W,
            line_height=4.4,
            padding=(2.6, 2.8, 2.8, 2.8),
            text_align="LEFT",
            borders_layout="HORIZONTAL_LINES",
            headings_style=headings,
            first_row_as_headings=True,
        ) as table:
            head = table.row()
            for col in cols:
                head.cell(self.up(col))
            for row in rows:
                line = table.row()
                for cell in row:
                    line.cell(self.tr(cell))
        self.ln(2.5)
        if spec.get("caption"):
            self.caption(spec["caption"])

    def caption(self, text: str) -> None:
        strong, _ = theme.accent(self.accent_name)
        y = self.get_y()
        P.rule(self, MARGIN_L, y + 1.6, MARGIN_L + 5, strong, 0.6)
        P.text_block(self, MARGIN_L + 8, y, CONTENT_W - 8, self.tr(text),
                     BODY, "", theme.PT_CAPTION, 4.2, theme.INK_MUTED)
        self.ln(theme.SPACE_AFTER_P)

    def figure(self, key: str, caption: str | None = None) -> None:
        spec = self.paper.figures[key]
        extra = self.paper.figure_drawers
        h = diagrams.draw(self, spec, MARGIN_L, 0, CONTENT_W, render=False, extra=extra, tr=self.tr)
        self.ensure(h + 12)
        self.ln(3)
        y = self.get_y()
        diagrams.draw(self, spec, MARGIN_L, y, CONTENT_W, render=True, extra=extra, tr=self.tr)
        self.set_y(y + h + 3.5)
        if caption:
            self.caption(caption)

    def image_block(self, key: str) -> None:
        spec = self.paper.images[key]
        path = spec.get("path")
        full = theme.REPO_ROOT / path if path else None
        if full and full.exists():
            if full.suffix.lower() == ".svg":
                self._vector(full, spec["caption"], spec.get("height", IMAGE_H))
            else:
                self._photo(full, spec["caption"])
        else:
            self.missing_images.append(key)
            self._placeholder(key, spec)

    def _photo(self, path: Path, caption: str) -> None:
        from PIL import Image

        img = Image.open(path).convert("RGB")
        target = CONTENT_W / IMAGE_H
        w, h = img.size
        if w / h > target:
            new_w = int(h * target)
            box = ((w - new_w) // 2, 0, (w - new_w) // 2 + new_w, h)
        else:
            new_h = int(w / target)
            top = int((h - new_h) * 0.38)
            box = (0, top, w, top + new_h)
        img = img.crop(box)

        self.ensure(IMAGE_H + 16)
        self.ln(3)
        y = self.get_y()
        self.image(img, x=MARGIN_L, y=y, w=CONTENT_W, h=IMAGE_H)
        P.notched_rect(self, MARGIN_L, y, CONTENT_W, IMAGE_H, fill=None,
                       stroke=theme.INK, corners=("tr",), notch=5.0, lw=0.35)
        self.set_y(y + IMAGE_H + 3.0)
        self.caption(caption)

    def _vector(self, path: Path, caption: str, height: float) -> None:
        from fpdf.drawing import Transform
        from fpdf.svg import SVGObject

        obj = SVGObject(path.read_bytes())
        _, _, vw, vh = obj.viewbox
        k = min(CONTENT_W / vw, height / vh)
        w, h = vw * k, vh * k

        self.ensure(h + 16)
        self.ln(3)
        y = self.get_y()
        x = MARGIN_L + (CONTENT_W - w) / 2

        _, _, group = obj.transform_to_rect_viewport(
            scale=1, width=w, height=h, align_viewbox=False, ignore_svg_top_attrs=True
        )
        group.transform = group.transform @ Transform.translation(x, y)
        self.draw_path(group)
        P.notched_rect(self, x, y, w, h, fill=None, stroke=theme.INK,
                       corners=("tr",), notch=5.0, lw=0.35)
        self.set_y(y + h + 3.0)
        self.caption(caption)

    def _placeholder(self, key: str, spec: dict) -> None:
        strong, _ = theme.accent(self.accent_name)
        pad = 7.0
        inner = CONTENT_W - 2 * pad
        brief_h = P.measure(self, self.tr(spec["brief"]), inner, BODY, "", 8.4, 4.4)
        box_h = max(52.0, pad + 6.0 + brief_h + pad)
        self.ensure(box_h + 16)
        self.ln(3)
        y = self.get_y()

        P.notched_rect(self, MARGIN_L, y, CONTENT_W, box_h, fill=theme.FILL_SUBTLE,
                       stroke=None, corners=("tr", "bl"), notch=5.0)
        self.set_draw_color(*strong)
        self.set_line_width(0.35)
        self.set_dash_pattern(2.0, 1.6)
        self.rect(MARGIN_L + 1.6, y + 1.6, CONTENT_W - 3.2, box_h - 3.2)
        self.set_dash_pattern()

        P.mono_label(self, MARGIN_L + pad, y + pad - 2.0,
                     self.up(f"Emplacement visuel · {key}"), 7.4, strong, 0.9, style="B")
        P.text_block(self, MARGIN_L + pad, y + pad + 5.0, inner, self.tr(spec["brief"]),
                     BODY, "", 8.4, 4.4, theme.INK_STRONG_MUTED)
        self.set_y(y + box_h + 3.0)
        self.caption(spec["caption"])

    def contact(self, lines: list[tuple[str, str, str]], note: str) -> None:
        self.ensure(14 + 6 * len(lines))
        self.ln(1)
        strong, _ = theme.accent(self.accent_name)
        for label, value, url in lines:
            y = self.get_y()
            P.mono_label(self, MARGIN_L, y + 0.8, self.up(label), 7.2,
                         theme.INK_MUTED, 0.8)
            self.set_font(BODY, "", 9.8)
            self.set_text_color(*strong)
            self.set_xy(MARGIN_L + 46, y)
            self.cell(CONTENT_W - 46, 5.2, self.tr(value), link=url)
            self.set_y(y + 6.0)
        self.ln(2.5)
        P.text_block(self, MARGIN_L, self.get_y(), CONTENT_W, self.tr(note),
                     BODY, "", 9.4, 5.0, theme.INK_MUTED, align="L")

    def resources(self, spec: dict) -> None:
        self.accent_name = "blue"
        self.h1(spec["title"])
        self.para(spec["intro"])
        for group in spec["groups"]:
            self.h3(group["title"])
            for title, label, url in group["items"]:
                self.ensure(12)
                y = self.get_y()
                P.marker_square(self, MARGIN_L + 1.2, y + 2.0, 1.5, theme.INK_FAINT)
                h = P.text_block(self, MARGIN_L + 7.5, y, CONTENT_W - 7.5, self.tr(title),
                                 BODY, "", theme.PT_BODY, theme.LEAD_BODY, theme.INK)
                self.set_font(BODY, "", 8.6)
                self.set_text_color(*theme.BLUE)
                self.set_xy(MARGIN_L + 7.5, y + h - 0.4)
                self.cell(CONTENT_W - 7.5, 4.4, label, link=url)
                self.set_y(y + h + 4.8)
            self.ln(1.5)

    def build(self) -> None:
        blocks = self.paper.blocks
        self.cover()
        self.chrome = True
        self.add_page()

        first = next((b for b in blocks if b["t"] in ("h1", "section")), None)
        if first:
            self.running = first["title"].replace("\n", " ")
        self.insert_toc_placeholder(_render_toc, pages=1, reset_page_indices=False)

        for block in blocks:
            kind = block["t"]
            if kind == "section":
                self.divider(block["num"], block["title"], block.get("accent", "blue"))
            elif kind == "h1":
                self.h1(block["title"])
            elif kind == "h2":
                self.h2(block["num"], block["title"])
            elif kind == "h3":
                self.h3(block["title"])
            elif kind == "p":
                self.para(block["text"])
            elif kind == "lead":
                self.para(block["text"], lead=True)
            elif kind == "bullets":
                self.bullets(block["items"])
            elif kind == "numbered":
                self.bullets(block["items"], numbered=True)
            elif kind == "callout":
                self.callout(block["title"], block["text"], block.get("accent"))
            elif kind == "application":
                self.application(block["title"], block["text"],
                                 block.get("label", "Application"))
            elif kind == "panel":
                self.panel(block["title"], block["items"])
            elif kind == "table":
                self.comparison_table(block)
            elif kind == "figure":
                self.figure(block["key"], block.get("caption"))
            elif kind == "image":
                self.image_block(block["key"])
            elif kind == "contact":
                self.contact(block["lines"], block["note"])
            elif kind == "pagebreak":
                self.add_page()
            else:
                raise ValueError(f"unknown block: {kind}")

        if self.paper.resources:
            self.resources(self.paper.resources)


def _render_toc(pdf: WhitePaper, outline) -> None:
    pdf.render_toc(outline)
