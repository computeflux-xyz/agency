from engine import Paper, Publication

from . import content_en, content_fr

SLUG = "guide-data-driven-90-jours"
TOPICS = ("ai-engineering", "inference", "data-engineering")
PUBLISH_DATE = "2026-08-09"

FR = Paper(
    slug=SLUG,
    lang="fr",
    title="Méthodologie : les étapes clés pour mettre un système data-driven en production en 90 jours",
    subtitle="L'approche Computeflux.",
    description=(
        "Comment nous cadrons, construisons et mettons en production un système data-driven "
        "en trois mois : évaluation, architecture, socle, exploitation."
    ),
    eyebrow="GUIDE",
    edition="Édition 2026",
    subject="Méthodologie de mise en production d'un système data-driven",
    keywords="IA en production, ingénierie IA, inférence, données, agents, souveraineté",
    topics=TOPICS,
    publish_date=PUBLISH_DATE,
    featured=True,
    blocks=content_fr.BLOCKS,
    images=content_fr.IMAGES,
    figures=content_fr.FIGURES,
    resources=content_fr.RESOURCES,
)

EN = Paper(
    slug=SLUG,
    lang="en",
    title="Methodology: the key steps to get a data-driven system into production in 90 days",
    subtitle="The Computeflux approach.",
    description=(
        "How we frame, build and ship a data-driven system in three months: evaluation, "
        "architecture, foundation, operations."
    ),
    eyebrow="GUIDE",
    edition="2026 edition",
    subject="Methodology for getting a data-driven system into production",
    keywords="AI in production, AI engineering, inference, data, agents, sovereignty",
    topics=TOPICS,
    publish_date=PUBLISH_DATE,
    featured=True,
    blocks=content_en.BLOCKS,
    images=content_en.IMAGES,
    figures=content_en.FIGURES,
    resources=content_en.RESOURCES,
)

PUBLICATION = Publication.of(FR, EN)
