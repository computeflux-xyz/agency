#!/usr/bin/env python3
"""Generate Computeflux whitepapers (PDF per language + manifest + visuals brief)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from engine import build_publication  # noqa: E402
from engine import theme  # noqa: E402
from papers import PAPERS  # noqa: E402


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slugs", nargs="*", metavar="SLUG",
                        help="whitepapers to build (default: all)")
    parser.add_argument("-l", "--list", action="store_true", help="list known whitepapers")
    parser.add_argument("--lang", action="append", metavar="LANG",
                        help="build only these languages (repeatable)")
    parser.add_argument("-o", "--out", type=Path, default=theme.OUT_DIR,
                        help="output root; each whitepaper gets its own subdirectory")
    parser.add_argument("--clear-font-cache", action="store_true",
                        help="re-transcode fonts from the site .woff2 files")
    parser.add_argument("--refresh-icons", action="store_true",
                        help="re-extract cover glyphs from services/site/node_modules/simple-icons")
    args = parser.parse_args(argv)

    if args.list:
        for slug, pub in PAPERS.items():
            print(f"{slug:<28} [{', '.join(pub.langs)}]  {pub.default_edition.title}")
        return 0

    if not PAPERS:
        print("no whitepaper found in papers/", file=sys.stderr)
        return 1

    unknown = [s for s in args.slugs if s not in PAPERS]
    if unknown:
        print(f"unknown whitepaper(s): {', '.join(unknown)}", file=sys.stderr)
        print(f"known: {', '.join(PAPERS)}", file=sys.stderr)
        return 2

    if args.clear_font_cache:
        theme.clear_font_cache()

    langs = tuple(args.lang) if args.lang else None
    selected = [PAPERS[s] for s in args.slugs] if args.slugs else list(PAPERS.values())
    for pub in selected:
        result = build_publication(pub, out_root=args.out,
                                   refresh_icons=args.refresh_icons, langs=langs)
        print(pub.slug)
        for edition in result.editions:
            print(f"  [{edition.paper.lang}] {edition.pdf}  ({edition.pages} pages)")
            if edition.visuals:
                print(f"        visuals  : {edition.visuals}")
            for note in edition.font_notes:
                print(f"        ! font   : {note}")
            if edition.missing_images:
                print(f"        ! to produce : {', '.join(edition.missing_images)}")
        print(f"  manifest : {result.manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
