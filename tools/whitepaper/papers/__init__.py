"""Paper registry. Every subpackage exposing PUBLICATION (or PAPER) is picked up."""

from __future__ import annotations

import importlib
import pkgutil
from pathlib import Path

from engine import Paper, Publication


def discover() -> dict[str, Publication]:
    found: dict[str, Publication] = {}
    for mod in pkgutil.iter_modules([str(Path(__file__).resolve().parent)]):
        if not mod.ispkg or mod.name.startswith("_"):
            continue
        module = importlib.import_module(f"{__name__}.{mod.name}")
        pub = getattr(module, "PUBLICATION", None)
        if pub is None:
            paper = getattr(module, "PAPER", None)
            pub = Publication.of(paper) if isinstance(paper, Paper) else None
        if isinstance(pub, Publication):
            found[pub.slug] = pub

    return dict(sorted(found.items()))


PAPERS = discover()
