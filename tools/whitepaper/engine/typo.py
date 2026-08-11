from __future__ import annotations

import re
from typing import Callable

NBSP = " "
APOS = "’"

_SP = r"[  ]*"

_RE_COLON = re.compile(_SP + r":(?=\s|$)")
_RE_HIGH = re.compile(_SP + r"([;!?])")
_RE_PERCENT = re.compile(_SP + r"%")
_RE_OPEN_Q = re.compile(r"«" + _SP)
_RE_CLOSE_Q = re.compile(_SP + r"»")


def fr(text: str) -> str:
    if not text:
        return text

    out = text.replace("'", APOS)
    out = _RE_COLON.sub(NBSP + ":", out)
    out = _RE_HIGH.sub(NBSP + r"\1", out)
    out = _RE_PERCENT.sub(NBSP + "%", out)
    out = _RE_OPEN_Q.sub("«" + NBSP, out)
    out = _RE_CLOSE_Q.sub(NBSP + "»", out)
    return out


def en(text: str) -> str:
    """English typography: curly apostrophes and quotes, no French spacing."""
    if not text:
        return text

    out = text.replace("'", APOS)
    if '"' in out:
        parts = out.split('"')
        out = parts[0]
        for i, segment in enumerate(parts[1:]):
            out += ("“" if i % 2 == 0 else "”") + segment
    return out


TRANSFORMS: dict[str, Callable[[str], str]] = {"fr": fr, "en": en}


def for_lang(lang: str) -> Callable[[str], str]:
    return TRANSFORMS.get(lang, en)
