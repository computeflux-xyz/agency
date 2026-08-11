#!/usr/bin/env python3
"""Build the whitepaper vector assets: PlantUML templates and SVG generators.

Every paper package may hold a `diagrams/` folder containing:
  * `*.puml`    a template whose `${...}` placeholders are filled from
                `content_<lang>.DIAGRAM_LABELS[<stem>]`, rendered once per
                language of the publication into `assets/<stem>-<lang>.svg`.
                A template with no labels is rendered once, to
                `assets/<stem>.svg`.
  * `gen_*.py`  a module exposing `build(out_dir) -> Path` that writes an SVG.

Generated SVG is committed, so producing the PDF needs neither PlantUML nor Java.
"""

from __future__ import annotations

import argparse
import importlib
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

PAPERS = ROOT / "papers"


def _langs(package: str) -> list[str]:
    module = importlib.import_module(f"papers.{package}")
    pub = getattr(module, "PUBLICATION", None)
    if pub is not None:
        return list(pub.langs)
    paper = getattr(module, "PAPER", None)
    return [paper.lang] if paper is not None else []


def _labels(package: str, lang: str, stem: str) -> dict[str, str] | None:
    try:
        content = importlib.import_module(f"papers.{package}.content_{lang}")
    except ModuleNotFoundError:
        return None
    return getattr(content, "DIAGRAM_LABELS", {}).get(stem)


def render_plantuml(source: str, stem: str, out_dir: Path) -> Path | None:
    if not shutil.which("plantuml"):
        print("! plantuml not found — `brew install plantuml`", file=sys.stderr)
        return None
    out_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / f"{stem}.puml"
        src.write_text(source, encoding="utf-8")
        proc = subprocess.run(
            ["plantuml", "-tsvg", "-nometadata", "-o", str(out_dir), str(src)],
            capture_output=True, text=True,
        )
    if proc.returncode != 0:
        print(f"! plantuml {stem}: {proc.stderr.strip()}", file=sys.stderr)
        return None
    dst = out_dir / f"{stem}.svg"
    return dst if dst.exists() else None


def render_template(src: Path, package: str, out_dir: Path) -> list[Path]:
    template = Template(src.read_text(encoding="utf-8"))
    made: list[Path] = []
    localized = False
    for lang in _langs(package):
        labels = _labels(package, lang, src.stem)
        if labels is None:
            continue
        localized = True
        try:
            source = template.substitute(labels)
        except KeyError as exc:
            print(f"! {src.name} [{lang}]: missing label {exc}", file=sys.stderr)
            continue
        dst = render_plantuml(source, f"{src.stem}-{lang}", out_dir)
        if dst:
            made.append(dst)
    if not localized:
        dst = render_plantuml(template.template, src.stem, out_dir)
        if dst:
            made.append(dst)
    return made


def run_generator(module_path: Path, package: str, out_dir: Path) -> Path | None:
    module = importlib.import_module(f"papers.{package}.diagrams.{module_path.stem}")
    build = getattr(module, "build", None)
    if build is None:
        print(f"! {module_path.name} does not expose build(out_dir)", file=sys.stderr)
        return None
    return build(out_dir)


def build_paper_diagrams(pkg_dir: Path) -> list[Path]:
    diagrams = pkg_dir / "diagrams"
    if not diagrams.is_dir():
        return []
    out_dir = pkg_dir / "assets"
    made: list[Path] = []
    for src in sorted(diagrams.glob("*.puml")):
        made += render_template(src, pkg_dir.name, out_dir)
    for src in sorted(diagrams.glob("gen_*.py")):
        dst = run_generator(src, pkg_dir.name, out_dir)
        if dst:
            made.append(dst)
    return made


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("packages", nargs="*", metavar="PACKAGE",
                        help="paper package directories (default: all)")
    args = parser.parse_args(argv)

    targets = [PAPERS / p for p in args.packages] if args.packages else [
        d for d in sorted(PAPERS.iterdir())
        if d.is_dir() and not d.name.startswith(("_", "."))
    ]

    total = 0
    for pkg in targets:
        made = build_paper_diagrams(pkg)
        if made:
            print(pkg.name)
            for path in made:
                print(f"  {path.relative_to(ROOT)}")
            total += len(made)
    if not total:
        print("no diagram produced")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
