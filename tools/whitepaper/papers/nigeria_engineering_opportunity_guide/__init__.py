from engine import Paper

from . import content_en


SLUG = "nigeria-engineering-opportunity-guide"

PAPER = Paper(
    slug=SLUG,
    lang="en",
    title="A field guide to engineering opportunities in Nigeria",
    subtitle="How west african partners can identify problems Computeflux is equipped to solve.",
    description=(
        "A guide for west african partners to qualify Nigerian payment, performance, "
        "reliability, data and infrastructure problems and route suitable prospects "
        "into a bounded diagnostic."
    ),
    eyebrow="PARTNER FIELD GUIDE",
    edition="Nigeria edition 2026",
    subject="Engineering opportunity qualification for partners in Nigeria",
    keywords=(
        "Nigeria, fintech, telecoms, financial services, e-commerce, infrastructure, "
        "reliability, performance, data engineering, platform engineering"
    ),
    topics=("platform-engineering", "payments", "data-engineering", "distributed-systems"),
    publish_date="2026-09-09",
    featured=False,
    blocks=content_en.BLOCKS,
    images=content_en.IMAGES,
    figures=content_en.FIGURES,
    resources=content_en.RESOURCES,
)
