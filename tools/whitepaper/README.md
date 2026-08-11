# Computeflux white papers PDF engine

An A4 layout engine using the site's colours and typography, plus one package
per white paper. A white paper is a **publication** with one or more language
editions. Every build produces one PDF per language, a single `manifest.json`
(same shape as `articles/*/article.json`, for future ingestion) and a visuals
brief per language.

```
engine/          reusable engine — knows nothing about content
  theme.py         palette, page metrics, fonts, brand mark geometry
  typo.py          French typographic rules
  primitives.py    hairlines, notched frames, arrows, brand mark, text measuring
  diagrams.py      generic schematics: columns, grid, pipeline, cycle
  cover_art.py     isometric tool field + shadow gradient
  i18n.py          strings the layout emits itself, per language
  paper.py         Paper (one language edition) and Publication (+ manifest)
  renderer.py      layout: cover, table of contents, blocks, resources
  build.py         build_paper() -> PDF + manifest + VISUELS.md
diagrams.py      builds the vector assets (PlantUML + SVG generators)
papers/
  _template/       skeleton to copy (skipped by the registry)
  guide_ia_90_jours/
    __init__.py      metadata + editions, exposes PUBLICATION
    content_fr.py    all the French copy, visuals and schematics
    content_en.py    the English mirror, block for block
    diagrams/        *.puml sources and gen_*.py SVG generators
    assets/          generated SVG, committed
assets/icons.json  extracted Simple Icons glyphs, version-controlled
out/<slug>/        computeflux-<slug>-<lang>.pdf, manifest.json, visuals-<lang>.md
```

## Running

```bash
uv venv --python 3.12 tools/whitepaper/.venv
```

```bash
uv pip install --python tools/whitepaper/.venv/bin/python -r tools/whitepaper/requirements.txt
```

```bash
tools/whitepaper/.venv/bin/python tools/whitepaper/generate.py
```

With no argument, every white paper is built. Otherwise:

| Command | Effect |
|---|---|
| `generate.py --list` | list the known white papers |
| `generate.py guide-data-driven-90-jours` | build only that one |
| `generate.py --lang en` | build only that language (repeatable) |
| `generate.py --out /tmp/wp` | change the output root |
| `generate.py --clear-font-cache` | re-transcode the fonts from the site `.woff2` files |
| `generate.py --refresh-icons` | re-extract the cover glyphs |

Without `uv`, a `python3 -m venv` plus `pip install -r requirements.txt` is
enough (Python 3.9 or later).

## Adding a white paper

1. `cp -r papers/_template papers/my_guide`
2. In `__init__.py`: `slug`, title, subtitle, description, `topics`,
   `publish_date`. The `slug` drives the output directory and the PDF filenames
   (`computeflux-<slug>-<lang>.pdf`).
3. In `content.py`: `BLOCKS`, `IMAGES`, `FIGURES`, `RESOURCES`.
4. `generate.py my-guide`.

The registry discovers any package under `papers/` exposing a `PUBLICATION`, or
a bare `PAPER` which it wraps into a single-edition publication. Packages
prefixed with `_` are skipped.

## Adding a language

An edition is one `Paper`. A `Publication` groups them under one slug.

```python
FR = Paper(slug=SLUG, lang="fr", title=..., blocks=content_fr.BLOCKS, ...)
EN = Paper(slug=SLUG, lang="en", title=..., blocks=content_en.BLOCKS, ...)
PUBLICATION = Publication.of(FR, EN)
```

Split the copy into one `content_<lang>.py` per language and mirror it block for
block. It is the same keys, same figures, same image slots so the layout is identical
and only the words change. Language-independent metadata (`topics`,
`publish_date`, `featured`) is read from the first edition.

The layout emits a handful of strings of its own (the table of contents title,
the "Part N" label): they live in `engine/i18n.py`. Typography is per language
too. `engine/typo.py` applies the French non-breaking spaces for `fr` and
curly quotes only for `en`. Adding a language means adding an entry to both,
otherwise it falls back to the English rules.

## Available blocks

`section` (part divider page), `h1`, `h2` (numbered), `h3`, `lead`, `p`,
`bullets`, `numbered`, `callout`, `panel` (ruled box, e.g. "Livrables"),
`application` (worked example illustrating an abstract passage), `table`,
`figure`, `image`, `contact`, `pagebreak`. The `Ressources` page is
rendered last, from `RESOURCES`.

Use `application` where the reasoning is abstract enough that a reader could
agree with it and still not know what it looks like — defining "correct",
propagating access rights, routing by task difficulty. One anonymised case per
hard idea, no more; it carries a `title` and a `text`, plus an optional `label`
if "Application" is not the right word.

Write copy normally: the language's transform handles punctuation. French gets
non-breaking spaces before `: ; ! ?` plus `« »` and typographic apostrophes.
English gets curly apostrophes and turns `"..."` into `“...”`. For a single-quoted
aside in English, type the curly pair yourself (`‘like this’`): a bare `'` is
always read as an apostrophe. `**bold**` is interpreted inside paragraphs,
lists and application blocks.

## Schematics

Four generic kinds, selected by the `kind` key of a `FIGURES` entry:

| `kind` | Shape | Fields |
|---|---|---|
| `columns` | N titled columns + reading axis | `columns[]`, `axis` |
| `grid` | grid of numbered tiles | `items[]`, `per_row` |
| `pipeline` | step chain wrapped over N rows, two rails | `steps[]`, `per_row`, `rail_top`, `rail_bottom` |
| `cycle` | step loop with a dashed feedback return | `steps[]`, `feedback` |

A white paper can add its own kinds through
`Paper(figure_drawers={"my_kind": fn})`, where
`fn(pdf, spec, x, y, w, render) -> height`.

These schematics are structural: they show a sequence, never orders of
magnitude.

## Cover

An isometric field of the stack's tools and languages: 36 extruded plates, the
glyph projected onto the top face in the same perspective, three accent plates,
dissolving upwards under a shadow gradient made of bands of decreasing opacity.
The field sits on a pillar of the same footprint — `draw_pillar()` extrudes the
diamond returned by `field_extent()` — which dissolves towards the bottom of
the page, so the plateau reads as levitating. That gradient redraws the pillar
in **opaque** bands interpolated towards the background colour: stacking
translucent bands instead compounds at the seams and stripes. Everything is
vector. The Computeflux mark only appears small, inside the title block.

The default list is `engine/cover_art.py > DEFAULT_TOOLS` (most recognisable in
the front row); a white paper can replace it through `Paper(cover_tools=[...])`.
The glyphs come from [Simple Icons](https://simpleicons.org) (CC0 1.0), the same
source as the site; they are extracted once from
`services/site/node_modules/simple-icons` into `assets/icons.json`, which is
version-controlled and then read as-is. `--refresh-icons` rebuilds that cache
(requires a `pnpm install` in `services/site`). With no glyph available, the
plate carries a monogram instead.

## Typography

Fonts taken from the site: Space Grotesk (headings), Spline Sans (body),
JetBrains Mono (labels). The first two only ship as `.woff2`, which fpdf2
cannot read: they are transcoded to `.ttf` into `.fontcache/` on first run. If
`fonttools`/`brotli` are missing, the script falls back to Spline Sans and says
so — the PDF stays valid, the typography is degraded.

## Visuals

Two kinds of slots, described in each white paper's `IMAGES`:

* `path` set and the file present → the photograph is cropped to the band ratio
  and framed in a notched frame;
* `path: None` → a placeholder frame is printed **in the PDF**, carrying the
  detailed brief of the visual to produce.

An entry may carry `height` (mm): the visual is then fitted inside that height
rather than cropped to the band ratio. `.svg` files are drawn as vectors, so
they stay sharp and their labels stay selectable text; anything else goes
through the crop path.

Every build rewrites `out/<slug>/visuals-<lang>.md`: list, status and briefs,
ready to hand to the studio or the designer.

## Diagrams as assets

```bash
tools/whitepaper/.venv/bin/python tools/whitepaper/diagrams.py
```

Each paper may hold a `diagrams/` folder. The output lands in its `assets/`:

* `*.puml` : rendered with `plantuml -tsvg` (`brew install plantuml`). Use it
  for structural diagrams. Keep the flow **top-down**: it is the only direction
  where the automatic layout stays stable once two paths converge, and the
  horizontal variants came out with crossing arcs.
* `gen_*.py` : a module exposing `build(out_dir) -> Path` that writes an SVG.
  Use it whenever PlantUML has no primitive for the job. It has none for time
  series, for instance.

Both are committed, so producing the PDF needs neither PlantUML nor Java. Keep
the viewBox narrow (around 700 units for a full-width figure): the scale factor
to the 162 mm column is then large enough for labels to stay legible in print.

SVG text is resolved by font family name, so the engine registers each site
font twice, under its internal alias and under its real name (`Space Grotesk`,
`Spline Sans`, `JetBrains Mono`). A diagram that names another family will fall back and warn.

## Manifest

`out/<slug>/manifest.json` mirrors the shape of `articles/*/article.json`
(`slug`, `type: "whitepaper"`, `topics`, `authors`, `featured`, `publishDate`,
`locales.<lang>.{entry, title, shortdesc, longdesc, pages}`), one entry per
language edition, `entry` pointing at that edition's PDF. Backend ingestion is
not wired up: the manifest exists so it can be, without touching the generator.
