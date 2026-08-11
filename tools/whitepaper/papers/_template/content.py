from __future__ import annotations

IMAGES = {
    "atelier": {
        # Repo-relative path, or None when the visual still has to be produced:
        # the PDF then prints a framed placeholder carrying the brief below.
        "path": None,
        "caption": "Légende imprimée sous le visuel.",
        "brief": "VISUEL À PRODUIRE — format, cadrage, couleurs, ce qu'on doit y voir.",
    },
}

FIGURES = {
    "plan": {
        "kind": "columns",
        "columns": [
            {"label": "Étape 01", "title": "Titre", "accent": "blue",
             "items": ["Livrable", "Livrable"]},
            {"label": "Étape 02", "title": "Titre", "accent": "magenta",
             "items": ["Livrable", "Livrable"]},
            {"label": "Étape 03", "title": "Titre", "accent": "amber",
             "items": ["Livrable", "Livrable"]},
        ],
        "axis": ("Décider", "Construire", "Exploiter"),
    },
    "briques": {
        "kind": "grid",
        "per_row": 3,
        "items": [
            ("01", "Titre court", "Une ligne de description."),
            ("02", "Titre court", "Une ligne de description."),
            ("03", "Titre court", "Une ligne de description."),
        ],
    },
    "chaine": {
        "kind": "pipeline",
        "per_row": 4,
        "steps": ["Entrée", "Étape", "Étape", "Sortie"],
        "rail_top": "Ce qui traverse toute la chaîne",
        "rail_bottom": "Ce que l'on mesure",
    },
    "boucle": {
        "kind": "cycle",
        "steps": [
            ("Étape", "Une ligne."),
            ("Étape", "Une ligne."),
            ("Étape", "Une ligne."),
        ],
        "feedback": "Ce que la boucle renvoie au début",
    },
}

BLOCKS: list[dict] = [
    {"t": "h1", "title": "Introduction"},
    {"t": "p", "text": "Paragraphe justifié, avec du **gras** ponctuel."},
    {"t": "figure", "key": "plan", "caption": "Légende de la figure."},

    {"t": "section", "num": "1", "title": "Titre de partie", "accent": "blue"},
    {"t": "lead", "text": "Chapeau de partie, une ou deux phrases."},
    {"t": "h2", "num": "1.1", "title": "Sous-titre numéroté"},
    {"t": "bullets", "items": ["**Amorce.** Explication.", "Second point."]},
    {"t": "numbered", "items": ["Première étape.", "Deuxième étape."]},
    {"t": "image", "key": "atelier"},
    {
        "t": "table",
        "caption": "Légende du tableau.",
        "cols": ["Colonne", "Colonne", "Colonne"],
        "widths": [30, 44, 44],
        "rows": [["Cellule", "Cellule", "Cellule"]],
    },
    {
        "t": "application",
        "title": "Titre de l'exemple, une ligne",
        "text": "Cas réel et anonymisé qui illustre le raisonnement ci-dessus : "
                "la situation, ce qui a été décidé, et pourquoi. À réserver aux "
                "passages abstraits (un exemple par idée difficile).",
    },
    {"t": "panel", "title": "Livrables", "items": ["Livrable.", "Livrable."]},
    {"t": "callout", "title": "En bref", "text": "Le message à retenir.", "accent": "magenta"},
    {"t": "h3", "title": "Titre non numéroté"},
    {
        "t": "contact",
        "lines": [("Écrire", "gabriel.mougard@gmail.com", "mailto:gabriel.mougard@gmail.com")],
        "note": "Une phrase d'appel.",
    },
]

RESOURCES = {
    "title": "Ressources",
    "intro": "Pour prolonger la lecture.",
    "groups": [
        {
            "title": "Articles",
            "items": [
                ("Titre de l'article", "computeflux.xyz/articles/slug",
                 "https://computeflux.xyz/articles/slug"),
            ],
        },
    ],
}
