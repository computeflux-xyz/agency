from __future__ import annotations

# Strings the layout emits itself, per language. Everything else comes from the
# paper's content module.
UI = {
    "fr": {"toc": "Table des matières", "part": "Partie {num}"},
    "en": {"toc": "Contents", "part": "Part {num}"},
}

PDF_LANG = {"fr": "fr-FR", "en": "en-GB"}


def ui(lang: str) -> dict[str, str]:
    return UI.get(lang, UI["en"])


def pdf_lang(lang: str) -> str:
    return PDF_LANG.get(lang, lang)
