from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass(frozen=True)
class Paper:
    """One language edition of a whitepaper: metadata + content blocks."""

    slug: str
    title: str
    subtitle: str
    description: str

    blocks: list[dict]
    resources: dict
    images: dict = field(default_factory=dict)
    figures: dict = field(default_factory=dict)

    eyebrow: str = "GUIDE"
    edition: str = ""
    subject: str = ""
    keywords: str = ""

    lang: str = "fr"
    author: str = "Computeflux"
    site: str = "computeflux.xyz"
    topics: tuple[str, ...] = ()
    publish_date: str = ""
    featured: bool = False

    cover_tools: list[tuple[str, str]] | None = None
    figure_drawers: dict[str, Callable] = field(default_factory=dict)

    @property
    def filename(self) -> str:
        return f"computeflux-{self.slug}-{self.lang}.pdf"

    def locale_entry(self, pages: int = 0) -> dict[str, Any]:
        return {
            "entry": self.filename,
            "title": self.title,
            "shortdesc": self.description,
            "longdesc": self.subtitle,
            "pages": pages,
        }


@dataclass(frozen=True)
class Publication:
    """A whitepaper and its language editions — one slug, one manifest."""

    slug: str
    editions: tuple[Paper, ...]
    topics: tuple[str, ...] = ()
    publish_date: str = ""
    featured: bool = False
    author: str = "Computeflux"

    @classmethod
    def of(cls, *editions: Paper) -> "Publication":
        first = editions[0]
        return cls(
            slug=first.slug,
            editions=editions,
            topics=first.topics,
            publish_date=first.publish_date,
            featured=first.featured,
            author=first.author,
        )

    @property
    def default_edition(self) -> Paper:
        return self.editions[0]

    @property
    def langs(self) -> tuple[str, ...]:
        return tuple(e.lang for e in self.editions)

    def manifest(self, pages: dict[str, int] | None = None) -> dict[str, Any]:
        """Shape mirrors articles/*/article.json so ingestion can reuse it."""
        pages = pages or {}
        return {
            "slug": self.slug,
            "type": "whitepaper",
            "topics": list(self.topics),
            "authors": [self.author.lower()],
            "featured": self.featured,
            "cover": "",
            "publishDate": self.publish_date,
            "locales": {
                e.lang: e.locale_entry(pages.get(e.lang, 0)) for e in self.editions
            },
        }
