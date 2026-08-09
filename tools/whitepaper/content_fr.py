"""
Contenu français du livre blanc Computeflux.

Le document est décrit comme une suite de blocs typés, consommés par
`whitepaper.py`. Séparer le fond de la mise en page permet de relire le texte
sans lire de code, et de produire une autre édition (anglaise, ou un autre
guide) en ne remplaçant que ce fichier.

Conventions d'écriture
----------------------
* `**gras**` met en valeur une notion, jamais une phrase entière.
* La ponctuation double (: ; ! ?) et les guillemets « » sont espacés
  automatiquement par `typo.fr()` — écrire normalement.
* Aucun chiffre de performance invérifiable : la méthode se défend par sa
  logique, pas par des pourcentages inventés.

Types de blocs
--------------
section      page de garde de partie (grand numéral + titre)
h1/h2/h3     titres (h2 porte un numéro « 2.3 »)
lead         chapeau de partie
p            paragraphe justifié
bullets      liste à puces (accepte du **gras** en amorce)
numbered     liste numérotée
callout      encadré accentué (« En bref »)
deliverables encadré « Livrables »
figure       schéma vectoriel dessiné par le générateur
image        photographie ou emplacement décrit à produire
table        tableau comparatif
pagebreak    saut de page forcé
resources    dernière page de liens
"""

from __future__ import annotations


META = {
    "eyebrow": "GUIDE",
    "title": "Méthodologie : les étapes clés pour mettre un système d'IA en production en 90 jours",
    "subtitle": "L'approche Computeflux.",
    "running_head": "Guide — Mettre un système d'IA en production en 90 jours",
    "site": "computeflux.xyz",
    "edition": "Édition 2026",
    "author": "Computeflux",
    "keywords": "IA en production, ingénierie IA, inférence, données, agents, FinOps, souveraineté",
}

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
    "observabilite": {
        "path": None,
        "caption": "Vue d'exploitation : qualité, latence au 95e centile et coût par requête sur un même écran.",
        "brief": (
            "CAPTURE À PRODUIRE — tableau de bord d'observabilité anonymisé, exporté en PNG "
            "à 2400 px de large, fond clair (#F5F4EF), sans identifiant client. Trois "
            "panneaux alignés sur une ligne : (1) taux de réussite sur le jeu d'évaluation "
            "par version, (2) latence de bout en bout aux 50e et 95e centiles, (3) coût par "
            "requête cumulé sur la période. Courbes en bleu #2F6BFF et magenta #E11FD0, "
            "grille en #DCD7CB, libellés en JetBrains Mono. Les valeurs peuvent être "
            "synthétiques mais doivent rester plausibles et non commentées dans le texte."
        ),
    },
    "architecture": {
        "path": None,
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
        "text": "Ce document s'adresse aux décideurs qui souhaitent comprendre, sans entrer dans une technicité excessive, comment, chez **Computeflux**, nous concevons, construisons et mettons en production un système d'IA en quatre-vingt-dix jours.",
    },
    {
        "t": "p",
        "text": "Il s'appuie sur notre pratique de l'ingénierie IA et de l'ingénierie de la donnée : chaînes d'inférence, pipelines de données et systèmes agentiques destinés à fonctionner sous trafic réel, avec des exigences de latence, de coût et de conformité.",
    },
    {
        "t": "p",
        "text": "Notre proposition est simple : transformer une fonctionnalité d'IA prometteuse en **un service mesuré, borné en coût et exploitable par vos équipes**.",
    },
    {
        "t": "p",
        "text": "Le contexte a changé. Assembler un modèle, quelques documents et une interface prend aujourd'hui quelques jours ; la démonstration est devenue facile. Ce qui reste difficile n'a pas bougé : tenir la charge, prouver la qualité, contenir la facture, corriger sans régresser, et rendre l'ensemble exploitable par une équipe qui n'a pas écrit le code.",
    },
    {
        "t": "p",
        "text": "C'est cet écart — entre le prototype qui convainc en réunion et le service qui tient en production — que cette méthode adresse.",
    },
    {
        "t": "p",
        "text": "**Mettre un système d'IA en production n'est pas un problème de modèle.** C'est un projet d'ingénierie, d'organisation et de conduite du changement. Une mise en œuvre mal cadrée produit trois symptômes reconnaissables : un coût d'inférence que personne ne sait expliquer, une qualité que personne ne sait démontrer, et un service que personne n'ose brancher sur le parcours client.",
    },
    {
        "t": "p",
        "text": "Ce guide décrit une trajectoire en trois temps : un mois de cadrage et d'architecture, un mois de construction du socle, un mois de mise en production et d'exploitation. Les durées sont indicatives et s'ajustent au contexte ; le séquencement, lui, ne varie pas.",
    },
    {"t": "figure", "key": "plan90", "caption": "La trajectoire en quatre-vingt-dix jours."},
    # ======================================================================
    {"t": "section", "num": "1", "title": "Notre philosophie", "accent": "blue"},
    {
        "t": "lead",
        "text": "Notre approche tient dans une phrase : on ne pilote que ce que l'on mesure. Le choix du modèle, celui de l'hébergement et le niveau d'automatisation en découlent — jamais l'inverse.",
    },
    {"t": "h2", "num": "1.1", "title": "Les principes fondateurs"},
    {
        "t": "p",
        "text": "Six principes structurent chacune de nos interventions. Ils ne sont ni négociables ni décoratifs : ce sont eux qui déterminent l'ordre des travaux.",
    },
    {
        "t": "bullets",
        "items": [
            "**Mesurer avant d'optimiser.** Un système d'IA sans jeu d'évaluation n'est pas améliorable : il est seulement modifiable. Nous établissons dès le cadrage une définition explicite de ce qu'est une bonne réponse, et le jeu de cas qui permet de la vérifier à chaque changement.",
            "**Le modèle n'est qu'un composant.** L'essentiel de la fiabilité se joue autour de lui : préparation et récupération du contexte, garde-fous, gestion des erreurs, reprises, cache, limitation de débit. C'est cette ingénierie qui sépare une démonstration d'un service.",
            "**Le coût unitaire est une contrainte de conception.** Le coût par requête, ou par tâche métier traitée, se décide à l'architecture et non à la réception de la facture. Nous l'estimons dès les scénarios, puis nous le suivons comme un indicateur de production à part entière.",
            "**Modularité et réversibilité.** Le fournisseur de modèles est isolé derrière une interface stable, afin d'en changer sans réécrire l'application. Aucune brique ne doit devenir irremplaçable, ni techniquement, ni contractuellement.",
            "**Souveraineté proportionnée.** Le niveau de contrôle — service managé, hébergement européen, exécution sur votre propre infrastructure — se choisit selon la sensibilité des données et les obligations réglementaires, pas par posture.",
            "**Autonomie des équipes.** Notre objectif est que vos équipes exploitent le système sans nous. La documentation, la montée en compétence et l'accompagnement au démarrage font partie du périmètre, jamais des options.",
        ],
    },
    {"t": "h2", "num": "1.2", "title": "Comment nous mesurons le succès d'un projet"},
    {
        "t": "p",
        "text": "Évaluer un système d'IA est plus délicat qu'évaluer une application classique : la sortie est probabiliste, la notion de « correct » dépend du métier, et une amélioration visible sur un cas peut dégrader les autres. Nous retenons donc un jeu d'indicateurs restreint, défini **avant** la construction et adapté au contexte :",
    },
    {
        "t": "bullets",
        "items": [
            "la qualité mesurée sur un jeu d'évaluation représentatif, suivie version après version ;",
            "la latence de bout en bout observée au 95e centile, sur le parcours complet et non sur le seul appel au modèle ;",
            "le coût par requête, ou par tâche métier traitée ;",
            "le taux d'échec et de reprise : erreurs, dépassements de délai, réponses écartées par les garde-fous ;",
            "la disponibilité du service et le délai de retour à la normale après incident ;",
            "l'adoption réelle : la part des utilisateurs ou des flux qui passent effectivement par le système.",
        ],
    },
    {
        "t": "p",
        "text": "L'essentiel n'est pas de multiplier les métriques, mais d'en retenir trois à cinq qui éclairent une décision. Un indicateur qui ne déclenche jamais d'action n'est pas un indicateur : c'est une décoration.",
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
        "text": "Le premier mois ne produit pas de code destiné à la production. Il produit des décisions — et les éléments qui permettent de les défendre six mois plus tard.",
    },
    {
        "t": "p",
        "text": "Cette phase vise à aligner la solution technique sur les objectifs stratégiques, les besoins métier et les contraintes de l'organisation. Elle dresse un état des lieux des données et des usages existants, et clarifie les attentes des parties prenantes avant que le premier euro d'infrastructure ne soit engagé.",
    },
    {"t": "h2", "num": "2.1", "title": "Cadrage et compréhension du contexte"},
    {
        "t": "p",
        "text": "Nous organisons des ateliers avec les directions concernées, analysons les documents existants et cartographions les sources de données, les cas d'usage prioritaires et les irritants opérationnels. Ce travail aboutit à une **note de cadrage** qui fixe les objectifs de l'intervention, le périmètre, les priorités, les risques identifiés et le calendrier.",
    },
    {
        "t": "p",
        "text": "Un point mérite une attention particulière : la nature de la tâche confiée au système. Assister un opérateur qui garde la décision, ou automatiser un traitement de bout en bout, ne demandent ni le même niveau de qualité, ni les mêmes garde-fous, ni le même budget. Trancher tôt évite de reconstruire tard.",
    },
    {"t": "image", "key": "cadrage"},
    {"t": "h2", "num": "2.2", "title": "Définir « correct » : le jeu d'évaluation comme premier livrable"},
    {
        "t": "p",
        "text": "C'est la principale différence entre un projet d'IA et un projet logiciel classique, et le point le plus souvent négligé. Avant de construire, nous constituons avec vos experts métier un **jeu d'évaluation** : un ensemble de cas réels, représentatifs, accompagnés du résultat attendu et du critère qui permet de juger une réponse acceptable.",
    },
    {
        "t": "p",
        "text": "Ce jeu couvre le fonctionnement nominal, les cas limites et les cas où le système doit refuser de répondre ou passer la main à un humain. Il devient la référence commune du projet : toute modification — nouveau modèle, nouvelle consigne, nouvelle stratégie de récupération — est mesurée contre lui.",
    },
    {
        "t": "p",
        "text": "Sans cette référence, les arbitrages se règlent à l'impression et les régressions se découvrent en production. Avec elle, une décision d'architecture devient discutable sur des faits.",
    },
    {"t": "h2", "num": "2.3", "title": "Hypothèses, contraintes et exigences non fonctionnelles"},
    {
        "t": "p",
        "text": "Nous identifions les contraintes **techniques, juridiques, de sécurité, environnementales et réglementaires**, puis posons des hypothèses chiffrées — volumétrie, trafic attendu, budget, délais, taille et compétences de l'équipe — afin d'en déduire un cadre opérationnel explicite.",
    },
    {
        "t": "p",
        "text": "Trois exigences pèsent particulièrement sur l'architecture d'un système d'IA :",
    },
    {
        "t": "bullets",
        "items": [
            "**la latence acceptable**, qui détermine la place du modèle dans le parcours, la taille du contexte transmis et la possibilité de traiter par lots ;",
            "**la confidentialité des données**, qui conditionne le lieu d'exécution du modèle et la nature des journaux conservés ;",
            "**le budget d'exploitation**, qui fixe le compromis entre la qualité recherchée et le coût par requête soutenable.",
        ],
    },
    {
        "t": "p",
        "text": "Ces exigences sont documentées, datées et opposables. Lorsqu'elles évoluent, l'architecture évolue explicitement plutôt que par dérive.",
    },
    {"t": "h2", "num": "2.4", "title": "Les six briques d'un système d'IA en production"},
    {
        "t": "p",
        "text": "Pour chaque brique, nous comparons les solutions du marché au regard de critères fonctionnels, techniques, opérationnels, de conformité et de coût, établis lors des étapes précédentes. Le résultat est un **tableau comparatif argumenté**, adossé à une matrice pondérée qui documente les critères et motive la recommandation finale.",
    },
    {"t": "figure", "key": "bricks", "caption": "Les six briques d'un système d'IA en production."},
    {
        "t": "p",
        "text": "Cette décomposition sert aussi de grille de lecture de l'existant : dans la plupart des organisations, deux ou trois de ces briques sont déjà en place et n'ont pas à être reconstruites.",
    },
    {"t": "h2", "num": "2.5", "title": "Scénarios d'architecture"},
    {
        "t": "p",
        "text": "Nous élaborons ensuite plusieurs scénarios répondant à des priorités différentes. Aucun n'est supérieur en soi : chacun optimise une variable au détriment d'une autre, et le choix appartient au client, éclairé par les documents remis.",
    },
    {
        "t": "table",
        "caption": "Trois scénarios types, à arbitrer selon la sensibilité des données et le trafic attendu.",
        "cols": ["Scénario", "Ce qu'il optimise", "Ce qu'il coûte", "Contexte typique"],
        "widths": [30, 44, 44, 44],
        "rows": [
            [
                "Service managé",
                "Le délai de mise sur le marché et la simplicité d'exploitation.",
                "Une dépendance forte au fournisseur et un coût variable peu compressible.",
                "Premier usage, volumétrie modérée, données peu sensibles.",
            ],
            [
                "Plateforme souveraine",
                "Le contrôle des données, la maîtrise du coût unitaire à volume élevé.",
                "Un investissement initial et des compétences d'exploitation internes.",
                "Données réglementées, trafic soutenu et prévisible.",
            ],
            [
                "Hybride",
                "L'ajustement fin : le bon modèle, au bon endroit, pour chaque tâche.",
                "Une complexité de routage et d'observation supérieure.",
                "Portefeuille d'usages hétérogènes, exigences mixtes.",
            ],
        ],
    },
    {
        "t": "p",
        "text": "Chaque scénario est chiffré sur les mêmes hypothèses de trafic, évalué sur le même jeu de cas, et accompagné de son plan de sortie : que faudrait-il faire, et à quel coût, pour en changer dans un an ?",
    },
    {"t": "h2", "num": "2.6", "title": "Décision et livrables de fin du premier mois"},
    {
        "t": "p",
        "text": "La décision fige l'architecture cible, les outils et la feuille de route de construction. Elle est prise en comité, tracée, et assortie des critères qui justifieraient de la revoir.",
    },
    {"t": "image", "key": "architecture"},
    {
        "t": "deliverables",
        "title": "Livrables du premier mois",
        "items": [
            "Note de cadrage : objectifs, périmètre, priorités, risques, calendrier.",
            "Jeu d'évaluation initial et définition partagée de la réponse acceptable.",
            "Registre des hypothèses, contraintes et exigences non fonctionnelles.",
            "Comparatif argumenté des solutions et matrice de décision pondérée.",
            "Architecture cible (High Level Design), plan d'adoption et, si nécessaire, plan de migration.",
        ],
    },
    # ======================================================================
    {"t": "section", "num": "3", "title": "Deuxième mois :\nConstruction du socle", "accent": "amber"},
    {
        "t": "lead",
        "text": "L'architecture cible et la feuille de route étant arrêtées, la construction peut commencer. L'objectif du deuxième mois est de transformer une architecture théorique en un socle opérationnel et industrialisé.",
    },
    {"t": "h2", "num": "3.1", "title": "Infrastructure et environnements"},
    {
        "t": "p",
        "text": "Nous provisionnons l'infrastructure **en tant que code**, afin d'en garantir la reproductibilité, et définissons les environnements de développement, de test, de recette et de production. La gestion des secrets, le cloisonnement réseau et la politique d'accès sont posés à ce stade, pas après le premier incident.",
    },
    {
        "t": "p",
        "text": "Lorsque le scénario retenu suppose une exécution sur accélérateurs matériels, cette étape inclut le dimensionnement de la capacité et la stratégie d'allocation : réservation, mutualisation entre équipes, et comportement attendu en cas de saturation.",
    },
    {"t": "image", "key": "socle"},
    {"t": "h2", "num": "3.2", "title": "Socle de données et gestion du contexte"},
    {
        "t": "p",
        "text": "La qualité d'un système d'IA est d'abord celle du contexte qu'on lui fournit. Cette étape comprend :",
    },
    {
        "t": "bullets",
        "items": [
            "le développement des **pipelines d'ingestion**, qui font transiter la donnée d'une source vers une destination de manière fiable et rejouable ;",
            "la **normalisation et le découpage des documents**, condition de pertinence de la recherche : un mauvais découpage dégrade la qualité plus sûrement qu'un mauvais modèle ;",
            "la **construction de l'index de recherche** et le réglage de la stratégie de récupération, évaluée sur le jeu de cas et non sur des exemples choisis ;",
            "la **gestion de la fraîcheur** : que se passe-t-il lorsqu'un document change, est supprimé, ou devient confidentiel ?",
            "la **propagation des droits d'accès** jusqu'au niveau du document, afin qu'un utilisateur n'obtienne jamais, par l'intermédiaire du système, une information à laquelle il n'a pas droit ;",
            "la définition de **contrats de données** stabilisant les interfaces entre producteurs et consommateurs.",
        ],
    },
    {"t": "h2", "num": "3.3", "title": "La chaîne d'inférence"},
    {
        "t": "p",
        "text": "La chaîne d'inférence est l'ensemble des traitements traversés par une requête, de sa réception à la réponse rendue. La concevoir explicitement — plutôt que de la laisser émerger — permet d'y placer les points de mesure, de reprise et de maîtrise du coût.",
    },
    {"t": "figure", "key": "chain", "caption": "Le trajet d'une requête, de la réception à la réponse."},
    {
        "t": "p",
        "text": "Quatre leviers y sont réglés ensemble, car ils interagissent : la **mise en cache** des résultats et des contextes récurrents, le **routage** vers un modèle proportionné à la difficulté de la tâche, le **traitement par lots** des requêtes non interactives, et le **repli** vers un chemin dégradé lorsque le fournisseur principal est indisponible.",
    },
    {"t": "h2", "num": "3.4", "title": "Garde-fous, sécurité et conformité"},
    {
        "t": "p",
        "text": "Un système d'IA exposé à des utilisateurs, internes ou externes, présente une surface d'attaque et de dérive qui lui est propre. Nous mettons en place la validation des entrées et des sorties, la détection des tentatives de détournement des consignes, le cloisonnement des outils que le système est autorisé à appeler, et la journalisation intégrale des décisions à des fins de traçabilité.",
    },
    {
        "t": "p",
        "text": "Le traitement des données personnelles est cadré à ce stade : minimisation, durée de conservation des journaux, anonymisation, et localisation des traitements. Lorsque l'usage relève d'une catégorie réglementée, la documentation exigée est produite pendant la construction, quand elle coûte peu, et non après, quand elle bloque une mise en production.",
    },
    {"t": "h2", "num": "3.5", "title": "Industrialisation et évaluation continue"},
    {
        "t": "p",
        "text": "L'industrialisation est ce qui permet à une équipe de modifier le système sans crainte. Elle repose sur des chaînes d'intégration et de déploiement continus — tests automatiques, revues de code, déploiements contrôlés — et sur une pratique spécifique à l'IA : **l'évaluation rejouée à chaque changement**.",
    },
    {"t": "figure", "key": "loop", "caption": "La boucle d'évaluation continue : aucun changement ne part en production sans avoir été mesuré."},
    {
        "t": "p",
        "text": "Une modification de consigne, un changement de version de modèle ou une évolution de la stratégie de récupération déclenchent la même chose qu'une modification de code : une exécution du jeu d'évaluation, une comparaison avec la version précédente, et une décision documentée. Le jeu d'évaluation s'enrichit en retour des cas réels rencontrés en production.",
    },
    {"t": "h2", "num": "3.6", "title": "Observabilité et maîtrise des coûts"},
    {
        "t": "p",
        "text": "Nous instrumentons le système de bout en bout : traces complètes d'une requête, métriques de qualité, de latence et d'erreur, et **coût rattaché à chaque appel**. Le coût cesse alors d'être une ligne de facture mensuelle pour devenir une donnée d'exploitation, ventilable par usage, par équipe et par version.",
    },
    {"t": "image", "key": "observabilite"},
    {
        "t": "p",
        "text": "Cette instrumentation sert deux publics : les équipes techniques, qui diagnostiquent, et la direction, qui arbitre. C'est la condition d'un dispositif FinOps qui pilote réellement l'usage plutôt que de le constater.",
    },
    {"t": "h2", "num": "3.7", "title": "Documentation et transfert de compétences"},
    {
        "t": "p",
        "text": "Notre objectif est que **vos équipes soient pleinement autonomes sur le système et maîtrisent ce que nous avons produit**. Il ne s'agit pas de créer une dépendance, mais de transmettre un socle opérationnel clair, documenté et appropriable. Le transfert s'organise en trois volets :",
    },
    {
        "t": "bullets",
        "items": [
            "**la documentation** : architecture et décisions, catalogue des données et lignage, procédures d'exploitation, guides orientés cas d'usage ;",
            "**la montée en compétence** : formations par rôle, sessions de programmation en binôme sur de vraies évolutions, afin que les équipes prennent la main sur des changements réels ;",
            "**l'accompagnement au démarrage** : rituels d'exploitation, revues avant mise en production, gestion des premières alertes.",
        ],
    },
    {
        "t": "deliverables",
        "title": "Livrables du deuxième mois",
        "items": [
            "Infrastructure décrite en code, environnements séparés, gestion des secrets et des accès.",
            "Pipelines d'ingestion, index de recherche et contrats de données en fonctionnement.",
            "Chaîne d'inférence instrumentée : cache, routage, traitement par lots, repli.",
            "Garde-fous, journalisation et documentation de conformité.",
            "Chaîne de déploiement continu incluant l'exécution automatique du jeu d'évaluation.",
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
        "text": "Un bon périmètre de lancement réunit trois propriétés : un volume suffisant pour que les mesures soient significatives, une population d'utilisateurs identifiée et joignable, et un chemin de repli manuel si le système est indisponible.",
    },
    {"t": "h2", "num": "4.2", "title": "Déploiement progressif"},
    {
        "t": "p",
        "text": "La bascule ne se fait jamais d'un bloc. Nous procédons par étapes, chacune assortie de son critère de passage et de son critère d'arrêt :",
    },
    {
        "t": "numbered",
        "items": [
            "**Exécution en observation** : le système traite le trafic réel sans que ses réponses soient exposées ; elles sont comparées à la pratique existante.",
            "**Ouverture progressive** : une fraction du trafic est servie par le système, sous surveillance rapprochée de la qualité, de la latence et du coût.",
            "**Généralisation** : le périmètre est étendu, le chemin de retour arrière restant disponible et testé.",
        ],
    },
    {
        "t": "p",
        "text": "À chaque étape, la décision de poursuivre s'appuie sur les indicateurs définis au premier mois. Un retour arrière n'est pas un échec de projet : c'est le mécanisme qui rend le déploiement acceptable.",
    },
    {"t": "h2", "num": "4.3", "title": "Exploitation : incidents, astreinte et procédures"},
    {
        "t": "p",
        "text": "Un système d'IA connaît des modes de défaillance inhabituels : dégradation silencieuse de la qualité, dérive des données d'entrée, indisponibilité d'un fournisseur, emballement du coût. Nous définissons les alertes correspondantes, les seuils qui les déclenchent, et les procédures d'intervention associées.",
    },
    {
        "t": "p",
        "text": "Les procédures répondent à des questions simples et écrites à l'avance : que fait-on si le fournisseur principal est indisponible ? Si la qualité baisse sans qu'aucun déploiement n'ait eu lieu ? Si le coût journalier dépasse le seuil convenu ?",
    },
    {"t": "image", "key": "exploitation"},
    {"t": "h2", "num": "4.4", "title": "Mesure et amélioration continue"},
    {
        "t": "p",
        "text": "Le succès de l'usage est suivi par les indicateurs définis en amont : qualité, latence, coût unitaire, disponibilité, adoption. Les traces d'exécution et les retours des utilisateurs alimentent un backlog d'améliorations priorisé et planifié régulièrement.",
    },
    {
        "t": "p",
        "text": "Les cas problématiques rencontrés en production sont ajoutés au jeu d'évaluation. Le système devient ainsi plus difficile à faire régresser à mesure qu'il vieillit — propriété rare, et déterminante sur la durée.",
    },
    {"t": "h2", "num": "4.5", "title": "Gouvernance et pérennisation"},
    {
        "t": "p",
        "text": "Nous structurons la gouvernance pour inscrire le système dans la durée : responsabilités claires sur chaque brique, instance d'arbitrage des évolutions, processus de gestion de la demande, et cycle de vie explicite des modèles et des consignes — qui les modifie, selon quelle procédure, avec quelle validation.",
    },
    {
        "t": "deliverables",
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
        "text": "Mais **le socle n'est pas une fin en soi**. La suite consiste à le faire évoluer vers une plateforme mature : extension à de nouveaux domaines de données, exposition des capacités sous forme de produits et d'interfaces réutilisables, traitement en temps réel, systèmes agentiques capables d'enchaîner des actions, et optimisation de l'inférence à mesure que le volume croît.",
    },
    {
        "t": "callout",
        "title": "En bref",
        "text": "En quatre-vingt-dix jours, nous concevons, construisons et mettons en service un système d'IA qui délivre de la valeur mesurable tout en préparant la suite. L'architecture, l'industrialisation et l'adoption avancent de concert, afin que l'IA devienne un levier durable de décision et non une démonstration de plus.",
        "accent": "magenta",
    },
    {"t": "h3", "title": "Votre feuille de route, en tant que décideur"},
    {
        "t": "p",
        "text": "Si vous êtes CTO, CDO, directeur de l'innovation ou responsable d'une ligne métier, construire ce socle est l'occasion de poser des fondations durables, sans surinvestir ni surcomplexifier. Sept questions suffisent à situer votre organisation :",
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
        "text": "Une réponse négative n'est pas un problème : c'est un point de départ, et l'ordre de ces questions donne l'ordre des travaux.",
    },
    {"t": "h3", "title": "Besoin d'être accompagné dans vos projets IA et data ?"},
    {
        "t": "p",
        "text": "Computeflux est un studio d'ingénierie français. Nous fournissons les ingénieurs IA, ingénieurs data et architectes dont votre projet a besoin pour atteindre la production — avec méthode, mesure et sens du concret.",
    },
    {
        "t": "contact",
        "lines": [
            ("Écrire", "hello@computeflux.xyz", "mailto:hello@computeflux.xyz"),
            ("Site", "computeflux.xyz", "https://computeflux.xyz"),
            ("Prendre rendez-vous", "computeflux.xyz/book", "https://computeflux.xyz/book"),
            ("LinkedIn", "linkedin.com/company/computeflux", "https://www.linkedin.com/company/computeflux"),
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
                ("Maîtrise du coût d'inférence dans la fintech", "computeflux.xyz/studies/fintech-inference-cost", "https://computeflux.xyz/studies/fintech-inference-cost"),
                ("Fiabiliser l'exploitation d'un système agentique", "computeflux.xyz/studies/agentic-ops-reliability", "https://computeflux.xyz/studies/agentic-ops-reliability"),
                ("Pipeline d'ingestion à haut débit", "computeflux.xyz/studies/rust-ingestion-pipeline", "https://computeflux.xyz/studies/rust-ingestion-pipeline"),
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
        "columns": [
            {
                "label": "MOIS 01",
                "title": "Cadrage et architecture",
                "items": [
                    "Note de cadrage",
                    "Jeu d'évaluation",
                    "Scénarios et décision",
                    "Architecture cible",
                ],
                "accent": "blue",
            },
            {
                "label": "MOIS 02",
                "title": "Construction du socle",
                "items": [
                    "Infrastructure en code",
                    "Données et contexte",
                    "Chaîne d'inférence",
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
        "items": [
            ("01", "Sources et ingestion", "Collecter les données métier de façon fiable et rejouable."),
            ("02", "Socle de données et contexte", "Normaliser, découper, indexer : ce que le modèle aura sous les yeux."),
            ("03", "Modèles et inférence", "Servir les modèles : cache, routage, lots, repli."),
            ("04", "Orchestration et agents", "Enchaîner les étapes, appeler les outils, gérer les reprises."),
            ("05", "Garde-fous et sécurité", "Valider les entrées et les sorties, cloisonner, tracer."),
            ("06", "Observabilité et FinOps", "Mesurer la qualité, la latence et le coût par requête."),
        ]
    },
    "chain": {
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
        "rail_bottom": "Mesure : qualité · latence · coût par requête",
    },
    "loop": {
        "steps": [
            ("Changement", "Consigne, modèle, récupération ou code."),
            ("Évaluation", "Le jeu de cas est rejoué automatiquement."),
            ("Comparaison", "Écart mesuré avec la version en service."),
            ("Décision", "Déploiement, correction ou abandon — tracé."),
        ],
        "feedback": "Les cas rencontrés en production enrichissent le jeu d'évaluation",
    },
}
