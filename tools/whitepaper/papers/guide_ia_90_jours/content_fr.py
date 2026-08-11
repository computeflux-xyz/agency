"""
Contenu du guide " Méthodologie : mettre un système d'IA en production en 90 jours ".
"""

from __future__ import annotations


IMAGES = {
    "cadrage": {
        "path": "services/site/public/photos/hero-whiteboard-1600.webp",
        "caption": "Atelier de cadrage : cartographier les sources, les usages et les irritants avant d'écrire la moindre ligne de code.",
        "brief": (
            "Photographie horizontale (3:2), lumière naturelle, tons chauds. Deux à quatre "
            "personnes devant un tableau blanc couvert de post-it et de flèches. Visages de "
            "trois-quarts ou de dos, aucune marque cliente lisible. Registre documentaire, "
            "pas de mise en scène corporate."
        ),
    },
    "socle": {
        "path": "services/site/public/photos/reason-baremetal-1600.webp",
        "caption": "Le socle d'exécution : les décisions d'infrastructure conditionnent la latence et le coût unitaire bien avant le choix du modèle.",
        "brief": (
            "Photographie horizontale (3:2) d'allées de baies ou de cartes accélératrices, "
            "éclairage froid contrastant avec le reste du document. Aucun logo de "
            "constructeur ni étiquette d'identification lisible."
        ),
    },
    "architecture": {
        "path": "tools/whitepaper/papers/guide_ia_90_jours/assets/architecture-fr.svg",
        "height": 132,
        "caption": "Exemple de schéma d'architecture cible, annoté des décisions et des points de réversibilité.",
        "brief": (
            "SCHÉMA À PRODUIRE — illustration vectorielle exportée en PNG à 2400 px de "
            "large, fond #F5F4EF. Architecture cible d'un système d'IA : sources de données, "
            "socle de données et index de recherche, passerelle d'inférence, modèles "
            "(managé et auto-hébergé), garde-fous, application. Trois pastilles numérotées "
            "en magenta #E11FD0 marquent les points de réversibilité (fournisseur de "
            "modèle, moteur d'index, hébergement). Traits fins #201F1E, remplissages "
            "blancs, libellés en Space Grotesk. Aucun logo d'éditeur, aucun nom de client."
        ),
    },
    "exploitation": {
        "path": "services/site/public/photos/collab-1600.webp",
        "caption": "Revue d'exploitation : les incidents et les retours utilisateurs alimentent un backlog priorisé, pas une liste de doléances.",
        "brief": (
            "Photographie horizontale (3:2), même série que l'atelier de cadrage pour la "
            "cohérence de lumière. Deux personnes devant un écran, posture de revue et non "
            "de démonstration. Aucune donnée lisible à l'écran."
        ),
    },
}

BLOCKS: list[dict] = [
    {"t": "h1", "title": "Introduction", "toc": "Introduction"},
    {
        "t": "p",
        "text": "Ce document s'adresse à ceux qui souhaitent comprendre, sans entrer dans une technicité excessive, comment chez **Computeflux**, nous concevons, construisons et mettons en production un système data-driven en quatre-vingt-dix jours.",
    },
    {
        "t": "p",
        "text": "Il s'appuie sur notre pratique de l'ingénierie IA et de l'ingénierie de la donnée. Nous concevons des chaînes d'inférence, des pipelines de données et autres systèmes agentiques destinés à fonctionner sous trafic réel, avec des exigences de latence, de coût et de conformité.",
    },
    {
        "t": "p",
        "text": "Notre proposition est simple : transformer une fonctionnalité d'IA prometteuse en **un service mesuré, borné en coût et exploitable par vos équipes**.",
    },
    {
        "t": "p",
        "text": "Le contexte n'a malheureusement pas beaucoup changé. Assembler un modèle, quelques documents et une interface prend aujourd'hui quelques jours. Bien que l'adoption des modèles de langages ait raccourci ce temps, la complexité du code source en sorti est moins digeste, mais nous sommes d'accord pour dire que la démonstration est 'devenue facile'. Ce qui reste difficile n'a pas évolué : tenir la charge de calcul et la latence, prouver la qualité de la sortie, contenir les coûts, corriger sans régresser, et rendre l'ensemble exploitable par une équipe qui n'a pas écrit le code.",
    },
    {
        "t": "p",
        "text": "C'est cet écart entre le PoC et le service en production que cette méthode essaie de corriger.",
    },
    {
        "t": "p",
        "text": "**Mettre un système data-driven en production n'est pas un problème de modèle.** C'est un projet d'ingénierie, d'organisation et de conduite du changement. Une mise en œuvre mal cadrée produit trois symptômes reconnaissables : un coût d'inférence que personne ne sait expliquer, une qualité que personne ne sait démontrer, et un service que personne n'ose brancher sur le parcours client.",
    },
    {
        "t": "p",
        "text": "Ce guide décrit une trajectoire en trois temps : un mois de cadrage et d'architecture, un mois de construction du socle, un mois de mise en production et d'exploitation. Les durées sont indicatives et s'ajustent au contexte. Le séquencement, lui, ne varie pas.",
    },
    {"t": "figure", "key": "plan90", "caption": "La trajectoire en quatre-vingt-dix jours."},
    # ======================================================================
    {"t": "section", "num": "1", "title": "Notre philosophie", "accent": "blue"},
    {
        "t": "lead",
        "text": "Notre approche tient en une phrase : on ne pilote que ce que l'on mesure. Le choix du modèle et celui de l'hébergement et le niveau d'automatisation en découlent mais celà ne peut pas être l'inverse.",
    },
    {"t": "h2", "num": "1.1", "title": "Les principes fondateurs"},
    {
        "t": "p",
        "text": "Six principes structurent chacune de nos interventions. Ils ne sont que peu négociables ou décoratifs. Ils sont ceux qui déterminent l'ordre des travaux.",
    },
    {
        "t": "bullets",
        "items": [
            "**Mesurer avant d'optimiser.** Un système data-driven sans dataset d'évaluation n'est pas améliorable mais plutôt seulement modifiable. Nous établissons dès le cadrage une définition explicite de ce qu'est une bonne réponse, et le jeu de cas qui permet de la vérifier à chaque changement.",
            "**Le modèle n'est qu'un composant.** L'essentiel de la fiabilité se joue autour de lui. La préparation et récupération du contexte, les garde-fous, la gestion des erreurs, le cache et la limitation de débit sont autant de principes d'ingénierie qui sépare une démonstration d'un service.",
            "**Le coût unitaire est une contrainte de conception.** Le coût par requête, ou par tâche métier traitée, se décide à l'architecture et non à la réception de la facture. Nous l'estimons dès les scénarios, puis nous le suivons comme un indicateur de production à part entière.",
            "**Modularité et réversibilité.** Le fournisseur de modèles (si utilisé en tant que service externe) est isolé derrière une interface stable, afin d'en changer sans réécrire l'application. Aucune brique ne doit devenir irremplaçable, ni techniquement, ni contractuellement.",
            "**Souveraineté proportionnée.** Le niveau de contrôle comme le fait que le service soit géré, qu'il s'agisse d'un hébergement européen ou que l'execution se situe sur votre propre infrastructure, se choisit selon la sensibilité des données et les obligations réglementaires, mais celà ne saurait en aucun cas être une posture.",
            "**Autonomie des équipes.** Notre objectif est que vos équipes exploitent le système sans nous. La documentation, la montée en compétence et l'accompagnement au démarrage font partie du périmètre.",
        ],
    },
    {"t": "h2", "num": "1.2", "title": "Comment nous mesurons le succès d'un projet"},
    {
        "t": "p",
        "text": "Évaluer un système data-driven est plus délicat qu'évaluer une application classique. la sortie peut être probabiliste, la notion de « correct » dépend du métier, et une amélioration visible sur un cas peut dégrader les autres. Nous retenons donc un jeu d'indicateurs restreint, défini **avant** la construction et adapté au contexte :",
    },
    {
        "t": "bullets",
        "items": [
            "la qualité mesurée sur un jeu d'évaluation représentatif, suivie version après version.",
            "la latence de bout en bout observée au 95e centile, sur le parcours complet et non sur le seul appel au modèle.",
            "le coût par requête, ou par tâche métier traitée.",
            "le taux d'échec et de reprise : erreurs, dépassements de délai, réponses écartées par les garde-fous.",
            "la disponibilité du service et le délai de retour à la normale après incident.",
            "l'adoption réelle : la part des utilisateurs ou des flux qui passent effectivement par le système.",
        ],
    },
    {
        "t": "p",
        "text": "L'essentiel n'est pas de multiplier les métriques, mais d'en retenir trois à cinq qui éclairent une décision. Un indicateur qui ne déclenche jamais d'action n'est pas un indicateur mais plutôt une décoration.",
    },
    {
        "t": "application",
        "title": "Un copilote de support et ses deux métriques pour prioriser les corrections",
        "text": "Pour piloter les premiers mois d'un copilote destiné au support interne, nous avons suivi deux métriques opérationnelles : le taux d'acceptation des brouillons et le coût par conversation.\n\nLe taux d'acceptation mesure la proportion de réponses proposées par le copilote que l'agent envoie sans modification significative. Il ne repose pas sur une enquête déclarative mais plutôt sur le fait que pour chaque brouillon, nous comparons le texte généré au message effectivement envoyé. De ce fait, un score de similarité élevé, au-delà d'un seuil défini, compte comme une réponse acceptée. L'analyse de cette métrique par motif de contact a mis en évidence le fait que les brouillons liés aux demandes de résiliation étaient beaucoup plus souvent réécrits que les autres.. L'équipe a donc corrigé en priorité les sources, les règles métier et les consignes de génération propres à ce parcours.\n\nIl s'en trouve que le coût est donc calculé à l'échelle d'une conversation, et non d'un appel au modèle. Une même conversation peut en effet déclencher plusieurs requêtes : la reformulation de la demande, la recherche documentaire, la génération du brouillon ou les appels d'outils ou nouvelle génération après intervention de l'agent. Comme chaque appel est rattaché à la même trace OpenTelemetry, les coûts de tokens et d'inférence sont ensuite agrégés par identifiant de conversation. Celà a révélé qu'une part importante de la dépense provenait de questions très proches, déjà traitées au cours de la même journée.\n\nEn ajoutant un cache sémantique dans Redis, nous avons pu éviter de rechercher une correspondance exacte entre deux textes, mais à la place faire que le système compare leurs représentations vectorielles. Si une nouvelle question est suffisamment proche d'une question déjà résolue, le copilote réutilise la réponse mise en cache, sous réserve que le contexte et les sources soient encore valides.\n\nDans Grafana, il nous suffisait donc de deux tableaux pour orienter les décisions : le taux d'acceptation, segmenté par motif de contact, pour identifier les parcours à fiabiliser, et le coût moyen par conversation, différencié entre réponses générées et réponses servies depuis le cache, pour suivre l'effet de l'optimisation."
    },
    {"t": "h2", "num": "1.3", "title": "Ce que nous ne faisons pas"},
    {
        "t": "p",
        "text": "Un cadrage honnête suppose d'annoncer aussi les limites de la démarche.",
    },
    {
        "t": "bullets",
        "items": [
            "**Nous n'entraînons pas de modèle de fondation.** Nous ne recourons à la spécialisation d'un modèle existant que lorsque l'évaluation démontre qu'aucun réglage du contexte, de la récupération ou des consignes ne suffit.",
            "**Nous ne livrons pas de plateforme sans cas d'usage.** Une plateforme construite avant le premier usage produit une facture immédiate et une valeur hypothétique.",
            "**Nous n'installons pas d'outillage que vos équipes ne pourront pas exploiter.** La sophistication d'une architecture se paie tous les mois, en exploitation.",
        ],
    },
    # ======================================================================
    {"t": "section", "num": "2", "title": "Premier mois :\nCadrage et architecture", "accent": "magenta"},
    {
        "t": "lead",
        "text": "Le premier mois ne produit pas de code destiné à la production. Il produit des décisions et les éléments qui permettent de les défendre.",
    },
    {
        "t": "p",
        "text": "Cette phase vise à aligner la solution technique sur les objectifs stratégiques, les besoins métier et les contraintes de l'organisation. Elle dresse un état des lieux des données et des usages existants, et clarifie les attentes des parties prenantes avant que le premier euro d'infrastructure ne soit engagé.",
    },
    {"t": "h2", "num": "2.1", "title": "Cadrage et compréhension du contexte"},
    {
        "t": "p",
        "text": "Nous organisons des ateliers avec les directions concernées, analysons les documents existants et cartographions les sources de données et les cas d'usage prioritaires. Ce travail aboutit à une **note de cadrage** qui fixe les objectifs de l'intervention, le périmètre, les priorités, les risques identifiés et le calendrier.",
    },
    {
        "t": "p",
        "text": "Un point mérite une attention particulière : la nature de la tâche confiée au système. Assister un opérateur qui garde la décision, ou automatiser un traitement de bout en bout, ne demandent ni le même niveau de qualité, ni les mêmes garde-fous, ni le même budget. Trancher tôt évite de reconstruire tard.",
    },
    {"t": "image", "key": "cadrage"},
    {"t": "h2", "num": "2.2", "title": "Définir « correct » : le dataset d'évaluation comme premier livrable"},
    {
        "t": "p",
        "text": "C'est la principale différence entre un projet data-driven et un projet logiciel classique, et le point le plus souvent négligé. Avant de construire, nous constituons avec vos experts métier un **dataset d'évaluation** : un ensemble de cas réels, représentatifs, accompagnés du résultat attendu et du critère qui permet de juger une réponse acceptable.",
    },
    {
        "t": "p",
        "text": "Ce dataset couvre le fonctionnement nominal, les cas limites et les cas où le système doit refuser de répondre ou passer la main à un humain. Il devient la référence commune du projet : toute modification (nouveau modèle, nouvelle consigne, nouvelle stratégie de récupération) est mesurée contre lui.",
    },
    {
        "t": "application",
        "title": "Définir une réponse fiable pour un assistant d'analyse de contrats",
        "text": "Pour un assureur, répondre à la question « ce sinistre est-il couvert ? » ne consiste pas seulement à produire une réponse plausible. La réponse doit pouvoir être reliée aux clauses applicables du contrat et signaler explicitement les cas où le contrat ne permet pas de conclure.\n\nL’équipe a défini trois critères d’évaluation.\n\n1. La réponse doit citer une clause existante et pertinente. Chaque citation générée contient une référence structurée (numéro d'article, titre de clause ou identifiant de passage) qui est vérifiée automatiquement dans la version du contrat fournie au système. Une référence absente du document, ou associée à un passage différent, fait échouer ce contrôle.\n\n2. La réponse doit distinguer la règle générale de ses exclusions et conditions. Par exemple, une garantie peut couvrir un dommage dans son principe, tout en excluant certains usages, plafonner l'indemnisation ou exiger une condition particulière. Ce point est évalué par un modèle de contrôle chargé de comparer la réponse aux extraits contractuels. Son comportement est mesuré et ajusté sur un corpus annoté par des spécialistes métier, afin de vérifier qu'il détecte effectivement les omissions importantes.\n\n3. Lorsque les documents disponibles sont insuffisants ou ambigus, l'assistant doit le communiquer et orienter le dossier vers un gestionnaire. Cette exigence est évaluée comme une décision binaire : l'assistant s'abstient-il lorsque le cas de référence indique qu'aucune conclusion ne peut être tirée du contrat ?\n\nLe dataset d'évaluation est constitué à partir de dossiers réels, anonymisés et revus. Il contient volontairement des cas sans réponse certaine (clauses incomplètes, informations de sinistre manquantes, garanties contradictoires ou exclusions dont l'applicabilité dépend d'un élément non fourni). Dans ces situations, la bonne réponse n'est pas une décision de couverture, c'est une demande d'instruction complémentaire ou une transmission à un gestionnaire.\n\nChaque évaluation est enregistrée dans un outil de suivi d'expériences, sur le modèle de MLflow (version du modèle, instructions, documents utilisés, résultats par critère et sorties produites). Deux versions peuvent ainsi être rejouées sur exactement le même corpus. Sans les cas d'abstention, un système trop affirmatif pourrait obtenir un bon score sur les cas simples tout en donnant des réponses non fondées dans les situations où il devrait explicitement ne pas conclure."
    },
    {
        "t": "p",
        "text": "Sans référentiel d'évaluation commun, les choix entre deux approches reposent souvent sur des perceptions individuelles : une réponse paraît meilleure, un changement semble plus rapide, ou un modèle donne une impression de fiabilité. Les régressions ne deviennent alors visibles qu'après le déploiement, au contact des utilisateurs et des cas réels.\n\nAvec un dataset de cas versionné, des critères explicites et des résultats comparables d'une exécution à l'autre, les décisions d'architecture peuvent être examinées à partir d'éléments mesurables. Il devient possible, par exemple, de vérifier qu'un nouveau modèle réduit le coût ou la latence sans dégrader la qualité des citations, le traitement des exclusions ou la capacité du système à s'abstenir."
    },
    {"t": "h2", "num": "2.3", "title": "Hypothèses, contraintes et exigences non fonctionnelles"},
    {
        "t": "p",
        "text": "Nous identifions les contraintes **techniques, juridiques, de sécurité, environnementales et réglementaires**, puis posons des hypothèses chiffrées comme la volumétrie, le trafic attendu, le budget, les délais, la taille et la compétences de l'équipe. Tout celà afin d'en déduire un cadre opérationnel explicite.",
    },
    {
        "t": "p",
        "text": "Trois exigences pèsent particulièrement sur l'architecture d'un système data-driven :",
    },
    {
        "t": "bullets",
        "items": [
            "**La latence acceptable**, qui détermine la place du modèle dans le parcours, la taille du contexte transmis et la possibilité de traiter par batches.",
            "**La confidentialité des données**, qui conditionne le lieu d'exécution du modèle et la nature des logs conservés.",
            "**Le budget d'exploitation**, qui fixe le compromis entre la qualité recherchée et le coût par requête.",
        ],
    },
    {
        "t": "p",
        "text": "Ces exigences sont consignées, datées et versionnées. Elles constituent un cadre de référence partagé pour évaluer les changements apportés au système. Lorsqu'une exigence évolue (e.g, lorsqu'un nouveau niveau de traçabilité, de précision ou de délai de réponse est attendu), cette évolution est explicitement examinée et prise en compte dans l'architecture, les données, les évaluations et les mécanismes de contrôle. L'architecture ne se transforme donc pas progressivement au fil d'exceptions ou de choix implicites : ses évolutions restent reliées à des besoins identifiés et documentés."
    },
    {
        "t": "application",
        "title": "Deux architectures pour un même besoin métier",
        "text": "Une plateforme logistique souhaite produire un résumé des échanges associés à un dossier de livraison. Ce résumé répond à deux usages distincts, qui portent sur les mêmes informations mais n'imposent pas les mêmes contraintes de délai.\n\nLe premier usage est opérationnel. Lorsqu'un opérateur échange avec un client par téléphone, il doit pouvoir consulter un résumé actualisé du dossier en quelques secondes. Le système ne transmet alors au modèle que le contexte utile, par exemple les derniers messages et les principaux événements du dossier. Un modèle compact, servi en interne par un moteur d'inférence tel que vLLM, produit la réponse avec une faible latence. Ce type de moteur permet notamment de traiter plusieurs requêtes simultanément et de réutiliser certains calculs lorsque les requêtes partagent un même préfixe de contexte.\n\nLe second usage est analytique. En fin de journée, l'entreprise génère des résumés destinés au suivi de l'activité, à l'analyse des incidents ou à l'alimentation d'un datalake. Dans ce cas, un délai de plusieurs minutes est acceptable. Une tâche planifiée, orchestrée par Airflow ou Temporal, traite les dossiers par lots avec un modèle plus capable, puis dépose les résultats dans le datalake.\n\nLes deux chaînes utilisent le même dataset d'évaluation pour vérifier que les résumés restent fidèles aux échanges, conservent les informations importantes et n'introduisent pas de faits non présents dans le dossier. Elles diffèrent en revanche par leur infrastructure, leur modèle, leur mode de traitement et leur coût. Ce n'est donc pas le modèle qui détermine l'architecture en premier lieu : c'est l'exigence de latence associée à chaque usage métier."
    },
    {"t": "h2", "num": "2.4", "title": "Les six briques d'un système data-driven en production"},
    {
        "t": "p",
        "text": "Pour chaque brique, nous comparons les solutions du marché au regard de critères fonctionnels, techniques, opérationnels, de conformité et de coût, établis lors des étapes précédentes. Le résultat est un **tableau comparatif argumenté**, adossé à une matrice pondérée qui documente les critères et motive la recommandation finale.",
    },
    {"t": "figure", "key": "bricks", "caption": "Les six briques d'un système data-driven en production."},
    {
        "t": "p",
        "text": "Cette décomposition sert aussi de grille de lecture de l'existant. Dans la plupart des organisations, deux ou trois de ces briques sont déjà en place et n'ont pas à être reconstruites.",
    },
    {"t": "h2", "num": "2.5", "title": "Scénarios d'architecture"},
    {
        "t": "p",
        "text": "Nous élaborons ensuite plusieurs scénarios répondant à des priorités différentes. Aucun n'est supérieur en soi mais plutôt, chacun optimise une variable au détriment d'une autre, et le choix appartient au client, éclairé par les documents remis.",
    },
    {
        "t": "table",
        "caption": "Trois scénarios d'architecture courants, à comparer selon la sensibilité des données, le niveau de trafic et les contraintes d'exploitation.",
        "cols": ["Scénario", "Ce qu'il optimise", "Ce qu'il implique", "Contexte typique"],
        "widths": [30, 44, 44, 44],
        "rows": [
            [
            "Service managé",
            "La rapidité de mise sur le marché, la simplicité de déploiement et la réduction de la charge d'exploitation.",
            "Une dépendance importante au fournisseur, un coût principalement variable et une marge de manoeuvre limitée sur l'infrastructure et les modèles disponibles.",
            "Premier cas d'usage, trafic modéré, données peu sensibles ou pouvant être traitées conformément aux exigences de confidentialité."
            ],
            [
            "Plateforme souveraine",
            "Le contrôle des données, le choix de l'infrastructure et la maîtrise du coût unitaire lorsque les volumes sont élevés et stables.",
            "Un investissement initial plus important, des compétences internes pour exploiter la plateforme et une responsabilité directe sur sa disponibilité, sa sécurité et ses mises à jour.",
            "Données réglementées ou sensibles, trafic soutenu et prévisible, exigences fortes de localisation, de traçabilité ou de personnalisation."
            ],
            [
            "Hybride",
            "L'ajustement entre plusieurs options : utiliser le modèle, l'environnement et le niveau de service les plus adaptés à chaque tâche.",
            "Une architecture de routage plus complexe, davantage de mécanismes d'observation et des règles explicites pour déterminer quelles données et quelles requêtes peuvent emprunter chaque chemin.",
            "Portefeuille de cas d'usage hétérogènes, contraintes de données variées et exigences combinant réactivité, contrôle et capacité d'évolution."
            ]
        ]
    },
    {
        "t": "p",
        "text": "Chaque scénario est chiffré sur les mêmes hypothèses de trafic, évalué sur le même dataset de cas, et est accompagné de son plan de sortie avec comme option ce qu'il faudrait faire, et à quel coût pour en changer dans un an ?",
    },
    {"t": "h2", "num": "2.6", "title": "Décision et livrables de fin du premier mois"},
    {
        "t": "p",
        "text": "La décision fige l'architecture cible, les outils et la feuille de route de construction. Elle est prise en comité, tracée, et assortie des critères qui justifieraient de la revoir.",
    },
    {"t": "image", "key": "architecture"},
    {
        "t": "panel",
        "title": "Livrables du premier mois",
        "items": [
            "Note de cadrage : objectifs, périmètre, priorités, risques, calendrier.",
            "dataset d'évaluation (si entraînement requis) initial et définition partagée de la réponse acceptable.",
            "Registre des hypothèses, contraintes et exigences non fonctionnelles.",
            "Comparatif argumenté des solutions et matrice de décision pondérée.",
            "Architecture cible (High Level Design), plan d'adoption et, si nécessaire, plan de migration.",
        ],
    },
    # ======================================================================
    {"t": "section", "num": "3", "title": "Deuxième mois :\nConstruction du socle", "accent": "amber"},
    {
        "t": "lead",
        "text": "L'architecture cible et la feuille de route étant arrêtées, la construction peut commencer. L'objectif du deuxième mois est de transformer une architecture théorique en un socle opérationnel.",
    },
    {"t": "h2", "num": "3.1", "title": "Infrastructure et environnements"},
    {
        "t": "p",
        "text": "Nous déployons l'infrastructure (i.e, Infrastructure as Code avec Terraform/Ansible/etc), afin d'en garantir la reproductibilité, et définissons les environnements de développement, de test, et autres 'recipes' en production. La gestion des secrets, la segmentation réseau, la politique d'accès, les besoins en stockage sont posés à ce stade.",
    },
    {
        "t": "p",
        "text": "Lorsque le scénario retenu repose sur du hardware spécifique, tels que des GPU, cette étape ne consiste pas uniquement à choisir une infrastructure. Elle inclut le dimensionnement de la capacité nécessaire en fonction du trafic attendu, de la taille des modèles, des objectifs de latence et du niveau de disponibilité visé. Elle définit également les règles d'allocation des ressources (e.g, capacité réservée pour les services critiques, capacité mutualisée entre équipes ou cas d'usage, priorités de traitement et limites de consommation).\n\nLe comportement du système en cas de saturation doit aussi être prévu explicitement. Selon le contexte, une requête peut être mise en file d'attente, traitée avec un modèle plus léger, orientée vers une capacité alternative ou refusée avec un message compréhensible. Ces mécanismes permettent de protéger les usages prioritaires, d'éviter qu'une hausse ponctuelle de trafic dégrade l'ensemble des services et de rendre le coût comme la qualité de service plus prévisibles."
},
    {"t": "image", "key": "socle"},
    {"t": "h2", "num": "3.2", "title": "Socle de données et gestion du contexte"},
    {
        "t": "p",
        "text": "La qualité d'un système data-driven est d'abord celle du contexte qu'on lui fournit. Cette étape comprend :",
    },
    {
        "t": "bullets",
        "items": [
            "Le développement des **pipelines d'ingestion**, qui font transiter la donnée d'une source vers une destination de manière fiable.",
            "La **normalisation et le découpage des documents** (condition de pertinence de la recherche) : un mauvais découpage dégrade la qualité plus sûrement qu'un mauvais modèle.",
            "La **construction de l'index de recherche** et le réglage de la stratégie de récupération, évaluée sur le dataset de cas et non sur des exemples choisis.",
            "La **gestion de la 'liveness'** : que se passe-t-il lorsqu'un document change, est supprimé, ou devient confidentiel ?",
            "La **propagation des droits d'accès** jusqu'au niveau du document, afin qu'un utilisateur n'obtienne jamais, par l'intermédiaire du système, une information à laquelle il n'a pas droit.",
            "La définition de **contrats de données** stabilisant les interfaces entre producers et consumers.",
        ],
    },
    {
        "t": "application",
        "title": "Quand le droit d'accès se perd dans l'index",
        "text": "Un intranet de ressources humaines regroupait dans un même système de recherche des notes de service générales et des dossiers individuels contenant des informations sensibles. Le système semblait fonctionner correctement étant donné que les documents affichés respectaient les droits d'accès des utilisateurs. Pourtant, un manager pouvait parfois obtenir dans une réponse générée, des éléments issus d'un dossier individuel auquel il n'était pas autorisé à accéder.\n\nLe problème venait du fait que l'information sensible n'était pas nécessairement affichée sous la forme d'un document identifiable. Elle pouvait être reconstituée par le modèle à partir de fragments récupérés lors de la recherche. Appliquer un filtre après la génération ne suffisait donc pas puisque le fragment non autorisé avait déjà été transmis au modèle et pouvait influencer la réponse.\n\nLe patch a consisté à intégrer les règles d'accès directement dans l'index. Chaque fragment stocké contient, en plus de sa représentation vectorielle et de ses métadonnées, les groupes ou les utilisateurs autorisés à le consulter. Lors de la recherche, la base vectorielle applique ce filtre d'autorisation avant de sélectionner les fragments transmis au modèle. Seuls les contenus accessibles à l'utilisateur peuvent ainsi contribuer à la réponse.\n\nCette protection doit rester synchronisée avec le référentiel d'identités. Les changements d'habilitation, comme l'arrivée d'un salarié dans une équipe, un changement de fonction ou le retrait d'un accès, sont transmis par une message queue. Ils déclenchent la mise à jour ou la réindexation des fragments concernés. Sans ce mécanisme, les droits présents dans l'index peuvent progressivement diverger des droits réels, souvent sans que cette dérive soit immédiatement visible."
    },
    {"t": "h2", "num": "3.3", "title": "La séquence d'inférence"},
    {
        "t": "p",
        "text": "La séquence d'inférence est l'ensemble des traitements effectués par une requête, de sa réception à la réponse rendue. La concevoir explicitement plutôt que de la laisser émerger permet d'y placer les points de tracing, de 'replay' et de maîtrise du coût.",
    },
    {"t": "figure", "key": "chain", "caption": "Le trajet d'une requête, de la réception à la réponse."},
    {
        "t": "p",
        "text": "Quatre leviers y sont réglés ensemble, car ils interagissent entre eux : la **mise en cache** des résultats et des contextes récurrents, le **routage** vers un modèle proportionné à la difficulté de la tâche, le **traitement par lots** des requêtes non interactives, et le **repli** vers un chemin dégradé lorsque le fournisseur principal est indisponible.",
    },
    {
        "t": "application",
        "title": "Router plutôt que surdimensionner",
        "text": "Un assistant chargé de qualifier les demandes entrantes recevait majoritairement des messages courts et simples comme classer une demande, la diriger vers la bonne équipe ou envoyer un accusé de réception. Une faible part des sollicitations nécessitait toutefois de lire des pièces jointes, d'exploiter un historique plus long ou de produire un raisonnement en plusieurs étapes.\n\nInitialement, toutes les demandes étaient traitées par un même modèle, dimensionné pour les cas les plus complexes. Cette approche garantissait une couverture fonctionnelle large, mais elle imposait le coût, la latence et la capacité d'un modèle avancé à l'ensemble du trafic, y compris aux requêtes les plus simples.\n\nLe patch a consisté à introduire une 'inference gateway' devant les modèles. Cette passerelle applique d'abord un classifieur léger afin d'identifier la nature de la demande. Les cas courants sont traités par un modèle plus petit, auto-hébergé et adapté aux réponses courtes. Seules les demandes répondant à des critères d'escalade explicites sont transmises à un modèle plus capable (e.g, présence d'une pièce jointe, longueur inhabituelle du fil de discussion, ambiguïté détectée, besoin de traitement multimodal ou échec du premier passage).\n\nLa passerelle centralise également les quotas, les règles de priorité, le repli vers une solution alternative en cas d'indisponibilité et la mesure du coût par type de requête. Le principal enjeu n'est pas seulement de mettre en place ce routage. Il est surtout de définir des critères d'escalade clairs et vérifiables, puis de suivre leur taux de déclenchement. Si ce taux augmente sans raison métier identifiable, il peut signaler une dégradation de la qualité du petit modèle, un classifieur trop prudent ou une évolution du trafic qui remet en cause les hypothèses initiales de l'architecture."
    },
    {"t": "h2", "num": "3.4", "title": "Garde-fous, sécurité et conformité"},
    {
        "t": "p",
        "text": "Un système data-driven exposé à des utilisateurs, internes ou externes, présente une surface d'attaque et de dérive qui lui est propre. Nous mettons en place la validation des entrées et des sorties, la détection des tentatives de détournement des consignes, la segmentation des outils que le système est autorisé à appeler, et la journalisation intégrale des décisions à des fins de traçabilité.",
    },
    {
        "t": "p",
        "text": "Le traitement des données personnelles est cadré à ce stade (e.g, minimisation, durée de conservation des logs, anonymisation, et localisation des traitements). Lorsque l'usage relève d'une catégorie réglementée, la documentation exigée est produite pendant la construction, quand elle coûte peu, et non après, quand elle bloque une mise en production.",
    },
    {"t": "h2", "num": "3.5", "title": "Industrialisation et évaluation continue"},
    {
        "t": "p",
        "text": "L'industrialisation est ce qui permet à une équipe de modifier le système sans crainte. Elle repose sur des chaînes d'intégration et de déploiement continus (e.g, tests automatiques, revues de code, déploiements contrôlés) et sur une pratique spécifique aux systèmes data-driven : **l'évaluation rejouée à chaque changement**.",
    },
    {"t": "figure", "key": "loop", "caption": "La boucle d'évaluation continue permet qu'aucun changement ne parte en production sans avoir été mesuré."},
    {
        "t": "p",
        "text": "Une modification de consigne, un changement de version de modèle ou une évolution de la stratégie de récupération déclenchent la même chose qu'une modification de code : une exécution du dataset d'évaluation, une comparaison avec la version précédente, et une décision documentée. Le dataset d'évaluation s'enrichit en retour des cas réels rencontrés en production.",
    },
    {
        "t": "application",
        "title": "La correction qui casse ailleurs",
        "text": "Pour homogénéiser la présentation des réponses, une équipe ajoute à la consigne du système : « réponds toujours en trois points ». Le cas initialement problématique est bien corrigé. Toutefois, une consigne n'agit jamais uniquement sur l'exemple qui a motivé sa modification puisqu'elle influence l'ensemble des comportements du modèle.\n\nLes consignes étant versionnées avec le code, chaque changement déclenche l'exécution automatique du dataset d'évaluation dans la chaîne d'intégration continue. Le rapport met alors en évidence des effets de bord comme le fait que des réponses qui tenaient auparavant en une phrase deviennent inutilement longues, tandis que certains cas où le système devait s'abstenir produisent désormais trois points artificiels ou spéculatifs afin de respecter la nouvelle instruction de format.\n\nL'évaluation compare chaque cas à la version actuellement en production, plutôt que de ne retenir qu'un score global. Cette comparaison détaillée est essentielle : une moyenne inchangée peut masquer simultanément une amélioration sur un scénario, une réponse devenue trop verbeuse sur un autre et une régression plus grave sur les cas d'abstention. Tous ces écarts n'ont ni la même importance ni le même niveau de risque.\n\nUn seuil de non-régression est alors appliqué : si la nouvelle version dégrade des cas critiques au-delà de la tolérance définie, la fusion est bloquée. Sans ce dispositif, une correction locale peut être déployée comme une amélioration apparente, alors qu'elle introduit silencieusement des défaillances dans d'autres situations."
    },
    {"t": "h2", "num": "3.6", "title": "Observabilité et maîtrise des coûts"},
    {
        "t": "p",
        "text": "Nous instrumentons le système de bout en bout pour produire des traces complètes d'une requête, des métriques de qualité, de latence et d'erreur, et l'évaluation des **coûts rattachés à chaque appel**. Le coût cesse alors d'être une ligne de facture mensuelle pour devenir une donnée d'exploitation, analysable par usage, par équipe et par version.",
    },
    {
        "t": "p",
        "text": "Cette instrumentation est utile pour deux types d'utilisateurs. D'une part, les équipes techniques qui diagnostiquent, et la direction qui arbitre. C'est la condition d'un dispositif FinOps qui pilote réellement l'usage plutôt que de le constater.",
    },
    {"t": "h2", "num": "3.7", "title": "Documentation et transfert de compétences"},
    {
        "t": "p",
        "text": "Notre objectif est que **vos équipes soient pleinement autonomes sur le système et maîtrisent ce que nous avons produit**. Il ne s'agit pas de créer une dépendance, mais de transmettre un socle opérationnel clair, documenté et appropriable. Le transfert s'organise en trois volets :",
    },
    {
        "t": "bullets",
        "items": [
            "**La documentation** : architecture et décisions, catalogue des données et lignage, procédures d'exploitation, guides orientés par cas d'usage.",
            "**La montée en compétence** : formations par rôle, sessions 'peer-programming' sur de vraies évolutions, afin que les équipes prennent la main sur des changements réels.",
            "**L'accompagnement au démarrage** : rituels d'exploitation, revues avant mise en production, gestion des premières alertes.",
        ],
    },
    {
        "t": "panel",
        "title": "Livrables du deuxième mois",
        "items": [
            "'Infrastructure as code', environnements séparés, gestion des secrets et des accès.",
            "Pipelines d'ingestion, index de recherche et contrats de données en fonctionnement.",
            "Séquence d'inférence instrumentée : cache, routage, traitement par lots, 'replays'.",
            "Garde-fous, journalisation et documentation de conformité.",
            "Chaîne de déploiement continu incluant l'exécution automatique du dataset d'évaluation.",
            "Documentation d'exploitation et plan de montée en compétence engagé.",
        ],
    },
    # ======================================================================
    {"t": "section", "num": "4", "title": "Troisième mois :\nMise en production", "accent": "blue"},
    {
        "t": "lead",
        "text": "Le socle en place, l'enjeu est de prouver rapidement sa valeur sur un périmètre réel, puis d'installer le régime d'exploitation qui permettra de l'étendre.",
    },
    {"t": "h2", "num": "4.1", "title": "Choisir le périmètre du premier lancement"},
    {
        "t": "p",
        "text": "Nous privilégions un usage qui résout un irritant identifié, dont le résultat est visible par le métier et mesurable sans instrumentation supplémentaire. Ce premier résultat tangible sert de démonstrateur, crée l'adhésion et embarque les acteurs autour de la démarche.",
    },
    {
        "t": "p",
        "text": "Un bon périmètre de lancement réunit trois propriétés. Premièrement, il faut atteindre un volume suffisant pour que les mesures soient significatives, puis il faut une population d'utilisateurs identifiée et joignable, et enfin un chemin de repli manuel si le système est indisponible.",
    },
    {"t": "h2", "num": "4.2", "title": "Déploiement progressif"},
    {
        "t": "p",
        "text": "La bascule ne se fait jamais d'une traite. Nous procédons par étapes, chacune assortie de son critère de passage et de son critère d'arrêt :",
    },
    {
        "t": "numbered",
        "items": [
        "**Exécution en observation** : le système traite le trafic réel sans exposer ses réponses aux utilisateurs finaux. Ses résultats sont comparés à la pratique existante, aux décisions humaines ou au système déjà en service. Cette phase permet de vérifier la qualité des réponses, les écarts de comportement et les conditions réelles de fonctionnement sans introduire de risque opérationnel.",
        "**Ouverture progressive** : une fraction limitée du trafic est effectivement traitée par le nouveau système. Le déploiement est suivi de près au moyen d'indicateurs de qualité, de latence, de taux d'erreur, de coût et de retours utilisateurs. Le périmètre ou la part de trafic augmente uniquement lorsque les critères définis sont atteints.",
        "**Généralisation** : le système est étendu à l'ensemble du périmètre prévu, tout en maintenant un mécanisme de retour arrière disponible, documenté et régulièrement testé. La capacité à revenir rapidement à la solution précédente fait partie intégrante de la stratégie de déploiement."
        ]
    },
    {
        "t": "p",
        "text": "À chaque étape, la décision de poursuivre, de stabiliser ou de revenir en arrière s'appuie sur les indicateurs définis dès le premier mois du projet. Un retour arrière ne doit pas être considéré comme un échec mais contraire, il constitue le mécanisme qui permet de déployer progressivement un système dans des conditions maîtrisées. Pour être utile, il doit être techniquement réalisable, suffisamment rapide et connu des équipes qui interviennent en exploitation."
    },
    {
        "t": "h2",
        "num": "4.3",
        "title": "Exploitation : incidents, astreinte et procédures"
    },
    {
        "t": "p",
        "text": "Un système data-driven présente des modes de défaillance qui ne se limitent pas aux incidents techniques habituels. La qualité peut se dégrader sans erreur visible, les données d'entrée peuvent évoluer, un fournisseur externe peut devenir indisponible ou modifier son comportement, et le coût peut augmenter rapidement sous l'effet du trafic ou d'un changement de routage. L'exploitation doit donc définir les alertes adaptées à ces risques, les seuils qui les déclenchent, les responsables mobilisés et les procédures d'intervention associées."
    },
    {
        "t": "p",
        "text": "Les procédures doivent répondre à l'avance à des questions opérationnelles simples comme que faire si le fournisseur principal est indisponible ? Quelle solution de repli est utilisée, et pour quels usages ? Que faire si la qualité baisse alors qu'aucun déploiement n'a eu lieu ? Comment suspendre un flux, limite-t-on l'accès à une fonctionnalité ou revient-on à un traitement manuel ? Que faire si le coût journalier dépasse le seuil convenu ? Ces décisions ne doivent pas être improvisées au moment de l'incident."
    },
    {
        "t": "application",
        "title": "La dérive qui n'était pas prévue par une alerte technique",
        "text": "Un fournisseur met à jour la version de son modèle tout en conservant la même référence d'appel. Du point de vue de l'infrastructure, aucun indicateur technique ne signale de problème. Les requêtes continuent, la latence reste stable et le coût ne varie pas de manière notable. Pourtant, le comportement fonctionnel du modèle a changé. Certains champs attendus par l'application ne sont plus systématiquement renseignés dans les réponses.\n\nLe problème n'est détecté que plusieurs jours plus tard, lorsque les équipes métier constatent l'apparition de dossiers incomplets. Les alertes fondées uniquement sur les erreurs HTTP, la disponibilité ou le temps de réponse ne permettent pas de voir cette dérive. Le service fonctionne techniquement, mais il ne remplit plus correctement son rôle métier.\n\nTrois mesures réduisent fortement ce risque. La première consiste à figer explicitement la version du modèle appelée, plutôt que de dépendre d'un alias susceptible d'évoluer sans modification du code applicatif. La deuxième consiste à valider systématiquement chaque réponse contre un schéma attendu, puis à surveiller le taux d'échec de cette validation comme un indicateur de production à part entière. Une réponse HTTP réussie mais structurellement inexploitable doit être considérée comme un échec fonctionnel.\n\nLa troisième mesure consiste à rejouer périodiquement, en production, un sous-ensemble représentatif du jeu d'évaluation. Ces contrôles permettent de détecter une évolution de comportement même lorsque les réponses restent techniquement valides. Enfin, la version précise du modèle doit être enregistrée comme attribut de trace pour chaque appel. En cas de dégradation, cette information permet d'identifier et de dater la bascule à la minute près, au lieu de devoir l'inférer a posteriori à partir des symptômes observés."
    },
    {"t": "image", "key": "exploitation"},
    {"t": "h2", "num": "4.4", "title": "Mesure et amélioration continue"},
    {
        "t": "p",
        "text": "Le succès de l'usage est suivi par les indicateurs définis en amont comme la qualité, la latence, le coût unitaire, la disponibilité, l'adoption. Les traces d'exécution et les retours des utilisateurs alimentent un backlog d'améliorations priorisé et planifié régulièrement.",
    },
    {
        "t": "p",
        "text": "Les cas problématiques rencontrés en production sont ajoutés au dataset d'évaluation. Le système devient ainsi plus difficile à faire régresser à mesure qu'il vieillit.",
    },
    {"t": "h2", "num": "4.5", "title": "Gouvernance et pérennisation"},
    {
        "t": "p",
        "text": "Nous structurons la gouvernance pour inscrire le système dans la durée. Il est indispensable d'expliciter les responsabilités claires sur chaque brique, les processus de gestion de la demande, et le cycle de vie explicite des modèles et des consignes. Il faut aussi définir qui les modifie, selon quelle procédure et avec quelle validation.",
    },
    {
        "t": "panel",
        "title": "Livrables du troisième mois",
        "items": [
            "Premier usage en production, sur un périmètre défini et mesuré.",
            "Procédure de déploiement progressif et retour arrière testé.",
            "Alertes, seuils et procédures d'exploitation documentés.",
            "Tableau de bord de suivi : qualité, latence, coût, disponibilité, adoption.",
            "Modèle de gouvernance : responsabilités, instances, gestion de la demande.",
        ],
    },
    # ======================================================================
    {"t": "section", "num": "5", "title": "Et après les 90 jours ?", "accent": "magenta"},
    {
        "t": "p",
        "text": "En quatre-vingt-dix jours, nous passons **du cadrage à un premier usage en production**, en sécurisant les choix d'architecture, en construisant un socle industrialisé et en livrant un résultat mesurable.",
    },
    {
        "t": "p",
        "text": "Cette approche incrémentale, guidée par des résultats visibles, démontre rapidement la valeur et embarque les métiers autour d'indicateurs partagés.",
    },
    {
        "t": "p",
        "text": "Mais **le socle n'est pas une fin en soi**. La suite consiste à le faire évoluer vers une plateforme mature étant en capacité de supporter de nouveaux domaines de données, d'exposer des capacités sous forme de produits et d'interfaces réutilisables, de traiter l'information en temps réel pour être de plus en plus réactif si un besoin émerge, de faire que des systèmes agentiques soient capables d'enchaîner des actions, et d'optimiser l'inférence à mesure que le volume croît.",
    },
    {
        "t": "callout",
        "title": "En bref",
        "text": "En quatre-vingt-dix jours, nous concevons, construisons et mettons en service un système data-driven qui délivre de la valeur mesurable tout en préparant la suite. L'architecture, l'industrialisation et l'adoption avancent de concert, afin que la donnée devienne un levier durable de décision et non une démonstration de plus.",
        "accent": "magenta",
    },
    {"t": "h3", "title": "Votre feuille de route, en tant que décideur"},
    {
        "t": "p",
        "text": "Si vous êtes CTO, CPO, directeur de l'innovation ou responsable d'une ligne métier, construire ce socle est l'occasion de poser des fondations durables, sans surinvestir ni surcomplexifier. Sept questions suffisent à situer votre organisation :",
    },
    {
        "t": "numbered",
        "items": [
            "Savons-nous dire, sur des cas réels, ce qu'est une bonne réponse de notre système ?",
            "Connaissons-nous le coût d'une requête, et sa trajectoire si le trafic double ?",
            "Pouvons-nous changer de fournisseur de modèle sans réécrire l'application ?",
            "Une modification de consigne est-elle tracée, testée et réversible comme un changement de code ?",
            "Savons-nous détecter une baisse de qualité avant que les utilisateurs ne la signalent ?",
            "Nos données sensibles sortent-elles de l'organisation, et sous quelles garanties contractuelles ?",
            "Si notre prestataire partait demain, notre équipe saurait-elle exploiter le système ?",
        ],
    },
    {
        "t": "p",
        "text": "Une réponse négative n'est pas un problème mais plutôt un point de départ, et l'ordre de ces questions donne l'ordre des travaux.",
    },
    {"t": "h3", "title": "Besoin d'être accompagné dans vos projets data-driven ?"},
    {
        "t": "p",
        "text": "Computeflux est un studio d'ingénierie français. Nous fournissons les ingénieurs IA, ingénieurs data et architectes dont votre projet a besoin pour atteindre la production avec méthode, mesure et sens du concret.",
    },
    {
        "t": "contact",
        "lines": [
            ("Écrire", "gabriel.mougard@gmail.com", "mailto:gabriel.mougard@gmail.com"),
            ("Site", "computeflux.xyz", "https://computeflux.xyz"),
            ("Prendre rendez-vous", "computeflux.xyz/book", "https://computeflux.xyz/book"),
            ("LinkedIn", "linkedin.com/company/computeflux-xyz", "https://www.linkedin.com/company/computeflux-xyz"),
        ],
        "note": "Diagnostic de maturité, atelier d'architecture ou renfort d'équipe : dites-nous où vous en êtes, nous vous dirons par où commencer.",
    },
]

# ---------
# Last page
# ---------

RESOURCES = {
    "title": "Ressources",
    "intro": "Pour prolonger la lecture, quelques publications Computeflux sur les sujets abordés dans ce guide.",
    "groups": [
        {
            "title": "Articles",
            "items": [
                ("Ce qu'est vraiment l'ingénierie IA", "computeflux.xyz/articles/what-is-ai-engineering", "https://computeflux.xyz/articles/what-is-ai-engineering"),
                ("Agents : de la démonstration à la production", "computeflux.xyz/articles/agent-demo-vs-production", "https://computeflux.xyz/articles/agent-demo-vs-production"),
                ("Les optimisations d'inférence qui tiennent en production", "computeflux.xyz/articles/inference-optimizations-that-work", "https://computeflux.xyz/articles/inference-optimizations-that-work"),
            ],
        },
        {
            "title": "Études de cas",
            "items": [
                ("Edge e-commerce: Le paiement est le produit", "computeflux.xyz/studies/mobile-money-payment-processor", "https://computeflux.xyz/studies/mobile-money-payment-processor"),
                ("Edge e-commerce: Le catalogue est un artefact", "computeflux.xyz/studies/edge-serving-layer", "https://computeflux.xyz/studies/edge-serving-layer"),
                ("Edge e-commerce: Signals first-party, sans tracker", "computeflux.xyz/studies/first-party-signal-dco-newsletter", "https://computeflux.xyz/studies/first-party-signal-dco-newsletter"),
            ],
        },
        {
            "title": "Nos expertises",
            "items": [
                ("Ingénierie IA", "computeflux.xyz/expertise/ai-engineering", "https://computeflux.xyz/expertise/ai-engineering"),
                ("Ingénierie de la donnée", "computeflux.xyz/expertise/data-engineering", "https://computeflux.xyz/expertise/data-engineering"),
                ("Optimisation de l'inférence", "computeflux.xyz/expertise/inference-optimization", "https://computeflux.xyz/expertise/inference-optimization"),
            ],
        },
    ],
}

FIGURES = {
    "plan90": {
        "kind": "columns",
        "columns": [
            {
                "label": "MOIS 01",
                "title": "Cadrage et architecture",
                "items": [
                    "Note de cadrage",
                    "Dataset d'évaluation",
                    "Scénarios et décision",
                    "Architecture cible",
                ],
                "accent": "blue",
            },
            {
                "label": "MOIS 02",
                "title": "Construction du socle",
                "items": [
                    "Infrastructure as code",
                    "Données et contexte",
                    "Séquence d'inférence",
                    "Garde-fous et CI/CD",
                ],
                "accent": "magenta",
            },
            {
                "label": "MOIS 03",
                "title": "Mise en production",
                "items": [
                    "Déploiement progressif",
                    "Exploitation et alertes",
                    "Mesure et backlog",
                    "Gouvernance",
                ],
                "accent": "amber",
            },
        ],
        "axis": ("Décider", "Construire", "Exploiter"),
    },
    "bricks": {
        "kind": "grid",
        "items": [
            ("01", "Sources et ingestion", "Collecter les données métier de façon fiable."),
            ("02", "Socle de données et contexte", "Normaliser, découper, indexer ce que le modèle va traiter."),
            ("03", "Modèles et inférence", "Servir les modèles : cache, routage, lots, repli."),
            ("04", "Orchestration et agents", "Enchaîner les étapes, appeler les outils, gérer les reprises."),
            ("05", "Garde-fous et sécurité", "Valider les entrées et les sorties, cloisonner, tracer."),
            ("06", "Observabilité et FinOps", "Mesurer la qualité, la latence et le coût par requête."),
        ]
    },
    "chain": {
        "kind": "pipeline",
        "steps": [
            "Requête",
            "Passerelle et quotas",
            "Garde-fous d'entrée",
            "Récupération du contexte",
            "Cache et routage",
            "Modèle",
            "Garde-fous de sortie",
            "Réponse",
        ],
        "rail_top": "Journalisation et traçabilité de bout en bout",
        "rail_bottom": "Mesure : qualité, latence, coût par requête",
    },
    "loop": {
        "kind": "cycle",
        "steps": [
            ("Changement", "Consigne, modèle, récupération ou code."),
            ("Évaluation", "Le jeu de cas est rejoué automatiquement."),
            ("Comparaison", "Écart mesuré avec la version en service."),
            ("Décision", "Déploiement, correction ou abandon."),
        ],
        "feedback": "Les cas rencontrés en production enrichissent le jeu d'évaluation",
    },
}

DIAGRAM_LABELS = {
    "architecture": {
        "data_pkg": "CONTEXTE (CHEMIN DE LA DONNÉE)",
        "sources_title": "Sources métier",
        "sources_note": "applications, fichiers, API",
        "ingest_title": "Ingestion et qualité",
        "chunk_title": "Normalisation et splitting",
        "index_title": "Index de recherche",
        "index_note": "moteur remplaçable",
        "service_pkg": "SERVICE (CHEMIN DE LA REQUÊTE)",
        "app_title": "Application métier",
        "guards_title": "Garde-fous entrée et sortie",
        "guards_note": "validation, cloisonnement, logs",
        "gateway_title": "Passerelle d'inférence",
        "gateway_note": "quotas, cache, routage, repli",
        "managed_title": "Modèle managé",
        "selfhosted_title": "Modèle auto-hébergé",
        "infra_pkg": "SOCLE D'EXÉCUTION",
        "iac_title": "Infrastructure as code, environnements séparés, secrets et accès",
        "iac_note": "hébergement réversible",
        "edge_context": "contexte",
    },
}
