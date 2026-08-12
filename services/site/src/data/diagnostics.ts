import type { Locale } from "@i18n";

export type ChartKind = "bars" | "spark" | "split";

export type CaseChart = {
  kind: ChartKind;
  data: number[];
  labels: string[];
};

export type CaseTool = {
  name: string;
  si: string;
  reason: string;
};

export type DiagCase = {
  slug: string;
  label: string;
  cause: string;
  causeChart?: CaseChart;
  action: string;
  actionChart?: CaseChart;
  cta: string;
  tools: CaseTool[];
  morePath: string;
};

const fr: DiagCase[] = [
  {
    slug: "data-quality",
    label: "Des données sales qui dérivent",
    cause:
      "Les schémas changent, les sources renvoient du vide, et les motifs du monde réel bougent sans prévenir. Les modèles apprennent sur un passé qui n'existe déjà plus, et personne ne voit la dérive arriver.",
    causeChart: {
      kind: "bars",
      data: [18, 12, 61, 6, 43, 28, 9, 33, 54, 11],
      labels: ["", "", "", "", "", "", "", "", "", ""],
    },
    action:
      "On pose des contrats de données, des contrôles de qualité à chaque étape et des alertes de dérive (statistiques, fraîcheur, schémas). La qualité devient une propriété mesurée du pipeline, pas une blague découverte le lundi.",
    actionChart: { kind: "spark", data: [48, 58, 66, 78, 87, 94, 99, 100], labels: [] },
    tools: [
      {
        name: "Kafka",
        si: "Apachekafka",
        reason: "Chaque événement porte son schéma et son historique : quand le monde change, on le voit, et on peut rejouer.",
      },
      {
        name: "DuckDB",
        si: "Duckdb",
        reason: "Validation et requêtes d'ombrage instantanées : on approuve un changement de schéma en secondes, pas en jours.",
      },
      {
        name: "Polars",
        si: "Polars",
        reason: "Des contrôles de qualité sur de larges volumes exécutés en multi-cœur, sans cluster à maintenir.",
      },
      {
        name: "Spark",
        si: "Apachespark",
        reason: "Pour les contrôles à l'échelle du lac entier, Spark en distribue l'exécution sans réécrire les règles.",
      },
    ],
    cta: "Parler de qualité de données",
    morePath: "/expertise/data-engineering",
  },
  {
    slug: "unstructured",
    label: "Nos données ne tiennent pas dans des tableaux",
    cause:
      "Textes, audio, vidéo, scans : la donnée brute explose en volume et ne rentre dans aucune table. Les pipelines existants la jettent ou l'ingèrent en noir, sans structure ni recherche.",
    causeChart: {
      kind: "split",
      data: [22, 100],
      labels: ["Données tabulaires", "Non structurées"],
    },
    action:
      "On construit la chaîne d'extraction : transcription et embeddings, indexation multimodale, puis stockage et recherche unifiés. Le sens de vos documents devient interrogable, pas enterré.",
    actionChart: {
      kind: "bars",
      data: [40, 78, 100],
      labels: ["Extraction", "Indexation", "Recherche"],
    },
    tools: [
      {
        name: "Python",
        si: "Python",
        reason: "L'écosystème multimédia (audio, vision, texte) est Python-first : on prototypie la chaîne en quelques jours.",
      },
      {
        name: "Hugging Face",
        si: "Huggingface",
        reason: "Modèles de transcription, d'embedding et de vision prêts à l'emploi : on choisit les meilleurs, on ne les entraîne pas.",
      },
      {
        name: "PyTorch",
        si: "Pytorch",
        reason: "Pour affiner un modèle maison ou capturer un embedding spécifique, il offre le contrôle fin sans refaire le monde.",
      },
      {
        name: "ONNX",
        si: "Onnx",
        reason: "Le modèle multimodal passe dans une exécution de production optimisée, sans dépendre de la pile d'entraînement.",
      },
    ],
    cta: "Parler de données non structurées",
    morePath: "/expertise/ai-engineering",
  },
  {
    slug: "governance",
    label: "On ne sait plus d'où viennent nos données",
    cause:
      "Chaque chiffre a un pedigree trouble, et chaque suppression devrait obéir à un RGPD que personne ne peut prouver. Les auditeurs posent des questions, et la réponse est : on ne sait pas.",
    causeChart: {
      kind: "bars",
      data: [82, 51],
      labels: ["Avant traçage", "Avec lignée"],
    },
    action:
      "On trace la lignée de la donnée brute jusqu'au dashboard, on centralise les accès derrière une gouvernance, et on rend l'effacement, la rétention et le droit à l'oubli exécutables et prouvables.",
    actionChart: { kind: "spark", data: [30, 44, 58, 69, 80, 90, 97, 100], labels: [] },
    tools: [
      {
        name: "Trino",
        si: "Trino",
        reason: "Un point d'entrée fédéré : chaque requête traverse une gouvernance unique, quelle que soit la source.",
      },
      {
        name: "Snowflake",
        si: "Snowflake",
        reason: "Time travel et rétention native : l'historique et les legal holds s'expriment en SQL, sans copie.",
      },
      {
        name: "OpenTelemetry",
        si: "Opentelemetry",
        reason: "La donnée devient traçable comme du code : chaque accès et chaque transformation laisse une trace.",
      },
      {
        name: "MongoDB",
        si: "Mongodb",
        reason: "Un registre souple pour les consentements, les métadonnées de gouvernance et les durées de rétention.",
      },
    ],
    cta: "Parler de gouvernance",
    morePath: "/expertise/data-engineering",
  },
  {
    slug: "streaming",
    label: "Le batch ne suffit plus",
    cause:
      "Le batch livre des données déjà périmées : les décisions se prennent sur un instantané d'hier. Les événements ne passent nulle part entre deux jobs, et personne ne garantit l'ordre ni l'exactitude.",
    causeChart: { kind: "spark", data: [10, 30, 55, 88, 100, 96, 100], labels: [] },
    action:
      "On bascule sur un streaming par contrat : événement unique, traitement avec état et exactly-once, agrégation continue. La fraîcheur passe en secondes, pas en jours, sans perdre l'exactitude.",
    actionChart: {
      kind: "split",
      data: [100, 24],
      labels: ["Latence batch", "Streaming continu"],
    },
    tools: [
      {
        name: "Flink",
        si: "Apacheflink",
        reason: "Un moteur streaming avec état et exactly-once : les agrégations restent exactes, même en pleine panne.",
      },
      {
        name: "Redis",
        si: "Redis",
        reason: "Un cache et un store de fenêtres à microseconde pour les compteurs et les sessions temps réel.",
      },
      {
        name: "ClickHouse",
        si: "Clickhouse",
        reason: "Les agrégations en continu atterrissent directement dans une colonne, prêtes pour le dashboard.",
      },
      {
        name: "Apache Pulsar",
        si: "Apachepulsar",
        reason: "Un backbone d'événements multi-tenant : rejeu, ordre et isolation sans le plafond des brokers.",
      },
    ],
    cta: "Parler de streaming",
    morePath: "/expertise/data-engineering",
  },
  {
    slug: "rag",
    label: "L'IA répond à côté de la plaque",
    cause:
      "Le LLM invente ou se trompe parce que le bon contexte ne lui arrive pas : fenêtres trop courtes, mauvais découpage, mauvais rappels. Chaque hallucination est une histoire de retriever, pas de modèle.",
    causeChart: {
      kind: "bars",
      data: [64, 41],
      labels: ["Rappel", "Réponses exactes"],
    },
    action:
      "On conçoit l'ingénierie du contexte : découpage juste, embeddings calibrés, récupération hybride et re-ranking, puis évaluation du taux de bonnes réponses. Le modèle répond depuis vos faits, pas depuis son imagination.",
    actionChart: { kind: "spark", data: [45, 55, 66, 76, 85, 92, 97, 100], labels: [] },
    tools: [
      {
        name: "LangChain",
        si: "Langchain",
        reason: "Le cadre standard pour monter la chaîne de récupération et de génération, sans réinventer les jointures.",
      },
      {
        name: "Qdrant",
        si: "Qdrant",
        reason: "Une recherche vectorielle à faible latence, dimensionnable, qui sert le rappel sans ramper.",
      },
      {
        name: "Milvus",
        si: "Milvus",
        reason: "Quand le volume d'embeddings est massif, Milvus indexe et filtre des millions de vecteurs sans effort.",
      },
      {
        name: "PostgreSQL",
        si: "Postgresql",
        reason: "pgvector dans votre base existante : pour démarrer propre, sans nouvelle infrastructure à opérer.",
      },
    ],
    cta: "Parler de RAG",
    morePath: "/expertise/ai-engineering",
  },
  {
    slug: "agent-observability",
    label: "Nos agents agissent… on ignore comment",
    cause:
      "Un agent multi-étapes décide seul : il appelle des outils, change d'avis, fait des boucles. Personne ne voit quoi, quand, pourquoi, donc personne ne peut corriger une trajectoire perdante.",
    causeChart: {
      kind: "split",
      data: [98, 61],
      labels: ["En démo", "En production"],
    },
    action:
      "On trace chaque étape (appels, outils, coûts, sorties), on mesure l'échec par branche, et on pose les tableaux de bord avant la prod. Un agent sans traces est un agent qu'on ne peut pas réparer.",
    actionChart: { kind: "spark", data: [52, 60, 68, 78, 86, 94, 99, 100], labels: [] },
    tools: [
      {
        name: "Datadog",
        si: "Datadog",
        reason: "APM et logs unifiés : la boucle de l'agent vue comme une intégration distribuée, avec alertes.",
      },
      {
        name: "Grafana",
        si: "Grafana",
        reason: "Des tableaux de bord partagés sur chaque parcours : l'équipe voit la santé des agents sans demander.",
      },
      {
        name: "Prometheus",
        si: "Prometheus",
        reason: "Des métriques (appels, erreurs, durée par outil) conservées et interrogées librement.",
      },
      {
        name: "Elasticsearch",
        si: "Elasticsearch",
        reason: "Les traces et messages deviennent full-text searchables : on retrouve un incident en tapant une phrase.",
      },
    ],
    cta: "Parler d'observabilité",
    morePath: "/expertise/agentic-systems",
  },
  {
    slug: "evaluation",
    label: "On ne peut pas déployer un modèle qui répond n'importe quoi",
    cause:
      "Les sorties LLM sont non déterministes : une régression passe inaperçue, et un contenu dangereux peut filer au-delà des garde-fous. Sans évaluation, chaque version est un pari.",
    causeChart: {
      kind: "split",
      data: [100, 61],
      labels: ["Sans éval", "Avec éval"],
    },
    action:
      "On construit un banc d'évaluation (jeux d'or, métriques, tests de régression), on mesure la cohérence entre versions, et on pose des garde-fous bloquants avant la publication.",
    actionChart: {
      kind: "bars",
      data: [40, 78, 100],
      labels: ["Bench d'éval", "Garde-fous", "Régression tracking"],
    },
    tools: [
      {
        name: "MLflow",
        si: "Mlflow",
        reason: "Le registre d'évaluation : chaque version de modèle passe les mêmes tests, les résultats se comparent.",
      },
      {
        name: "Weights & Biases",
        si: "Weightsandbiases",
        reason: "Les scores d'évaluation et les curseurs de garde-fous se suivent d'une itération à l'autre.",
      },
      {
        name: "Gradio",
        si: "Gradio",
        reason: "Un harnais d'évaluation humaine : chacun sonde des réponses et annote sans écrire de code.",
      },
      {
        name: "NumPy",
        si: "Numpy",
        reason: "Les métriques (précision, cohérence, toxicité) se calculent et se comparent en quelques lignes.",
      },
    ],
    cta: "Parler d'évaluation",
    morePath: "/expertise/ai-engineering",
  },
  {
    slug: "compute-cost",
    label: "Le calcul coûte plus cher que la valeur qu'il produit",
    cause:
      "Les GPU tournent à vide ou sont sur-réservés, les workloads s'étalent sans ordonnancement, et la facture suit la capacité, pas l'usage. Personne ne sait ce qui coûte quoi.",
    causeChart: {
      kind: "bars",
      data: [14, 22, 19, 61, 78, 86, 30, 24, 26],
      labels: ["", "", "", "", "", "", "", "", ""],
    },
    action:
      "On dimensionne le parc au besoin réel, on ordonnance les workloads, on mutualise les cartes et on rend le coût par charge traçable. Vous payez le calcul qui travaille, pas la capacité qui attend.",
    actionChart: {
      kind: "split",
      data: [100, 40],
      labels: ["Capacité installée", "Usage réel"],
    },
    tools: [
      {
        name: "Kubernetes",
        si: "Kubernetes",
        reason: "Ordonnance les workloads GPU et surcharge les nœuds selon l'usage réel, pas selon la réservation.",
      },
      {
        name: "Ray",
        si: "Ray",
        reason: "Entraînements et servings se répartissent automatiquement sur le cluster, la bonne carte sur la bonne tâche.",
      },
      {
        name: "Terraform",
        si: "Terraform",
        reason: "L'infra en code : on provisionne, mesure et éteint de la capacité selon des budgets chiffrables.",
      },
      {
        name: "Docker",
        si: "Docker",
        reason: "Des images standardisées pour déplacer des workloads d'un cloud à un bare-metal sans rebâtir.",
      },
    ],
    cta: "Parler de coûts de calcul",
    morePath: "/expertise/bare-metal",
  },
  {
    slug: "legacy",
    label: "Nos vieux systèmes ne parlent pas l'IA",
    cause:
      "L'IA moderne doit se brancher sur un mainframe, des bases anciennes, des formats propriétaires. Chaque connexion devient un projet, et les données restent enfermées dans des silos.",
    causeChart: {
      kind: "bars",
      data: [80, 32],
      labels: ["En silo", "Connecté"],
    },
    action:
      "On encapsule l'existant, on expose des interfaces propres (API, événements), et on relie les systèmes au monde moderne sans réécrire le legacy. La migration devient continue, pas un big bang.",
    actionChart: { kind: "spark", data: [30, 42, 55, 66, 76, 86, 95, 100], labels: [] },
    tools: [
      {
        name: "Go",
        si: "Go",
        reason: "Des services d'intégration à haute concurrence, compilés en binaire léger, sans dépendance d'exécution.",
      },
      {
        name: "TypeScript",
        si: "Typescript",
        reason: "API et clients invariants par le typage : les contrats entre l'IA et les vieux systèmes se vérifient au compile.",
      },
      {
        name: "Neo4j",
        si: "Neo4j",
        reason: "On cartographie les dépendances du legacy : on sait ce qui mourra quand on touchera à quoi.",
      },
    ],
    cta: "Parler d'intégration",
    morePath: "/expertise/ai-engineering",
  },
  {
    slug: "llm-serving",
    label: "Chaque appel LLM nous coûte trop cher",
    cause:
      "Le coût par requête explose dès que l'usage grandit : générations lentes, throughput gâché, modèles surdimensionnés. La marge et la latence se dégradent en même temps.",
    causeChart: { kind: "spark", data: [12, 18, 30, 46, 71, 100], labels: [] },
    action:
      "On sert les modèles avec du batching continu, de la quantification et un routage adapté à la tâche. Le coût par requête baisse, la latence aussi, sans dégrader la qualité.",
    actionChart: {
      kind: "split",
      data: [100, 28],
      labels: ["Coût/requête", "Après réglage"],
    },
    tools: [
      {
        name: "vLLM",
        si: "Vllm",
        reason: "Batching continu et PagedAttention : le throughput par carte monte, le coût par token chute.",
      },
      {
        name: "Ollama",
        si: "Ollama",
        reason: "Des modèles locaux et quantifiés pour les usages sensibles ou hors ligne : coût à la requête quasi nul.",
      },
      {
        name: "BentoML",
        si: "Bentoml",
        reason: "Sert le modèle prêt pour la production (API, scaling, GPU) sans tout réimplanter à chaque itération.",
      },
    ],
    cta: "Parler d'inférence",
    morePath: "/expertise/inference-optimization",
  },
];

const en: DiagCase[] = [
  {
    slug: "data-quality",
    label: "Dirty data that quietly drifts",
    cause:
      "Schemas change, sources return blanks, and real-world patterns move without warning. Models train on a past that no longer exists, and nobody sees the drift coming.",
    causeChart: {
      kind: "bars",
      data: [18, 12, 61, 6, 43, 28, 9, 33, 54, 11],
      labels: ["", "", "", "", "", "", "", "", "", ""],
    },
    action:
      "We put data contracts, quality checks at every step and drift alerts (statistics, freshness, schemas) in place. Quality becomes a measured property of the pipeline, not a Monday-morning surprise.",
    actionChart: { kind: "spark", data: [48, 58, 66, 78, 87, 94, 99, 100], labels: [] },
    tools: [
      {
        name: "Kafka",
        si: "Apachekafka",
        reason: "Every event carries its schema and history: when the world changes, you see it, and you can replay.",
      },
      {
        name: "DuckDB",
        si: "Duckdb",
        reason: "Instant shadow validation: a schema change is approved in seconds, not days.",
      },
      {
        name: "Polars",
        si: "Polars",
        reason: "Quality rules over wide data running multi-core, with no cluster to maintain.",
      },
      {
        name: "Spark",
        si: "Apachespark",
        reason: "For lake-wide checks, Spark distributes the execution without rewriting the rules.",
      },
    ],
    cta: "Talk about data quality",
    morePath: "/expertise/data-engineering",
  },
  {
    slug: "unstructured",
    label: "Our data doesn't fit in tables",
    cause:
      "Text, audio, video, scans: raw data is exploding in volume and fits no table. Existing pipelines throw it away or ingest it blind, with no structure and no search.",
    causeChart: {
      kind: "split",
      data: [22, 100],
      labels: ["Tabular data", "Unstructured"],
    },
    action:
      "We build the extraction chain: transcription and embeddings, multimodal indexing, then unified storage and search. The meaning inside your documents becomes queryable, not buried.",
    actionChart: {
      kind: "bars",
      data: [40, 78, 100],
      labels: ["Extract", "Index", "Search"],
    },
    tools: [
      {
        name: "Python",
        si: "Python",
        reason: "The audio/vision/text ecosystem is Python-first, so we prototype the chain in days, not sprints.",
      },
      {
        name: "Hugging Face",
        si: "Huggingface",
        reason: "Ready transcription, embedding and vision models: we pick the best, we don't train them.",
      },
      {
        name: "PyTorch",
        si: "Pytorch",
        reason: "To fine-tune a model or capture a bespoke embedding, it gives the control without reinventing everything.",
      },
      {
        name: "ONNX",
        si: "Onnx",
        reason: "The multimodal model moves into an optimised production runtime, free from the training stack.",
      },
    ],
    cta: "Talk about unstructured data",
    morePath: "/expertise/ai-engineering",
  },
  {
    slug: "governance",
    label: "We no longer know where our data came from",
    cause:
      "Every number has a murky pedigree, and every deletion should obey GDPR rules nobody can prove. Auditors ask questions, and the answer is: we don't know.",
    causeChart: {
      kind: "bars",
      data: [82, 51],
      labels: ["Before tracing", "With lineage"],
    },
    action:
      "We trace lineage from raw data to dashboard, centralise access behind one governance layer, and make erasure, retention and the right-to-be-forgotten executable and provable.",
    actionChart: { kind: "spark", data: [30, 44, 58, 69, 80, 90, 97, 100], labels: [] },
    tools: [
      {
        name: "Trino",
        si: "Trino",
        reason: "One federated entry point: every query crosses a single governance layer, whatever the source.",
      },
      {
        name: "Snowflake",
        si: "Snowflake",
        reason: "Time travel and native retention: history and legal holds in SQL, no copies.",
      },
      {
        name: "OpenTelemetry",
        si: "Opentelemetry",
        reason: "Data becomes traceable like code: every access and transform leaves a footprint.",
      },
      {
        name: "MongoDB",
        si: "Mongodb",
        reason: "A flexible registry for consents, governance metadata and retention windows.",
      },
    ],
    cta: "Talk about governance",
    morePath: "/expertise/data-engineering",
  },
  {
    slug: "streaming",
    label: "Batch is no longer enough",
    cause:
      "Batch delivers data that is already stale: decisions run on yesterday's snapshot. Events sit nowhere between jobs, and nobody guarantees order or exactness.",
    causeChart: { kind: "spark", data: [10, 30, 55, 88, 100, 96, 100], labels: [] },
    action:
      "We move to streaming by contract: one event handled once, stateful exactly-once processing, continuous aggregation. Freshness drops to seconds, not days, without losing accuracy.",
    actionChart: {
      kind: "split",
      data: [100, 24],
      labels: ["Batch latency", "Continuous"],
    },
    tools: [
      {
        name: "Flink",
        si: "Apacheflink",
        reason: "A stateful exactly-once stream engine: aggregations stay exact even mid-outage.",
      },
      {
        name: "Redis",
        si: "Redis",
        reason: "A microsecond cache and window store for real-time counters and sessions.",
      },
      {
        name: "ClickHouse",
        si: "Clickhouse",
        reason: "Continuous aggregations land straight in a column store, ready for the dashboard.",
      },
      {
        name: "Apache Pulsar",
        si: "Apachepulsar",
        reason: "A multi-tenant event backbone: replay, ordering and isolation without the broker ceiling.",
      },
    ],
    cta: "Talk about streaming",
    morePath: "/expertise/data-engineering",
  },
  {
    slug: "rag",
    label: "The AI answers wide of the mark",
    cause:
      "The LLM invents or errs because useful context never reaches it: windows too short, bad chunking, weak recall. Every hallucination is a retriever story, not a model story.",
    causeChart: {
      kind: "bars",
      data: [64, 41],
      labels: ["Recall", "Exact answers"],
    },
    action:
      "We engineer the context: proper chunking, calibrated embeddings, hybrid retrieval and re-ranking, then evaluate the right-answer rate. The model replies from your facts, not its imagination.",
    actionChart: { kind: "spark", data: [45, 55, 66, 76, 85, 92, 97, 100], labels: [] },
    tools: [
      {
        name: "LangChain",
        si: "Langchain",
        reason: "The standard framework to stand up a retrieval-generation chain without reinventing the joins.",
      },
      {
        name: "Qdrant",
        si: "Qdrant",
        reason: "A low-latency, scalable vector search that serves the recall without crawling.",
      },
      {
        name: "Milvus",
        si: "Milvus",
        reason: "When embeddings are massive, Milvus indexes and filters millions of vectors effortlessly.",
      },
      {
        name: "PostgreSQL",
        si: "Postgresql",
        reason: "pgvector inside your existing database: a clean start with nothing new to operate.",
      },
    ],
    cta: "Talk about RAG",
    morePath: "/expertise/ai-engineering",
  },
  {
    slug: "agent-observability",
    label: "Our agents act… we don't know how",
    cause:
      "A multi-step agent decides alone: it calls tools, changes its mind, loops. Nobody sees what, when, why, so nobody can fix a losing trajectory.",
    causeChart: {
      kind: "split",
      data: [98, 61],
      labels: ["In demo", "In production"],
    },
    action:
      "We trace every step (calls, tools, costs, outputs), measure failure per branch, and ship dashboards before production. An untraced agent is an agent that cannot be repaired.",
    actionChart: { kind: "spark", data: [52, 60, 68, 78, 86, 94, 99, 100], labels: [] },
    tools: [
      {
        name: "Datadog",
        si: "Datadog",
        reason: "Unified APM and logs: the agent loop viewed as a distributed integration, with alerts.",
      },
      {
        name: "Grafana",
        si: "Grafana",
        reason: "Shared dashboards over every trajectory: the team sees agent health without asking.",
      },
      {
        name: "Prometheus",
        si: "Prometheus",
        reason: "Metrics (calls, errors, duration per tool) kept and queried freely.",
      },
      {
        name: "Elasticsearch",
        si: "Elasticsearch",
        reason: "Traces and messages become full-text searchable: find an incident by typing a phrase.",
      },
    ],
    cta: "Talk about observability",
    morePath: "/expertise/agentic-systems",
  },
  {
    slug: "evaluation",
    label: "We can't ship a model that answers anything",
    cause:
      "LLM outputs are non-deterministic: a regression slips through unnoticed, and unsafe content can escape the guardrails. Without evaluation, every release is a gamble.",
    causeChart: {
      kind: "split",
      data: [100, 61],
      labels: ["No eval", "With eval"],
    },
    action:
      "We build an evaluation bench (golden sets, metrics, regression tests), measure consistency across versions, and put blocking guardrails in front of publication.",
    actionChart: {
      kind: "bars",
      data: [40, 78, 100],
      labels: ["Eval bench", "Guardrails", "Regression tracking"],
    },
    tools: [
      {
        name: "MLflow",
        si: "Mlflow",
        reason: "The evaluation registry: every model version runs the same tests, results stay comparable.",
      },
      {
        name: "Weights & Biases",
        si: "Weightsandbiases",
        reason: "Eval scores and guardrail thresholds tracked from one iteration to the next.",
      },
      {
        name: "Gradio",
        si: "Gradio",
        reason: "A human evaluation harness: anyone can probe responses and label them without code.",
      },
      {
        name: "NumPy",
        si: "Numpy",
        reason: "Metrics (precision, consistency, toxicity) computed and compared in a few lines.",
      },
    ],
    cta: "Talk about evaluation",
    morePath: "/expertise/ai-engineering",
  },
  {
    slug: "compute-cost",
    label: "Compute costs more than the value it produces",
    cause:
      "GPUs sit idle or are overbooked, workloads sprawl without scheduling, and the bill follows capacity, not usage. Nobody knows what costs what.",
    causeChart: {
      kind: "bars",
      data: [14, 22, 19, 61, 78, 86, 30, 24, 26],
      labels: ["", "", "", "", "", "", "", "", ""],
    },
    action:
      "We size the fleet to real need, schedule the workloads, share the cards and make cost per job traceable. You pay for compute that works, not capacity that waits.",
    actionChart: {
      kind: "split",
      data: [100, 40],
      labels: ["Installed capacity", "Real usage"],
    },
    tools: [
      {
        name: "Kubernetes",
        si: "Kubernetes",
        reason: "Schedules GPU workloads and over-commits nodes against real usage, not reservations.",
      },
      {
        name: "Ray",
        si: "Ray",
        reason: "Training and serving spread automatically across the cluster: the right card on the right job.",
      },
      {
        name: "Terraform",
        si: "Terraform",
        reason: "Infrastructure as code: provision, measure and switch off capacity against a priced budget.",
      },
      {
        name: "Docker",
        si: "Docker",
        reason: "Standard images to move workloads between cloud and bare-metal without rebuilding.",
      },
    ],
    cta: "Talk about compute costs",
    morePath: "/expertise/bare-metal",
  },
  {
    slug: "legacy",
    label: "Our old systems don't speak AI",
    cause:
      "Modern AI has to plug into a mainframe, old databases, proprietary formats. Every connection becomes a project, and the data stays trapped in silos.",
    causeChart: {
      kind: "bars",
      data: [80, 32],
      labels: ["In silos", "Connected"],
    },
    action:
      "We encapsulate the existing stack, expose clean interfaces (APIs, events) and link the systems to the modern world without rewriting the legacy. Migration becomes continuous, not a big bang.",
    actionChart: { kind: "spark", data: [30, 42, 55, 66, 76, 86, 95, 100], labels: [] },
    tools: [
      {
        name: "Go",
        si: "Go",
        reason: "High-concurrency integration services compiled to a lightweight binary, with no runtime dependency.",
      },
      {
        name: "TypeScript",
        si: "Typescript",
        reason: "Typed API contracts: the boundaries between AI and legacy systems check at compile time.",
      },
      {
        name: "Neo4j",
        si: "Neo4j",
        reason: "We map the legacy dependency graph, so we know what dies when we touch what.",
      },
    ],
    cta: "Talk about integration",
    morePath: "/expertise/ai-engineering",
  },
  {
    slug: "llm-serving",
    label: "Every LLM call costs us too much",
    cause:
      "Cost per request explodes as usage grows: slow generation, wasted throughput, oversized models. Margin and latency degrade at the same time.",
    causeChart: { kind: "spark", data: [12, 18, 30, 46, 71, 100], labels: [] },
    action:
      "We serve the models with continuous batching, quantisation and task-aware routing. Cost per request drops, latency drops too, without hurting quality.",
    actionChart: {
      kind: "split",
      data: [100, 28],
      labels: ["Cost/request", "After tuning"],
    },
    tools: [
      {
        name: "vLLM",
        si: "Vllm",
        reason: "Continuous batching and PagedAttention: throughput per card rises, cost per token falls.",
      },
      {
        name: "Ollama",
        si: "Ollama",
        reason: "Local, quantised models for sensitive or offline use: near-zero cost per request.",
      },
      {
        name: "BentoML",
        si: "Bentoml",
        reason: "Serves the model production-ready (API, scaling, GPU) without reimplementing on every iteration.",
      },
    ],
    cta: "Talk about inference",
    morePath: "/expertise/inference-optimization",
  },
];

const byLocale: Record<Locale, DiagCase[]> = { fr, en };

export function getDiagnostics(locale: Locale): DiagCase[] {
  return byLocale[locale] ?? fr;
}
