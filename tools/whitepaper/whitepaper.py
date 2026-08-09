"""
Whitepaper engine for Computeflux

Usage :
    python generate.py [--output out/mon-guide.pdf] [--clear-font-cache]

Content lives in `content_fr.py`, schemas in `figures.py`, graphical chart
in `theme.py`. This file does not describe any type of page structure.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from fpdf import FPDF
from fpdf.fonts import FontFace

import content_fr as C
import cover_art
import figures
import primitives as P
import theme
from theme import (
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
from typo import fr, upper_label

IMAGE_H = 54.0


class WhitePaper(FPDF):
    def __init__(self) -> None:
        super().__init__(orientation="P", unit="mm", format="A4")
        self.chrome = False
        self.accent_name = "blue"
        self.running = ""
        self.missing_images: list[str] = []
        self.font_notes: list[str] = []
        self.refresh_icons = False
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
        if not self._has_mono:
            self.add_font(MONO, "", str(next(f.path for f in files if f.family == BODY)))
            self.add_font(MONO, "B", str(next(f.path for f in files if f.family == BODY and f.style == "B")))

    def _set_metadata(self) -> None:
        self.set_title(C.META["title"])
        self.set_author(C.META["author"])
        self.set_subject("Méthodologie de mise en production d'un système d'IA")
        self.set_keywords(C.META["keywords"])
        self.set_creator("Computeflux — tools/whitepaper")
        self.set_lang("fr-FR")

    def header(self) -> None:
        self._chrome_pages[self.page] = self.chrome
        if not self.chrome:
            return
        P.mono_label(self, MARGIN_L, theme.HEADER_Y, upper_label("Computeflux"),
                     theme.PT_LABEL, theme.INK_MUTED, 0.7)
        if self.running:
            label = upper_label(self.running)
            P.mono_label(self, MARGIN_L, theme.HEADER_Y, label, theme.PT_LABEL,
                         theme.INK_FAINT, 0.7, align="R", w=CONTENT_W)
        P.rule(self, MARGIN_L, theme.HEADER_RULE_Y, PAGE_W - MARGIN_R, theme.LINE, 0.2)
        self.set_xy(MARGIN_L, MARGIN_T)

    def footer(self) -> None:
        if not self._chrome_pages.get(self.page, self.chrome):
            return
        P.rule(self, MARGIN_L, theme.FOOTER_RULE_Y, PAGE_W - MARGIN_R, theme.LINE, 0.2)
        P.mono_label(self, MARGIN_L, theme.FOOTER_Y, C.META["site"], theme.PT_LABEL,
                     theme.INK_FAINT, 0.6)
        P.mono_label(self, MARGIN_L, theme.FOOTER_Y, str(self.page_no() - 1),
                     theme.PT_LABEL, theme.INK_MUTED, 0.6, align="R", w=CONTENT_W, style="B")

    def ensure(self, height: float) -> None:
        """Saute une page si `height` ne tient pas sous le curseur."""
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

        cover_art.draw_tool_field(self, cx=PAGE_W / 2, cy=90.0,
                                  refresh_icons=self.refresh_icons)
        cover_art.draw_top_shadow(self, height=106.0)

        P.mono_label(self, MARGIN_L, 186, upper_label(C.META["eyebrow"]),
                     11.0, theme.INK_MUTED, 2.6, style="B")

        P.text_block(self, MARGIN_L, 196, CONTENT_W - 6, fr(C.META["title"]),
                     DISPLAY, "B", theme.PT_COVER_TITLE, 11.2, theme.WHITE)
        y = self.get_y() + 4
        P.text_block(self, MARGIN_L, y, CONTENT_W - 6, fr(C.META["subtitle"]),
                     BODY, "", theme.PT_COVER_SUB, 6.4, theme.INK_FAINT)

        P.rule(self, MARGIN_L, 258, PAGE_W - MARGIN_R, (0x3A, 0x38, 0x35), 0.3)
        P.wordmark(self, MARGIN_L, 266, 5.6, theme.WHITE)
        P.mono_label(self, MARGIN_L, 267.5, upper_label(C.META["edition"]),
                     theme.PT_LABEL, theme.INK_MUTED, 0.7, align="R", w=CONTENT_W)

    def render_toc(self, outline) -> None:
        self.set_y(MARGIN_T)
        P.text_block(self, MARGIN_L, MARGIN_T, CONTENT_W, fr("Table des matières"),
                     DISPLAY, "B", 18.0, 9.0, theme.INK)
        y = self.get_y() + 2
        P.rule(self, MARGIN_L, y, MARGIN_L + 26, theme.BLUE, 0.7)
        y += 9

        page_x = PAGE_W - MARGIN_R
        for section in outline:
            name = fr(section.name)
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
        self.start_section(fr(f"{num}  {self.running}"), 0)
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

        P.mono_label(self, MARGIN_L, 30, upper_label(f"Partie {num}"), 8.4, strong, 1.6, style="B")

        P.text_block(self, MARGIN_L, 196, CONTENT_W, fr(title),
                     DISPLAY, "B", theme.PT_DIVIDER_TITLE, 9.6, theme.INK, align="L")
        y = self.get_y() + 5
        P.rule(self, MARGIN_L, y, MARGIN_L + 26, strong, 0.7)

        self.content_page()

    def h1(self, title: str) -> None:
        self.running = title
        self.content_page(reuse_empty=True)
        self.start_section(fr(title), 0)
        P.text_block(self, MARGIN_L, self.get_y(), CONTENT_W, fr(title),
                     DISPLAY, "B", theme.PT_H1, 10.5, theme.INK)
        y = self.get_y() + 2.5
        strong, _ = theme.accent(self.accent_name)
        P.rule(self, MARGIN_L, y, MARGIN_L + 26, strong, 0.7)
        self.set_y(y + 7.5)

    def h2(self, num: str, title: str) -> None:
        strong, _ = theme.accent(self.accent_name)
        title_h = P.measure(self, fr(title), CONTENT_W - 14, DISPLAY, "B", theme.PT_H2, 6.2)
        self.ensure(theme.SPACE_BEFORE_H2 + title_h + theme.SPACE_AFTER_H2 + 16)
        y = self.get_y() + theme.SPACE_BEFORE_H2
        self.start_section(fr(f"{num}  {title}"), 1)
        P.mono_label(self, MARGIN_L, y + 1.6, num, 8.4, strong, 0.5, style="B")
        P.text_block(self, MARGIN_L + 14, y, CONTENT_W - 14, fr(title),
                     DISPLAY, "B", theme.PT_H2, 6.2, theme.INK)
        self.set_y(y + title_h + theme.SPACE_AFTER_H2)

    def h3(self, title: str) -> None:
        strong, _ = theme.accent(self.accent_name)
        title_h = P.measure(self, fr(title), CONTENT_W, DISPLAY, "B", theme.PT_H3, 5.6)
        self.ensure(6 + title_h + 14)
        y = self.get_y() + 6
        self.start_section(fr(title), 1)
        P.marker_square(self, MARGIN_L, y + 1.9, 1.6, strong)
        P.text_block(self, MARGIN_L + 4.5, y, CONTENT_W - 4.5, fr(title),
                     DISPLAY, "B", theme.PT_H3, 5.6, theme.INK)
        self.set_y(y + title_h + 2.6)

    def para(self, text: str, lead: bool = False) -> None:
        size = theme.PT_LEAD if lead else theme.PT_BODY
        line = theme.LEAD_LEAD if lead else theme.LEAD_BODY
        color = theme.INK if lead else theme.INK_STRONG_MUTED
        body = fr(text)

        self.ensure(min(P.measure(self, body, CONTENT_W, BODY, "", size, line, True), 2 * line))
        P.text_block(self, MARGIN_L, self.get_y(), CONTENT_W, body,
                     BODY, "", size, line, color, align="J", markdown=True)
        self.ln(theme.SPACE_AFTER_P)

    def bullets(self, items: list[str], numbered: bool = False) -> None:
        strong, _ = theme.accent(self.accent_name)
        indent = 7.5
        for i, item in enumerate(items, start=1):
            text = fr(item)
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
        title_h = P.measure(self, fr(title), inner, DISPLAY, "B", 11.6, 6.0)
        body_h = P.measure(self, fr(text), inner, BODY, "", 10.0, 5.4, True)
        box_h = pad + title_h + 2.0 + body_h + pad
        self.ensure(box_h + 6)
        y = self.get_y() + 2
        P.notched_rect(self, MARGIN_L, y, CONTENT_W, box_h, fill=soft, stroke=None,
                       corners=("tr", "bl"), notch=4.5)
        self.set_fill_color(*strong)
        self.rect(MARGIN_L, y, 2.0, box_h, style="F")
        cy = y + pad
        cy += P.text_block(self, MARGIN_L + pad + 2, cy, inner, fr(title),
                           DISPLAY, "B", 11.6, 6.0, strong)
        cy += 2.0
        P.text_block(self, MARGIN_L + pad + 2, cy, inner, fr(text),
                     BODY, "", 10.0, 5.4, theme.INK, align="J", markdown=True)
        self.set_y(y + box_h + 6)

    def deliverables(self, title: str, items: list[str]) -> None:
        strong, _ = theme.accent(self.accent_name)
        pad = 6.0
        indent = 6.0
        inner = CONTENT_W - 2 * pad - indent
        box_h = pad + 5.0
        for item in items:
            box_h += P.measure(self, fr(item), inner, BODY, "", 9.2, 4.8) + 1.6
        box_h += pad - 1.6
        self.ensure(box_h + 8)
        y = self.get_y() + 4
        P.notched_rect(self, MARGIN_L, y, CONTENT_W, box_h, fill=theme.SURFACE,
                       stroke=theme.INK, corners=("tr", "bl"), notch=4.5, lw=0.35)
        P.mono_label(self, MARGIN_L + pad, y + pad - 1.4, upper_label(title),
                     7.6, strong, 0.9, style="B")
        cy = y + pad + 5.0
        for item in items:
            P.marker_square(self, MARGIN_L + pad, cy + 1.7, 1.4, strong)
            cy += P.text_block(self, MARGIN_L + pad + indent, cy, inner, fr(item),
                               BODY, "", 9.2, 4.8, theme.INK_STRONG_MUTED)
            cy += 1.6
        self.set_y(y + box_h + 7)

    def comparison_table(self, spec: dict) -> None:
        cols, rows = spec["cols"], spec["rows"]
        widths = spec.get("widths") or [1] * len(cols)
        self.ensure(58)
        self.ln(2)
        strong, soft = theme.accent(self.accent_name)
        self.set_draw_color(*theme.LINE)
        self.set_line_width(0.2)
        self.set_font(BODY, "", 8.6)
        self.set_text_color(*theme.INK_STRONG_MUTED)

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
                head.cell(upper_label(col))
            for row in rows:
                line = table.row()
                for i, cell in enumerate(row):
                    line.cell(fr(cell))
        _ = strong
        self.ln(2.5)
        if spec.get("caption"):
            self.caption(spec["caption"])

    def caption(self, text: str) -> None:
        strong, _ = theme.accent(self.accent_name)
        y = self.get_y()
        P.rule(self, MARGIN_L, y + 1.6, MARGIN_L + 5, strong, 0.6)
        P.text_block(self, MARGIN_L + 8, y, CONTENT_W - 8, fr(text),
                     BODY, "", theme.PT_CAPTION, 4.2, theme.INK_MUTED)
        self.ln(theme.SPACE_AFTER_P)

    def figure(self, key: str, caption: str | None = None) -> None:
        h = figures.figure(self, key, MARGIN_L, 0, CONTENT_W, draw=False)
        self.ensure(h + 12)
        self.ln(3)
        y = self.get_y()
        figures.figure(self, key, MARGIN_L, y, CONTENT_W, draw=True)
        self.set_y(y + h + 3.5)
        if caption:
            self.caption(caption)

    def image_block(self, key: str) -> None:
        spec = C.IMAGES[key]
        path = spec.get("path")
        full = theme.REPO_ROOT / path if path else None
        if full and full.exists():
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

    def _placeholder(self, key: str, spec: dict) -> None:
        strong, soft = theme.accent(self.accent_name)
        pad = 7.0
        inner = CONTENT_W - 2 * pad
        brief_h = P.measure(self, fr(spec["brief"]), inner, BODY, "", 8.4, 4.4)
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
                     upper_label(f"Emplacement visuel · {key}"), 7.4, strong, 0.9, style="B")
        P.text_block(self, MARGIN_L + pad, y + pad + 5.0, inner, fr(spec["brief"]),
                     BODY, "", 8.4, 4.4, theme.INK_STRONG_MUTED)
        self.set_y(y + box_h + 3.0)
        self.caption(spec["caption"])

    def contact(self, lines: list[tuple[str, str, str]], note: str) -> None:
        self.ensure(14 + 6 * len(lines))
        self.ln(1)
        strong, _ = theme.accent(self.accent_name)
        for label, value, url in lines:
            y = self.get_y()
            P.mono_label(self, MARGIN_L, y + 0.8, upper_label(label), 7.2,
                         theme.INK_MUTED, 0.8)
            self.set_font(BODY, "", 9.8)
            self.set_text_color(*strong)
            self.set_xy(MARGIN_L + 46, y)
            self.cell(CONTENT_W - 46, 5.2, fr(value), link=url)
            self.set_y(y + 6.0)
        self.ln(2.5)
        P.text_block(self, MARGIN_L, self.get_y(), CONTENT_W, fr(note),
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
                h = P.text_block(self, MARGIN_L + 7.5, y, CONTENT_W - 7.5, fr(title),
                                 BODY, "", theme.PT_BODY, theme.LEAD_BODY, theme.INK)
                self.set_font(BODY, "", 8.6)
                self.set_text_color(*theme.BLUE)
                self.set_xy(MARGIN_L + 7.5, y + h - 0.4)
                self.cell(CONTENT_W - 7.5, 4.4, label, link=url)
                self.set_y(y + h + 4.8)
            self.ln(1.5)

    def build(self) -> None:
        self.cover()
        self.chrome = True
        self.add_page()

        first = next((b for b in C.BLOCKS if b["t"] in ("h1", "section")), None)
        if first:
            self.running = first["title"].replace("\n", " ")
        self.insert_toc_placeholder(_render_toc, pages=1, reset_page_indices=False)

        for block in C.BLOCKS:
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
            elif kind == "deliverables":
                self.deliverables(block["title"], block["items"])
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
                raise ValueError(f"bloc inconnu : {kind}")

        self.resources(C.RESOURCES)


def _render_toc(pdf: WhitePaper, outline) -> None:
    pdf.render_toc(outline)


VISUALS_HEADER = """# Visuels du livre blanc

Généré par `tools/whitepaper/generate.py`. Chaque entrée correspond à un
emplacement du document. Les visuels marqués **à produire** sont imprimés dans
le PDF sous forme de cadre décrivant l'attendu.

Format cible des photographies : ratio {ratio:.2f}:1 après recadrage
(la largeur utile du document est de {width:.0f} mm), export ≥ 2000 px de large.
"""


def write_visuals_brief(path: Path) -> None:
    lines = [VISUALS_HEADER.format(ratio=CONTENT_W / IMAGE_H, width=CONTENT_W)]
    for key, spec in C.IMAGES.items():
        src = spec.get("path")
        exists = bool(src) and (theme.REPO_ROOT / src).exists()
        status = f"disponible — `{src}`" if exists else "**à produire**"
        lines.append(f"\n## {key}\n")
        lines.append(f"- Statut : {status}")
        lines.append(f"- Légende : {spec['caption']}")
        lines.append(f"- Brief : {spec['brief']}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate Computeflux white books (PDF).")
    parser.add_argument(
        "-o", "--output", type=Path,
        default=theme.HERE / "out" / "computeflux-guide-ia-90-jours.pdf",
        help="PDF output path",
    )
    parser.add_argument("--clear-font-cache", action="store_true",
                        help="re-generate transcoded fonts from .woff2 from site")
    parser.add_argument("--refresh-icons", action="store_true",
                        help="re-extract glyphs in the cover from services/site/node_modules/simple-icons")
    args = parser.parse_args(argv)

    if args.clear_font_cache:
        theme.clear_font_cache()

    pdf = WhitePaper()
    pdf.refresh_icons = args.refresh_icons
    pdf.build()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(args.output))

    brief = args.output.parent / "VISUELS.md"
    write_visuals_brief(brief)

    print(f"PDF     : {args.output}  ({pdf.pages_count} pages)")
    print(f"Visuals : {brief}")
    for note in pdf.font_notes:
        print(f"! police: {note}")
    if pdf.missing_images:
        print("! visuals to produce : " + ", ".join(sorted(set(pdf.missing_images))))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
