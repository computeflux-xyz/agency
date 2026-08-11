from engine import Paper

from . import content

PAPER = Paper(
    slug="template",
    title="Titre du livre blanc",
    subtitle="Sous-titre, une phrase.",
    description="Résumé d'une à deux phrases, repris dans le manifeste.",
    eyebrow="GUIDE",
    edition="Édition 2026",
    subject="Sujet, pour les métadonnées du PDF",
    keywords="mots, clés, séparés, par, des, virgules",
    lang="fr",
    topics=("ai-engineering",),
    publish_date="2026-01-01",
    blocks=content.BLOCKS,
    images=content.IMAGES,
    figures=content.FIGURES,
    resources=content.RESOURCES,
)
