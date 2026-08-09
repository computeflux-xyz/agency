from __future__ import annotations

import re

NBSP = " "
APOS = "’"

_SP = r"[  ]*"

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


def upper_label(text: str) -> str:
    return fr(text).upper()
